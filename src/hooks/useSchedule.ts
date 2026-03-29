'use client'
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
