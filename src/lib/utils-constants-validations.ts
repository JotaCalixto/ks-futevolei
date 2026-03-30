// ============================================================
// src/lib/onesignal.ts — OneSignal SDK Initialization
// ============================================================

declare global {
  interface Window {
    OneSignalDeferred?: Array<(onesignal: OneSignal) => void>
    OneSignal?: OneSignal
  }
}

interface OneSignal {
  login: (externalId: string) => Promise<void>
  logout: () => Promise<void>
  Notifications: {
    requestPermission: () => Promise<boolean>
    permission: boolean
  }
  User: {
    addTag: (key: string, value: string) => void
    addTags: (tags: Record<string, string>) => void
    removeTag: (key: string) => void
  }
}

let isInitialized = false

export async function initOneSignal(userId?: string): Promise<void> {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
    console.warn('[OneSignal] APP_ID não configurado')
    return
  }

  window.OneSignalDeferred = window.OneSignalDeferred || []

  if (!isInitialized) {
    window.OneSignalDeferred.push(async function(OneSignal) {
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID,
        notifyButton: { enable: false },
        allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
        serviceWorkerParam: { scope: '/' },
        serviceWorkerPath: '/sw.js',
        autoResubscribe: true,
        persistNotification: false,
      } as Parameters<typeof OneSignal.init>[0])

      isInitialized = true

      // Vincula o usuário ao OneSignal
      if (userId) {
        await OneSignal.login(userId)
      }
    })
  } else if (userId && window.OneSignal) {
    await window.OneSignal.login(userId)
  }
}

export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.OneSignal) return false

  try {
    const granted = await window.OneSignal.Notifications.requestPermission()
    return granted
  } catch (error) {
    console.error('[OneSignal] Erro ao solicitar permissão:', error)
    return false
  }
}

export async function setUserTags(tags: Record<string, string>): Promise<void> {
  if (typeof window === 'undefined' || !window.OneSignal) return
  window.OneSignal.User.addTags(tags)
}

export async function logoutOneSignal(): Promise<void> {
  if (typeof window === 'undefined' || !window.OneSignal) return
  await window.OneSignal.logout()
}

// ============================================================
// src/lib/utils.ts — Utilitários gerais
// ============================================================

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  format, formatDistance, isToday, isTomorrow, isYesterday,
  parseISO, isBefore, isAfter, addDays, startOfDay, endOfDay,
  differenceInDays, differenceInHours
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Merge classes com Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formata data para exibição
export function formatDate(date: string | Date, pattern: string = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: ptBR })
}

// Formata data relativa
export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isNaN(d.getTime())) return ''

  if (isToday(d)) return 'Hoje'
  if (isTomorrow(d)) return 'Amanhã'
  if (isYesterday(d)) return 'Ontem'

  return formatDistance(d, new Date(), { addSuffix: true, locale: ptBR })
}

// Formata hora
export function formatTime(time: string | null | undefined): string {
  if (!time) return '--:--'
  return time.slice(0, 5)
}

// Formata data do treino de forma amigável
export function formatTrainingDate(date: string): string {
  const d = parseISO(date)
  if (isToday(d)) return 'Hoje'
  if (isTomorrow(d)) return 'Amanhã'
  return format(d, "EEEE, dd 'de' MMMM", { locale: ptBR })
}

// Formata data curta do calendário
export function formatCalendarDate(date: string): {
  dayNumber: string
  dayName: string
  monthName: string
  fullDate: string
} {
  const d = parseISO(date)
  return {
    dayNumber: format(d, 'dd', { locale: ptBR }),
    dayName: format(d, 'EEE', { locale: ptBR }),
    monthName: format(d, 'MMM', { locale: ptBR }),
    fullDate: format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
  }
}

// Formata moeda brasileira
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Formata telefone brasileiro
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

// Calcula vagas disponíveis
export function getAvailableSpots(capacity: number, bookedCount: number): number {
  return Math.max(0, capacity - bookedCount)
}

