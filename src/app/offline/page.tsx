'use client'
import { WifiOff, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-graphite-900 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-sm">
        <div className="w-20 h-20 mx-auto rounded-full bg-graphite-800 border border-white/10 flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-graphite-400" />
        </div>
        <div>
          <p className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-2">K.S Futevôlei</p>
          <h1 className="text-2xl font-bold text-white">Sem conexão</h1>
          <p className="text-graphite-400 mt-2 text-sm">Verifique sua conexão e tente novamente.</p>
        </div>
        <button onClick={() => window.location.reload()} className="btn-primary w-full">
          <RefreshCw className="w-4 h-4" /> Tentar novamente
        </button>
      </motion.div>
    </div>
  )
}
