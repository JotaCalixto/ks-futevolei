'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell } from 'lucide-react'
import { SolidCard } from '@/components/shared/Cards'

export default function NotificacoesPage() {
  const router = useRouter()
  return (
    <div className="p-5 lg:p-7 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg text-graphite-400 hover:text-white hover:bg-white/5">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notificações</h1>
          <p className="text-sm text-graphite-500 mt-0.5">Push e alertas automáticos</p>
        </div>
      </div>
      <SolidCard className="p-5 text-center">
        <Bell className="w-10 h-10 text-graphite-600 mx-auto mb-3" />
        <p className="text-sm text-graphite-400">Configurações de notificação em breve.</p>
      </SolidCard>
    </div>
  )
}
