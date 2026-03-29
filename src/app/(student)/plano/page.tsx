'use client'
// src/app/(student)/plano/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard, Calendar, CheckCircle, AlertTriangle,
  Clock, ChevronDown, ChevronUp, MessageCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/Providers'
import { useTenant, useBranding } from '@/components/providers/TenantProvider'
import { AppShell, PageHeader, Section } from '@/components/layout/AppShell'
import { GoldCard, SolidCard } from '@/components/shared/Cards'
import { StatusBadge } from '@/components/shared/Cards'
import { Skeleton } from '@/components/shared/SharedComponents'
import {
  formatCurrency, formatDate, getDaysUntilDue,
  calculateMembershipStatus, cn,
} from '@/lib/utils'
import type { Membership } from '@/types/domain'

interface EnrichedMembership extends Membership {
  membershipStatus: Membership['membershipStatus']
  daysUntilDue: number
}

export default function PlanoPage() {
  const { student } = useAuth()
  const { tenant } = useTenant()
  const branding = useBranding()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [memberships, setMemberships] = useState<EnrichedMembership[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!student?.id) return
    setIsLoading(true)
    const { data } = await supabase
      .from('memberships')
      .select('*')
      .eq('student_id', student.id)
      .eq('academy_id', tenant.id)
      .order('reference_month', { ascending: false })
      .limit(12)

    const enriched: EnrichedMembership[] = (data ?? []).map(m => ({
      ...(m as unknown as Membership),
      membershipStatus: calculateMembershipStatus(
        m.due_date,
        m.status as 'paid' | 'pending' | 'overdue' | 'waived',
      ),
      daysUntilDue: getDaysUntilDue(m.due_date),
      isOverdue: new Date(m.due_date) < new Date() && m.status !== 'paid',
      isDueSoon: getDaysUntilDue(m.due_date) <= 5 && m.status !== 'paid',
    }))

    setMemberships(enriched)
    setIsLoading(false)
  }, [student?.id, tenant.id, supabase])

  useEffect(() => { load() }, [load])

  const current = memberships[0] ?? null
  const history = memberships.slice(1)

  // Cores por status
  const statusColors = {
    active:   { border: 'rgba(34,197,94,0.35)',  bg: 'rgba(34,197,94,0.08)',  text: '#22C55E' },
    due_soon: { border: 'rgba(245,158,11,0.45)', bg: 'rgba(245,158,11,0.10)', text: '#F59E0B' },
    overdue:  { border: 'rgba(239,68,68,0.45)',  bg: 'rgba(239,68,68,0.10)',  text: '#EF4444' },
    inactive: { border: 'rgba(71,71,71,0.4)',    bg: 'rgba(30,30,30,0.5)',    text: '#717171' },
    trial:    { border: 'rgba(168,85,247,0.35)', bg: 'rgba(168,85,247,0.08)', text: '#A855F7' },
  }

  return (
    <AppShell>
      <PageHeader title="Meu Plano" subtitle="Situação financeira" withDivider />

      <div className="px-4 pb-6 pt-5 space-y-6">

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : !current ? (
          /* Sem mensalidade */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 space-y-4"
          >
            <div
              className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--brand-gradient-subtle)' }}
            >
              <CreditCard className="w-8 h-8" style={{ color: 'var(--brand-primary,#D4A017)' }} />
            </div>
            <div>
              <p className="text-base font-bold text-white">Sem mensalidade cadastrada</p>
              <p className="text-sm text-graphite-500 mt-1">
                Fale com seu professor para verificar seu plano.
              </p>
            </div>
            <button
              onClick={() => router.push('/mensagens')}
              className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl font-semibold text-sm border"
              style={{
                borderColor: 'var(--brand-primary-border)',
                color: 'var(--brand-primary)',
                background: 'var(--brand-gradient-subtle)',
              }}
            >
              <MessageCircle className="w-4 h-4" />
              Falar com professor
            </button>
          </motion.div>
        ) : (
          <>
            {/* Card principal — mensalidade atual */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="rounded-2xl overflow-hidden border"
                style={{
                  background: statusColors[current.membershipStatus]?.bg ?? statusColors.inactive.bg,
                  borderColor: statusColors[current.membershipStatus]?.border ?? statusColors.inactive.border,
                }}
              >
                {/* Faixa topo */}
                <div
                  className="h-[3px]"
                  style={{
                    background: statusColors[current.membershipStatus]?.text ?? '#717171',
                  }}
                />

                <div className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-graphite-400">
                        Mensalidade atual
                      </p>
                      <p className="text-sm font-semibold text-white mt-0.5 capitalize">
                        {formatDate(current.referenceMonth, 'MMMM yyyy')}
                      </p>
                    </div>
                    <StatusBadge
                      status={current.membershipStatus}
                      size="md"
                      animated={current.membershipStatus === 'due_soon'}
                    />
                  </div>

                  {/* Valor */}
                  <div>
                    <p className="text-4xl font-black text-white leading-none">
                      {formatCurrency(current.amount)}
                    </p>
                  </div>

                  {/* Status detalhado */}
                  <div
                    className="flex items-center gap-2.5 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    {current.membershipStatus === 'active' ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : current.membershipStatus === 'overdue' ? (
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    )}
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: statusColors[current.membershipStatus]?.text ?? '#717171' }}
                      >
                        {current.membershipStatus === 'active'   ? 'Pagamento confirmado' :
                         current.membershipStatus === 'overdue'  ? `Venceu há ${Math.abs(current.daysUntilDue)} dia${Math.abs(current.daysUntilDue) !== 1 ? 's' : ''}` :
                         current.membershipStatus === 'due_soon' ? `Vence em ${current.daysUntilDue} dia${current.daysUntilDue !== 1 ? 's' : ''}` :
                         'Aguardando pagamento'}
                      </p>
                      <p className="text-xs text-graphite-500 mt-0.5">
                        Vencimento: {formatDate(current.dueDate, "dd 'de' MMMM 'de' yyyy")}
                      </p>
                    </div>
                  </div>

                  {/* Método de pagamento */}
                  {current.status === 'paid' && current.paidAt && (
                    <div className="flex items-center justify-between text-xs text-graphite-500">
                      <span>Pago em {formatDate(current.paidAt, 'dd/MM/yyyy')}</span>
                      {current.paymentMethod && (
                        <span className="capitalize">{current.paymentMethod}</span>
                      )}
                    </div>
                  )}

                  {/* CTA para vencido ou vencendo */}
                  {(current.membershipStatus === 'overdue' || current.membershipStatus === 'due_soon') && (
                    <button
                      onClick={() => router.push('/mensagens')}
                      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                      style={{
                        background: statusColors[current.membershipStatus]?.text,
                        color: '#fff',
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Falar com professor
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Info da academia */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <SolidCard className="p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: 'var(--brand-gradient)', color: '#0D0D0D' }}
                >
                  {branding.academyShortName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{branding.academyName}</p>
                  <p className="text-xs text-graphite-500">{tenant.settings.cancelPolicy}</p>
                </div>
              </SolidCard>
            </motion.div>

            {/* Histórico */}
            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
              >
                <Section title="Histórico">
                  <div className="space-y-2">
                    {history.map((mem) => (
                      <motion.button
                        key={mem.id}
                        onClick={() => setExpandedId(expandedId === mem.id ? null : mem.id)}
                        className="w-full text-left"
                        whileTap={{ scale: 0.985 }}
                      >
                        <SolidCard className="p-3.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-white capitalize">
                                {formatDate(mem.referenceMonth, 'MMMM yyyy')}
                              </p>
                              <p className="text-xs text-graphite-500 mt-0.5">
                                {formatCurrency(mem.amount)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge
                                status={mem.membershipStatus}
                                size="sm"
                                showDot={false}
                              />
                              {expandedId === mem.id
                                ? <ChevronUp className="w-4 h-4 text-graphite-600" />
                                : <ChevronDown className="w-4 h-4 text-graphite-600" />
                              }
                            </div>
                          </div>

                          {/* Expanded detail */}
                          {expandedId === mem.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5"
                            >
                              <div className="flex justify-between text-xs">
                                <span className="text-graphite-500">Vencimento</span>
                                <span className="text-white font-medium">
                                  {formatDate(mem.dueDate, 'dd/MM/yyyy')}
                                </span>
                              </div>
                              {mem.paidAt && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-graphite-500">Pago em</span>
                                  <span className="text-green-400 font-medium">
                                    {formatDate(mem.paidAt, 'dd/MM/yyyy')}
                                  </span>
                                </div>
                              )}
                              {mem.paymentMethod && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-graphite-500">Método</span>
                                  <span className="text-white font-medium capitalize">
                                    {mem.paymentMethod}
                                  </span>
                                </div>
                              )}
                              {mem.notes && (
                                <p className="text-xs text-graphite-500 italic pt-1">{mem.notes}</p>
                              )}
                            </motion.div>
                          )}
                        </SolidCard>
                      </motion.button>
                    ))}
                  </div>
                </Section>
              </motion.div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
