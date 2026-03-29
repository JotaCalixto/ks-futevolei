'use client'
// src/app/(coach)/configuracoes/branding/page.tsx
// Tela de personalização da academia — acessível apenas pelo professor (coach)

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, Palette, Check, Save, Eye, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { useTenant, useBranding } from '@/components/providers/TenantProvider'
import { injectCssVarsIntoDocument, generateCssVars, THEME_PRESETS } from '@/lib/tenant/brandingUtils'
import { generateBrandingFromColor } from '@/lib/tenant/brandingUtils'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateTenantCache } from '@/lib/tenant/resolveTenant'
import { cn } from '@/lib/utils'

// ============================================================
// PAGE
// ============================================================
export default function BrandingPage() {
  const { tenant } = useTenant()
  const branding = useBranding()
  const supabase = getSupabaseBrowserClient()

  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor)
  const [academyName, setAcademyName] = useState(branding.academyName)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(branding.logoUrl)
  const [customFont, setCustomFont] = useState<string>(branding.customFont ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Aplica preview em tempo real
  const applyPreview = useCallback((color: string, name: string) => {
    const previewBranding = generateBrandingFromColor(color, {
      academyName: name,
      logoUrl: logoPreview,
      faviconUrl: null,
      splashLogoUrl: logoPreview,
      customFont: customFont || null,
    })
    const vars = generateCssVars(previewBranding)
    injectCssVarsIntoDocument(vars)
  }, [logoPreview, customFont])

  const handleColorChange = (color: string) => {
    setPrimaryColor(color)
    setHasChanges(true)
    applyPreview(color, academyName)
  }

  const handleNameChange = (name: string) => {
    setAcademyName(name)
    setHasChanges(true)
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida (PNG, JPG, SVG)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo: 2MB')
      return
    }

    setLogoFile(file)
    setHasChanges(true)
    const reader = new FileReader()
    reader.onload = (e) => setLogoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!hasChanges) return
    setIsSaving(true)

    try {
      let logoUrl = branding.logoUrl

      // Upload da logo se tiver nova
      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const path = `academies/${tenant.id}/logo.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(path, logoFile, { upsert: true, contentType: logoFile.type })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('assets')
          .getPublicUrl(path)

        logoUrl = urlData.publicUrl
      }

      // Salva no banco
      const { error: updateError } = await supabase
        .from('academies')
        .update({
          name: academyName,
          primary_color: primaryColor,
          logo_url: logoUrl,
          custom_font: customFont || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tenant.id)

      if (updateError) throw updateError

      // Invalida cache do tenant
      invalidateTenantCache(tenant.slug)

      toast.success('Branding atualizado com sucesso!', {
        description: 'As mudanças serão visíveis para todos os alunos.',
      })

      setHasChanges(false)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="page-container max-w-2xl mx-auto py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Identidade Visual</h1>
          <p className="text-graphite-400 text-sm mt-1">
            Personalize o branding da sua academia
          </p>
        </div>
        {hasChanges && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary gap-2 text-sm"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Salvando...' : 'Salvar Mudanças'}
          </motion.button>
        )}
      </div>

      {/* Preview da academia */}
      <motion.div
        className="gold-card rounded-xl p-6 space-y-4"
        animate={{ borderColor: `${primaryColor}60` }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
          Pré-visualização
        </p>
        <div className="flex items-center gap-4">
          {/* Logo preview */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden border-2"
            style={{ borderColor: `${primaryColor}50` }}
          >
            {logoPreview ? (
              <Image src={logoPreview} alt="Logo" width={64} height={64} className="object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xl font-black"
                style={{ color: primaryColor }}
              >
                {academyName.charAt(0)}
              </div>
            )}
          </div>
          {/* Nome e cor */}
          <div>
            <h2 className="text-lg font-bold text-white">{academyName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-sm text-white/50">{primaryColor}</span>
            </div>
          </div>
        </div>
        {/* Botão de exemplo com a cor do tenant */}
        <div>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold text-graphite-900"
            style={{ backgroundColor: primaryColor }}
          >
            Agendar Treino
          </button>
        </div>
      </motion.div>

      {/* Nome da Academia */}
      <div className="solid-card rounded-xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          Nome da Academia
        </h3>
        <input
          type="text"
          value={academyName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Nome da sua escolinha"
          className="input-premium"
          maxLength={80}
        />
        <p className="text-xs text-white/30">
          Aparece no app, notificações e splash screen
        </p>
      </div>

      {/* Logo */}
      <div className="solid-card rounded-xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-white">Logo</h3>
        <div className="flex items-start gap-4">
          {/* Área de upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2',
              'border-white/20 hover:border-white/40 transition-colors',
              'text-white/40 hover:text-white/70'
            )}
          >
            <Upload className="w-6 h-6" />
            <span className="text-2xs font-medium">Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleLogoSelect}
            className="hidden"
          />

          {/* Preview atual */}
          {logoPreview && (
            <div className="relative">
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10">
                <Image src={logoPreview} alt="Logo atual" width={96} height={96} className="object-cover" />
              </div>
              <button
                onClick={() => { setLogoPreview(null); setLogoFile(null); setHasChanges(true) }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-white/30">
          PNG, JPG ou SVG. Recomendado: 512×512px, fundo transparente. Máx: 2MB
        </p>
      </div>

      {/* Cor Primária */}
      <div className="solid-card rounded-xl p-6 space-y-5">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-white/40" />
          Cor Primária
        </h3>

        {/* Presets */}
        <div className="grid grid-cols-4 gap-3">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleColorChange(preset.primaryColor)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                'border',
                primaryColor === preset.primaryColor
                  ? 'border-white/40 bg-white/5'
                  : 'border-white/10 hover:border-white/20'
              )}
            >
              <div
                className="w-8 h-8 rounded-full relative"
                style={{ backgroundColor: preset.primaryColor }}
              >
                {primaryColor === preset.primaryColor && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>
              <span className="text-2xs text-white/50 text-center leading-tight">
                {preset.name}
              </span>
            </button>
          ))}
        </div>

        {/* Custom color picker */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/50">Cor customizada:</label>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-white/20 bg-transparent"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => {
                const val = e.target.value
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  handleColorChange(val)
                }
              }}
              placeholder="#D4A017"
              className="input-premium flex-1 font-mono text-sm"
              maxLength={7}
            />
          </div>
        </div>
      </div>

      {/* Fonte customizada (apenas planos pro+) */}
      {(tenant.plan.id === 'pro' || tenant.plan.id === 'enterprise') && (
        <div className="solid-card rounded-xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-white">
            Fonte Customizada
            <span className="ml-2 text-xs badge-gold px-2 py-0.5 rounded-full">PRO</span>
          </h3>
          <input
            type="text"
            value={customFont}
            onChange={(e) => { setCustomFont(e.target.value); setHasChanges(true) }}
            placeholder="Ex: Montserrat, Oswald, Bebas Neue"
            className="input-premium font-mono text-sm"
          />
          <p className="text-xs text-white/30">
            Nome de uma fonte do Google Fonts. Será aplicada nos títulos do app.
          </p>
        </div>
      )}

      {/* Ação final */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 pb-8"
        >
          <button
            onClick={() => {
              // Restaura as cores originais
              const origVars = generateCssVars(branding)
              injectCssVarsIntoDocument(origVars)
              setPrimaryColor(branding.primaryColor)
              setAcademyName(branding.academyName)
              setLogoPreview(branding.logoUrl)
              setHasChanges(false)
            }}
            className="btn-ghost flex-1"
          >
            Descartar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex-1"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Salvando...' : 'Salvar Mudanças'}
          </button>
        </motion.div>
      )}
    </div>
  )
}
