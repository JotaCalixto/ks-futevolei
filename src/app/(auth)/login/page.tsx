'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Phone, User, ArrowRight, Loader2, ChevronLeft, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useTenant } from '@/components/providers/TenantProvider'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [step, setStep] = useState<'form' | 'role'>('form')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const router = useRouter()
  const { tenant } = useTenant()
  const supabase = getSupabaseBrowserClient()

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11)
    let formatted = raw
    if (raw.length > 2) formatted = `(${raw.slice(0,2)}) ${raw.slice(2)}`
    if (raw.length > 7) formatted = `(${raw.slice(0,2)}) ${raw.slice(2,7)}-${raw.slice(7)}`
    setPhone(formatted)
  }

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error('Email ou senha incorretos.')
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      window.location.href = profile?.role === 'coach' ? '/dashboard' : '/home'
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao fazer login')
      setIsLoading(false)
    }
  }, [supabase, email, password])

  const handleRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !password || phone.replace(/\D/g,'').length < 10) return
    setStep('role')
  }

  const createUser = useCallback(async (role: 'student' | 'coach') => {
    setIsLoading(true)
    const cleanPhone = phone.replace(/\D/g, '')
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      })
      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Este email já está cadastrado. Use a opção de login.')
        }
        throw new Error(authError.message)
      }
      if (!authData.user) throw new Error('Erro ao criar conta')
      const userId = authData.user.id
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        academy_id: tenant.id,
        role,
        full_name: fullName.trim(),
        phone: cleanPhone,
      })
      if (profileError) throw new Error('Erro ao criar perfil: ' + profileError.message)
      if (role === 'student') {
        await supabase.from('students').insert({ profile_id: userId, academy_id: tenant.id })
      } else {
        await supabase.from('coaches').insert({ profile_id: userId, academy_id: tenant.id, default_capacity: 10 })
      }
      window.location.href = role === 'coach' ? '/dashboard' : '/home'
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro desconhecido')
      setIsLoading(false)
    }
  }, [supabase, fullName, email, password, phone, tenant.id])

  const handleCoachPin = () => {
    if (pin === '1234') {
      createUser('coach')
    } else {
      setPinError(true)
      setPin('')
      setTimeout(() => setPinError(false), 1500)
    }
  }

  const firstName = fullName.split(' ')[0]

  return (
    <div className="min-h-screen flex flex-col px-5 pt-16 pb-10" style={{ background: '#0D0D0D' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 35% at 50% 0%, rgba(212,160,23,0.12) 0%, transparent 60%)' }} />

      <AnimatePresence mode="wait">

        {mode === 'login' && (
          <motion.div key="login" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="relative flex flex-col flex-1 max-w-sm mx-auto w-full">
            <div className="flex flex-col items-center mb-10">
              <img src="/logo.png" alt="KS Futevólei" className="w-20 h-20 object-contain rounded-2xl mb-3" />
              <h2 className="text-lg font-black text-white">K.S Futevólei</h2>
              <p className="text-sm" style={{ color: '#D4A017' }}>Floripa · SC</p>
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Bem-vindo de volta!</h1>
            <p className="text-sm text-gray-500 mb-8">Entre com seu email e senha</p>
            <form onSubmit={handleLogin} className="space-y-4 flex-1">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com" className="input-premium pl-10" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Sua senha" className="input-premium pl-10 pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading || !email || !password}
                className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 mt-4 disabled:opacity-40"
                style={{ background: '#D4A017', color: '#0D0D0D' }}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Entrar</span> <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              Primeira vez aqui?{' '}
              <button onClick={() => { setMode('register'); setStep('form') }}
                className="font-bold" style={{ color: '#D4A017' }}>
                Criar conta
              </button>
            </p>
          </motion.div>
        )}

        {mode === 'register' && step === 'form' && (
          <motion.div key="register" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="relative flex flex-col flex-1 max-w-sm mx-auto w-full">
            <div className="flex flex-col items-center mb-8">
              <img src="/logo.png" alt="KS Futevólei" className="w-16 h-16 object-contain rounded-2xl mb-2" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Criar conta</h1>
            <p className="text-sm text-gray-500 mb-6">Preencha seus dados para começar</p>
            <form onSubmit={handleRegisterStep1} className="space-y-4 flex-1">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Seu nome completo" className="input-premium pl-10" autoCapitalize="words" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com" className="input-premium pl-10" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input type="tel" value={phone} onChange={handlePhoneChange}
                    placeholder="(48) 99999-9999" className="input-premium pl-10 font-mono" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres" className="input-premium pl-10 pr-10"
                    minLength={6} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit"
                disabled={!fullName.trim() || !email || !password || phone.replace(/\D/g,'').length < 10}
                className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 mt-2 disabled:opacity-40"
                style={{ background: '#D4A017', color: '#0D0D0D' }}>
                <span>Continuar</span> <ArrowRight className="w-5 h-5" />
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              Já tem conta?{' '}
              <button onClick={() => setMode('login')} className="font-bold" style={{ color: '#D4A017' }}>
                Fazer login
              </button>
            </p>
          </motion.div>
        )}

        {mode === 'register' && step === 'role' && (
          <motion.div key="role" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="relative flex flex-col flex-1 max-w-sm mx-auto w-full">
            <button onClick={() => setStep('form')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-8 w-fit">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <h2 className="text-xl font-black text-white mb-1">Quem é você?</h2>
            <p className="text-sm text-gray-500 mb-8">Primeira vez aqui, {firstName}!</p>
            <div className="space-y-3">
              <button onClick={() => createUser('student')} disabled={isLoading}
                className="w-full rounded-2xl border border-white/10 p-5 text-left hover:border-yellow-500/50 transition-colors disabled:opacity-40">
                <div className="font-bold text-white mb-1">Sou Aluno</div>
                <div className="text-sm text-gray-500">Quero reservar quadras e participar de treinos</div>
              </button>
              <button onClick={() => setStep('form')} disabled={isLoading}
                className="w-full rounded-2xl border border-white/10 p-5 text-left hover:border-yellow-500/50 transition-colors disabled:opacity-40">
                <div className="font-bold text-white mb-1">Sou Professor</div>
                <div className="text-sm text-gray-500">Quero gerenciar turmas e alunos</div>
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}