// Verifica se slot está lotado
export function isSlotFull(capacity: number, bookedCount: number): boolean {
  return bookedCount >= capacity
}

// Calcula status de mensalidade
export function calculateMembershipStatus(
  dueDate: string,
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'waived'
): 'active' | 'due_soon' | 'overdue' | 'inactive' | 'trial' {
  if (paymentStatus === 'paid') return 'active'
  if (paymentStatus === 'waived') return 'active'

  const due = parseISO(dueDate)
  const today = new Date()
  const daysUntilDue = differenceInDays(due, startOfDay(today))

  if (daysUntilDue < 0) return 'overdue'
  if (daysUntilDue <= 5) return 'due_soon'
  return 'active'
}

// Dias até o vencimento
export function getDaysUntilDue(dueDate: string): number {
  const due = parseISO(dueDate)
  return differenceInDays(due, startOfDay(new Date()))
}

// Iniciais do nome
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

// Trunca texto
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Gera cor do avatar baseada no nome
export function getAvatarColor(name: string): string {
  const colors = [
    '#D4A017', '#16A34A', '#2563EB', '#7C3AED',
    '#DC2626', '#EA580C', '#0891B2', '#0D9488',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// Toca som de notificação (para o professor)
export async function playNotificationSound(): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const audio = new Audio('/sounds/booking-alert.mp3')
    audio.volume = 0.6
    await audio.play()
  } catch {
    // Autoplay pode ser bloqueado — silencia o erro
  }
}

// Vibração (mobile)
export function vibrate(pattern: number | number[] = 200): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

// Debounce
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

// Sleep
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Verifica se é mobile
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

// Verifica se PWA está instalado
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

// ============================================================
// src/lib/constants.ts — Constantes do App
// ============================================================

export const APP_NAME = 'K.S Futevôlei'
export const APP_FULL_NAME = 'K.S Futevôlei Floripa-SC'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ks-futevolei.com.br'
export const APP_VERSION = '1.0.0'

// Academia padrão (MVP single-tenant)
export const DEFAULT_ACADEMY_ID = 'a1b2c3d4-0000-0000-0000-000000000001'
export const DEFAULT_ACADEMY_SLUG = 'ks-futevolei-floripa'

// Configurações padrão
export const DEFAULT_SLOT_CAPACITY = 10
export const DEFAULT_SLOT_DURATION_HOURS = 1
export const CANCEL_DEADLINE_HOURS = 2
export const MEMBERSHIP_DUE_SOON_DAYS = 5
export const MAX_WAITLIST_POSITION = 10

// Horários permitidos (6h às 22h, de hora em hora)
export const TRAINING_HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
]

// Paginação
export const PAGE_SIZE = 20
export const MESSAGES_PAGE_SIZE = 30

// Realtime channels
export const REALTIME_CHANNELS = {
  BOOKINGS:       'bookings-channel',
  SLOTS:          'slots-channel',
  MESSAGES:       'messages-channel',
  NOTIFICATIONS:  'notifications-channel',
  MEMBERSHIPS:    'memberships-channel',
} as const

// Status labels
export const SLOT_STATUS_LABELS = {
  open:      'Disponível',
  closed:    'Fechado',
  cancelled: 'Cancelado',
} as const

export const BOOKING_STATUS_LABELS = {
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  no_show:   'Faltou',
  attended:  'Presente',
} as const

export const PAYMENT_STATUS_LABELS = {
  paid:    'Pago',
  pending: 'Pendente',
  overdue: 'Vencido',
  waived:  'Isento',
} as const

export const MEMBERSHIP_STATUS_LABELS = {
  active:   'Em Dia',
  due_soon: 'Vencendo',
  overdue:  'Vencido',
  inactive: 'Inativo',
  trial:    'Teste',
} as const

