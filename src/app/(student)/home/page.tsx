'use client'
// src/app/(student)/home/page.tsx

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Calendar, ChevronRight, Zap, Bell,
  Clock, MapPin, TrendingUp,
} from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/Providers'
import { useTenant, useBranding } from '@/components/providers/TenantProvider'
import { AppShell, PageHeader, Section } from '@/components/layout/AppShell'
import { SolidCard, GoldCard, StatCard } from '@/components/shared/Cards'
import { MembershipCard } from '@/components/membership/MembershipCard'
import { AnnouncementBanner } from '@/components/shared/SharedComponents'
import { SlotCardSkeleton, StatCardSkeleton } from '@/components/shared/SharedComponents'
import { StatusBadge } from '@/components/shared/Cards'
import {
  formatTrainingDate, formatTime, formatDate,
  calculateMembershipStatus, cn,
} from '@/lib/utils'
import type { Booking, Announcement, Membership } from '@/types/domain'

interface HomeData {
  nextBooking: Booking | null
  membership: Membership | null
  announcements: Announcement[]
  totalAttendances: number
  monthAttendances: number
}

export default function HomePage() {
  const { profile, student } = useAuth()
  const { tenant } = useTenant()
  const branding = useBranding()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [data, setData] = useState<HomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Atleta'

  const load = useCallback(async () => {
    if (!student?.id) return
    setIsLoading(true)

    try {
      const now = new Date().toISOString()
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const [nextBookingRes, membershipRes, announcementsRes, monthRes] = await Promise.all([
        // Próxima reserva futura confirmada
        supabase
          .from('bookings')
          .select(`
            *,
            slot:training_slots(
              *, training_day:training_days(date, observation, theme)
            )
          `)
          .eq('student_id', student.id)
          .eq('academy_id', tenant.id)
          .eq('status', 'confirmed')
          .gte('booked_at', now)
          .order('booked_at', { ascending: true })
          .limit(1)
          .maybeSingle(),

        // Mensalidade mais recente
        supabase
          .from('memberships')
          .select('*')
          .eq('student_id', student.id)
          .eq('academy_id', tenant.id)
          .order('reference_month', { ascending: false })
          .limit(1)
          .maybeSingle(),

        // Avisos recentes não expirados
        supabase
          .from('announcements')
          .select('*, coach:coaches(profile:profiles(full_name))')
          .eq('academy_id', tenant.id)
          .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(3),

        // Presenças do mês
        supabase
          .from('attendance')
          .select('id')
          .eq('student_id', student.id)
          .eq('academy_id', tenant.id)
          .eq('attended', true)
          .gte('created_at', monthStart.toISOString()),
      ])

      const mem = membershipRes.data
      setData({
        nextBooking: nextBookingRes.data as unknown as Booking | null,
        membership: mem ? {
          ...mem as unknown as Membership,
          membershipStatus: calculateMembershipStatus(
            mem.due_date,
            mem.status as 'paid' | 'pending' | 'overdue' | 'waived'
          ),
          daysUntilDue: Math.ceil((new Date(mem.due_date).getTime() - Date.now()) / 86400000),
          isOverdue: new Date(mem.due_date) < new Date() && mem.status !== 'paid',
          isDueSoon: Math.ceil((new Date(mem.due_date).getTime() - Date.now()) / 86400000) <= 5 && mem.status !== 'paid',
        } : null,
        announcements: (announcementsRes.data ?? []) as unknown as Announcement[],
        totalAttendances: student.totalAttendances ?? 0,
        monthAttendances: (monthRes.data ?? []).length,
      })
    } finally {
      setIsLoading(false)
    }
  }, [student?.id, tenant.id, supabase])

  useEffect(() => { load() }, [load])

  // Saudação por hora
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  })()

  const stagger = {
    animate: { transition: { staggerChildren: 0.07 } },
  }
  const fadeUp = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] } },
  }

  return (
    <AppShell>
      {/* Header com saudação */}
      <div
        className="px-4 pt-[calc(1.25rem+env(safe-area-inset-top,0px))] pb-4"
        style={{
          background: `radial-gradient(ellipse 120% 60% at 50% 0%, var(--brand-primary-glow, rgba(212,160,23,0.12)) 0%, transparent 70%)`,
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs font-semibold text-graphite-500 uppercase tracking-widest">
              {greeting}
            </p>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {firstName} 👋
            </h1>
          </div>
          {/* Bell */}
          <button
            onClick={() => router.push('/notificacoes')}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center text-graphite-400 hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
        {/* Academia */}
        <p className="text-xs font-medium" style={{ color: 'var(--brand-primary, #D4A017)' }}>
          {branding.academyName}
        </p>
      </div>

      {isLoading ? (
        <div className="px-4 space-y-5 mt-2">
          <StatCardSkeleton count={2} />
          <SlotCardSkeleton count={1} />
        </div>
      ) : (
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5 pb-4">

          {/* Avisos fixados */}
          {data?.announcements && data.announcements.length > 0 && (
            <motion.div variants={fadeUp} className="px-4 space-y-3">
              {data.announcements.map(a => (
                <AnnouncementBanner
                  key={a.id}
                  title={a.title}
                  content={a.content}
                  isPinned={a.isPinned}
                  createdAt={a.createdAt}
                />
              ))}
            </motion.div>
          )}

          {/* Próximo treino */}
          <motion.div variants={fadeUp}>
            <Section title="Próximo Treino" action={
              <button
                onClick={() => router.push('/agenda')}
                className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: 'var(--brand-primary, #D4A017)' }}
              >
                Ver agenda <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }>
              {data?.nextBooking ? (
                <NextTrainingCard booking={data.nextBooking} />
              ) : (
                <EmptyNextTraining onSchedule={() => router.push('/agenda')} />
              )}
            </Section>
          </motion.div>

          {/* Mensalidade */}
          <motion.div variants={fadeUp}>
            <Section title="Meu Plano" action={
              <button
                onClick={() => router.push('/plano')}
                className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: 'var(--brand-primary, #D4A017)' }}
              >
                Detalhes <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }>
              <MembershipCard membership={data?.membership ?? null} compact onClick={() => router.push('/plano')} />
            </Section>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp}>
            <Section title="Seus Números">
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Este mês"
                  value={data?.monthAttendances ?? 0}
                  subvalue="treinos realizados"
                  icon={<TrendingUp className="w-4 h-4" />}
                />
                <StatCard
                  label="Total"
                  value={data?.totalAttendances ?? 0}
                  subvalue="presença acumulada"
                  icon={<Zap className="w-4 h-4" />}
                  onClick={() => router.push('/reservas')}
                />
              </div>
            </Section>
          </motion.div>

          {/* Ação rápida */}
          <motion.div variants={fadeUp} className="px-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/agenda')}
              className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
              style={{
                background: 'var(--brand-primary, #D4A017)',
                color: '#0D0D0D',
                boxShadow: 'var(--brand-shadow-lg, 0 0 40px rgba(212,160,23,0.3))',
              }}
            >
              <Calendar className="w-5 h-5" />
              Agendar Treino
            </motion.button>
          </motion.div>

        </motion.div>
      )}
    </AppShell>
  )
}

