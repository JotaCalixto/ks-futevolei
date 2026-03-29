'use client'
// src/app/(coach)/mensagens/page.tsx
// Inbox do professor — lista de conversas + thread selecionada

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, MessageSquare, ArrowLeft } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/Providers'
import { useTenant } from '@/components/providers/TenantProvider'
import { ChatBubble } from '@/components/shared/SharedComponents'
import { Skeleton } from '@/components/shared/SharedComponents'
import { getInitials, getAvatarColor, formatRelativeDate, cn } from '@/lib/utils'
import type { Message } from '@/types/domain'

interface Conversation {
  studentId: string         // profile_id do aluno
  studentName: string
  studentPhone: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export default function MensagensCoachPage() {
  const { profile } = useAuth()
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingThread, setIsLoadingThread] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Carrega lista de conversas
  const loadConversations = useCallback(async () => {
    if (!profile?.id) return
    setIsLoading(true)

    const { data: msgs } = await supabase
      .from('messages')
      .select(`
        id, sender_id, receiver_id, content, is_read, created_at,
        sender:profiles!messages_sender_id_fkey(id, full_name, phone),
        receiver:profiles!messages_receiver_id_fkey(id, full_name, phone)
      `)
      .eq('academy_id', tenant.id)
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .order('created_at', { ascending: false })

    // Agrupa por aluno (não-coach)
    const convMap = new Map<string, Conversation>()
    for (const msg of msgs ?? []) {
      const m = msg as Record<string, unknown>
      const sender = m.sender as Record<string, string>
      const receiver = m.receiver as Record<string, string>
      const isFromCoach = m.sender_id === profile.id
      const studentProfile = isFromCoach ? receiver : sender
      const studentId = studentProfile?.id

      if (!studentId || studentId === profile.id) continue

      if (!convMap.has(studentId)) {
        convMap.set(studentId, {
          studentId,
          studentName: studentProfile?.full_name ?? '—',
          studentPhone: studentProfile?.phone ?? '',
          lastMessage: m.content as string,
          lastMessageAt: m.created_at as string,
          unreadCount: (!isFromCoach && !m.is_read) ? 1 : 0,
        })
      } else if (!isFromCoach && !m.is_read) {
        const existing = convMap.get(studentId)!
        existing.unreadCount++
      }
    }

    setConversations(Array.from(convMap.values()))
    setIsLoading(false)
  }, [profile?.id, tenant.id, supabase])

  useEffect(() => { loadConversations() }, [loadConversations])

