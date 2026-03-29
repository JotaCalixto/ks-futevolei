'use client'
// src/components/shared/PremiumToast.tsx + NotificationItem.tsx

import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { CheckCircle, X, Calendar, MessageCircle, CreditCard, Bell, Users } from 'lucide-react'
import { playNotificationSound, vibrate, formatTime, cn } from '@/lib/utils'
import type { NotificationType } from '@/types/domain'

// ── Tipos de toast ────────────────────────────────────────────

type ToastVariant = 'booking' | 'cancel' | 'waitlist' | 'message' | 'membership' | 'announcement' | 'success' | 'error'

interface ToastPayload {
  title: string
  description?: string
  studentName?: string
  slotTime?: string
  slotDate?: string
}

// ── Configuração visual por variante ─────────────────────────

const TOAST_CONFIG: Record<ToastVariant, {
  icon: React.ReactNode
  borderColor: string
  bgColor: string
  iconColor: string
  playSound: boolean
}> = {
  booking: {
    icon: <Calendar className="w-4 h-4" />,
    borderColor: 'rgba(212,160,23,0.45)',
    bgColor: 'rgba(212,160,23,0.1)',
    iconColor: '#D4A017',
    playSound: true,
  },
  cancel: {
    icon: <X className="w-4 h-4" />,
    borderColor: 'rgba(239,68,68,0.4)',
    bgColor: 'rgba(239,68,68,0.08)',
    iconColor: '#EF4444',
    playSound: false,
  },
  waitlist: {
    icon: <Users className="w-4 h-4" />,
    borderColor: 'rgba(245,158,11,0.4)',
    bgColor: 'rgba(245,158,11,0.08)',
    iconColor: '#F59E0B',
    playSound: true,
  },
  message: {
    icon: <MessageCircle className="w-4 h-4" />,
    borderColor: 'rgba(59,130,246,0.4)',
    bgColor: 'rgba(59,130,246,0.08)',
    iconColor: '#3B82F6',
    playSound: false,
  },
  membership: {
    icon: <CreditCard className="w-4 h-4" />,
    borderColor: 'rgba(239,68,68,0.4)',
    bgColor: 'rgba(239,68,68,0.08)',
    iconColor: '#EF4444',
    playSound: false,
  },
  announcement: {
    icon: <Bell className="w-4 h-4" />,
    borderColor: 'rgba(212,160,23,0.35)',
    bgColor: 'rgba(212,160,23,0.08)',
    iconColor: '#D4A017',
    playSound: false,
  },
  success: {
    icon: <CheckCircle className="w-4 h-4" />,
    borderColor: 'rgba(34,197,94,0.4)',
    bgColor: 'rgba(34,197,94,0.08)',
    iconColor: '#22C55E',
    playSound: false,
  },
  error: {
    icon: <X className="w-4 h-4" />,
    borderColor: 'rgba(239,68,68,0.5)',
    bgColor: 'rgba(239,68,68,0.1)',
    iconColor: '#EF4444',
    playSound: false,
  },
}

// ── Função que mostra toast premium ──────────────────────────

