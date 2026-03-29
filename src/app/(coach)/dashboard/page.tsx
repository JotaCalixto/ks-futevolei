'use client'
// src/app/(coach)/dashboard/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users, Calendar, DollarSign, MessageSquare,
  TrendingUp, Plus, ChevronRight, Clock,
  AlertCircle, CheckCircle, Zap,
} from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/Providers'
import { useTenant, useBranding } from '@/components/providers/TenantProvider'
import { StatCard, SolidCard, GoldCard } from '@/components/shared/Cards'
import { StatusBadge } from '@/components/shared/Cards'
import { StatCardSkeleton, Skeleton } from '@/components/shared/SharedComponents'
import { formatTime, formatCurrency, formatRelativeDate, cn } from '@/lib/utils'
import type { DashboardStats } from '@/types/domain'

interface RecentEvent {
  id: string
  type: 'booking' | 'cancel' | 'message' | 'waitlist'
  studentName: string
  slotTime: string
  slotDate: string
  createdAt: string
}

interface TodaySlot {
  id: string
  start_time: string
  end_time: string
  booked_count: number
  capacity: number
  status: string
}

export default function DashboardPage() {
  const { coach, profile } = useAuth()
  const { tenant } = useTenant()
  const branding = useBranding()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [todaySlots, setTodaySlots] = useState<TodaySlot[]>([])
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]
  const firstName = profile?.fullName?.split(' ')[0] ?? 'Professor'

  const load = useCallback(async () => {
    if (!coach?.id) return
    setIsLoading(true)

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const [
      studentsRes,
      todaySlotsRes,
      todayBookingsRes,
      pendingPayRes,
      overduePayRes,
      unreadMsgRes,
      recentBookingsRes,
    ] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact' })
        .eq('academy_id', tenant.id).eq('is_active', true),
      supabase.from('training_slots').select('*')
        .eq('academy_id', tenant.id)
        .eq('status', 'open')
        .in('training_day_id',
          (await supabase.from('training_days').select('id').eq('academy_id', tenant.id).eq('date', today)).data?.map(d => d.id) ?? []
        ),
      supabase.from('bookings').select('id', { count: 'exact' })
        .eq('academy_id', tenant.id).eq('status', 'confirmed')
        .gte('created_at', `${today}T00:00:00`),
      supabase.from('memberships').select('id', { count: 'exact' })
        .eq('academy_id', tenant.id).eq('status', 'pending'),
      supabase.from('memberships').select('id', { count: 'exact' })
        .eq('academy_id', tenant.id).eq('status', 'overdue'),
      supabase.from('messages').select('id', { count: 'exact' })
        .eq('academy_id', tenant.id).eq('receiver_id', profile!.id).eq('is_read', false),
      supabase.from('bookings')
        .select(`
          id, status, created_at,
          student:students(profile:profiles(full_name)),
          slot:training_slots(start_time, training_day:training_days(date))
        `)
        .eq('academy_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(8),
    ])

    const slots = (todaySlotsRes.data ?? []) as unknown as TodaySlot[]
    const totalCapacity = slots.reduce((a, s) => a + s.capacity, 0)
    const totalBooked   = slots.reduce((a, s) => a + s.booked_count, 0)

    setStats({
      totalStudents:   studentsRes.count ?? 0,
      activeStudents:  studentsRes.count ?? 0,
      todaySlots:      slots.length,
      todayBookings:   todayBookingsRes.count ?? 0,
      todayCapacity:   totalCapacity,
      pendingPayments: pendingPayRes.count ?? 0,
      overduePayments: overduePayRes.count ?? 0,
      unreadMessages:  unreadMsgRes.count ?? 0,
      occupancyRate:   totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0,
    })

    setTodaySlots(slots)

    const events: RecentEvent[] = (recentBookingsRes.data ?? []).map((b: Record<string, unknown>) => {
      const student = b.student as Record<string, Record<string, string>>
      const slot = b.slot as Record<string, unknown>
      const day = slot?.training_day as Record<string, string>
      return {
        id: b.id as string,
        type: b.status === 'cancelled' ? 'cancel' : 'booking',
        studentName: student?.profile?.full_name ?? 'Aluno',
        slotTime: slot?.start_time ? String(slot.start_time).slice(0, 5) : '—',
        slotDate: day?.date ?? today,
        createdAt: b.created_at as string,
      }
    })
    setRecentEvents(events)
    setIsLoading(false)
  }, [coach?.id, tenant.id, supabase, today, profile?.id])

  useEffect(() => { load() }, [load])

  const stagger = { animate: { transition: { staggerChildren: 0.06 } } }
  const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } },
  }

  return (
    <div className="p-5 lg:p-7 max-w-4xl">

      {/* Header */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="mb-7">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2"
          style={{ background: 'var(--brand-gradient-subtle)', color: 'var(--brand-primary,#D4A017)' }}
        >
          <Zap className="w-3 h-3" />
          Painel do Coach
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Olá, {firstName}! 👋
        </h1>
        <p className="text-sm text-graphite-500 mt-0.5">{branding.academyName}</p>
      </motion.div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">

        {/* Stats grid */}
        <motion.div variants={fadeUp}>
          {isLoading ? <StatCardSkeleton count={4} /> : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="Alunos ativos"
                value={stats?.totalStudents ?? 0}
                icon={<Users className="w-4 h-4" />}
                onClick={() => router.push('/alunos')}
              />
              <StatCard
                label="Treinos hoje"
                value={`${stats?.todayBookings ?? 0}/${stats?.todayCapacity ?? 0}`}
                subvalue={`${stats?.occupancyRate ?? 0}% ocupado`}
                icon={<Calendar className="w-4 h-4" />}
                onClick={() => router.push('/agenda-coach')}
              />
              <StatCard
                label="Pendentes"
                value={stats?.pendingPayments ?? 0}
                subvalue={stats?.overduePayments ? `${stats.overduePayments} vencidos` : 'mensalidades'}
                icon={<DollarSign className="w-4 h-4" />}
                accentColor={stats?.overduePayments ? '#EF4444' : undefined}
                onClick={() => router.push('/mensalidades')}
              />
              <StatCard
                label="Mensagens"
                value={stats?.unreadMessages ?? 0}
                subvalue="não lidas"
                icon={<MessageSquare className="w-4 h-4" />}
                accentColor={stats?.unreadMessages ? '#3B82F6' : undefined}
                onClick={() => router.push('/mensagens-coach')}
              />
            </div>
          )}
        </motion.div>

        {/* Slots de hoje */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-graphite-400">
              Horários de Hoje
            </h2>
            <button
              onClick={() => router.push('/agenda-coach')}
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: 'var(--brand-primary,#D4A017)' }}
            >
              Gerenciar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : todaySlots.length === 0 ? (
            <SolidCard className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-graphite-700/50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-graphite-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-graphite-400">Nenhum horário aberto hoje</p>
                <p className="text-xs text-graphite-600">Abra slots na agenda para receber reservas</p>
              </div>
              <button
                onClick={() => router.push('/agenda-coach')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: 'var(--brand-primary,#D4A017)', color: '#0D0D0D' }}
              >
                Abrir
              </button>
            </SolidCard>
          ) : (
            <div className="space-y-2">
              {todaySlots.map((slot) => {
                const pct = Math.round((slot.booked_count / slot.capacity) * 100)
                const full = slot.booked_count >= slot.capacity
                return (
                  <SolidCard
                    key={slot.id}
                    pressable
                    className="p-3.5"
                    onClick={() => router.push('/agenda-coach')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-10 rounded-full flex-shrink-0"
                        style={{ background: full ? '#EF4444' : 'var(--brand-primary,#D4A017)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-black text-white">
                            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                          </p>
                          <span className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded-full',
                            full
                              ? 'bg-red-500/15 text-red-400'
                              : 'bg-graphite-700/50 text-graphite-400',
                          )}>
                            {slot.booked_count}/{slot.capacity}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-graphite-700/60 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: full ? '#EF4444' : 'var(--brand-primary,#D4A017)' }}
                          />
                        </div>
                      </div>
                    </div>
                  </SolidCard>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Feed de atividade recente */}
        <motion.div variants={fadeUp}>
          <h2 className="text-sm font-bold uppercase tracking-widest text-graphite-400 mb-3">
            Atividade Recente
          </h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : recentEvents.length === 0 ? (
            <SolidCard className="p-5 text-center">
              <p className="text-sm text-graphite-500">Sem atividades recentes</p>
            </SolidCard>
          ) : (
            <SolidCard className="overflow-hidden divide-y divide-white/[0.05]">
              {recentEvents.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    ev.type === 'booking' ? 'bg-green-500/15' :
                    ev.type === 'cancel'  ? 'bg-red-500/15' :
                    'bg-blue-500/15',
                  )}>
                    {ev.type === 'booking'  ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                     ev.type === 'cancel'   ? <AlertCircle className="w-4 h-4 text-red-400" /> :
                     <MessageSquare className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{ev.studentName}</p>
                    <p className="text-xs text-graphite-500">
                      {ev.type === 'booking' ? 'Reservou' : ev.type === 'cancel' ? 'Cancelou' : 'Mensagem'} · {ev.slotTime}
                    </p>
                  </div>
                  <span className="text-[11px] text-graphite-600 flex-shrink-0">
                    {formatRelativeDate(ev.createdAt)}
                  </span>
                </div>
              ))}
            </SolidCard>
          )}
        </motion.div>

        {/* Atalhos rápidos */}
        <motion.div variants={fadeUp}>
          <h2 className="text-sm font-bold uppercase tracking-widest text-graphite-400 mb-3">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nova Agenda',    icon: Plus,          color: 'var(--brand-primary,#D4A017)', href: '/agenda-coach' },
              { label: 'Ver Alunos',     icon: Users,         color: '#3B82F6', href: '/alunos' },
              { label: 'Mensalidades',   icon: DollarSign,    color: '#22C55E', href: '/mensalidades' },
              { label: 'Publicar Aviso', icon: Zap,           color: '#A855F7', href: '/avisos' },
            ].map(({ label, icon: Icon, color, href }) => (
              <motion.button
                key={label}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push(href)}
                className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left no-tap-highlight"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-sm font-semibold text-white">{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
