'use client'
// src/app/(coach)/alunos/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronRight, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useTenant } from '@/components/providers/TenantProvider'
import { SolidCard } from '@/components/shared/Cards'
import { StatusBadge } from '@/components/shared/Cards'
import { Skeleton } from '@/components/shared/SharedComponents'
import { getInitials, getAvatarColor, formatPhone, calculateMembershipStatus, cn } from '@/lib/utils'

interface StudentRow {
  id: string
  profileId: string
  fullName: string
  phone: string
  totalAttendances: number
  joinedAt: string
  isActive: boolean
  membershipStatus: 'active' | 'due_soon' | 'overdue' | 'inactive' | 'trial'
}

export default function AlunosPage() {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'overdue'>('all')
  const { tenant } = useTenant()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const load = useCallback(async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('students')
      .select(`
        id, profile_id, total_attendances, joined_at, is_active,
        profile:profiles(full_name, phone),
        memberships(status, due_date, reference_month)
      `)
      .eq('academy_id', tenant.id)
      .eq('is_active', true)
      .order('joined_at', { ascending: false })

    const rows: StudentRow[] = (data ?? []).map((s: Record<string, unknown>) => {
      const profile = s.profile as Record<string, string>
      const mems = (s.memberships as Array<Record<string, string>>)
        ?.sort((a, b) => b.reference_month.localeCompare(a.reference_month))
      const latestMem = mems?.[0]
      return {
        id: s.id as string,
        profileId: s.profile_id as string,
        fullName: profile?.full_name ?? '—',
        phone: profile?.phone ?? '',
        totalAttendances: (s.total_attendances as number) ?? 0,
        joinedAt: s.joined_at as string,
        isActive: s.is_active as boolean,
        membershipStatus: latestMem
          ? calculateMembershipStatus(latestMem.due_date, latestMem.status as 'paid' | 'pending' | 'overdue' | 'waived')
          : 'inactive',
      }
    })
    setStudents(rows)
    setIsLoading(false)
  }, [supabase, tenant.id])

  useEffect(() => { load() }, [load])

  const filtered = students.filter(s => {
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search.replace(/\D/g, ''))
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && s.membershipStatus === 'active') ||
      (filterStatus === 'overdue' && (s.membershipStatus === 'overdue' || s.membershipStatus === 'due_soon'))
    return matchSearch && matchStatus
  })

  return (
    <div className="p-5 lg:p-7 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Alunos</h1>
          <p className="text-sm text-graphite-500 mt-0.5">{students.length} cadastrado{students.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite-600" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-premium pl-10"
          />
        </div>
        <div className="flex gap-2">
          {([
            { id: 'all', label: 'Todos' },
            { id: 'active', label: 'Em dia' },
            { id: 'overdue', label: 'Inadimplentes' },
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
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-10 h-10 text-graphite-700 mx-auto mb-3" />
          <p className="text-sm text-graphite-500">Nenhum aluno encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((student, i) => (
            <motion.div key={student.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <SolidCard pressable className="p-4" onClick={() => {}}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${getAvatarColor(student.fullName)}, ${getAvatarColor(student.fullName)}99)` }}
                  >
                    {getInitials(student.fullName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white truncate">{student.fullName}</p>
                      <StatusBadge status={student.membershipStatus} size="sm" showDot />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-graphite-500">{formatPhone(student.phone)}</span>
                      <span className="text-graphite-700">·</span>
                      <span className="text-xs text-graphite-500">{student.totalAttendances} treinos</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-graphite-600 flex-shrink-0" />
                </div>
              </SolidCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
