'use client'
import { useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/Providers'
import { useTenant } from '@/components/providers/TenantProvider'
import { notify } from '@/components/shared/PremiumToast'

export function useCoachRealtime() {
  const { coach } = useAuth()
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!coach) return
    const ch = supabase
      .channel(`${tenant.id}:coach-realtime`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings', filter: `academy_id=eq.${tenant.id}` },
        async (payload) => {
          const booking = payload.new as Record<string, unknown>
          const { data: studentData } = await supabase.from('students').select('profile:profiles(full_name)').eq('id', booking.student_id as string).single()
          const { data: slotData } = await supabase.from('training_slots').select('start_time, training_day:training_days(date)').eq('id', booking.slot_id as string).single()
          const studentName = (studentData?.profile as Record<string, string>)?.full_name ?? 'Aluno'
          const slotTime = slotData?.start_time ? slotData.start_time.slice(0, 5) : '—'
          notify.newBooking(studentName, slotTime)
          if (coach.profileId) {
            await supabase.from('notifications').insert({ user_id: coach.profileId, academy_id: tenant.id, type: 'booking_created', title: 'Novo agendamento', body: `${studentName} reservou ${slotTime}`, data: { booking_id: booking.id, slot_id: booking.slot_id } } as any)
          }
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `academy_id=eq.${tenant.id}` },
        async (payload) => {
          const newBooking = payload.new as Record<string, unknown>
          const oldBooking = payload.old as Record<string, unknown>
          if (newBooking.status === 'cancelled' && oldBooking.status === 'confirmed') {
            const { data: studentData } = await supabase.from('students').select('profile:profiles(full_name)').eq('id', newBooking.student_id as string).single()
            const { data: slotData } = await supabase.from('training_slots').select('start_time').eq('id', newBooking.slot_id as string).single()
            const studentName = (studentData?.profile as Record<string, string>)?.full_name ?? 'Aluno'
            const slotTime = slotData?.start_time ? slotData.start_time.slice(0, 5) : '—'
            notify.bookingCancelled(studentName, slotTime)
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [coach, tenant.id, supabase])
}
