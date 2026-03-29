'use client'
// src/app/(coach)/agenda-coach/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfToday, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Lock, Unlock, Trash2, Clock, Loader2, X, Save } from 'lucide-react'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/Providers'
import { useTenant } from '@/components/providers/TenantProvider'
import { SolidCard } from '@/components/shared/Cards'
import { SpotsBadge } from '@/components/shared/Cards'
import { formatTime, cn } from '@/lib/utils'

const HOURS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00']

interface Slot {
  id: string
  start_time: string
  end_time: string
  capacity: number
  booked_count: number
  status: string
  observation: string | null
}

interface Day {
  id: string
  date: string
  is_open: boolean
  observation: string | null
  theme: string | null
}

export default function AgendaCoachPage() {
  const [selectedDate, setSelectedDate] = useState(startOfToday())
  const [day, setDay] = useState<Day | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddSlot, setShowAddSlot] = useState(false)
  const [showObsForm, setShowObsForm] = useState(false)
  const [newHour, setNewHour] = useState('08:00')
  const [newCap, setNewCap] = useState(10)
  const [newObs, setNewObs] = useState('')
  const [obsValue, setObsValue] = useState('')
  const [themeValue, setThemeValue] = useState('')

  const { coach } = useAuth()
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const dates = Array.from({ length: 21 }, (_, i) => addDays(startOfToday(), i - 1))

  const load = useCallback(async () => {
    setIsLoading(true)
    setDay(null)
    setSlots([])

    const { data: dayData } = await supabase
      .from('training_days')
      .select('*')
      .eq('academy_id', tenant.id)
      .eq('date', dateStr)
      .maybeSingle()

    if (dayData) {
      setDay(dayData as Day)
      setObsValue(dayData.observation ?? '')
      setThemeValue(dayData.theme ?? '')

      const { data: slotsData } = await supabase
        .from('training_slots')
        .select('*')
        .eq('training_day_id', dayData.id)
        .order('start_time', { ascending: true })

      setSlots((slotsData ?? []) as Slot[])
    }
    setIsLoading(false)
  }, [supabase, tenant.id, dateStr])

  useEffect(() => { load() }, [load])

  const openDay = async () => {
    if (!coach?.id) { toast.error('Coach não encontrado'); return }
    setIsSaving(true)
    if (day) {
      await supabase.from('training_days').update({ is_open: true }).eq('id', day.id)
    } else {
      await supabase.from('training_days').insert({
        academy_id: tenant.id,
        coach_id: coach.id,
        date: dateStr,
        is_open: true,
      })
    }
    await load()
    setIsSaving(false)
    toast.success('Dia aberto!')
  }

  const closeDay = async () => {
    if (!day) return
    setIsSaving(true)
    await supabase.from('training_days').update({ is_open: false }).eq('id', day.id)
    await load()
    setIsSaving(false)
    toast.success('Dia fechado')
  }

  const saveObs = async () => {
    if (!day) return
    await supabase.from('training_days').update({
      observation: obsValue || null,
      theme: themeValue || null,
    }).eq('id', day.id)
    setShowObsForm(false)
    load()
    toast.success('Observação salva')
  }

  const createSlot = async () => {
    if (!day || !coach?.id) return
    setIsSaving(true)
    const [h] = newHour.split(':').map(Number)
    const endHour = `${String(h + 1).padStart(2,'0')}:00`

    const { error } = await supabase.from('training_slots').insert({
      training_day_id: day.id,
      academy_id: tenant.id,
      coach_id: coach.id,
      start_time: `${newHour}:00`,
      end_time: `${endHour}:00`,
      capacity: newCap,
      observation: newObs || null,
      location: 'Quadra Principal',
    })

    if (error) {
      toast.error(error.code === '23505' ? 'Já existe um horário nesse período' : 'Erro ao criar horário')
    } else {
      toast.success(`Horário ${newHour} criado!`)
      setShowAddSlot(false)
      setNewObs('')
      load()
    }
    setIsSaving(false)
  }

  const toggleSlot = async (slot: Slot) => {
    const newStatus = slot.status === 'open' ? 'closed' : 'open'
    await supabase.from('training_slots').update({ status: newStatus }).eq('id', slot.id)
    load()
    toast.success(newStatus === 'open' ? 'Horário aberto' : 'Horário fechado')
  }

  const deleteSlot = async (slotId: string) => {
    if (!confirm('Remover este horário?')) return
    await supabase.from('training_slots').delete().eq('id', slotId)
    load()
    toast.success('Horário removido')
  }

  const isDayOpen = day?.is_open === true

  return (
    <div className="p-4 lg:p-7 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-black text-white">Agenda</h1>
        <p className="text-sm text-graphite-500">Gerencie dias e horários</p>
      </div>

      {/* Mês */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-white capitalize">
          {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
        </p>
        <button
          onClick={() => setSelectedDate(startOfToday())}
          className="text-xs font-bold px-2 py-1 rounded-lg"
          style={{ color: 'var(--brand-primary,#D4A017)' }}
        >
          HOJE
        </button>
      </div>

      {/* Calendário horizontal */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-5">
        {dates.map(date => {
          const ds = format(date, 'yyyy-MM-dd')
          const isSelected = ds === dateStr
          return (
            <button
              key={ds}
              onClick={() => setSelectedDate(date)}
              className="flex-shrink-0 flex flex-col items-center gap-1 w-14 py-2.5 rounded-xl border transition-all no-tap-highlight"
              style={isSelected ? {
                background: 'var(--brand-primary,#D4A017)',
                borderColor: 'transparent',
              } : {
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <span className={cn('text-[10px] font-bold uppercase', isSelected ? 'text-black/70' : 'text-graphite-500')}>
                {format(date, 'EEE', { locale: ptBR }).slice(0,3)}
              </span>
              <span className={cn('text-lg font-black', isSelected ? 'text-black' : 'text-white')}>
                {format(date, 'd')}
              </span>
            </button>
          )
        })}
      </div>

      {/* Controle do dia */}
      <SolidCard className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white capitalize">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
            <p className="text-xs text-graphite-500 mt-0.5">
              {isDayOpen
                ? `Aberto · ${slots.length} horário(s)`
                : 'Fechado para reservas'}
            </p>
          </div>
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin text-graphite-500" />
          ) : isDayOpen ? (
            <button
              onClick={closeDay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/25"
            >
              <Lock className="w-3.5 h-3.5" /> Fechar Dia
            </button>
          ) : (
            <button
              onClick={openDay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black"
              style={{ background: 'var(--brand-primary,#D4A017)' }}
            >
              <Unlock className="w-3.5 h-3.5" /> Abrir Dia
            </button>
          )}
        </div>
      </SolidCard>

      {/* Observação do dia */}
      {day && (
        <div className="mb-4">
          {!showObsForm ? (
            <button
              onClick={() => setShowObsForm(true)}
              className="w-full text-left px-4 py-2.5 rounded-xl border border-dashed border-white/10 text-xs text-graphite-500 hover:border-white/20 hover:text-graphite-300 transition-colors"
            >
              {day.observation ? `📢 ${day.observation}` : '+ Adicionar observação do dia'}
            </button>
          ) : (
            <div className="rounded-xl border border-white/10 p-4 space-y-3" style={{ background: '#1a1a1a' }}>
              <input
                value={themeValue}
                onChange={e => setThemeValue(e.target.value)}
                placeholder="Tema (ex: Saque e Recepção)"
                className="input-premium text-sm"
              />
              <textarea
                value={obsValue}
                onChange={e => setObsValue(e.target.value)}
                placeholder="Observação para os alunos"
                rows={2}
                className="input-premium text-sm resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowObsForm(false)} className="flex-1 py-2 rounded-lg text-sm text-graphite-400 bg-white/5">Cancelar</button>
                <button onClick={saveObs} className="flex-1 py-2 rounded-lg text-sm font-bold text-black" style={{ background: 'var(--brand-primary,#D4A017)' }}>
                  <Save className="w-4 h-4 inline mr-1" />Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Horários */}
      {day && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-graphite-500">
              Horários ({slots.length})
            </p>
            {isDayOpen && (
              <button
                onClick={() => setShowAddSlot(true)}
                className="flex items-center gap-1 text-xs font-bold"
                style={{ color: 'var(--brand-primary,#D4A017)' }}
              >
                <Plus className="w-3.5 h-3.5" /> Novo Horário
              </button>
            )}
          </div>

          {/* Form novo slot */}
          <AnimatePresence>
            {showAddSlot && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="rounded-xl border p-4 space-y-3" style={{ background: 'rgba(212,160,23,0.08)', borderColor: 'rgba(212,160,23,0.3)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">Novo Horário</p>
                    <button onClick={() => setShowAddSlot(false)} className="text-graphite-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-graphite-500 mb-1 block">Hora início</label>
                      <select value={newHour} onChange={e => setNewHour(e.target.value)} className="input-premium text-sm">
                        {HOURS.slice(0,-1).map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-graphite-500 mb-1 block">Capacidade</label>
                      <input
                        type="number" min={1} max={50}
                        value={newCap}
                        onChange={e => setNewCap(Number(e.target.value))}
                        className="input-premium text-sm"
                      />
                    </div>
                  </div>
                  <textarea
                    value={newObs}
                    onChange={e => setNewObs(e.target.value)}
                    placeholder="Observação (opcional)"
                    rows={1}
                    className="input-premium text-sm resize-none w-full"
                  />
                  <button
                    onClick={createSlot}
                    disabled={isSaving}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-black flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: 'var(--brand-primary,#D4A017)' }}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Criar Horário
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lista de slots */}
          {isLoading ? (
            <div className="text-center py-8 text-graphite-500 text-sm">Carregando...</div>
          ) : slots.length === 0 ? (
            <SolidCard className="p-5 text-center">
              <p className="text-sm text-graphite-500">Nenhum horário criado</p>
              {isDayOpen && (
                <button
                  onClick={() => setShowAddSlot(true)}
                  className="mt-2 text-xs font-bold"
                  style={{ color: 'var(--brand-primary,#D4A017)' }}
                >
                  + Criar primeiro horário
                </button>
              )}
            </SolidCard>
          ) : (
            <div className="space-y-3">
              {slots.map((slot, i) => {
                const pct = Math.round((slot.booked_count / slot.capacity) * 100)
                const isFull = slot.booked_count >= slot.capacity
                const isClosed = slot.status !== 'open'
                return (
                  <motion.div key={slot.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <SolidCard className={cn('overflow-hidden', isClosed && 'opacity-60')}>
                      <div className="flex items-stretch">
                        <div className="w-1 flex-shrink-0" style={{ background: isClosed ? '#484848' : isFull ? '#EF4444' : 'var(--brand-primary,#D4A017)' }} />
                        <div className="flex-1 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-graphite-500" />
                              <span className="text-base font-black text-white">{formatTime(slot.start_time)}</span>
                              <span className="text-graphite-600">–</span>
                              <span className="text-sm text-graphite-400">{formatTime(slot.end_time)}</span>
                            </div>
                            <SpotsBadge available={slot.capacity - slot.booked_count} capacity={slot.capacity} />
                          </div>
                          <div className="h-1 rounded-full bg-graphite-700/60 overflow-hidden mb-3">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: isFull ? '#EF4444' : 'var(--brand-primary,#D4A017)' }} />
                          </div>
                          {slot.observation && <p className="text-xs text-graphite-500 italic mb-2">"{slot.observation}"</p>}
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleSlot(slot)}
                              className={cn(
                                'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors',
                                isClosed
                                  ? 'bg-green-500/15 text-green-400 border-green-500/25'
                                  : 'bg-graphite-700/50 text-graphite-400 border-white/10'
                              )}
                            >
                              {isClosed ? <><Unlock className="w-3 h-3" /> Abrir</> : <><Lock className="w-3 h-3" /> Fechar</>}
                            </button>
                            <button
                              onClick={() => deleteSlot(slot.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20"
                            >
                              <Trash2 className="w-3 h-3" /> Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    </SolidCard>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!day && !isLoading && (
        <SolidCard className="p-5 text-center">
          <p className="text-sm text-graphite-500 mb-3">Nenhuma configuração para este dia</p>
          <button
            onClick={openDay}
            className="px-4 py-2 rounded-xl text-sm font-bold text-black"
            style={{ background: 'var(--brand-primary,#D4A017)' }}
          >
            Abrir este dia
          </button>
        </SolidCard>
      )}
    </div>
  )
}
