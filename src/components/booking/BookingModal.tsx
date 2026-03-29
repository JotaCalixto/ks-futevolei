'use client'
// src/components/booking/BookingModal.tsx
// Sheet de reserva premium — confirmação, animação de sucesso e feedback em tempo real

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, MapPin, Users, CheckCircle,
  X, Hourglass, AlertTriangle, Loader2, ChevronRight,
} from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { toast } from 'sonner'
import { formatTrainingDate, formatTime, cn } from '@/lib/utils'
import { StatusBadge, SpotsBadge } from '@/components/shared/Cards'
import type { SlotWithContext } from '@/types/domain'

type BookingStep = 'confirm' | 'loading' | 'success' | 'waitlist'

interface BookingModalProps {
  slot: SlotWithContext | null
  open: boolean
  onClose: () => void
  onBook: (slotId: string, notes?: string) => Promise<{ success: boolean; waitlist?: boolean; position?: number; message: string }>
}

export function BookingModal({ slot, open, onClose, onBook }: BookingModalProps) {
  const [step, setStep] = useState<BookingStep>('confirm')
  const [notes, setNotes] = useState('')
  const [waitlistPos, setWaitlistPos] = useState<number | null>(null)

  const handleClose = useCallback(() => {
    if (step === 'loading') return
    onClose()
    // Reset após animação fechar
    setTimeout(() => { setStep('confirm'); setNotes(''); setWaitlistPos(null) }, 350)
  }, [step, onClose])

  const handleConfirm = useCallback(async () => {
    if (!slot) return
    setStep('loading')

    try {
      const result = await onBook(slot.id, notes || undefined)
      if (result.success) {
        if (result.waitlist) {
          setWaitlistPos(result.position ?? null)
          setStep('waitlist')
        } else {
          setStep('success')
        }
      } else {
        setStep('confirm')
        toast.error(result.message)
      }
    } catch {
      setStep('confirm')
      toast.error('Erro ao realizar reserva. Tente novamente.')
    }
  }, [slot, notes, onBook])

  if (!slot) return null

  const isFull = slot.isFull
  const ctaLabel = isFull ? 'Entrar na Fila de Espera' : 'Confirmar Reserva'

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className={cn(
          'border-t border-white/[0.08] rounded-t-2xl',
          'bg-[#111111] px-0 pb-0',
          'max-h-[92svh]',
          'focus:outline-none',
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="overflow-y-auto max-h-[80svh] px-5 pb-8">
          <AnimatePresence mode="wait">

            {/* ── STEP: Confirmar ──────────────────────────── */}
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between pt-2">
                  <h2 className="text-lg font-bold text-white">
                    {isFull ? 'Lista de Espera' : 'Confirmar Reserva'}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-graphite-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Alerta se for lista de espera */}
                {isFull && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Hourglass className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-300 leading-relaxed">
                      Este horário está lotado. Você entrará na fila de espera e será notificado se uma vaga abrir.
                    </p>
                  </div>
                )}

                {/* Detalhes do slot */}
                <div className="gold-card rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--brand-primary, #D4A017)' }}>
                    <Calendar className="w-3.5 h-3.5" />
                    {formatTrainingDate(slot.dayDate)}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-graphite-500" />
                      <span className="text-xl font-black text-white">
                        {formatTime(slot.startTime)}
                      </span>
                      <span className="text-graphite-500">–</span>
                      <span className="text-base font-semibold text-graphite-300">
                        {formatTime(slot.endTime)}
                      </span>
                    </div>
                    <SpotsBadge available={slot.availableSpots} capacity={slot.capacity} />
                  </div>

                  {slot.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-graphite-500" />
                      <span className="text-sm text-graphite-400">{slot.location}</span>
                    </div>
                  )}

                  {slot.observation && (
                    <div className="pt-2 border-t border-white/[0.06]">
                      <p className="text-xs text-graphite-400 italic leading-relaxed">
                        "{slot.observation}"
                      </p>
                    </div>
                  )}

                  {slot.dayObservation && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5">
                      <span className="text-[var(--brand-primary,#D4A017)] text-xs">📢</span>
                      <p className="text-xs text-graphite-300 leading-relaxed">{slot.dayObservation}</p>
                    </div>
                  )}
                </div>

                {/* Campo de observações */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">
                    Observação (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Ex: Pode me colocar na quadra 2?"
                    rows={2}
                    maxLength={300}
                    className="input-premium resize-none text-sm"
                  />
                </div>

                {/* Política de cancelamento */}
                <p className="text-xs text-graphite-600 text-center leading-relaxed">
                  Cancelamento gratuito até 2 horas antes do treino
                </p>

                {/* CTAs */}
                <div className="flex gap-3 pb-2">
                  <button onClick={handleClose} className="btn-ghost flex-1 border border-white/10">
                    Voltar
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm text-graphite-900 transition-all active:scale-95"
                    style={{ background: 'var(--brand-primary, #D4A017)' }}
                  >
                    {isFull ? <Hourglass className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {ctaLabel}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP: Loading ────────────────────────────── */}
            {step === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 space-y-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-10 h-10" style={{ color: 'var(--brand-primary, #D4A017)' }} />
                </motion.div>
                <p className="text-sm text-graphite-400 font-medium">Realizando reserva...</p>
              </motion.div>
            )}

            {/* ── STEP: Sucesso ────────────────────────────── */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex flex-col items-center text-center py-10 space-y-5"
              >
                {/* Ícone animado */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
                  className="relative w-20 h-20 flex items-center justify-center"
                >
                  {/* Glow ring */}
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'var(--brand-primary-glow, rgba(212,160,23,0.3))' }}
                  />
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--brand-gradient-subtle, rgba(212,160,23,0.15))', border: '2px solid var(--brand-primary-border, rgba(212,160,23,0.4))' }}
                  >
                    <CheckCircle className="w-10 h-10" style={{ color: 'var(--brand-primary, #D4A017)' }} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <h3 className="text-2xl font-black text-white">Reserva confirmada!</h3>
                  <p className="text-graphite-400 text-sm">
                    {formatTrainingDate(slot.dayDate)} às {formatTime(slot.startTime)}
                  </p>
                  {slot.observation && (
                    <p className="text-xs text-graphite-500 italic mt-1">"{slot.observation}"</p>
                  )}
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl font-bold text-sm text-graphite-900"
                  style={{ background: 'var(--brand-primary, #D4A017)' }}
                >
                  Perfeito!
                </motion.button>
              </motion.div>
            )}

            {/* ── STEP: Lista de Espera ────────────────────── */}
            {step === 'waitlist' && (
              <motion.div
                key="waitlist"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex flex-col items-center text-center py-10 space-y-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.1 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '2px solid rgba(245,158,11,0.4)' }}
                >
                  <Hourglass className="w-10 h-10 text-amber-400" />
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">Você está na fila!</h3>
                  {waitlistPos && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30">
                      <span className="text-amber-400 font-black text-lg">{waitlistPos}ª</span>
                      <span className="text-amber-300 text-sm font-medium">posição na fila</span>
                    </div>
                  )}
                  <p className="text-graphite-400 text-sm leading-relaxed max-w-xs">
                    Você será notificado imediatamente se uma vaga abrir.
                  </p>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl font-bold text-sm border border-amber-500/30 text-amber-400 bg-amber-500/10"
                >
                  Entendido
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  )
}
