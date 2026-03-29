'use client'
// src/components/booking/SlotCard.tsx
// Card de horário de treino — exibe status, vagas e observações em tempo real

import { motion } from 'framer-motion'
import { Clock, MapPin, Users, Lock, Hourglass, CheckCircle, ChevronRight } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import { StatusBadge, SpotsBadge } from '@/components/shared/Cards'
import type { SlotWithContext } from '@/types/domain'
import { cn } from '@/lib/utils'

interface SlotCardProps {
  slot: SlotWithContext
  onPress?: (slot: SlotWithContext) => void
  /** Modo compacto para listas densas */
  compact?: boolean
  /** Index para animação escalonada */
  index?: number
}

export function SlotCard({ slot, onPress, compact = false, index = 0 }: SlotCardProps) {
  const available = slot.availableSpots
  const isFull    = slot.isFull
  const isClosed  = slot.status !== 'open'
  const isPast    = slot.isPast
  const isBooked  = slot.userBooking?.status === 'confirmed'
  const isWaiting = slot.userWaitlistPosition !== null

  const isDisabled = isClosed || isPast
  const occupancyPercent = Math.min(100, Math.round((slot.bookedCount / slot.capacity) * 100))

  // Estado derivado para UX
  const ctaLabel = (() => {
    if (isBooked)   return 'Reservado'
    if (isWaiting)  return `Fila: ${slot.userWaitlistPosition}ª posição`
    if (isPast)     return 'Encerrado'
    if (isClosed)   return 'Fechado'
    if (isFull)     return 'Entrar na Fila'
    return 'Reservar'
  })()

  const ctaColor = (() => {
    if (isBooked || isWaiting) return 'text-[var(--brand-primary,#D4A017)]'
    if (isDisabled) return 'text-graphite-600'
    if (isFull) return 'text-amber-400'
    return 'text-white'
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      whileTap={!isDisabled ? { scale: 0.985 } : undefined}
      onClick={() => !isDisabled && onPress?.(slot)}
      className={cn(
        'relative overflow-hidden rounded-xl border transition-all duration-200',
        'no-tap-highlight select-none',
        isDisabled
          ? 'border-white/[0.05] bg-graphite-800/40 opacity-60 cursor-default'
          : isBooked
            ? 'border-[var(--brand-primary-border,rgba(212,160,23,0.3))] bg-[var(--brand-gradient-subtle)] cursor-pointer'
            : 'border-white/[0.08] bg-graphite-800/60 cursor-pointer hover:border-white/[0.14] hover:bg-graphite-800/80',
      )}
    >
      {/* Linha de acento esquerda com cor de status */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl',
          isBooked  ? 'bg-[var(--brand-primary,#D4A017)]' :
          isWaiting ? 'bg-amber-400' :
          isFull    ? 'bg-red-400' :
          isClosed  ? 'bg-graphite-600' :
          isPast    ? 'bg-graphite-700' :
          'bg-green-500',
        )}
      />

      <div className={cn('pl-4 pr-3', compact ? 'py-3' : 'py-4')}>

        {/* Linha principal */}
        <div className="flex items-center justify-between gap-3">

          {/* Horário + localização */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-graphite-500 flex-shrink-0" />
                <span className="text-base font-black text-white tracking-tight">
                  {formatTime(slot.startTime)}
                </span>
                <span className="text-graphite-600 text-sm">–</span>
                <span className="text-sm font-semibold text-graphite-400">
                  {formatTime(slot.endTime)}
                </span>
              </div>

              {/* Status badge */}
              {isBooked && (
                <StatusBadge status="confirmed" size="sm" animated />
              )}
              {isWaiting && (
                <StatusBadge status="waitlist" size="sm" />
              )}
              {isClosed && !isPast && (
                <StatusBadge status="closed" size="sm" />
              )}
            </div>

            {/* Localização */}
            {!compact && slot.location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-graphite-600" />
                <span className="text-xs text-graphite-500 font-medium">{slot.location}</span>
              </div>
            )}

            {/* Observação do treino */}
            {!compact && slot.observation && (
              <p className="text-xs text-graphite-400 mt-1.5 italic leading-snug line-clamp-1">
                "{slot.observation}"
              </p>
            )}
          </div>

          {/* Vagas + CTA */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Vagas */}
            <SpotsBadge available={available} capacity={slot.capacity} />

            {/* CTA */}
            {!isDisabled && (
              <div className={cn('flex items-center gap-1 text-xs font-semibold', ctaColor)}>
                {isBooked   ? <CheckCircle className="w-3 h-3" /> :
                 isWaiting  ? <Hourglass className="w-3 h-3" /> :
                 isFull     ? <Users className="w-3 h-3" /> :
                              <ChevronRight className="w-3 h-3" />}
                <span>{ctaLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Barra de ocupação */}
        {!compact && !isClosed && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-graphite-600" />
                <span className="text-[10px] text-graphite-500 font-medium">
                  {slot.bookedCount}/{slot.capacity}
                </span>
              </div>
              <span className="text-[10px] text-graphite-600 font-medium">
                {occupancyPercent}% ocupado
              </span>
            </div>
            <div className="h-1 rounded-full bg-graphite-700/60 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${occupancyPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.05 + 0.15 }}
                className="h-full rounded-full"
                style={{
                  background: isFull
                    ? '#EF4444'
                    : occupancyPercent > 70
                      ? '#F59E0B'
                      : 'var(--brand-primary, #D4A017)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
