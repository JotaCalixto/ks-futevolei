'use client'
// src/app/(coach)/avisos/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Pin, Megaphone, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/Providers'
import { useTenant } from '@/components/providers/TenantProvider'
import { SolidCard } from '@/components/shared/Cards'
import { Skeleton } from '@/components/shared/SharedComponents'
import { formatRelativeDate, cn } from '@/lib/utils'
import type { Announcement } from '@/types/domain'

export default function AvisosPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', isPinned: false })
  const { coach } = useAuth()
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()

  const load = useCallback(async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('academy_id', tenant.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30)
    setAnnouncements((data ?? []) as unknown as Announcement[])
    setIsLoading(false)
  }, [supabase, tenant.id])

  useEffect(() => { load() }, [load])

  const submit = useCallback(async () => {
    if (!form.title.trim() || !form.content.trim() || !coach?.id) return
    setIsSubmitting(true)
    const { error } = await supabase.from('announcements').insert({
      academy_id: tenant.id,
      coach_id: coach.id,
      title: form.title.trim(),
      content: form.content.trim(),
      scope: 'all',
      is_pinned: form.isPinned,
    })
    if (error) { toast.error('Erro ao publicar aviso'); }
    else {
      toast.success('Aviso publicado!')
      setForm({ title: '', content: '', isPinned: false })
      setShowForm(false)
      load()
    }
    setIsSubmitting(false)
  }, [form, coach?.id, supabase, tenant.id, load])

  const deleteAnnouncement = useCallback(async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id)
    toast.success('Aviso removido')
    load()
  }, [supabase, load])

  const togglePin = useCallback(async (announcement: Announcement) => {
    await supabase.from('announcements').update({ is_pinned: !announcement.isPinned }).eq('id', announcement.id)
    load()
  }, [supabase, load])

  return (
    <div className="p-5 lg:p-7 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Avisos</h1>
          <p className="text-sm text-graphite-500 mt-0.5">Comunique-se com todos os alunos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-graphite-900"
          style={{ background: 'var(--brand-primary,#D4A017)' }}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Novo Aviso'}
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div
              className="rounded-xl border p-5 space-y-4"
              style={{ background: 'var(--brand-gradient-subtle)', borderColor: 'var(--brand-primary-border)' }}
            >
              <h3 className="text-sm font-bold text-white">Novo Aviso</h3>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Título do aviso"
                className="input-premium"
                maxLength={200}
              />
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Conteúdo da mensagem..."
                rows={3}
                className="input-premium resize-none"
                maxLength={2000}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setForm(f => ({ ...f, isPinned: !f.isPinned }))}
                    className={cn(
                      'w-10 h-5 rounded-full transition-colors flex items-center px-0.5',
                      form.isPinned ? 'bg-[var(--brand-primary,#D4A017)]' : 'bg-graphite-700',
                    )}
                  >
                    <div className={cn('w-4 h-4 rounded-full bg-white transition-transform', form.isPinned && 'translate-x-5')} />
                  </div>
                  <span className="text-xs font-medium text-graphite-400 flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Fixar aviso
                  </span>
                </label>
                <button
                  onClick={submit}
                  disabled={isSubmitting || !form.title.trim() || !form.content.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-graphite-900 disabled:opacity-50"
                  style={{ background: 'var(--brand-primary,#D4A017)' }}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                  Publicar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12">
          <Megaphone className="w-10 h-10 text-graphite-700 mx-auto mb-3" />
          <p className="text-sm text-graphite-500">Nenhum aviso publicado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <SolidCard className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {a.isPinned && (
                        <Pin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--brand-primary,#D4A017)' }} />
                      )}
                      <p className="text-sm font-bold text-white truncate">{a.title}</p>
                    </div>
                    <p className="text-xs text-graphite-400 leading-relaxed line-clamp-2">{a.content}</p>
                    <p className="text-[11px] text-graphite-600 mt-2">{formatRelativeDate(a.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => togglePin(a)}
                      className={cn('p-1.5 rounded-lg transition-colors', a.isPinned ? 'text-[var(--brand-primary,#D4A017)] bg-[var(--brand-gradient-subtle)]' : 'text-graphite-600 hover:text-white hover:bg-white/5')}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteAnnouncement(a.id)} className="p-1.5 rounded-lg text-graphite-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </SolidCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

