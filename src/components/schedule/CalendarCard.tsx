'use client'
// src/components/schedule/CalendarCard.tsx
// Calendário horizontal de seleção de datas — estilo esportivo premium

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Lock, Zap } from 'lucide-react'
import { format, addDays, startOfToday, isSameDay, parseISO, isToday, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { TrainingDay } from '@/types/domain'

interface CalendarCardProps {
  trainingDays: TrainingDay[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
  /** Quantos dias mostrar na faixa */
  windowDays?: number
}

export function CalendarStrip({ trainingDays, selectedDate, onSelectDate, windowDays = 14 }: CalendarCardProps) {
  const today = startOfToday()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Gera array de datas
  const dates = Array.from({ length: windowDays }, (_, i) => addDays(today, i - 1))

  // Mapa de treiningDays por data string
  const dayMap = new Map(trainingDays.map(d => [d.date, d]))

  // Scroll para a data selecionada
  useEffect(() => {
    if (!scrollRef.current) return
    const selectedIdx = dates.findIndex(d => isSameDay(d, selectedDate))
    if (selectedIdx >= 0) {
      const el = scrollRef.current.children[selectedIdx] as HTMLElement
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [selectedDate])

  return (
    <div>
      {/* Header do mês */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h3 className="text-base font-bold text-white capitalize">
          {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <div className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--brand-primary, #D4A017)' }}>
          {isToday(selectedDate) ? 'Hoje' : format(selectedDate, "EEE, dd", { locale: ptBR })}
        </div>
      </div>

      {/* Faixa de dias */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-1"
      >
        {dates.map((date, i) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const trainingDay = dayMap.get(dateStr)
          const isPast = isBefore(date, today)
          const isSelected = isSameDay(date, selectedDate)
          const hasTraining = !!trainingDay && trainingDay.isOpen && !isPast
          const dayIsToday = isToday(date)

          return (
            <motion.button
              key={dateStr}
              onClick={() => onSelectDate(date)}
              whileTap={{ scale: 0.92 }}
              className={cn(
                'flex-shrink-0 flex flex-col items-center gap-1',
                'w-[52px] py-2.5 px-1.5 rounded-xl',
                'border transition-all duration-200',
                'no-tap-highlight select-none',
                isSelected
                  ? 'border-transparent text-graphite-900'
                  : isPast
                    ? 'border-white/[0.04] text-graphite-600 opacity-50'
                    : hasTraining
                      ? 'border-white/[0.08] text-white hover:border-white/20'
                      : 'border-white/[0.05] text-graphite-500 hover:border-white/10',
              )}
              style={isSelected ? {
                background: 'var(--brand-primary, #D4A017)',
                boxShadow: 'var(--brand-shadow, 0 0 20px rgba(212,160,23,0.3))',
              } : {
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              {/* Dia da semana */}
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wider',
                isSelected ? 'text-graphite-900/70' : dayIsToday ? 'opacity-100' : 'opacity-70',
              )}>
                {format(date, 'EEE', { locale: ptBR }).slice(0, 3)}
              </span>

              {/* Número do dia */}
              <span className={cn(
                'text-lg font-black leading-none',
                isSelected && 'text-graphite-900',
              )}>
                {format(date, 'd')}
              </span>

              {/* Indicador de treino */}
              <div className="h-1.5 flex items-center justify-center">
                {hasTraining && !isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--brand-primary, #D4A017)' }}
                  />
                )}
                {!hasTraining && !isPast && trainingDay && !trainingDay.isOpen && (
                  <Lock className="w-2.5 h-2.5 text-graphite-600" />
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ── DayObservation — banner de observação do dia ─────────────

interface DayObservationProps {
  observation: string
  theme?: string
  date: string
}

export function DayObservation({ observation, theme, date }: DayObservationProps) {
  if (!observation && !theme) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 rounded-xl overflow-hidden"
      style={{
        background: 'var(--brand-gradient-subtle, rgba(212,160,23,0.08))',
        border: '1px solid var(--brand-primary-border, rgba(212,160,23,0.2))',
      }}
    >
      <div
        className="h-[2px]"
        style={{ background: 'var(--brand-gradient, linear-gradient(135deg, #D4A017, #FBBF24))' }}
      />
      <div className="px-4 py-3 flex items-start gap-3">
        <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand-primary, #D4A017)' }} />
        <div>
          {theme && (
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5"
              style={{ color: 'var(--brand-primary, #D4A017)' }}>
              {theme}
            </p>
          )}
          {observation && (
            <p className="text-sm text-graphite-300 leading-relaxed">{observation}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Tabela de admin para professor ────────────────────────────

interface PremiumTableProps<T> {
  columns: Array<{
    key: keyof T | string
    label: string
    render?: (row: T) => React.ReactNode
    width?: string
  }>
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  isLoading?: boolean
}

export function PremiumTable<T>({
  columns, data, keyExtractor, onRowClick, emptyMessage = 'Nenhum registro', isLoading,
}: PremiumTableProps<T>) {
  return (
    <div className="solid-card rounded-xl overflow-hidden">
      {/* Cabeçalho */}
      <div
        className="flex border-b border-white/[0.06]"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        {columns.map(col => (
          <div
            key={String(col.key)}
            className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-graphite-500"
            style={{ width: col.width ?? `${100 / columns.length}%` }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Linhas */}
      {isLoading ? (
        <div className="py-12 text-center text-graphite-600 text-sm">Carregando...</div>
      ) : data.length === 0 ? (
        <div className="py-12 text-center text-graphite-600 text-sm">{emptyMessage}</div>
      ) : (
        data.map((row, i) => (
          <motion.div
            key={keyExtractor(row)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onRowClick?.(row)}
            className={cn(
              'flex border-b border-white/[0.04] last:border-0',
              'transition-colors duration-150',
              onRowClick && 'cursor-pointer hover:bg-white/[0.03] no-tap-highlight',
            )}
          >
            {columns.map(col => (
              <div
                key={String(col.key)}
                className="px-4 py-3.5 flex items-center"
                style={{ width: col.width ?? `${100 / columns.length}%` }}
              >
                {col.render
                  ? col.render(row)
                  : <span className="text-sm text-white truncate">{String((row as Record<string, unknown>)[String(col.key)] ?? '—')}</span>
                }
              </div>
            ))}
          </motion.div>
        ))
      )}
    </div>
  )
}
