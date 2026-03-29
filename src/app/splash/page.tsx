'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login')
    }, 2500)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#0D0D0D' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center gap-6"
      >
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-black"
          style={{
            background: 'linear-gradient(135deg, #D4A017, #FBBF24)',
            color: '#0D0D0D',
            boxShadow: '0 0 60px rgba(212,160,23,0.4)',
          }}
        >
          K
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">
            K.S Futevôlei
          </h1>
          <p style={{ color: '#D4A017' }} className="text-sm font-semibold mt-1">
            Floripa · SC
          </p>
        </div>
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full"
              style={{ background: '#D4A017' }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}