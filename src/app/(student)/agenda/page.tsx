'use client'
// src/app/(student)/agenda/page.tsx

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfToday } from 'date-fns'
import { Lock, CalendarX } from 'lucide-react'
import { AppShell, PageHeader } from '@/components/layout/AppShell'
import { CalendarStrip, DayObservation } from '@/components/schedule/CalendarCard'
import { SlotCard } from '@/components/booking/SlotCard'
import { BookingModal } from '@/components/booking/BookingModal'
import { SlotCardSkeleton } from '@/components/shared/SharedComponents'
import { EmptyState } from '@/components/shared/SharedComponents'
import { useSchedule } from '@/hooks/useSchedule'
import { useBooking } from '@/hooks/useBooking'
import { useTenant } from '@/components/providers/TenantProvider'
import type { SlotWithContext, TrainingDay } from '@/types/domain'

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(startOfToday())
  const [selectedSlot, setSelectedSlot] = useState<SlotWithContext | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { tenant } = useTenant()

  const { trainingDay, slots, isLoading, refetch } = useSchedule(selectedDate)
  const { createBooking } = useBooking()

  // Precisamos dos training_days para preencher o CalendarStrip
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([])

  const handleSlotPress = useCallback((slot: SlotWithContext) => {
    // Já reservado — vai para reservas
    if (slot.userBooking?.status === 'confirmed') return
    setSelectedSlot(slot)
    setModalOpen(true)
  }, [])

  const handleBook = useCallback(async (slotId: string, notes?: string) => {
    const result = await createBooking(slotId, notes)
    if (result.success) {
      refetch()
    }
    return result
  }, [createBooking, refetch])

  const isDayClosed = trainingDay && !trainingDay.isOpen

  return (
    <AppShell>
      <PageHeader title="Agenda" subtitle="Escolha seu horário" withDivider />

      {/* Calendário */}
      <div className="pt-4 pb-3">
        <CalendarStrip
          trainingDays={trainingDays}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          windowDays={21}
        />
      </div>

      {/* Observação do dia */}
      <AnimatePresence mode="wait">
        {trainingDay?.observation && (
          <motion.div
            key="obs"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <DayObservation
              observation={trainingDay.observation}
              theme={trainingDay.theme ?? undefined}
              date={format(selectedDate, 'yyyy-MM-dd')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slots */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="mt-3">
            <SlotCardSkeleton count={4} />
          </div>
        ) : isDayClosed ? (
          <EmptyState
            icon={<Lock className="w-7 h-7" />}
            title="Dia fechado"
            description="Não há treinos disponíveis nesta data. Tente outro dia."
          />
        ) : !trainingDay || slots.length === 0 ? (
          <EmptyState
            icon={<CalendarX className="w-7 h-7" />}
            title="Sem treinos nesta data"
            description="O professor ainda não abriu horários para este dia."
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 mt-3"
          >
            {/* Contador de vagas totais */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-graphite-500">
                {slots.length} horário{slots.length !== 1 ? 's' : ''} disponível{slots.length !== 1 ? 'is' : ''}
              </p>
              <p className="text-xs text-graphite-600">
                {slots.filter(s => !s.isFull && s.status === 'open' && !s.isPast).length} com vagas
              </p>
            </div>

            {slots.map((slot, i) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                onPress={handleSlotPress}
                index={i}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal de reserva */}
      <BookingModal
        slot={selectedSlot}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedSlot(null) }}
        onBook={handleBook}
      />
    </AppShell>
  )
}
