'use client'
import { useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/Providers'
import { useTenant } from '@/components/providers/TenantProvider'
import type { CreateBookingResponse } from '@/types/domain'

export function useBooking() {
  const { student } = useAuth()
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()

  const createBooking = useCallback(async (
    slotId: string,
    notes?: string
  ): Promise<CreateBookingResponse> => {
    if (!student?.id) return { success: false, message: 'Não autenticado' }

    const { data: existing } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('slot_id', slotId)
      .eq('student_id', student.id)
      .maybeSingle()

    if (existing?.status === 'confirmed') {
      return { success: false, message: 'Você já tem uma reserva neste horário.' }
    }

    const { data: slot } = await supabase
      .from('training_slots')
      .select('capacity, booked_count, status')
      .eq('id', slotId)
      .eq('academy_id', tenant.id)
      .single()

    if (!slot) return { success: false, message: 'Horário não encontrado.' }
    if (slot.status !== 'open') return { success: false, message: 'Este horário está fechado.' }

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

      const { error: wErr } = await supabase.from('waitlist').insert({
        slot_id: slotId,
        student_id: student.id,
        academy_id: tenant.id,
        position: nextPos,
      })

      if (wErr) return { success: false, message: 'Erro ao entrar na lista de espera.' }
      return { success: true, waitlist: true, position: nextPos, message: `Você está na posição ${nextPos} da fila.` }
    }

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

    if (bErr) return { success: false, message: 'Erro ao realizar reserva.' }
    return { success: true, waitlist: false, booking: booking as never, message: 'Reserva confirmada!' }
  }, [student?.id, tenant.id, supabase])

  const cancelBooking = useCallback(async (bookingId: string): Promise<{ success: boolean; message: string }> => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) return { success: false, message: 'Erro ao cancelar reserva.' }
    return { success: true, message: 'Reserva cancelada.' }
  }, [supabase])

  return { createBooking, cancelBooking }
}