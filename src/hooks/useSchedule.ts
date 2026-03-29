'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/Providers'
import { useTenant } from '@/components/providers/TenantProvider'
import type { TrainingDay, SlotWithContext, SlotStatus } from '@/types/domain'

export function useSchedule(selectedDate: Date) {
  const { student } = useAuth()
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()
  const [trainingDay, setTrainingDay] = useState<TrainingDay | null>(null)
  const [slots, setSlots] = useState<SlotWithContext[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  const loadDay = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: day } = await supabase
        .from('training_days')
        .select(`*, training_slots(*, bookings(id, status, student_id))`)
        .eq('academy_id', tenant.id)
        .eq('date', dateStr)
        .single()

      if (!day) { setTrainingDay(null); setSlots([]); return }

      setTrainingDay({
        id: day.id,
        academyId: day.academy_id,
        coachId: day.coach_id,
        date: day.date,
        isOpen: day.is_open,
        observation: day.observation ?? null,
        theme: day.theme ?? null,
        createdAt: day.created_at,
        updatedAt: day.updated_at,
      })

      const now = new Date()
      const today = format(now, 'yyyy-MM-dd')

      const enriched: SlotWithContext[] = ((day.training_slots ?? []) as never[]).map((slot: Record<string, unknown>) => {
        const bookings = (slot.bookings ?? []) as Array<{ student_id: string; status: string }>
        const userBooking = bookings.find(b => b.student_id === student?.id && b.status === 'confirmed') ?? null
        const slotDateTime = new Date(`${dateStr}T${slot.start_time}`)
        const capacity = slot.capacity as number
        const bookedCount = bookings.filter(b => b.status === 'confirmed').length

        return {
          id: slot.id as string,
          trainingDayId: slot.training_day_id as string,
          academyId: slot.academy_id as string,
          coachId: slot.coach_id as string,
          startTime: slot.start_time as string,
          endTime: slot.end_time as string,
          capacity,
          bookedCount,
          status: slot.status as SlotStatus,
          observation: slot.observation as string | null,
          location: slot.location as string,
          createdAt: slot.created_at as string,
          updatedAt: slot.updated_at as string,
          availableSpots: Math.max(0, capacity - bookedCount),
          isFull: bookedCount >= capacity,
          dayObservation: day.observation as string | null,
          dayTheme: day.theme as string | null,
          dayDate: dateStr,
          isToday: dateStr === today,
          isPast: slotDateTime < now,
          userBooking: userBooking as never,
          userWaitlistPosition: null,
        }
      })
      setSlots(enriched)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, tenant.id, dateStr, student?.id])

  useEffect(() => {
    loadDay()
    const ch = supabase
      .channel(`${tenant.id}:slots:${dateStr}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'training_slots', filter: `academy_id=eq.${tenant.id}` },
        (payload) => {
          const updated = payload.new as Record<string, unknown>
          setSlots(prev => prev.map(s =>
            s.id === updated.id ? {
              ...s,
              bookedCount: updated.booked_count as number,
              availableSpots: Math.max(0, (updated.capacity as number) - (updated.booked_count as number)),
              isFull: (updated.booked_count as number) >= (updated.capacity as number),
              status: updated.status as never,
            } : s
          ))
        }
      )
      .subscribe()
    channelRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [dateStr, tenant.id, supabase, loadDay])

  return { trainingDay, slots, isLoading, refetch: loadDay }
}