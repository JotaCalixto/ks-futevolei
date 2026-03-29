'use client'
// src/hooks/useSupabaseWithTenant.ts
// Hook que injeta academy_id automaticamente em todas as queries
// Garante que nenhuma query vaze dados entre tenants no client-side

import { useMemo, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useTenant } from '@/components/providers/TenantProvider'
import type { Database } from '@/types/supabase'
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'

type TableName = keyof Database['public']['Tables']

// ============================================================
// HOOK PRINCIPAL
// ============================================================
export function useSupabaseWithTenant() {
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()
  const academyId = tenant.id

  // Query builder com academy_id injetado automaticamente
  const from = useCallback(<T extends TableName>(table: T) => {
    return supabase
      .from(table)
      .select('*')
      // RLS já garante no banco, mas adicionamos no client como dupla segurança
      // Isso evita bugs de UI onde o academyId errado escorrega por um estado temporário
      // @ts-ignore — tipos genéricos do Supabase são complexos aqui
      .eq('academy_id', academyId)
  }, [supabase, academyId])

  // Insert com academy_id injetado
  const insert = useCallback(<T extends TableName>(
    table: T,
    // @ts-ignore
    data: Database['public']['Tables'][T]['Insert'] | Database['public']['Tables'][T]['Insert'][]
  ) => {
    const withAcademy = Array.isArray(data)
      ? data.map(row => ({ ...row, academy_id: academyId }))
      // @ts-ignore
      : { ...data, academy_id: academyId }

    return supabase.from(table).insert(withAcademy as Parameters<typeof supabase.from<T>>[0])
  }, [supabase, academyId])

  // Realtime channel com namespace por tenant (evita cross-tenant events)
  const channel = useCallback((name: string) => {
    return supabase.channel(`${academyId}:${name}`)
  }, [supabase, academyId])

  return {
    supabase,
    academyId,
    from,
    insert,
    channel,
  }
}

// ============================================================
// HOOK PARA QUERIES DE TREINO — Com tenant já aplicado
// ============================================================
export function useScheduleQuery() {
  const { academyId, supabase } = useSupabaseWithTenant()

  const getTrainingDays = useCallback(async (startDate: string, endDate: string) => {
    return supabase
      .from('training_days')
      .select(`
        *,
        training_slots (
          *,
          bookings (id, status, student_id)
        )
      `)
      .eq('academy_id', academyId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
  }, [supabase, academyId])

  const getSlotWithBookings = useCallback(async (slotId: string) => {
    return supabase
      .from('training_slots')
      .select(`
        *,
        training_day:training_days(*),
        bookings(
          *,
          student:students(*, profile:profiles(*))
        ),
        waitlist(
          *,
          student:students(*, profile:profiles(*))
        )
      `)
      .eq('id', slotId)
      .eq('academy_id', academyId)
      .single()
  }, [supabase, academyId])

  return { getTrainingDays, getSlotWithBookings }
}

// ============================================================
// HOOK PARA MENSAGENS — Com tenant e limpeza automática
// ============================================================
export function useMessagesQuery() {
  const { academyId, supabase, channel } = useSupabaseWithTenant()

  const getConversations = useCallback(async (userId: string) => {
    return supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*)
      `)
      .eq('academy_id', academyId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
  }, [supabase, academyId])

  const subscribeToMessages = useCallback((
    userId: string,
    onMessage: (payload: Record<string, unknown>) => void
  ) => {
    const ch = channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `academy_id=eq.${academyId}`,
        },
        (payload) => {
          // Filtra apenas mensagens do usuário atual
          const msg = payload.new as Record<string, unknown>
          if (msg.receiver_id === userId || msg.sender_id === userId) {
            onMessage(payload.new as Record<string, unknown>)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [supabase, academyId, channel])

  return { getConversations, subscribeToMessages }
}

// ============================================================
// HOOK PARA REALTIME DE SLOTS — Vagas em tempo real
// ============================================================
export function useSlotRealtime(slotId: string | null, onUpdate: (slot: Record<string, unknown>) => void) {
  const { academyId, supabase, channel } = useSupabaseWithTenant()

  const subscribe = useCallback(() => {
    if (!slotId) return () => {}

    const ch = channel(`slot:${slotId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'training_slots',
          filter: `id=eq.${slotId}`,
        },
        (payload) => onUpdate(payload.new as Record<string, unknown>)
      )
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [slotId, academyId, supabase, channel, onUpdate])

  return { subscribe }
}
