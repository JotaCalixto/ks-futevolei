'use client'
// src/components/brand/SplashScreen.tsx
// Tela de splash premium — logo com glow animado e transição elegante

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useBranding } from '@/components/providers/TenantProvider'
import { useAuth } from '@/components/providers/Providers'

interface SplashScreenProps {
  /** Duração mínima do splash em ms */
  minDuration?: number
}

export function SplashScreen({ minDuration = 2200 }: SplashScreenProps) {
  const branding = useBranding()
  const { isLoading, profile } = useAuth()
  const router = useRouter()
  const [visible, setVisible] = useState(true)
  const [minElapsed, setMinElapsed] = useState(false)

  // Timer mínimo de exibição
  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), minDuration)
    return () => clearTimeout(t)
  }, [minDuration])

  // Navega quando auth carregou E tempo mínimo passou
  useEffect(() => {
    if (!isLoading && minElapsed) {
      setVisible(false)
      setTimeout(() => {
        router.replace(profile ? (profile.role === 'coach' ? '/dashboard' : '/home') : '/onboarding')
      }, 500)
    }
  }, [isLoading, minElapsed, profile, router])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: branding.darkBg ?? '#0D0D0D' }}
        >
          {/* Radial glow de fundo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 70% 50% at 50% 55%, var(--brand-primary-glow, rgba(212,160,23,0.18)) 0%, transparent 70%)`,
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Glow ring animado */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 30px var(--brand-primary-glow, rgba(212,160,23,0.2))',
                  '0 0 80px var(--brand-primary-glow, rgba(212,160,23,0.45))',
                  '0 0 30px var(--brand-primary-glow, rgba(212,160,23,0.2))',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-full"
            >
              {branding.splashLogoUrl ? (
                <Image
                  src={branding.splashLogoUrl}
                  alt={branding.academyName}
                  width={160}
                  height={160}
                  priority
                  className="rounded-full select-none"
                  style={{ filter: 'drop-shadow(0 0 24px var(--brand-primary-glow, rgba(212,160,23,0.5)))' }}
                />
              ) : (
                // Fallback — inicial em círculo dourado
                <div
                  className="w-40 h-40 rounded-full flex items-center justify-center text-6xl font-black select-none"
                  style={{
                    background: 'var(--brand-gradient, linear-gradient(135deg, #D4A017, #FBBF24))',
                    color: '#0D0D0D',
                  }}
                >
                  {branding.academyShortName.charAt(0)}
                </div>
              )}
            </motion.div>

            {/* Nome da academia */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <h1
                className="text-2xl font-black tracking-tight text-white"
                style={{ textShadow: '0 0 30px var(--brand-primary-glow, rgba(212,160,23,0.4))' }}
              >
                {branding.academyName}
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs font-semibold uppercase tracking-[0.25em] mt-1.5"
                style={{ color: 'var(--brand-primary, #D4A017)' }}
              >
                Plataforma Premium
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute bottom-16 flex items-center gap-2"
            style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--brand-primary, #D4A017)' }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── LogoSection — exibe logo e nome da academia em telas de auth ──

interface LogoSectionProps {
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

export function LogoSection({ size = 'md', showName = true, className }: LogoSectionProps) {
  const branding = useBranding()

  const sizeMap = { sm: 48, md: 64, lg: 96 }
  const logoSize = sizeMap[size]

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {branding.logoUrl ? (
        <Image
          src={branding.logoUrl}
          alt={branding.academyName}
          width={logoSize}
          height={logoSize}
          priority
          className="rounded-xl object-cover"
          style={{ filter: 'drop-shadow(0 4px 16px var(--brand-primary-glow, rgba(212,160,23,0.35)))' }}
        />
      ) : (
        <div
          className="rounded-xl flex items-center justify-center font-black text-graphite-900"
          style={{
            width: logoSize, height: logoSize,
            background: 'var(--brand-gradient, linear-gradient(135deg, #D4A017, #FBBF24))',
            fontSize: logoSize * 0.4,
          }}
        >
          {branding.academyShortName.charAt(0)}
        </div>
      )}
      {showName && (
        <div className="text-center">
          <p
            className="font-black tracking-tight"
            style={{
              fontSize: size === 'sm' ? 14 : size === 'md' ? 18 : 22,
              color: 'var(--brand-primary, #D4A017)',
            }}
          >
            {branding.academyName}
          </p>
        </div>
      )}
    </div>
  )
}
