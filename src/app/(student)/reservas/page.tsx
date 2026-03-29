'use client'
// src/app/(student)/reservas/page.tsx

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare, Clock, History,
  Calendar, MapPin, Trash2, Loader2,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/Providers'
import { useTenant } from '@/components/providers/TenantProvider'
import { AppShell, PageHeader, Section } from '@/components/layout/AppShell'
import { SolidCard } from '@/components/shared/Cards'
import { StatusBadge } from '@/components/shared/Cards'
import { EmptyState, SlotCardSkeleton } from '@/components/shared/SharedComponents'
import { useBooking } from '@/hooks/useBooking'
import {
  formatTrainingDate, formatTime, formatDate,
  formatRelativeDate, cn,
} from '@/lib/utils'
import type { Booking } from '@/types/domain'

type Tab = 'upcoming' | 'history'

interface EnrichedBooking extends Booking {
  slot: {
    id: string
    start_time: string
    end_time: string
    location: string
    observation: string | null
    training_day: {
      date: string
      observation: string | null
    }
  }
}

export default function ReservasPage() {
  const [tab, setTab] = useState<Tab>('upcoming')
  const [bookings, setBookings] = useState<EnrichedBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { student } = useAuth()
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()
  const { cancelBooking } = useBooking()

  const load = useCallback(async () => {
    if (!student?.id) return
    setIsLoading(true)

    const now = new Date().toISOString()

    const query = supabase
      .from('bookings')
      .select(`
        *,
        slot:training_slots(
          id, start_time, end_time, location, observation,
          training_day:training_days(date, observation)
        )
      `)
      .eq('student_id', student.id)
      .eq('academy_id', tenant.id)
      .order('created_at', { ascending: false })

    if (tab === 'upcoming') {
      query
        .eq('status', 'confirmed')
    } else {
      query
        .in('status', ['confirmed', 'cancelled', 'attended', 'no_show'])
        .lt('booked_at', now)
        .limit(30)
    }

    const { data } = await query.limit(50)
    setBookings((data ?? []) as unknown as EnrichedBooking[])
    setIsLoading(false)
  }, [student?.id, tenant.id, supabase, tab])

  useEffect(() => { load() }, [load])

  const handleCancel = useCallback(async (bookingId: string) => {
    setCancellingId(bookingId)
    const result = await cancelBooking(bookingId)
    if (result.success) {
      toast.success('Reserva cancelada')
      load()
    } else {
      toast.error(result.message)
    }
    setCancellingId(null)
  }, [cancelBooking, load])

  return (
    <AppShell>
      <PageHeader title="Minhas Reservas" withDivider />

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-4 pb-2">
        {([
          { id: 'upcoming', label: 'Próximas', icon: Clock },
          { id: 'history',  label: 'Histórico', icon: History },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
              tab === id
                ? 'text-graphite-900'
                : 'text-graphite-500 bg-white/5 hover:text-white',
            )}
            style={tab === id ? {
              background: 'var(--brand-primary, #D4A017)',
            } : {}}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <SlotCardSkeleton count={3} />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="w-7 h-7" />}
            title={tab === 'upcoming' ? 'Nenhuma reserva futura' : 'Sem histórico ainda'}
            description={tab === 'upcoming' ? 'Reserve um treino na aba Agenda.' : 'Suas reservas passadas aparecerão aqui.'}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div className="space-y-3 mt-2">
              {bookings.map((booking, i) => (
                <BookingItem
                  key={booking.id}
                  booking={booking}
                  index={i}
                  isExpanded={expandedId === booking.id}
                  onToggle={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                  onCancel={tab === 'upcoming' ? handleCancel : undefined}
                  cancellingId={cancellingId}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </AppShell>
  )
}

// ── Item de reserva ──────────────────────────────────────────

interface BookingItemProps {
  booking: EnrichedBooking
  index: number
  isExpanded: boolean
  onToggle: () => void
  onCancel?: (id: string) => void
  cancellingId: string | null
}

function BookingItem({ booking, index, isExpanded, onToggle, onCancel, cancellingId }: BookingItemProps) {
  const [confirmCancel, setConfirmCancel] = useState(false)
  const slot = booking.slot
  const day = slot?.training_day

  const isCancelling = cancellingId === booking.id
  const canCancel = booking.status === 'confirmed' && onCancel

  const slotDate = day?.date
  const displayDate = slotDate ? formatTrainingDate(slotDate) : '—'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <SolidCard
        className={cn(
          'overflow-hidden',
          booking.status === 'cancelled' && 'opacity-60',
        )}
      >
        {/* Linha de topo com cor do status */}
        <div
          className="h-[2px]"
          style={{
            background:
              booking.status === 'confirmed' ? 'var(--brand-primary,#D4A017)' :
              booking.status === 'attended'  ? '#22C55E' :
              booking.status === 'no_show'   ? '#EF4444' :
              '#484848',
          }}
        />

        {/* Conteúdo principal */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 text-left no-tap-highlight"
        >
          <div className="flex-1 min-w-0">
            {/* Data */}
            <p className="text-xs font-bold uppercase tracking-widest mb-1.5"
              style={{ color: booking.status === 'confirmed' ? 'var(--brand-primary,#D4A017)' : '#717171' }}>
              {displayDate}
            </p>

            {/* Horário */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white leading-none">
                {slot?.start_time ? formatTime(slot.start_time) : '—'}
              </span>
              {slot?.end_time && (
                <>
                  <span className="text-graphite-600">–</span>
                  <span className="text-sm font-semibold text-graphite-400">
                    {formatTime(slot.end_time)}
                  </span>
                </>
              )}
            </div>

            {/* Local */}
            {slot?.location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-graphite-600" />
                <span className="text-xs text-graphite-500">{slot.location}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-3">
            <StatusBadge
              status={booking.status === 'confirmed' ? 'confirmed' :
                      booking.status === 'attended'  ? 'attended'  :
                      booking.status === 'no_show'   ? 'no_show'   :
                      'cancelled'}
              size="sm"
              showDot={false}
            />
            {isExpanded
              ? <ChevronUp className="w-4 h-4 text-graphite-600" />
              : <ChevronDown className="w-4 h-4 text-graphite-600" />
            }
          </div>
        </button>

        {/* Detalhes expandidos */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06] pt-3">

                {/* Observação do treino */}
                {slot?.observation && (
                  <p className="text-xs text-graphite-400 italic">
                    "{slot.observation}"
                  </p>
                )}

                {/* Observação do dia */}
                {day?.observation && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5">
                    <span className="text-xs" style={{ color: 'var(--brand-primary,#D4A017)' }}>📢</span>
                    <p className="text-xs text-graphite-300">{day.observation}</p>
                  </div>
                )}

                {/* Data de agendamento */}
                <p className="text-xs text-graphite-600">
                  Agendado {formatRelativeDate((booking as unknown as {booked_at: string}).booked_at ?? booking.createdAt)}
                </p>

                {/* Notas do aluno */}
                {booking.notes && (
                  <p className="text-xs text-graphite-400">Obs: {booking.notes}</p>
                )}

                {/* Cancelamento */}
                {canCancel && (
                  <div>
                    {!confirmCancel ? (
                      <button
                        onClick={() => setConfirmCancel(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Cancelar reserva
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2"
                      >
                        <button
                          onClick={() => setConfirmCancel(false)}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold text-graphite-400 bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          Manter
                        </button>
                        <button
                          onClick={() => { onCancel!(booking.id); setConfirmCancel(false) }}
                          disabled={isCancelling}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold text-red-400 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 transition-colors flex items-center justify-center gap-1"
                        >
                          {isCancelling
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <>Confirmar cancelamento</>
                          }
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Motivo do cancelamento */}
                {booking.status === 'cancelled' && booking.cancelReason && (
                  <p className="text-xs text-graphite-600">
                    Motivo: {booking.cancelReason}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SolidCard>
    </motion.div>
  )
}
