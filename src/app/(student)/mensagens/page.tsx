'use client'
// src/app/(student)/mensagens/page.tsx

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, MessageCircle, Phone } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/Providers'
import { useTenant, useBranding } from '@/components/providers/TenantProvider'
import { AppShell } from '@/components/layout/AppShell'
import { ChatBubble } from '@/components/shared/SharedComponents'
import { EmptyState } from '@/components/shared/SharedComponents'
import { getInitials, getAvatarColor, cn } from '@/lib/utils'
import type { Message, Profile } from '@/types/domain'

export default function MensagensPage() {
  const { profile, student } = useAuth()
  const { tenant } = useTenant()
  const branding = useBranding()
  const supabase = getSupabaseBrowserClient()

  const [messages, setMessages] = useState<Message[]>([])
  const [coachProfile, setCoachProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Carrega coach e mensagens
  useEffect(() => {
    if (!profile?.id) return

    const init = async () => {
      setIsLoading(true)

      // Busca profile do coach da academia
      const { data: coachData } = await supabase
        .from('coaches')
        .select('profile:profiles(*)')
        .eq('academy_id', tenant.id)
        .limit(1)
        .single()

      if (coachData?.profile) {
        setCoachProfile(coachData.profile as unknown as Profile)
      }

      const coachProfileId = (coachData?.profile as Record<string, string>)?.id
      if (!coachProfileId) { setIsLoading(false); return }

      // Carrega histórico de mensagens
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('academy_id', tenant.id)
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${coachProfileId}),and(sender_id.eq.${coachProfileId},receiver_id.eq.${profile.id})`)
        .order('created_at', { ascending: true })
        .limit(100)

      setMessages((msgs ?? []) as unknown as Message[])

      // Marca mensagens do coach como lidas
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('receiver_id', profile.id)
        .eq('sender_id', coachProfileId)
        .eq('is_read', false)

      setIsLoading(false)

      // Subscreve realtime
      const ch = supabase
        .channel(`${tenant.id}:chat:${profile.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `academy_id=eq.${tenant.id}`,
          },
          (payload) => {
            const msg = payload.new as Message
            if (
              (msg.senderId === profile.id && msg.receiverId === coachProfileId) ||
              (msg.senderId === coachProfileId && msg.receiverId === profile.id)
            ) {
              setMessages(prev => [...prev, msg])
              // Marca como lida se for do coach
              if (msg.receiverId === profile.id) {
                supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() })
                  .eq('id', msg.id)
              }
            }
          }
        )
        .subscribe()

      channelRef.current = ch
    }

    init()

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [profile?.id, tenant.id, supabase])

  // Scroll para o final quando chegam novas mensagens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async () => {
    const content = input.trim()
    if (!content || isSending || !profile?.id || !coachProfile?.id) return

    setIsSending(true)
    setInput('')

    // Mensagem otimista
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      academyId: tenant.id,
      senderId: profile.id,
      receiverId: coachProfile.id,
      content,
      type: 'text',
      relatedSlotId: null,
      isRead: false,
      readAt: null,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    const { error } = await supabase.from('messages').insert({
      academy_id: tenant.id,
      sender_id: profile.id,
      receiver_id: coachProfile.id,
      content,
      type: 'text',
    })

    if (error) {
      // Remove mensagem otimista em caso de erro
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setInput(content)
    }

    setIsSending(false)
    inputRef.current?.focus()
  }, [input, isSending, profile?.id, coachProfile?.id, tenant.id, supabase])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const coachName = coachProfile?.fullName ?? branding.academyName
  const coachInitials = coachProfile ? getInitials(coachProfile.fullName) : 'P'
  const coachColor = getAvatarColor(coachName)

  return (
    <AppShell hideNav={false} scrollable={false} contentClassName="flex flex-col">

      {/* Header do chat */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] sticky top-0 z-10"
        style={{
          background: 'rgba(13,13,13,0.95)',
          backdropFilter: 'blur(12px)',
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top,0px))',
        }}
      >
        {/* Avatar do coach */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${coachColor}, ${coachColor}99)` }}
        >
          {coachInitials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{coachName}</p>
          <p className="text-[11px] font-medium" style={{ color: 'var(--brand-primary,#D4A017)' }}>
            {branding.academyShortName} · Treinador
          </p>
        </div>

        {/* Telefone (link direto para WhatsApp) */}
        {coachProfile?.phone && (
          <a
            href={`https://wa.me/55${coachProfile.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center text-green-400"
          >
            <Phone className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-0.5">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-graphite-600" />
          </div>
        ) : !coachProfile ? (
          <EmptyState
            icon={<MessageCircle className="w-7 h-7" />}
            title="Professor não encontrado"
            description="Entre em contato com sua academia."
          />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--brand-gradient-subtle)' }}
            >
              <MessageCircle className="w-7 h-7" style={{ color: 'var(--brand-primary,#D4A017)' }} />
            </div>
            <p className="text-sm font-bold text-white mb-1">Comece uma conversa</p>
            <p className="text-xs text-graphite-500 max-w-xs leading-relaxed">
              Tire dúvidas, avise sobre faltas ou comente sobre os treinos.
            </p>
          </div>
        ) : (
          <>
            {/* Agrupar mensagens por data */}
            {messages.map((msg, i) => {
              const prevMsg = messages[i - 1]
              const showDateSeparator = !prevMsg ||
                new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString()

              const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId

              return (
                <div key={msg.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-4">
                      <span className="text-[11px] text-graphite-600 bg-graphite-800/60 rounded-full px-3 py-1 font-medium">
                        {new Date(msg.createdAt).toLocaleDateString('pt-BR', {
                          weekday: 'long', day: '2-digit', month: 'short',
                        })}
                      </span>
                    </div>
                  )}
                  <ChatBubble
                    message={{
                      id: msg.id,
                      content: msg.content,
                      createdAt: msg.createdAt,
                      senderId: msg.senderId,
                      type: msg.type,
                    }}
                    isOwn={msg.senderId === profile?.id}
                    showAvatar={showAvatar && msg.senderId !== profile?.id}
                    senderName={msg.senderId !== profile?.id ? coachName : undefined}
                    senderInitials={coachInitials}
                  />
                </div>
              )
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div
        className="px-4 pt-3 border-t border-white/[0.06]"
        style={{
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom,0px))',
          background: 'rgba(13,13,13,0.98)',
        }}
      >
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-2xl border border-white/[0.10] bg-graphite-800/80 focus-within:border-[var(--brand-primary-border,rgba(212,160,23,0.4))] transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma mensagem..."
              rows={1}
              maxLength={1000}
              className={cn(
                'w-full resize-none bg-transparent px-4 py-3 text-sm text-white',
                'placeholder:text-graphite-600 outline-none',
                'max-h-32 scrollbar-hide',
              )}
              style={{
                height: 'auto',
                minHeight: '44px',
              }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = `${Math.min(el.scrollHeight, 128)}px`
              }}
            />
          </div>

          {/* Botão enviar */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
            style={{ background: 'var(--brand-primary, #D4A017)' }}
          >
            {isSending
              ? <Loader2 className="w-4 h-4 text-graphite-900 animate-spin" />
              : <Send className="w-4 h-4 text-graphite-900" />
            }
          </motion.button>
        </div>
      </div>
    </AppShell>
  )
}
