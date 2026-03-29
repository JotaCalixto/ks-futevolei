'use client'
// ============================================================
// src/components/membership/MembershipCard.tsx
// ============================================================
import { motion } from 'framer-motion'
import { CreditCard, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { formatDate, formatCurrency, getDaysUntilDue, cn } from '@/lib/utils'
import { StatusBadge, type MembershipStatusType } from '@/components/shared/Cards'
import type { Membership } from '@/types/domain'

interface MembershipCardProps {
  membership: Membership | null
  /** Se true, mostra o card compacto (para a home) */
  compact?: boolean
  onClick?: () => void
}

export function MembershipCard({ membership, compact = false, onClick }: MembershipCardProps) {
  if (!membership) return <MembershipCardEmpty />

  const status = membership.membershipStatus
  const daysUntil = getDaysUntilDue(membership.dueDate)

  const borderColor = {
    active:   'rgba(34,197,94,0.3)',
    due_soon: 'rgba(245,158,11,0.4)',
    overdue:  'rgba(239,68,68,0.4)',
    inactive: 'rgba(113,113,113,0.2)',
    trial:    'rgba(168,85,247,0.3)',
  }[status]

  const bgColor = {
    active:   'rgba(34,197,94,0.06)',
    due_soon: 'rgba(245,158,11,0.08)',
    overdue:  'rgba(239,68,68,0.08)',
    inactive: 'rgba(30,30,30,0.4)',
    trial:    'rgba(168,85,247,0.06)',
  }[status]

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'rounded-xl border overflow-hidden',
        onClick && 'cursor-pointer no-tap-highlight',
      )}
      style={{ background: bgColor, borderColor }}
    >
      <div className={cn('p-4', compact && 'p-3')}>

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: bgColor, border: `1px solid ${borderColor}` }}
            >
              <CreditCard className="w-4 h-4" style={{ color: borderColor }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-graphite-400 uppercase tracking-wider leading-none">
                Mensalidade
              </p>
              <p className="text-sm font-bold text-white mt-0.5">
                {formatDate(membership.referenceMonth, 'MMMM yyyy')}
              </p>
            </div>
          </div>
          <StatusBadge status={status as MembershipStatusType} size="sm" animated={status === 'due_soon'} />
        </div>

        {/* Valor */}
        {!compact && (
          <div className="mb-3">
            <span className="text-2xl font-black text-white">
              {formatCurrency(membership.amount)}
            </span>
          </div>
        )}

        {/* Info de vencimento */}
        <div className="flex items-center gap-2">
          {status === 'overdue' ? (
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          ) : status === 'active' ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          )}
          <p className={cn(
            'text-xs font-medium leading-snug',
            status === 'overdue'  ? 'text-red-400' :
            status === 'due_soon' ? 'text-amber-400' :
            status === 'active'   ? 'text-green-400' :
            'text-graphite-400',
          )}>
            {status === 'overdue'
              ? `Venceu há ${Math.abs(daysUntil)} dia${Math.abs(daysUntil) !== 1 ? 's' : ''}`
              : status === 'active'
                ? `Vence em ${daysUntil} dia${daysUntil !== 1 ? 's' : ''} · ${formatDate(membership.dueDate, 'dd/MM')}`
                : `Vence em ${daysUntil} dia${daysUntil !== 1 ? 's' : ''} — ${formatDate(membership.dueDate, 'dd/MM')}`
            }
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function MembershipCardEmpty() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-graphite-800/30 p-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-graphite-700/50 flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-graphite-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-graphite-500">Sem mensalidade cadastrada</p>
          <p className="text-xs text-graphite-600">Fale com seu professor</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// src/components/shared/EmptyState.tsx
// ============================================================

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn('flex flex-col items-center text-center py-14 px-6', className)}
    >
      {icon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
          className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center"
          style={{
            background: 'var(--brand-gradient-subtle, rgba(212,160,23,0.08))',
            border: '1px solid var(--brand-primary-border, rgba(212,160,23,0.2))',
          }}
        >
          <span className="text-2xl">{icon}</span>
        </motion.div>
      )}
      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-graphite-500 leading-relaxed max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}

// ============================================================
// src/components/shared/LoadingSkeleton.tsx
// ============================================================

