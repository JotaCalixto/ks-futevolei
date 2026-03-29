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

// ============================================================
// src/hooks/useBooking.ts
// Hook completo de reserva com realtime e otimistic update
// ============================================================
import { useCallback, useEffect, useRef } from 'react'
import type { CreateBookingResponse, SlotWithContext } from '@/types/domain'
import { notify } from '@/components/shared/PremiumToast'

export function useBooking() {
  const { student } = useAuth()
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()

  const createBooking = useCallback(async (
    slotId: string,
    notes?: string
  ): Promise<CreateBookingResponse> => {
    if (!student?.id) return { success: false, message: 'Não autenticado' }

    // 1. Verifica se já tem reserva
    const { data: existing } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('slot_id', slotId)
      .eq('student_id', student.id)
      .maybeSingle()

    if (existing?.status === 'confirmed') {
      return { success: false, message: 'Você já tem uma reserva neste horário.' }
    }

    // 2. Verifica capacidade atual
    const { data: slot } = await supabase
      .from('training_slots')
      .select('capacity, booked_count, status')
      .eq('id', slotId)
      .eq('academy_id', tenant.id)
      .single()

    if (!slot) return { success: false, message: 'Horário não encontrado.' }
    if (slot.status !== 'open') return { success: false, message: 'Este horário está fechado.' }

    // 3. Slot lotado → lista de espera
    if (slot.booked_count >= slot.capacity) {
      const { data: waitlistPos } = await supabase
        .from('waitlist')
        .select('position')
        .eq('slot_id', slotId)
        .eq('academy_id', tenant.id)
        .eq('is_active', true)
        .order('position', { ascending: false })
        .limit(1)
        .single()

      const nextPos = (waitlistPos?.position ?? 0) + 1

      const { error: wErr } = await supabase
        .from('waitlist')
        .insert({
          slot_id: slotId,
          student_id: student.id,
          academy_id: tenant.id,
          position: nextPos,
        })

      if (wErr) return { success: false, message: 'Erro ao entrar na lista de espera.' }

      return {
        success: true,
        waitlist: true,
        position: nextPos,
        message: `Você está na posição ${nextPos} da fila de espera.`,
      }
    }

    // 4. Cria reserva
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .insert({
        slot_id: slotId,
        student_id: student.id,
        academy_id: tenant.id,
        status: 'confirmed',
        notes: notes ?? null,
      })
      .select()
      .single()

    if (bErr) return { success: false, message: 'Erro ao realizar reserva. Tente novamente.' }

    return {
      success: true,
      waitlist: false,
      booking: booking as unknown as import('@/types/domain').Booking,
      message: 'Reserva confirmada com sucesso!',
    }
  }, [student?.id, tenant.id, supabase])

  const cancelBooking = useCallback(async (bookingId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    // Verifica prazo de cancelamento
    const { data: booking } = await supabase
      .from('bookings')
      .select(`*, slot:training_slots(start_time, training_day:training_days(date))`)
      .eq('id', bookingId)
      .single()

    if (!booking) return { success: false, message: 'Reserva não encontrada.' }

    // Verifica prazo
    const slotDate = (booking.slot as Record<string, unknown>)?.training_day as Record<string, unknown>
    const slotDateStr = slotDate?.date as string
    const slotTime = (booking.slot as Record<string, unknown>)?.start_time as string
    if (slotDateStr && slotTime) {
      const slotDateTime = new Date(`${slotDateStr}T${slotTime}`)
      const hoursUntilSlot = (slotDateTime.getTime() - Date.now()) / 3600000
      if (hoursUntilSlot < tenant.settings.cancelDeadlineHours) {
        return {
          success: false,
          message: `Cancelamento permitido até ${tenant.settings.cancelDeadlineHours}h antes do treino.`,
        }
      }
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancel_reason: reason ?? null })
      .eq('id', bookingId)

    if (error) return { success: false, message: 'Erro ao cancelar reserva.' }
    return { success: true, message: 'Reserva cancelada.' }
  }, [supabase, tenant.settings.cancelDeadlineHours])

  return { createBooking, cancelBooking }
}

// ============================================================
// src/hooks/useSchedule.ts
// Hook para carregar agenda + realtime de slots
// ============================================================
import { format } from 'date-fns'

