'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader2, ChevronRight, Palette, Bell, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useTenant, useBranding } from '@/components/providers/TenantProvider'
import { SolidCard } from '@/components/shared/Cards'
import { cn } from '@/lib/utils'

export default function ConfiguracoesPage() {
  const { tenant } = useTenant()
  const branding = useBranding()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [defaultCapacity, setDefaultCapacity] = useState(tenant.settings.defaultCapacity)
  const [cancelDeadlineHours, setCancelDeadlineHours] = useState(tenant.settings.cancelDeadlineHours)
  const [defaultMonthlyFee, setDefaultMonthlyFee] = useState(tenant.settings.defaultMonthlyFee)
  const [membershipDueDay, setMembershipDueDay] = useState(tenant.settings.membershipDueDay)
  const [isSaving, setIsSaving] = useState(false)

  const saveSettings = async () => {
    setIsSaving(true)
    const { error } = await supabase
      .from('settings')
      .update({
        default_capacity: defaultCapacity,
        cancel_deadline_hours: cancelDeadlineHours,
        default_monthly_fee: defaultMonthlyFee,
        membership_due_day: membershipDueDay,
      })
      .eq('academy_id', tenant.id)

    if (error) toast.error('Erro ao salvar configurações')
    else toast.success('Configurações salvas!')
    setIsSaving(false)
  }

  const sections = [
    {
      icon: Palette,
      label: 'Identidade Visual',
      desc: 'Logo, nome e cores da academia',
      href: '/configuracoes/branding',
      highlight: true,
    },
    {
      icon: Bell,
      label: 'Notificações',
      desc: 'Push e alertas automáticos',
      href: '/configuracoes/notificacoes',
      highlight: false,
    },
    {
      icon: Shield,
      label: 'Conta e Plano',
      desc: `Plano ${tenant.plan.name}`,
      href: '/configuracoes/plano',
      highlight: false,
    },
  ]

  return (
    <div className="p-5 lg:p-7 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Configurações</h1>
        <p className="text-sm text-graphite-500 mt-0.5">{branding.academyName}</p>
      </div>

      <div className="space-y-2">
        {sections.map(sec => (
          <motion.button
            key={sec.href}
            whileTap={{ scale: 0.985 }}
            onClick={() => router.push(sec.href)}
            className={cn(
              'w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors border no-tap-highlight',
              sec.highlight
                ? 'border-[var(--brand-primary-border)] hover:border-[var(--brand-primary)]'
                : 'border-white/[0.07] hover:border-white/20',
            )}
            style={sec.highlight ? { background: 'var(--brand-gradient-subtle)' } : { background: '#181818' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={sec.highlight ? {
                background: 'var(--brand-primary-glow)',
                color: 'var(--brand-primary,#D4A017)',
              } : {
                background: 'rgba(255,255,255,0.06)',
                color: '#717171',
              }}
            >
              <sec.icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{sec.label}</p>
              <p className="text-xs text-graphite-500 mt-0.5">{sec.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-graphite-600" />
          </motion.button>
        ))}
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-graphite-500 mb-3">Regras de Treino</h2>
        <SolidCard className="p-5 space-y-5">
          {[
            { label: 'Capacidade padrão por horário', value: defaultCapacity, setter: setDefaultCapacity, min: 1, max: 50, suffix: 'alunos' },
            { label: 'Prazo para cancelamento', value: cancelDeadlineHours, setter: setCancelDeadlineHours, min: 0, max: 48, suffix: 'horas antes' },
            { label: 'Mensalidade padrão', value: defaultMonthlyFee, setter: setDefaultMonthlyFee, min: 0, max: 9999, suffix: 'R$' },
            { label: 'Dia de vencimento', value: membershipDueDay, setter: setMembershipDueDay, min: 1, max: 28, suffix: 'do mês' },
          ].map(field => (
            <div key={field.label} className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{field.label}</p>
                <p className="text-xs text-graphite-500">{field.value} {field.suffix}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => field.setter(v => Math.max(field.min, v - 1))} className="w-8 h-8 rounded-lg bg-white/5 text-white font-bold text-lg flex items-center justify-center hover:bg-white/10">–</button>
                <span className="text-base font-black text-white w-10 text-center">{field.value}</span>
                <button onClick={() => field.setter(v => Math.min(field.max, v + 1))} className="w-8 h-8 rounded-lg bg-white/5 text-white font-bold text-lg flex items-center justify-center hover:bg-white/10">+</button>
              </div>
            </div>
          ))}

          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="w-full py-3 rounded-xl text-sm font-bold text-graphite-900 flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'var(--brand-primary,#D4A017)' }}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </SolidCard>
      </div>
    </div>
  )
}
