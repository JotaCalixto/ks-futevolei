'use client'
// src/components/layout/CoachShell.tsx
// Layout do professor — sidebar em desktop, drawer em mobile

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Calendar, Users, DollarSign,
  MessageSquare, Megaphone, Settings, Menu, X,
  Bell, ChevronRight, LogOut,
} from 'lucide-react'
import Image from 'next/image'
import { useTenant, useBranding } from '@/components/providers/TenantProvider'
import { useAuth } from '@/components/providers/Providers'
import { useNotificationContext } from '@/components/providers/Providers'
import { getInitials, cn } from '@/lib/utils'

const COACH_NAV = [
  { href: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard, badge: null },
  { href: '/agenda-coach',        label: 'Agenda',        icon: Calendar,         badge: null },
  { href: '/alunos',        label: 'Alunos',        icon: Users,            badge: null },
  { href: '/mensalidades',  label: 'Mensalidades',  icon: DollarSign,       badge: 'overdue' },
  { href: '/mensagens-coach',     label: 'Mensagens',     icon: MessageSquare,    badge: 'unread' },
  { href: '/avisos',        label: 'Avisos',        icon: Megaphone,        badge: null },
  { href: '/configuracoes', label: 'Configurações', icon: Settings,         badge: null },
] as const

interface CoachShellProps {
  children: React.ReactNode
}

export function CoachShell({ children }: CoachShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const branding = useBranding()
  const { profile, signOut } = useAuth()
  const { unreadCount } = useNotificationContext()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-graphite-900 flex">

      {/* ── Sidebar (desktop) ─────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r border-white/[0.06]">
        <SidebarContent
          branding={branding}
          profile={profile}
          pathname={pathname}
          unreadCount={unreadCount}
          onSignOut={signOut}
          onClose={() => {}}
        />
      </aside>

      {/* ── Mobile Drawer ─────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 38 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col border-r border-white/[0.08]"
              style={{ background: '#111111' }}
            >
              <SidebarContent
                branding={branding}
                profile={profile}
                pathname={pathname}
                unreadCount={unreadCount}
                onSignOut={signOut}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-white/[0.06] bg-graphite-900 sticky top-0 z-30 pt-[env(safe-area-inset-top,0px)]">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-graphite-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo compacta */}
          <div className="flex items-center gap-2">
            {branding.logoUrl ? (
              <Image src={branding.logoUrl} alt={branding.academyName} width={28} height={28} className="rounded-md object-cover" />
            ) : (
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black text-graphite-900"
                style={{ background: 'var(--brand-primary, #D4A017)' }}
              >
                {branding.academyShortName.charAt(0)}
              </div>
            )}
            <span className="text-sm font-bold text-white truncate max-w-[140px]">
              {branding.academyShortName}
            </span>
          </div>

          {/* Bell */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-graphite-400 hover:text-white hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// ── Sidebar Content (compartilhado entre desktop e mobile drawer) ──

interface SidebarContentProps {
  branding: ReturnType<typeof useBranding>
  profile: ReturnType<typeof useAuth>['profile']
  pathname: string
  unreadCount: number
  onSignOut: () => void
  onClose: () => void
}

function SidebarContent({ branding, profile, pathname, unreadCount, onSignOut, onClose }: SidebarContentProps) {
  const router = useRouter()

  const navigate = (href: string) => {
    router.push(href)
    onClose()
  }

  return (
    <div className="flex flex-col h-full bg-[#111111]">

      {/* Logo section */}
      <div className="px-4 pt-6 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          {branding.logoUrl ? (
            <Image
              src={branding.logoUrl}
              alt={branding.academyName}
              width={40}
              height={40}
              className="rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-graphite-900 flex-shrink-0"
              style={{ background: 'var(--brand-gradient, linear-gradient(135deg, #D4A017, #FBBF24))' }}
            >
              {branding.academyShortName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{branding.academyName}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--brand-primary, #D4A017)' }}>
              Painel do Coach
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {COACH_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          const badgeCount = item.badge === 'unread' ? unreadCount : 0

          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
                'transition-all duration-150 group relative',
                isActive
                  ? 'text-white'
                  : 'text-graphite-400 hover:text-white hover:bg-white/5',
              )}
            >
              {/* Fundo ativo */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'var(--brand-gradient-subtle, linear-gradient(135deg, rgba(212,160,23,0.12), rgba(212,160,23,0.04)))',
                    borderWidth: '1px',
                    borderColor: 'var(--brand-primary-border, rgba(212,160,23,0.3))',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}

              <Icon
                className="w-4 h-4 flex-shrink-0 relative z-10"
                strokeWidth={isActive ? 2.2 : 1.8}
                style={isActive ? { color: 'var(--brand-primary, #D4A017)' } : {}}
              />
              <span className="text-sm font-medium flex-1 relative z-10">{item.label}</span>

              {/* Badge */}
              {badgeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center relative z-10">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}

              {isActive && (
                <ChevronRight
                  className="w-3.5 h-3.5 relative z-10"
                  style={{ color: 'var(--brand-primary, #D4A017)' }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Profile footer */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-graphite-900 flex-shrink-0"
            style={{ background: 'var(--brand-primary, #D4A017)' }}
          >
            {profile?.fullName ? getInitials(profile.fullName) : 'P'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{profile?.fullName ?? 'Professor'}</p>
            <p className="text-[10px] text-graphite-500 truncate">{profile?.phone ?? ''}</p>
          </div>
          <button
            onClick={onSignOut}
            className="p-1.5 rounded-lg text-graphite-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
