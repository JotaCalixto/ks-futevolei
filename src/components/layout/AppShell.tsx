'use client'
// src/components/layout/AppShell.tsx
// Shell principal mobile-first — envolve todas as telas do aluno

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { BottomNav } from './BottomNav'
import { ConnectionIndicator } from '@/components/shared/ConnectionIndicator'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  /** Esconde bottom nav (ex: tela de chat em foco) */
  hideNav?: boolean
  /** Scrollável ou altura fixa (ex: chat) */
  scrollable?: boolean
  /** Classe extra no container de conteúdo */
  contentClassName?: string
}

export function AppShell({
  children,
  hideNav = false,
  scrollable = true,
  contentClassName,
}: AppShellProps) {
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reseta scroll ao trocar de rota
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [pathname])

  return (
    <div
      className={cn(
        'relative flex flex-col',
        'min-h-[100svh] max-h-[100svh]',
        'bg-graphite-900',
        'overflow-hidden',
      )}
    >
      {/* Indicador de conexão realtime — topo */}
      <ConnectionIndicator />

      {/* Área de conteúdo principal */}
      <main
        ref={scrollRef}
        className={cn(
          'flex-1 relative',
          scrollable ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden',
          'scrollbar-hide',
          // Padding bottom para não ficar atrás do bottom nav
          !hideNav && 'pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]',
          contentClassName,
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {!hideNav && <BottomNav />}
    </div>
  )
}

// ── Header de página reutilizável ────────────────────────────

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Elemento no lado direito (ex: botão de ação) */
  action?: React.ReactNode
  /** Se true, aplica padding top safe area */
  withSafeArea?: boolean
  /** Adiciona separador sutil abaixo */
  withDivider?: boolean
}

export function PageHeader({
  title,
  subtitle,
  action,
  withSafeArea = true,
  withDivider = false,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-10',
        'px-4 py-4',
        'bg-graphite-900/95 backdrop-blur-md',
        withSafeArea && 'pt-[calc(1rem+env(safe-area-inset-top,0px))]',
        withDivider && 'border-b border-white/[0.06]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-graphite-400 mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0 pt-0.5">{action}</div>}
      </div>
    </header>
  )
}

// ── Section container com espaçamento padrão ─────────────────

interface SectionProps {
  children: React.ReactNode
  title?: string
  action?: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function Section({ children, title, action, className, noPadding }: SectionProps) {
  return (
    <section className={cn('px-4', !noPadding && 'mb-6', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && (
            <h2 className="text-sm font-semibold text-graphite-300 uppercase tracking-widest">
              {title}
            </h2>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
