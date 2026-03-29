'use client'
// src/components/layout/BottomNav.tsx
// Bottom navigation premium com animação de indicador e badge de notificação

import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Calendar, CheckSquare,
  MessageCircle, CreditCard,
} from 'lucide-react'
import { useNotificationContext } from '@/components/providers/Providers'
import { useTenant } from '@/components/providers/TenantProvider'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/home',      label: 'Início',   icon: Home },
  { href: '/agenda',    label: 'Agenda',   icon: Calendar },
  { href: '/reservas',  label: 'Reservas', icon: CheckSquare },
  { href: '/mensagens', label: 'Chat',     icon: MessageCircle },
  { href: '/plano',     label: 'Plano',    icon: CreditCard },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { unreadCount } = useNotificationContext()
  const { tenant } = useTenant()

  return (
    <>
      {/* Blur de fundo para depth */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
        style={{ height: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-graphite-900 via-graphite-900/95 to-transparent" />
      </div>

      {/* Nav bar */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40',
          'px-2',
          'pb-[env(safe-area-inset-bottom,0px)]',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-around',
            'mx-auto max-w-lg',
            'h-[4.25rem]',
            'rounded-2xl',
            'border border-white/[0.08]',
            'mb-2',
          )}
          style={{
            background: 'rgba(24,24,24,0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            const showBadge = item.href === '/mensagens' && unreadCount > 0

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1',
                  'w-14 h-14 rounded-xl',
                  'transition-all duration-200 active:scale-90',
                  'no-tap-highlight select-none',
                  isActive ? 'text-white' : 'text-graphite-500 hover:text-graphite-300',
                )}
              >
                {/* Fundo ativo com cor do tenant */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, var(--brand-primary-glow, rgba(212,160,23,0.15)), transparent)`,
                      border: `1px solid var(--brand-primary-border, rgba(212,160,23,0.25))`,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}

                {/* Ícone */}
                <div className="relative">
                  <Icon
                    className={cn(
                      'transition-all duration-200',
                      isActive ? 'w-5 h-5' : 'w-5 h-5',
                    )}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={isActive ? { color: 'var(--brand-primary, #D4A017)' } : {}}
                  />

                  {/* Badge de notificação */}
                  <AnimatePresence>
                    {showBadge && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={cn(
                          'absolute -top-1.5 -right-1.5',
                          'min-w-[16px] h-4 px-1',
                          'rounded-full',
                          'bg-red-500 text-white',
                          'text-[10px] font-bold',
                          'flex items-center justify-center',
                          'border border-graphite-900',
                        )}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-[10px] font-semibold tracking-tight leading-none',
                    'transition-all duration-200',
                  )}
                  style={isActive ? { color: 'var(--brand-primary, #D4A017)' } : {}}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