interface SkeletonProps { className?: string }

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton rounded-lg', className)}
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.03) 25%, var(--brand-shimmer, rgba(212,160,23,0.05)) 50%, rgba(255,255,255,0.03) 75%)`,
        backgroundSize: '200% 100%',
      }}
    />
  )
}

export function SlotCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-graphite-800/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-1 w-full" />
        </div>
      ))}
    </div>
  )
}

export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="solid-card rounded-xl p-4 space-y-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

// ============================================================
// src/components/chat/ChatBubble.tsx
// ============================================================

interface ChatBubbleProps {
  message: {
    id: string
    content: string
    createdAt: string
    senderId: string
    type?: 'text' | 'system'
  }
  isOwn: boolean
  showAvatar?: boolean
  senderName?: string
  senderInitials?: string
}

export function ChatBubble({ message, isOwn, showAvatar, senderName, senderInitials }: ChatBubbleProps) {
  // Mensagem do sistema (ex: "Reserva confirmada")
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3">
        <span className="text-[11px] text-graphite-600 bg-graphite-800/50 rounded-full px-3 py-1 font-medium">
          {message.content}
        </span>
      </div>
    )
  }

  const time = new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn('flex gap-2 mb-3', isOwn ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar (não-próprio) */}
      {!isOwn && showAvatar && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-graphite-900 flex-shrink-0 mt-1"
          style={{ background: 'var(--brand-primary, #D4A017)' }}
        >
          {senderInitials ?? '?'}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-7 flex-shrink-0" />}

      {/* Bubble */}
      <div className={cn('max-w-[80%] space-y-0.5', isOwn && 'items-end flex flex-col')}>
        {senderName && !isOwn && (
          <p className="text-[10px] font-semibold text-graphite-500 ml-1">{senderName}</p>
        )}
        <div
          className={cn(
            'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
            isOwn
              ? 'rounded-br-sm text-graphite-900 font-medium'
              : 'rounded-bl-sm bg-graphite-800 border border-white/[0.07] text-white',
          )}
          style={isOwn ? { background: 'var(--brand-primary, #D4A017)' } : {}}
        >
          {message.content}
        </div>
        <p className={cn('text-[10px] text-graphite-600 px-1', isOwn && 'text-right')}>
          {time}
        </p>
      </div>
    </motion.div>
  )
}

// ============================================================
// src/components/notifications/AnnouncementBanner.tsx
// ============================================================

interface AnnouncementBannerProps {
  title: string
  content: string
  isPinned?: boolean
  createdAt: string
  onDismiss?: () => void
}

export function AnnouncementBanner({ title, content, isPinned, createdAt, onDismiss }: AnnouncementBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={cn(
        'relative overflow-hidden rounded-xl p-4',
        'border',
      )}
      style={{
        background: 'var(--brand-gradient-subtle, rgba(212,160,23,0.08))',
        borderColor: 'var(--brand-primary-border, rgba(212,160,23,0.25))',
      }}
    >
      {/* Acento top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'var(--brand-gradient, linear-gradient(135deg, #D4A017, #FBBF24))' }}
      />

      <div className="flex items-start gap-3">
        <span className="text-base flex-shrink-0 mt-0.5">📢</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold text-white leading-tight">{title}</p>
            {isPinned && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--brand-primary-glow)', color: 'var(--brand-primary, #D4A017)' }}>
                Fixado
              </span>
            )}
          </div>
          <p className="text-xs text-graphite-300 leading-relaxed">{content}</p>
          <p className="text-[10px] text-graphite-600 mt-2">
            {new Date(createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-graphite-600 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <span className="text-sm">×</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ============================================================
// src/components/shared/ConnectionIndicator.tsx
// ============================================================
import { useRealtimeContext } from '@/components/providers/Providers'

export function ConnectionIndicator() {
  const { isConnected } = useRealtimeContext()
  return null // Exibe apenas quando desconectado
  // Se quiser um indicador visual de desconexão, descomente:
  /*
  if (isConnected) return null
  return (
    <div className="bg-red-500/90 px-3 py-1 text-center text-xs text-white font-medium pt-[env(safe-area-inset-top,0px)]">
      Sem conexão em tempo real — reconectando...
    </div>
  )
  */
}
