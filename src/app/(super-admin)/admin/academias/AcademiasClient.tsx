// src/app/(super-admin)/admin/academias/AcademiasClient.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Plus, ExternalLink, Settings,
  Users, Calendar, CheckCircle, XCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Academia {
  id: string
  name: string
  slug: string
  subdomain: string | null
  custom_domain: string | null
  primary_color: string
  logo_url: string | null
  plan_id: string
  is_active: boolean
  created_at: string
  owner_email: string | null
  settings: { default_monthly_fee: number; default_capacity: number } | null
}

interface AcademiaStat {
  id: string
  current_students: number
  current_coaches: number
  bookings_last_30d: number
  plan_name: string
}

interface Props {
  academias: Academia[]
  stats: AcademiaStat[]
}

const PLAN_BADGE: Record<string, string> = {
  free:       'bg-graphite-700 text-graphite-300',
  starter:    'bg-blue-500/20 text-blue-400',
  pro:        'bg-gold-500/20 text-gold-400',
  enterprise: 'bg-purple-500/20 text-purple-400',
}

export default function AcademiasClient({ academias, stats }: Props) {
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState<string>('all')

  const statsMap = Object.fromEntries(stats.map(s => [s.id, s]))

  const filtered = academias.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.includes(search.toLowerCase()) ||
      a.owner_email?.includes(search.toLowerCase())
    const matchPlan = filterPlan === 'all' || a.plan_id === filterPlan
    return matchSearch && matchPlan
  })

  return (
    <div className="min-h-screen bg-graphite-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Academias</h1>
          <p className="text-graphite-400 text-sm mt-1">
            {academias.length} academia{academias.length !== 1 ? 's' : ''} cadastrada{academias.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/academias/nova" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Nova Academia
        </Link>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: academias.length, color: 'text-white' },
          { label: 'Ativas', value: academias.filter(a => a.is_active).length, color: 'text-green-400' },
          { label: 'Plano Pro+', value: academias.filter(a => ['pro','enterprise'].includes(a.plan_id)).length, color: 'text-gold-400' },
          { label: 'Total Alunos', value: stats.reduce((acc, s) => acc + (s.current_students ?? 0), 0), color: 'text-blue-400' },
        ].map(stat => (
          <div key={stat.label} className="solid-card rounded-xl p-4">
            <p className="text-xs text-graphite-400 font-medium">{stat.label}</p>
            <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite-400" />
          <input
            type="text"
            placeholder="Buscar por nome, slug ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-premium pl-10"
          />
        </div>
        <select
          value={filterPlan}
          onChange={e => setFilterPlan(e.target.value)}
          className="input-premium w-40"
        >
          <option value="all">Todos os planos</option>
          <option value="free">Gratuito</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="solid-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              {['Academia', 'URL', 'Plano', 'Alunos', 'Reservas (30d)', 'Status', 'Ações'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-graphite-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((academia, i) => {
              const stat = statsMap[academia.id]
              return (
                <motion.tr
                  key={academia.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  {/* Academia */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-black flex-shrink-0"
                        style={{ backgroundColor: academia.primary_color }}
                      >
                        {academia.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{academia.name}</p>
                        <p className="text-xs text-graphite-400">{academia.owner_email ?? '—'}</p>
                      </div>
                    </div>
                  </td>

                  {/* URL */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {academia.custom_domain && (
                        <p className="text-xs font-mono text-gold-400">{academia.custom_domain}</p>
                      )}
                      {academia.subdomain && (
                        <p className="text-xs font-mono text-white/50">{academia.subdomain}.app</p>
                      )}
                      <p className="text-xs font-mono text-white/30">/s/{academia.slug}</p>
                    </div>
                  </td>

                  {/* Plano */}
                  <td className="px-4 py-4">
                    <span className={cn(
                      'badge text-xs font-semibold px-2 py-0.5 rounded-full',
                      PLAN_BADGE[academia.plan_id]
                    )}>
                      {academia.plan_id.charAt(0).toUpperCase() + academia.plan_id.slice(1)}
                    </span>
                  </td>

                  {/* Alunos */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-white">
                      <Users className="w-3 h-3 text-graphite-400" />
                      {stat?.current_students ?? 0}
                    </div>
                  </td>

                  {/* Reservas */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-white">
                      <Calendar className="w-3 h-3 text-graphite-400" />
                      {stat?.bookings_last_30d ?? 0}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    {academia.is_active ? (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="w-3 h-3" /> Ativa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <XCircle className="w-3 h-3" /> Inativa
                      </span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/academias/${academia.id}/configuracoes`}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-graphite-400 hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </Link>
                      <a
                        href={`https://${academia.subdomain ? `${academia.subdomain}.ks-futevolei.com.br` : `app.ks-futevolei.com.br/s/${academia.slug}`}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-graphite-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-graphite-500">
            Nenhuma academia encontrada
          </div>
        )}
      </div>
    </div>
  )
}