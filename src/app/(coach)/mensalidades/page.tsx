'use client'
// src/app/(coach)/mensalidades/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, CheckCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useTenant } from '@/components/providers/TenantProvider'
import { SolidCard } from '@/components/shared/Cards'
import { StatusBadge } from '@/components/shared/Cards'
import { Skeleton } from '@/components/shared/SharedComponents'
import { formatCurrency, formatDate, formatPhone, getInitials, getAvatarColor, calculateMembershipStatus, cn } from '@/lib/utils'
import type { MembershipStatusType } from '@/components/shared/Cards'

interface MembershipRow {
  id: string
  studentId: string
  studentName: string
  studentPhone: string
  referenceMonth: string
  dueDate: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'waived'
  membershipStatus: MembershipStatusType
  paidAt: string | null
  paymentMethod: string | null
}

export default function MensalidadesPage() {
  const [rows, setRows] = useState<MembershipRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()

  const load = useCallback(async () => {
    setIsLoading(true)
    const now = new Date()
    const { data } = await supabase
      .from('memberships')
      .select(`*, student:students(profile:profiles(full_name, phone))`)
      .eq('academy_id', tenant.id)
      .gte('reference_month', new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0])
      .order('due_date', { ascending: true })

    setRows((data ?? []).map((m: Record<string, unknown>) => {
      const student = m.student as Record<string, Record<string, string>>
      return {
        id: m.id as string,
        studentId: m.student_id as string,
        studentName: student?.profile?.full_name ?? '—',
        studentPhone: student?.profile?.phone ?? '',
        referenceMonth: m.reference_month as string,
        dueDate: m.due_date as string,
        amount: m.amount as number,
        status: m.status as 'paid' | 'pending' | 'overdue' | 'waived',
        membershipStatus: calculateMembershipStatus(m.due_date as string, m.status as 'paid' | 'pending' | 'overdue' | 'waived'),
        paidAt: m.paid_at as string | null,
        paymentMethod: m.payment_method as string | null,
      }
    }))
    setIsLoading(false)
  }, [supabase, tenant.id])

  useEffect(() => { load() }, [load])

  const markPaid = useCallback(async (membershipId: string) => {
    setUpdatingId(membershipId)
    await supabase.from('memberships').update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_method: 'pix',
    }).eq('id', membershipId)
    toast.success('Mensalidade marcada como paga')
    load()
    setUpdatingId(null)
  }, [supabase, load])

  const markPending = useCallback(async (membershipId: string) => {
    setUpdatingId(membershipId)
    await supabase.from('memberships').update({ status: 'pending', paid_at: null }).eq('id', membershipId)
    toast.success('Mensalidade marcada como pendente')
    load()
    setUpdatingId(null)
  }, [supabase, load])

  const filtered = rows.filter(r => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'paid') return r.status === 'paid'
    if (filterStatus === 'pending') return r.status === 'pending'
    if (filterStatus === 'overdue') return r.membershipStatus === 'overdue' || r.membershipStatus === 'due_soon'
    return true
  })

  const totals = {
    paid: rows.filter(r => r.status === 'paid').reduce((a, r) => a + r.amount, 0),
    pending: rows.filter(r => r.status !== 'paid').reduce((a, r) => a + r.amount, 0),
    overdue: rows.filter(r => r.membershipStatus === 'overdue').length,
  }

  return (
    <div className="p-5 lg:p-7 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white tracking-tight">Mensalidades</h1>
        <p className="text-sm text-graphite-500 mt-0.5">Controle financeiro dos alunos</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <SolidCard className="p-3 text-center">
          <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-lg font-black text-white leading-none">{formatCurrency(totals.paid)}</p>
          <p className="text-[10px] text-graphite-500 font-semibold uppercase tracking-wider mt-0.5">Pago</p>
        </SolidCard>
        <SolidCard className="p-3 text-center">
          <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-black text-white leading-none">{formatCurrency(totals.pending)}</p>
          <p className="text-[10px] text-graphite-500 font-semibold uppercase tracking-wider mt-0.5">Pendente</p>
        </SolidCard>
        <SolidCard className="p-3 text-center">
          <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <p className="text-lg font-black text-white leading-none">{totals.overdue}</p>
          <p className="text-[10px] text-graphite-500 font-semibold uppercase tracking-wider mt-0.5">Vencidos</p>
        </SolidCard>
      </div>

      <div className="flex gap-2 mb-4">
        {([
          { id: 'all', label: 'Todos' },
          { id: 'paid', label: 'Pagos' },
          { id: 'pending', label: 'Pendentes' },
          { id: 'overdue', label: 'Vencidos' },
        ] as const).map(f => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              filterStatus === f.id ? 'text-graphite-900' : 'text-graphite-500 bg-white/5 hover:text-white',
            )}
            style={filterStatus === f.id ? { background: 'var(--brand-primary,#D4A017)' } : {}}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <DollarSign className="w-10 h-10 text-graphite-700 mx-auto mb-3" />
          <p className="text-sm text-graphite-500">Nenhuma mensalidade encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((row, i) => (
            <motion.div key={row.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <SolidCard className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg,${getAvatarColor(row.studentName)},${getAvatarColor(row.studentName)}99)` }}
                  >
                    {getInitials(row.studentName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-white truncate">{row.studentName}</p>
                      <StatusBadge status={row.membershipStatus} size="sm" showDot />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-graphite-500 mb-2">
                      <span className="capitalize">{formatDate(row.referenceMonth, 'MMMM yyyy')}</span>
                      <span className="text-graphite-700">·</span>
                      <span className="font-semibold text-white">{formatCurrency(row.amount)}</span>
                      <span className="text-graphite-700">·</span>
                      <span>Venc: {formatDate(row.dueDate, 'dd/MM')}</span>
                    </div>
                    <div className="flex gap-2">
                      {row.status !== 'paid' ? (
                        <button
                          onClick={() => markPaid(row.id)}
                          disabled={updatingId === row.id}
                          className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                        >
                          {updatingId === row.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Marcar pago
                        </button>
                      ) : (
                        <button onClick={() => markPending(row.id)} disabled={updatingId === row.id} className="text-xs text-graphite-600 hover:text-graphite-400 transition-colors">
                          Desfazer
                        </button>
                      )}
                      {row.paidAt && (
                        <span className="text-xs text-graphite-600 self-center">
                          Pago {formatDate(row.paidAt, 'dd/MM')}{row.paymentMethod ? ` · ${row.paymentMethod}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </SolidCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
