'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Shield } from 'lucide-react'
import { SolidCard } from '@/components/shared/Cards'
import { useTenant } from '@/components/providers/TenantProvider'

export default function PlanoPage() {
  const router = useRouter()
  const { tenant } = useTenant()
  return (
    <div className="p-5 lg:p-7 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg text-graphite-400 hover:text-white hover:bg-white/5">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Conta e Plano</h1>
          <p className="text-sm text-graphite-500 mt-0.5">Plano {tenant.plan.name}</p>
        </div>
      </div>
      <SolidCard className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8" style={{ color: 'var(--brand-primary,#D4A017)' }} />
          <div>
            <p className="text-sm font-bold text-white">Plano {tenant.plan.name}</p>
            <p className="text-xs text-graphite-500">Até {tenant.plan.maxStudents} alunos · {tenant.plan.maxSlotsPerDay} horários/dia</p>
          </div>
        </div>
      </SolidCard>
    </div>
  )
}
