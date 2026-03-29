'use client'
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { Toaster } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { initOneSignal } from '@/lib/onesignal'
import type { AuthUser, Profile, Student, Coach, Academy } from '@/types/domain'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  student: Student | null
  coach: Coach | null
  academy: Academy | null
  authUser: AuthUser | null
  session: Session | null
  isLoading: boolean
  isStudent: boolean
  isCoach: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null, profile: null, student: null, coach: null, academy: null,
  authUser: null, session: null, isLoading: true,
  isStudent: false, isCoach: false,
  signOut: async () => {}, refreshProfile: async () => {},
})

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}

interface NotificationContextType {
  unreadCount: number
  incrementUnread: () => void
  clearUnread: () => void
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0, incrementUnread: () => {}, clearUnread: () => {},
})

export function useNotificationContext() { return useContext(NotificationContext) }

interface RealtimeContextType { isConnected: boolean }
const RealtimeContext = createContext<RealtimeContextType>({ isConnected: false })
export function useRealtimeContext() { return useContext(RealtimeContext) }

function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [coach, setCoach] = useState<Coach | null>(null)
  const [academy, setAcademy] = useState<Academy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isFetching = useRef(false)

  const fetchUserData = useCallback(async (userId: string) => {
    if (isFetching.current) return
    isFetching.current = true
    try {
      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', userId).maybeSingle()
      if (!profileData) return
      setProfile(profileData as unknown as Profile)
      if (profileData.academy_id) {
        const { data: academyData } = await supabase
          .from('academies').select('*').eq('id', profileData.academy_id).maybeSingle()
        if (academyData) setAcademy(academyData as unknown as Academy)
      }
      if (profileData.role === 'student') {
        const { data: studentData } = await supabase
          .from('students').select('*, coach:coaches(*)').eq('profile_id', userId).maybeSingle()
        if (studentData) setStudent(studentData as unknown as Student)
      } else if (profileData.role === 'coach') {
        const { data: coachData } = await supabase
          .from('coaches').select('*').eq('profile_id', userId).maybeSingle()
        if (coachData) setCoach(coachData as unknown as Coach)
      }
      initOneSignal(userId).catch(() => {})
    } catch (error) {
      console.error('Erro em fetchUserData:', error)
    } finally {
      setIsLoading(false)
      isFetching.current = false
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      isFetching.current = false
      await fetchUserData(user.id)
    }
  }, [user?.id, fetchUserData])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null); setSession(null); setProfile(null)
    setStudent(null); setCoach(null); setAcademy(null)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          isFetching.current = false
          await fetchUserData(session.user.id)
        } else {
          setProfile(null); setStudent(null); setCoach(null); setAcademy(null)
          setIsLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [supabase, fetchUserData])

  const authUser: AuthUser | null = user && profile && academy
    ? { id: user.id, profile, student: student ?? undefined, coach: coach ?? undefined, academy }
    : null

  return (
    <AuthContext.Provider value={{
      user, profile, student, coach, academy, authUser, session, isLoading,
      isStudent: profile?.role === 'student',
      isCoach: profile?.role === 'coach' || profile?.role === 'super_admin',
      signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const incrementUnread = useCallback(() => setUnreadCount(prev => prev + 1), [])
  const clearUnread = useCallback(() => setUnreadCount(0), [])
  return (
    <NotificationContext.Provider value={{ unreadCount, incrementUnread, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  )
}

function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient()
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  useEffect(() => {
    channelRef.current = supabase.channel('app-health')
      .subscribe((status) => setIsConnected(status === 'SUBSCRIBED'))
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [supabase])
  return (
    <RealtimeContext.Provider value={{ isConnected }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RealtimeProvider>
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
          <Toaster
            position="top-right" richColors closeButton duration={4000}
            toastOptions={{
              style: {
                background: '#181818',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-geist-sans)',
                borderRadius: '12px',
              },
            }}
          />
        </RealtimeProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}