export function showPremiumToast(variant: ToastVariant, payload: ToastPayload) {
  const config = TOAST_CONFIG[variant]

  if (config.playSound) {
    playNotificationSound()
    vibrate([100, 50, 100])
  }

  toast.custom((id) => (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex items-start gap-3 p-4 rounded-xl w-[340px] max-w-[calc(100vw-2rem)]"
      style={{
        background: '#181818',
        border: `1px solid ${config.borderColor}`,
        boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px ${config.bgColor}`,
      }}
    >
      {/* Ícone */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: config.bgColor, color: config.iconColor, border: `1px solid ${config.borderColor}` }}
      >
        {config.icon}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white leading-tight">{payload.title}</p>
        {payload.description && (
          <p className="text-xs text-graphite-400 mt-0.5 leading-relaxed">{payload.description}</p>
        )}
        {payload.studentName && payload.slotTime && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs font-semibold text-white/80">{payload.studentName}</span>
            <span className="text-graphite-600">·</span>
            <span className="text-xs" style={{ color: config.iconColor }}>
              {payload.slotTime}
            </span>
          </div>
        )}
      </div>

      {/* Fechar */}
      <button
        onClick={() => toast.dismiss(id)}
        className="w-6 h-6 flex items-center justify-center rounded-md text-graphite-600 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 mt-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  ), {
    duration: variant === 'booking' ? 8000 : 5000,
    position: 'top-right',
  })
}

// ── Helpers semânticos ────────────────────────────────────────

export const notify = {
  newBooking: (studentName: string, slotTime: string) =>
    showPremiumToast('booking', {
      title: 'Novo agendamento! 🏐',
      description: 'Reserva confirmada automaticamente',
      studentName,
      slotTime,
    }),

  bookingCancelled: (studentName: string, slotTime: string) =>
    showPremiumToast('cancel', {
      title: 'Reserva cancelada',
      studentName,
      slotTime,
    }),

  waitlistPromoted: (studentName: string, slotTime: string) =>
    showPremiumToast('waitlist', {
      title: 'Vaga liberada da fila! 🎉',
      description: 'Aluno promovido automaticamente',
      studentName,
      slotTime,
    }),

  newMessage: (senderName: string) =>
    showPremiumToast('message', {
      title: 'Nova mensagem',
      description: `${senderName} enviou uma mensagem`,
    }),

  membershipOverdue: (studentName: string) =>
    showPremiumToast('membership', {
      title: 'Mensalidade vencida',
      description: `${studentName} está com pagamento pendente`,
    }),

  success: (message: string) =>
    showPremiumToast('success', { title: message }),

  error: (message: string) =>
    showPremiumToast('error', { title: message }),
}

// ── NotificationItem ──────────────────────────────────────────

interface NotificationItemProps {
  notification: {
    id: string
    type: NotificationType
    title: string
    body: string
    isRead: boolean
    createdAt: string
  }
  onClick?: () => void
}

const NOTIF_ICONS: Partial<Record<NotificationType, React.ReactNode>> = {
  booking_created:    <Calendar className="w-4 h-4" />,
  booking_cancelled:  <X className="w-4 h-4" />,
  waitlist_promoted:  <Users className="w-4 h-4" />,
  new_message:        <MessageCircle className="w-4 h-4" />,
  membership_due:     <CreditCard className="w-4 h-4" />,
  membership_overdue: <CreditCard className="w-4 h-4" />,
  new_announcement:   <Bell className="w-4 h-4" />,
}

const NOTIF_COLOR: Partial<Record<NotificationType, string>> = {
  booking_created:    '#D4A017',
  booking_cancelled:  '#EF4444',
  waitlist_promoted:  '#F59E0B',
  new_message:        '#3B82F6',
  membership_due:     '#F59E0B',
  membership_overdue: '#EF4444',
  new_announcement:   '#D4A017',
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const icon = NOTIF_ICONS[notification.type] ?? <Bell className="w-4 h-4" />
  const color = NOTIF_COLOR[notification.type] ?? '#D4A017'

  const timeAgo = (() => {
    const diff = Date.now() - new Date(notification.createdAt).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'agora'
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  })()

  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-white/[0.03] no-tap-highlight',
        !notification.isRead && 'bg-white/[0.02]',
      )}
    >
      {/* Ícone */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
      >
        {icon}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-tight', notification.isRead ? 'text-graphite-300 font-medium' : 'text-white font-semibold')}>
          {notification.title}
        </p>
        <p className="text-xs text-graphite-500 mt-0.5 leading-relaxed line-clamp-2">
          {notification.body}
        </p>
      </div>

      {/* Tempo + dot não lido */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0 mt-0.5">
        <span className="text-[10px] text-graphite-600 font-medium">{timeAgo}</span>
        {!notification.isRead && (
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        )}
      </div>
    </motion.button>
  )
}
