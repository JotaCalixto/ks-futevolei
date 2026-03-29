'use client'
// src/app/(student)/perfil/page.tsx
// Perfil completo do aluno

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Phone, Calendar, Trophy, Clock,
  ChevronRight, LogOut, Bell, Shield, Edit3,
  CheckCircle, XCircle,
} from 'lucide-react'
import { useAuth } from '@/components/providers/Providers'
import { useBranding } from '@/components/providers/TenantProvider'
import { AppShell, PageHeader } from '@/components/layout/AppShell'
import { SolidCard, GoldCard, StatusBadge } from '@/components/shared/Cards'
import { MembershipCard } from '@/components/membership/MembershipCard'
import { formatDate, formatPhone, getInitials, getAvatarColor, cn } from '@/lib/utils'
import { useStudentProfile } from '@/hooks/useStudentProfile'

export default function PerfilPage() {
  const { profile, student, signOut } = useAuth()
  const branding = useBranding()
  const { membership, recentBookings, isLoading } = useStudentProfile()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  if (!profile) return null

  const initials = getInitials(profile.fullName)
  const avatarBg = getAvatarColor(profile.fullName)

  return (
    <AppShell>
      <PageHeader title="Meu Perfil" withDivider />

      <div className="px-4 pb-6 space-y-5 pt-4">

        {/* Avatar + nome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          {/* Avatar com inicial */}
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
              style={{ background: `linear-gradient(135deg, ${avatarBg}, ${avatarBg}99)` }}
            >
              {initials}
            </div>
            {/* Dot ativo */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-graphite-900"
              style={{ background: 'var(--brand-primary, #D4A017)' }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-white tracking-tight truncate">
              {profile.fullName}
            </h2>
            <p className="text-sm text-graphite-400 font-medium">
              {formatPhone(profile.phone)}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <StatusBadge
                status="active"
                label={branding.academyShortName}
                size="sm"
                showDot
              />
              {student?.totalAttendances != null && (
                <span className="text-xs text-graphite-500 font-medium">
                  {student.totalAttendances} treinos
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Mensalidade */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-graphite-500 mb-2.5">
            Plano
          </p>
          <MembershipCard membership={membership ?? null} />
        </motion.div>

        {/* Stats rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-graphite-500 mb-2.5">
            Resumo
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Treinos', value: student?.totalAttendances ?? 0, icon: '🏐' },
              { label: 'Este mês', value: recentBookings?.filter(b => b.status === 'attended').length ?? 0, icon: '📅' },
              { label: 'Desde', value: student?.joinedAt ? formatDate(student.joinedAt, 'MMM/yy') : '—', icon: '⭐' },
            ].map((stat) => (
              <SolidCard key={stat.label} className="p-3 text-center space-y-1">
                <span className="text-lg">{stat.icon}</span>
                <p className="text-lg font-black text-white leading-none">{stat.value}</p>
                <p className="text-[10px] font-semibold text-graphite-500 uppercase tracking-wider">{stat.label}</p>
              </SolidCard>
            ))}
          </div>
        </motion.div>

        {/* Histórico recente */}
        {recentBookings && recentBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-graphite-500 mb-2.5">
              Histórico recente
            </p>
            <SolidCard className="overflow-hidden divide-y divide-white/[0.05]">
              {recentBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center',
                      booking.status === 'attended' ? 'bg-green-500/15' : 'bg-red-500/15',
                    )}>
                      {booking.status === 'attended'
                        ? <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                        : <XCircle className="w-3.5 h-3.5 text-red-400" />
                      }
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {booking.slot?.trainingDay
                          ? formatDate(booking.slot.trainingDay.date, 'dd/MM/yyyy')
                          : '—'}
                      </p>
                      <p className="text-[11px] text-graphite-500">
                        {booking.slot?.startTime ? booking.slot.startTime.slice(0, 5) : '—'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    status={booking.status === 'attended' ? 'attended' : booking.status === 'cancelled' ? 'cancelled' : 'no_show'}
                    size="sm"
                    showDot={false}
                  />
                </div>
              ))}
            </SolidCard>
          </motion.div>
        )}

        {/* Configurações */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-graphite-500 mb-2.5">
            Configurações
          </p>
          <SolidCard className="overflow-hidden divide-y divide-white/[0.05]">
            {[
              { icon: Bell, label: 'Notificações', desc: 'Agendamentos e avisos', action: 'Ativadas' },
              { icon: Shield, label: 'Privacidade', desc: 'Seus dados são protegidos' },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors text-left no-tap-highlight"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-graphite-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  {item.desc && <p className="text-xs text-graphite-500">{item.desc}</p>}
                </div>
                {item.action
                  ? <span className="text-xs font-semibold" style={{ color: 'var(--brand-primary, #D4A017)' }}>{item.action}</span>
                  : <ChevronRight className="w-4 h-4 text-graphite-600" />
                }
              </button>
            ))}
          </SolidCard>
        </motion.div>

        {/* Sair */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-3.5 rounded-xl border border-red-500/25 text-red-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-3"
            >
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3.5 rounded-xl border border-white/10 text-graphite-400 font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={signOut}
                className="flex-1 py-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-semibold text-sm hover:bg-red-500/30 transition-colors"
              >
                Confirmar saída
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Versão */}
        <p className="text-center text-[11px] text-graphite-700">
          {branding.academyName} · v1.0
        </p>
      </div>
    </AppShell>
  )
}
