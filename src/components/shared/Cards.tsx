'use client'
// src/components/shared/Cards.tsx
// Família de cards premium — glass, solid e gold

import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

// ── Tipos base ────────────────────────────────────────────────

type CardVariant = 'glass' | 'solid' | 'gold' | 'flat'

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: CardVariant
  pressable?: boolean
  glow?: boolean
  radius?: 'md' | 'lg' | 'xl'
}

// ── Variantes de estilo ───────────────────────────────────────

const variantStyles: Record<CardVariant, string> = {
  glass: 'glass-card',
  solid: 'solid-card',
  gold:  'gold-card',
  flat:  'bg-transparent',
}

const radiusStyles = {
  md: 'rounded-[10px]',
  lg: 'rounded-[14px]',
  xl: 'rounded-[18px]',
}

// ── GlassCard ─────────────────────────────────────────────────

export const GlassCard = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'glass', pressable = false, glow = false, radius = 'lg', className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileTap={pressable ? { scale: 0.985 } : undefined}
        transition={{ duration: 0.12 }}
        className={cn(
          variantStyles[variant],
          radiusStyles[radius],
          'overflow-hidden',
          pressable && 'cursor-pointer active:brightness-95 no-tap-highlight',
          glow && 'shadow-[var(--brand-shadow)]',
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
GlassCard.displayName = 'GlassCard'

// ── SolidCard (alias com variant='solid') ─────────────────────

export const SolidCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  (props, ref) => <GlassCard ref={ref} variant="solid" {...props} />
)
SolidCard.displayName = 'SolidCard'

// ── GoldCard (alias com variant='gold') ──────────────────────

export const GoldCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  (props, ref) => <GlassCard ref={ref} variant="gold" glow {...props} />
)
GoldCard.displayName = 'GoldCard'

// ── StatCard ─────────────────────────────────────────────────
// Card de estatística para dashboards

interface StatCardProps {
  label: string
  value: string | number
  subvalue?: string
  icon?: React.ReactNode
  trend?: { value: number; label: string }
  accentColor?: string
  className?: string
  onClick?: () => void
}

export function StatCard({ label, value, subvalue, icon, trend, accentColor, className, onClick }: StatCardProps) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
      className={cn(
        'solid-card rounded-xl p-4 space-y-3',
        onClick && 'cursor-pointer no-tap-highlight',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-graphite-400 uppercase tracking-wider leading-none">
          {label}
        </p>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: accentColor
                ? `${accentColor}20`
                : 'var(--brand-gradient-subtle, rgba(212,160,23,0.1))',
            }}
          >
            <span
              className="text-sm"
              style={{ color: accentColor ?? 'var(--brand-primary, #D4A017)' }}
            >
              {icon}
            </span>
          </div>
        )}
      </div>

      {/* Valor */}
      <div>
        <p className="text-2xl font-black text-white tracking-tight leading-none">
          {value}
        </p>
        {subvalue && (
          <p className="text-xs text-graphite-400 mt-1 font-medium">{subvalue}</p>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className={cn(
          'flex items-center gap-1 text-xs font-semibold',
          trend.value >= 0 ? 'text-green-400' : 'text-red-400',
        )}>
          <span>{trend.value >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
          <span className="text-graphite-500 font-normal">{trend.label}</span>
        </div>
      )}
    </motion.div>
  )
}

// ── src/components/shared/StatusBadge.tsx ────────────────────
// Badges de status com cores semânticas consistentes

export type SlotStatusType = 'available' | 'full' | 'closed' | 'cancelled'
export type BookingStatusType = 'confirmed' | 'cancelled' | 'no_show' | 'attended' | 'waitlist'
export type MembershipStatusType = 'active' | 'due_soon' | 'overdue' | 'inactive' | 'trial'
export type BadgeStatusType = SlotStatusType | BookingStatusType | MembershipStatusType

const BADGE_CONFIG: Record<
  BadgeStatusType,
  { label: string; className: string; dot: string }
> = {
  // Slot
  available:  { label: 'Disponível',   className: 'bg-green-500/12 text-green-400 border-green-500/25',   dot: 'bg-green-400' },
  full:       { label: 'Lotado',       className: 'bg-red-500/12 text-red-400 border-red-500/25',         dot: 'bg-red-400' },
  closed:     { label: 'Fechado',      className: 'bg-graphite-700/50 text-graphite-400 border-graphite-600/20', dot: 'bg-graphite-500' },
  cancelled:  { label: 'Cancelado',    className: 'bg-graphite-700/50 text-graphite-400 border-graphite-600/20', dot: 'bg-graphite-500' },
  // Booking
  confirmed:  { label: 'Confirmado',   className: 'bg-blue-500/12 text-blue-400 border-blue-500/25',      dot: 'bg-blue-400' },
  no_show:    { label: 'Faltou',       className: 'bg-red-500/12 text-red-400 border-red-500/25',         dot: 'bg-red-400' },
  attended:   { label: 'Presente',     className: 'bg-green-500/12 text-green-400 border-green-500/25',   dot: 'bg-green-400' },
  waitlist:   { label: 'Fila de espera', className: 'bg-amber-500/12 text-amber-400 border-amber-500/25', dot: 'bg-amber-400' },
  // Membership
  active:     { label: 'Em Dia',       className: 'bg-green-500/12 text-green-400 border-green-500/25',   dot: 'bg-green-400' },
  due_soon:   { label: 'Vencendo',     className: 'bg-amber-500/12 text-amber-400 border-amber-500/25',   dot: 'bg-amber-400' },
  overdue:    { label: 'Vencido',      className: 'bg-red-500/12 text-red-400 border-red-500/25',         dot: 'bg-red-400' },
  inactive:   { label: 'Inativo',      className: 'bg-graphite-700/50 text-graphite-400 border-graphite-600/20', dot: 'bg-graphite-500' },
  trial:      { label: 'Teste',        className: 'bg-purple-500/12 text-purple-400 border-purple-500/25', dot: 'bg-purple-400' },
}

interface StatusBadgeProps {
  status: BadgeStatusType
  /** Sobrescreve o label padrão */
  label?: string
  /** Tamanho — sm (padrão) ou md */
  size?: 'sm' | 'md'
  showDot?: boolean
  className?: string
  animated?: boolean
}

export function StatusBadge({
  status,
  label,
  size = 'sm',
  showDot = true,
  className,
  animated = false,
}: StatusBadgeProps) {
  const config = BADGE_CONFIG[status]
  if (!config) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        config.className,
        className,
      )}
    >
      {showDot && (
        <span className={cn('rounded-full flex-shrink-0', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2', config.dot)}>
          {animated && (
            <span className={cn(
              'absolute inline-flex rounded-full opacity-75 animate-ping',
              size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
              config.dot,
            )} />
          )}
        </span>
      )}
      {label ?? config.label}
    </span>
  )
}

// ── SpotsBadge — vagas disponíveis ────────────────────────────

interface SpotsBadgeProps {
  available: number
  capacity: number
  className?: string
}

export function SpotsBadge({ available, capacity, className }: SpotsBadgeProps) {
  const isFull = available === 0
  const isAlmostFull = available > 0 && available <= Math.ceil(capacity * 0.3)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 border',
        isFull
          ? 'bg-red-500/12 text-red-400 border-red-500/25'
          : isAlmostFull
            ? 'bg-amber-500/12 text-amber-400 border-amber-500/25'
            : 'bg-graphite-700/40 text-graphite-400 border-graphite-600/20',
        className,
      )}
    >
      {isFull ? 'Lotado' : `${available} vaga${available !== 1 ? 's' : ''}`}
    </span>
  )
}
