'use client'
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