// Navegação do aluno
export const STUDENT_NAV_ITEMS = [
  { href: '/home',      label: 'Início',    icon: 'Home' },
  { href: '/agenda',    label: 'Agenda',    icon: 'Calendar' },
  { href: '/reservas',  label: 'Reservas',  icon: 'CheckSquare' },
  { href: '/mensagens', label: 'Chat',      icon: 'MessageCircle' },
  { href: '/plano',     label: 'Plano',     icon: 'CreditCard' },
] as const

// Navegação do professor
export const COACH_NAV_ITEMS = [
  { href: '/dashboard',      label: 'Dashboard',   icon: 'LayoutDashboard' },
  { href: '/agenda',         label: 'Agenda',       icon: 'Calendar' },
  { href: '/alunos',         label: 'Alunos',       icon: 'Users' },
  { href: '/mensalidades',   label: 'Mensalidades', icon: 'DollarSign' },
  { href: '/mensagens-coach',      label: 'Mensagens',    icon: 'MessageSquare' },
  { href: '/avisos',         label: 'Avisos',       icon: 'Megaphone' },
  { href: '/configuracoes',  label: 'Configurações', icon: 'Settings' },
] as const

// ============================================================
// src/lib/validations.ts — Schemas Zod
// ============================================================

import { z } from 'zod'

// Login
export const loginSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim(),
  phone: z
    .string()
    .min(10, 'Telefone inválido')
    .max(15, 'Telefone inválido')
    .regex(/^[\d\s\-\(\)\+]+$/, 'Telefone inválido')
    .transform(val => val.replace(/\D/g, '')),
})
export type LoginFormData = z.infer<typeof loginSchema>

// Reserva
export const createBookingSchema = z.object({
  slotId: z.string().uuid('ID do horário inválido'),
  notes: z.string().max(500, 'Observação muito longa').optional(),
})
export type CreateBookingFormData = z.infer<typeof createBookingSchema>

// Cancelamento
export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().max(300, 'Motivo muito longo').optional(),
})
export type CancelBookingFormData = z.infer<typeof cancelBookingSchema>

// Mensagem
export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(1000, 'Mensagem muito longa')
    .trim(),
  receiverId: z.string().uuid(),
  relatedSlotId: z.string().uuid().optional(),
})
export type SendMessageFormData = z.infer<typeof sendMessageSchema>

// Criação de slot
export const createSlotSchema = z.object({
  trainingDayId: z.string().uuid(),
  startTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-2]):[0-5][0-9]$/, 'Horário inválido (HH:MM)'),
  capacity: z
    .number()
    .int()
    .min(1, 'Capacidade mínima é 1')
    .max(50, 'Capacidade máxima é 50'),
  observation: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
})
export type CreateSlotFormData = z.infer<typeof createSlotSchema>

// Criação de dia de treino
export const createTrainingDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  isOpen: z.boolean().default(true),
  observation: z.string().max(500).optional(),
  theme: z.string().max(200).optional(),
})
export type CreateTrainingDayFormData = z.infer<typeof createTrainingDaySchema>

// Atualização de mensalidade
export const updateMembershipSchema = z.object({
  studentId: z.string().uuid(),
  referenceMonth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().min(0, 'Valor não pode ser negativo'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['paid', 'pending', 'overdue', 'waived']),
  paymentMethod: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
})
export type UpdateMembershipFormData = z.infer<typeof updateMembershipSchema>

// Aviso
export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200),
  content: z.string().min(1, 'Conteúdo obrigatório').max(2000),
  scope: z.enum(['all', 'slot', 'day']),
  slotId: z.string().uuid().optional(),
  dayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isPinned: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
})
export type CreateAnnouncementFormData = z.infer<typeof createAnnouncementSchema>

// Configurações
export const updateSettingsSchema = z.object({
  defaultCapacity: z.number().int().min(1).max(100),
  cancelDeadlineHours: z.number().int().min(0).max(48),
  autoWaitlist: z.boolean(),
  membershipDueDay: z.number().int().min(1).max(28),
  defaultMonthlyFee: z.number().min(0),
  customTexts: z.record(z.string()).optional(),
})
export type UpdateSettingsFormData = z.infer<typeof updateSettingsSchema>
