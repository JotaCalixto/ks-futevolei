'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/Providers'
import { useTenant } from '@/components/providers/TenantProvider'
import type { SlotWithContext } from '@/types/domain'

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
        .select('*, training_slots(*, bookings(id, status, student_id))')
        .eq('academy_id', tenant.id)
        .eq('date', dateStr)
        .maybeSingle()

      if (!day) { setTrainingDay(null); setSlots([]); return }

      setTrainingDay({ ...day, isOpen: (day as any).is_open } as unknown as import('@/types/domain').TrainingDay)

      const now = new Date()
      const today = format(now, 'yyyy-MM-dd')

      const enriched: SlotWithContext[] = ((day.training_slots ?? []) as any[]).map((slot: any) => {
        const userBooking = (slot.bookings ?? []).find(
          (b: { student_id: string; status: string }) => b.student_id === student?.id && b.status === 'confirmed'
        ) ?? null
        const bookedCount = slot.booked_count ?? 0
        const startTime = slot.start_time ?? ''
        const endTime = slot.end_time ?? ''
        const slotDateTime = new Date(dateStr + 'T' + startTime + '-03:00')
        const isPast = slotDateTime < now
        return {
          ...slot,
          startTime,
          endTime,
          bookedCount,
          availableSpots: Math.max(0, slot.capacity - bookedCount),
          isFull: bookedCount >= slot.capacity,
          dayObservation: (day as any).observation ?? null,
          dayTheme: (day as any).theme ?? null,
          dayDate: dateStr,
          isToday: dateStr === today,
          isPast,
          userBooking: userBooking ?? null,
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
      .channel(tenant.id + ':slots:' + dateStr)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'training_slots', filter: 'academy_id=eq.' + tenant.id },
        (payload) => {
          const updated = payload.new as any
          setSlots(prev => prev.map(s =>
            s.id === updated.id
              ? { ...s, bookedCount: updated.booked_count ?? 0, availableSpots: Math.max(0, updated.capacity - (updated.booked_count ?? 0)), isFull: (updated.booked_count ?? 0) >= updated.capacity, status: updated.status }
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