'use client'
// ============================================================
// src/hooks/useStudentProfile.ts
// Hook para carregar dados completos do perfil do aluno
// ============================================================
import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/Providers'
import { useTenant } from '@/components/providers/TenantProvider'
import type { Membership, Booking } from '@/types/domain'
import { calculateMembershipStatus } from '@/lib/utils'

interface StudentProfileData {
  membership: Membership | null
  recentBookings: Booking[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useStudentProfile(): StudentProfileData {
  const { student } = useAuth()
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()
  const [membership, setMembership] = useState<Membership | null>(null)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)

  const refetch = () => setRevision(r => r + 1)

  useEffect(() => {
    if (!student?.id) return

    const load = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Mensalidade atual
        const now = new Date()
        const refMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

        const { data: mem } = await supabase
          .from('memberships')
          .select('*')
          .eq('student_id', student.id)
          .eq('academy_id', tenant.id)
          .gte('reference_month', refMonth)
          .order('reference_month', { ascending: false })
          .limit(1)
          .single()

        if (mem) {
          setMembership({
            ...mem as unknown as Membership,
            membershipStatus: calculateMembershipStatus(mem.due_date, mem.status as 'paid' | 'pending' | 'overdue' | 'waived'),
            daysUntilDue: Math.ceil((new Date(mem.due_date).getTime() - Date.now()) / 86400000),
            isOverdue: new Date(mem.due_date) < new Date() && mem.status !== 'paid',
            isDueSoon: Math.ceil((new Date(mem.due_date).getTime() - Date.now()) / 86400000) <= 5 && mem.status !== 'paid',
          })
        }

        // Reservas recentes (últimas 20)
        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            *,
            slot:training_slots(
              start_time, end_time,
              training_day:training_days(date)
            )
          `)
          .eq('student_id', student.id)
          .eq('academy_id', tenant.id)
          .order('created_at', { ascending: false })
          .limit(20)

        setRecentBookings((bookings ?? []) as unknown as Booking[])
      } catch (err) {
        setError('Erro ao carregar perfil')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [student?.id, tenant.id, supabase, revision])

  return { membership, recentBookings, isLoading, error, refetch }
}
