'use client'
// src/app/(auth)/onboarding/page.tsx
// 3 slides de onboarding premium com Framer Motion

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Calendar, Zap, Shield, ChevronRight } from 'lucide-react'
import { useBranding } from '@/components/providers/TenantProvider'

const SLIDES = [
  {
    id: 0,
    icon: Calendar,
    iconBg: 'rgba(212,160,23,0.12)',
    iconColor: 'var(--brand-primary, #D4A017)',
    title: 'Agende seus treinos',
    description:
      'Veja os horários disponíveis, reserve sua vaga em segundos e receba confirmação imediata. Sem ligações, sem espera.',
    visual: OnboardingVisual1,
  },
  {
    id: 1,
    icon: Zap,
    iconBg: 'rgba(59,130,246,0.12)',
    iconColor: '#3B82F6',
    title: 'Tudo em tempo real',
    description:
      'Vagas atualizadas ao vivo. Quando alguém cancela, você é avisado automaticamente — sem perder uma oportunidade.',
    visual: OnboardingVisual2,
  },
  {
    id: 2,
    icon: Shield,
    iconBg: 'rgba(34,197,94,0.12)',
    iconColor: '#22C55E',
    title: 'Controle total do seu plano',
    description:
      'Acompanhe sua mensalidade, histórico de presença e fale diretamente com seu professor pelo app.',
    visual: OnboardingVisual3,
  },
] as const

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const router = useRouter()
  const branding = useBranding()

  const isLast = current === SLIDES.length - 1

  const next = () => {
    if (isLast) {
      router.push('/login')
    } else {
      setCurrent((c) => c + 1)
    }
  }

  const skip = () => router.push('/login')

  const slide = SLIDES[current]
  const SlideVisual = slide.visual

  return (
    <div
      className="min-h-svh flex flex-col overflow-hidden"
      style={{ background: '#0D0D0D' }}
    >
      {/* Fundo radial sutil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 40% at 50% 20%, var(--brand-primary-glow, rgba(212,160,23,0.10)) 0%, transparent 70%)`,
        }}
      />

      {/* Skip */}
      <div className="relative z-10 flex justify-end px-5 pt-[calc(1.25rem+env(safe-area-inset-top,0px))]">
        {!isLast && (
          <button
            onClick={skip}
            className="text-sm font-semibold text-graphite-500 hover:text-white transition-colors py-1 px-2"
          >
            Pular
          </button>
        )}
      </div>

      {/* Visual area */}
      <div className="relative flex-1 flex items-center justify-center px-6 pt-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="w-full max-w-sm"
          >
            <SlideVisual brandColor="var(--brand-primary, #D4A017)" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Text + CTA */}
      <div
        className="relative z-10 px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]"
        style={{ background: 'linear-gradient(to top, #0D0D0D 60%, transparent)' }}
      >
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-7">
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === current ? 24 : 6,
                opacity: i === current ? 1 : 0.3,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              className="h-1.5 rounded-full"
              style={{ background: 'var(--brand-primary, #D4A017)' }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${slide.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="space-y-3 mb-8 text-center"
          >
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
              {slide.title}
            </h2>
            <p className="text-sm text-graphite-400 leading-relaxed max-w-xs mx-auto">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={next}
          className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all"
          style={{
            background: 'var(--brand-primary, #D4A017)',
            color: '#0D0D0D',
            boxShadow: 'var(--brand-shadow-lg, 0 0 40px rgba(212,160,23,0.35))',
          }}
        >
          {isLast ? (
            <>Começar agora</>
          ) : (
            <>
              Próximo
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {/* Logo */}
        <p className="text-center text-[11px] text-graphite-700 mt-4 font-medium">
          {branding.academyName}
        </p>
      </div>
    </div>
  )
}

// ── Visuais decorativos por slide ─────────────────────────────

function OnboardingVisual1({ brandColor }: { brandColor: string }) {
  return (
    <div className="space-y-3">
      {/* Calendário estilizado */}
      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#181818' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Janeiro</span>
          <span className="text-xs font-semibold" style={{ color: brandColor }}>Hoje</span>
        </div>
        <div className="grid grid-cols-7 gap-0 p-3">
          {['D','S','T','Q','Q','S','S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-graphite-600 pb-2">{d}</div>
          ))}
          {Array.from({ length: 31 }, (_, i) => {
            const day = i + 1
            const active = [8, 10, 13, 15, 17, 20, 22].includes(day)
            const selected = day === 15
            return (
              <div key={i} className="flex items-center justify-center p-0.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold"
                  style={selected ? { background: brandColor, color: '#0D0D0D' } : {
                    color: active ? '#fff' : '#444',
                    background: active && !selected ? 'rgba(255,255,255,0.05)' : 'transparent',
                  }}
                >
                  {day}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* Slot card preview */}
      <div className="rounded-xl border p-3 flex items-center gap-3" style={{ background: 'rgba(212,160,23,0.08)', borderColor: 'rgba(212,160,23,0.3)' }}>
        <div className="w-1 h-10 rounded-full" style={{ background: brandColor }} />
        <div>
          <p className="text-sm font-black text-white">08:00 – 09:00</p>
          <p className="text-xs text-graphite-400">3 vagas disponíveis</p>
        </div>
        <div className="ml-auto px-3 py-1 rounded-lg text-xs font-bold" style={{ background: brandColor, color: '#0D0D0D' }}>
          Reservar
        </div>
      </div>
    </div>
  )
}

function OnboardingVisual2({ brandColor }: { brandColor: string }) {
  return (
    <div className="space-y-3">
      {/* Realtime feed */}
      {[
        { name: 'João Silva', action: 'reservou 08:00', time: 'agora', color: brandColor },
        { name: 'Maria Costa', action: 'cancelou 10:00', time: '2m', color: '#EF4444' },
        { name: 'Pedro Lima', action: 'entrou na fila 08:00', time: '5m', color: '#F59E0B' },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          className="rounded-xl border border-white/[0.07] p-3 flex items-center gap-3"
          style={{ background: '#181818' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black" style={{ background: item.color + '20', color: item.color }}>
            {item.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white">{item.name}</p>
            <p className="text-[11px] text-graphite-500">{item.action}</p>
          </div>
          <span className="text-[10px] font-semibold" style={{ color: item.color }}>{item.time}</span>
        </motion.div>
      ))}
      {/* Vagas live */}
      <div className="rounded-xl border border-white/[0.07] p-3" style={{ background: '#181818' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-graphite-500 mb-2">Vagas ao vivo — 08:00</p>
        <div className="flex gap-1.5">
          {Array.from({ length: 10 }, (_, i) => (
            <motion.div
              key={i}
              animate={i < 7 ? {} : { scale: [1, 1.3, 1] }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="w-5 h-5 rounded-md"
              style={{ background: i < 7 ? brandColor : 'rgba(255,255,255,0.08)' }}
            />
          ))}
        </div>
        <p className="text-[11px] text-graphite-500 mt-2">7 de 10 vagas ocupadas</p>
      </div>
    </div>
  )
}

function OnboardingVisual3({ brandColor }: { brandColor: string }) {
  return (
    <div className="space-y-3">
      {/* Membership card */}
      <div className="rounded-2xl border p-4" style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-graphite-400 uppercase tracking-wider">Mensalidade</p>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25">Em Dia</span>
        </div>
        <p className="text-2xl font-black text-white">R$ 250,00</p>
        <p className="text-xs text-green-400 mt-1">Vence em 18 dias · 28/01</p>
      </div>
      {/* Histórico */}
      <div className="rounded-xl border border-white/[0.07] overflow-hidden" style={{ background: '#181818' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-graphite-500 px-4 py-2.5 border-b border-white/[0.05]">Presenças — Janeiro</p>
        {[
          { date: 'Qua, 08', time: '08:00', present: true },
          { date: 'Sex, 10', time: '10:00', present: true },
          { date: 'Seg, 13', time: '08:00', present: false },
          { date: 'Qua, 15', time: '08:00', present: true },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] last:border-0">
            <div>
              <p className="text-xs font-semibold text-white">{item.date}</p>
              <p className="text-[11px] text-graphite-500">{item.time}</p>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.present ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
              {item.present ? 'Presente' : 'Faltou'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