  // Carrega thread selecionada
  const loadThread = useCallback(async (studentId: string) => {
    if (!profile?.id) return
    setIsLoadingThread(true)

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('academy_id', tenant.id)
      .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${studentId}),and(sender_id.eq.${studentId},receiver_id.eq.${profile.id})`)
      .order('created_at', { ascending: true })
      .limit(100)

    setMessages((data ?? []) as unknown as Message[])

    // Marca como lidas
    await supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() })
      .eq('receiver_id', profile.id)
      .eq('sender_id', studentId)
      .eq('is_read', false)

    setIsLoadingThread(false)

    // Atualiza contador local
    setConversations(prev => prev.map(c =>
      c.studentId === studentId ? { ...c, unreadCount: 0 } : c
    ))
  }, [profile?.id, tenant.id, supabase])

  // Realtime
  useEffect(() => {
    if (!profile?.id) return
    const ch = supabase
      .channel(`${tenant.id}:coach-chat`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `academy_id=eq.${tenant.id}`,
      }, (payload) => {
        const msg = payload.new as Message
        if (msg.senderId === profile.id || msg.receiverId === profile.id) {
          if (msg.receiverId === profile.id || msg.senderId === profile.id) {
            const studentId = msg.senderId === profile.id ? msg.receiverId : msg.senderId
            if (studentId === selectedId) {
              setMessages(prev => [...prev, msg])
              supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', msg.id)
            } else {
              setConversations(prev => prev.map(c =>
                c.studentId === studentId
                  ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt, unreadCount: c.unreadCount + 1 }
                  : c
              ))
            }
          }
        }
      })
      .subscribe()
    channelRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [profile?.id, tenant.id, supabase, selectedId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const selectConversation = (studentId: string) => {
    setSelectedId(studentId)
    loadThread(studentId)
  }

  const sendMessage = useCallback(async () => {
    const content = input.trim()
    if (!content || isSending || !profile?.id || !selectedId) return
    setIsSending(true)
    setInput('')

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      academyId: tenant.id,
      senderId: profile.id,
      receiverId: selectedId,
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
      receiver_id: selectedId,
      content,
      type: 'text',
    })

    if (error) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setInput(content)
    }
    setIsSending(false)
  }, [input, isSending, profile?.id, selectedId, tenant.id, supabase])

  const selectedConv = conversations.find(c => c.studentId === selectedId)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen overflow-hidden">

      {/* ── Sidebar: Lista de conversas ────────────────────── */}
      <div className={cn(
        'flex-shrink-0 flex flex-col border-r border-white/[0.06]',
        'w-full lg:w-72',
        selectedId && isMobile ? 'hidden' : 'flex',
      )}>
        <div className="p-4 border-b border-white/[0.06]">
          <h2 className="text-base font-bold text-white">Mensagens</h2>
          <p className="text-xs text-graphite-500 mt-0.5">
            {conversations.reduce((a, c) => a + c.unreadCount, 0)} não lidas
          </p>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageSquare className="w-10 h-10 text-graphite-700 mb-3" />
              <p className="text-sm text-graphite-500">Nenhuma conversa ainda</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.studentId}
                onClick={() => selectConversation(conv.studentId)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-white/[0.04]',
                  selectedId === conv.studentId
                    ? 'bg-white/[0.05]'
                    : 'hover:bg-white/[0.03]',
                )}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg,${getAvatarColor(conv.studentName)},${getAvatarColor(conv.studentName)}99)` }}
                  >
                    {getInitials(conv.studentName)}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[var(--brand-primary,#D4A017)] text-graphite-900 text-[10px] font-black flex items-center justify-center px-1">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn('text-sm truncate', conv.unreadCount > 0 ? 'font-bold text-white' : 'font-semibold text-graphite-300')}>
                      {conv.studentName}
                    </p>
                    <span className="text-[10px] text-graphite-600 flex-shrink-0 ml-2">
                      {formatRelativeDate(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs text-graphite-500 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Thread ─────────────────────────────────────────── */}
      <div className={cn(
        'flex-1 flex flex-col',
        !selectedId && isMobile ? 'hidden' : 'flex',
      )}>
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-graphite-700 mx-auto mb-3" />
              <p className="text-sm text-graphite-500">Selecione uma conversa</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <button
                onClick={() => setSelectedId(null)}
                className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-graphite-400"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {selectedConv && (
                <>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg,${getAvatarColor(selectedConv.studentName)},${getAvatarColor(selectedConv.studentName)}99)` }}
                  >
                    {getInitials(selectedConv.studentName)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{selectedConv.studentName}</p>
                    <p className="text-xs text-graphite-500">{selectedConv.studentPhone}</p>
                  </div>
                </>
              )}
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4">
              {isLoadingThread ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-graphite-600" /></div>
              ) : (
                messages.map((msg, i) => {
                  const prev = messages[i-1]
                  const showDate = !prev || new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString()
                  const showAvatar = !prev || prev.senderId !== msg.senderId
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-[11px] text-graphite-600 bg-graphite-800/60 rounded-full px-3 py-1 font-medium">
                            {new Date(msg.createdAt).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      )}
                      <ChatBubble
                        message={{ id: msg.id, content: msg.content, createdAt: msg.createdAt, senderId: msg.senderId, type: msg.type }}
                        isOwn={msg.senderId === profile?.id}
                        showAvatar={showAvatar && msg.senderId !== profile?.id}
                        senderName={selectedConv?.studentName}
                        senderInitials={selectedConv ? getInitials(selectedConv.studentName) : '?'}
                      />
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 pt-3 pb-5 border-t border-white/[0.06]">
              <div className="flex items-end gap-2">
                <div className="flex-1 rounded-2xl border border-white/10 bg-graphite-800/80 focus-within:border-[var(--brand-primary-border,rgba(212,160,23,0.4))] transition-colors">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder="Responder..."
                    rows={1}
                    className="w-full resize-none bg-transparent px-4 py-3 text-sm text-white placeholder:text-graphite-600 outline-none max-h-32 scrollbar-hide"
                    onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 128)}px` }}
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || isSending}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                  style={{ background: 'var(--brand-primary,#D4A017)' }}
                >
                  {isSending ? <Loader2 className="w-4 h-4 text-graphite-900 animate-spin" /> : <Send className="w-4 h-4 text-graphite-900" />}
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
