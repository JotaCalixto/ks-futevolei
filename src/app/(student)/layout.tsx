'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/Providers'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!profile) { router.replace('/login'); return }
    if (profile.role === 'coach') router.replace('/dashboard')
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

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D]">
      <div className="flex-1">
        {children}
      </div>

      {/* Powered by Jota Labs */}
      <div className="fixed bottom-24 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none z-10">
        <span className="text-[10px] text-gray-400">powered by</span>
        <img src="/jotalabs.png" alt="Jota Labs" className="w-14 h-14 opacity-100" />
      </div>
    </div>
  )
}
