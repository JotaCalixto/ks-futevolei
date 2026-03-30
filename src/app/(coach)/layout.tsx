'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/Providers'
import { useCoachRealtime } from '@/hooks/useCoachRealtime'
import { CoachShell } from '@/components/layout/CoachShell'

function CoachLayoutInner({ children }: { children: React.ReactNode }) {
  useCoachRealtime()
  return <CoachShell>{children}</CoachShell>
}

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!profile) {
      router.replace('/login')
      return
    }
    if (profile.role === 'student') {
      router.replace('/home')
    }
  }, [profile, isLoading, router])

  if (isLoading) return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: '#D4A017', animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )

  if (!profile) return null
  return <CoachLayoutInner>{children}</CoachLayoutInner>
}