export function useSchedule(selectedDate: Date) {
  const { student } = useAuth()
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()
  const [trainingDay, setTrainingDay] = useState<import('@/types/domain').TrainingDay | null>(null)
  const [slots, setSlots] = useState<SlotWithContext[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  const loadDay = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: day } = await supabase
        .from('training_days')
        .select(`
          *,
          training_slots(
            *,
            bookings(id, status, student_id)
          )
        `)
        .eq('academy_id', tenant.id)
        .eq('date', dateStr)
        .single()

      if (!day) { setTrainingDay(null); setSlots([]); return }

      setTrainingDay(day as unknown as import('@/types/domain').TrainingDay)

      const now = new Date()
      const today = format(now, 'yyyy-MM-dd')

      const enriched: SlotWithContext[] = ((day.training_slots ?? []) as unknown as import('@/types/domain').TrainingSlot[]).map(slot => {
        const userBooking = (slot.bookings ?? []).find(
          (b: { student_id: string; status: string }) => b.student_id === student?.id && b.status === 'confirmed'
        ) ?? null

        const slotDateTime = new Date(`${dateStr}T${slot.startTime}`)
        const isPast = slotDateTime < now

        return {
          ...slot,
          availableSpots: Math.max(0, slot.capacity - slot.bookedCount),
          isFull: slot.bookedCount >= slot.capacity,
          dayObservation: (day as Record<string, unknown>).observation as string | null,
          dayTheme: (day as Record<string, unknown>).theme as string | null,
          dayDate: dateStr,
          isToday: dateStr === today,
          isPast,
          userBooking: userBooking as unknown as import('@/types/domain').Booking | null,
          userWaitlistPosition: null,
        }
      })

      setSlots(enriched)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, tenant.id, dateStr, student?.id])

  // Subscreve realtime nos slots do dia
  useEffect(() => {
    loadDay()

    // Canal com namespace por tenant
    const ch = supabase
      .channel(`${tenant.id}:slots:${dateStr}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'training_slots',
          filter: `academy_id=eq.${tenant.id}`,
        },
        (payload) => {
          const updated = payload.new as import('@/types/domain').TrainingSlot
          setSlots(prev => prev.map(s =>
            s.id === updated.id
              ? {
                  ...s,
                  bookedCount: updated.bookedCount,
                  availableSpots: Math.max(0, updated.capacity - updated.bookedCount),
                  isFull: updated.bookedCount >= updated.capacity,
                  status: updated.status,
                }
              : s
          ))
        }
      )
      .subscribe()

    channelRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [dateStr, tenant.id, supabase, loadDay])

  return { trainingDay, slots, isLoading, refetch: loadDay }
}

// ============================================================
// src/hooks/useCoachRealtime.ts
// Hook do professor — recebe eventos em tempo real com toast+som
// ============================================================

export function useCoachRealtime() {
  const { coach } = useAuth()
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!coach) return

    // Canal de bookings da academia
    const ch = supabase
      .channel(`${tenant.id}:coach-realtime`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `academy_id=eq.${tenant.id}`,
        },
        async (payload) => {
          const booking = payload.new as Record<string, unknown>

          // Busca nome do aluno e horário
          const { data: studentData } = await supabase
            .from('students')
            .select('profile:profiles(full_name)')
            .eq('id', booking.student_id as string)
            .single()

          const { data: slotData } = await supabase
            .from('training_slots')
            .select('start_time, training_day:training_days(date)')
            .eq('id', booking.slot_id as string)
            .single()

          const studentName = (studentData?.profile as Record<string, string>)?.full_name ?? 'Aluno'
          const slotTime = slotData?.start_time ? slotData.start_time.slice(0, 5) : '—'

          notify.newBooking(studentName, slotTime)

          // Cria notificação in-app para o coach
          if (coach.profileId) {
            await supabase.from('notifications').insert({
              user_id: coach.profileId,
              academy_id: tenant.id,
              type: 'booking_created',
              title: 'Novo agendamento',
              body: `${studentName} reservou ${slotTime}`,
              data: { booking_id: booking.id, slot_id: booking.slot_id },
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `academy_id=eq.${tenant.id}`,
        },
        async (payload) => {
          const newBooking = payload.new as Record<string, unknown>
          const oldBooking = payload.old as Record<string, unknown>

          if (newBooking.status === 'cancelled' && oldBooking.status === 'confirmed') {
            const { data: studentData } = await supabase
              .from('students')
              .select('profile:profiles(full_name)')
              .eq('id', newBooking.student_id as string)
              .single()

            const { data: slotData } = await supabase
              .from('training_slots')
              .select('start_time')
              .eq('id', newBooking.slot_id as string)
              .single()

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