// ── Próximo treino card ──────────────────────────────────────

function NextTrainingCard({ booking }: { booking: Booking }) {
  const slot = booking.slot as unknown as Record<string, unknown>
  const day = slot?.training_day as Record<string, unknown> | null

  if (!slot || !day) return null

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      className="rounded-xl overflow-hidden border"
      style={{
        background: 'var(--brand-gradient-subtle, rgba(212,160,23,0.08))',
        borderColor: 'var(--brand-primary-border, rgba(212,160,23,0.3))',
      }}
    >
      {/* Top bar */}
      <div
        className="h-[3px]"
        style={{ background: 'var(--brand-gradient, linear-gradient(135deg,#D4A017,#FBBF24))' }}
      />
      <div className="p-4 space-y-3">
        {/* Data */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--brand-primary, #D4A017)' }}
          >
            {formatTrainingDate(day.date as string)}
          </span>
          <StatusBadge status="confirmed" size="sm" animated />
        </div>

        {/* Horário */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-graphite-500" />
          <span className="text-2xl font-black text-white">
            {formatTime(slot.start_time as string)}
          </span>
          <span className="text-graphite-500">–</span>
          <span className="text-base font-semibold text-graphite-400">
            {formatTime(slot.end_time as string)}
          </span>
        </div>

        {/* Local */}
        {slot.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-graphite-600" />
            <span className="text-xs text-graphite-400 font-medium">{String(slot.location)}</span>
          </div>
        )}

        {/* Observação do dia */}
        {day.observation && (
          <div className="flex items-start gap-2 pt-1 border-t border-white/[0.06]">
            <Zap className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand-primary,#D4A017)' }} />
            <p className="text-xs text-graphite-300 leading-relaxed">{String(day.observation)}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function EmptyNextTraining({ onSchedule }: { onSchedule: () => void }) {
  return (
    <SolidCard className="p-5 flex flex-col items-center text-center gap-3">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--brand-gradient-subtle)' }}
      >
        <Calendar className="w-6 h-6" style={{ color: 'var(--brand-primary,#D4A017)' }} />
      </div>
      <div>
        <p className="text-sm font-bold text-white">Nenhum treino agendado</p>
        <p className="text-xs text-graphite-500 mt-0.5">Reserve um horário e apareça na quadra!</p>
      </div>
      <button
        onClick={onSchedule}
        className="px-4 py-2 rounded-xl text-xs font-bold border"
        style={{
          borderColor: 'var(--brand-primary-border)',
          color: 'var(--brand-primary)',
          background: 'var(--brand-gradient-subtle)',
        }}
      >
        Ver agenda →
      </button>
    </SolidCard>
  )
}
