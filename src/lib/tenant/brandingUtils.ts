// src/lib/tenant/brandingUtils.ts
// Gera paleta completa e CSS vars a partir da cor primária do tenant

import type { TenantBranding } from './types'

// ============================================================
// GERAÇÃO DE BRANDING A PARTIR DE COR HEX
// ============================================================

interface BrandingInput {
  academyName: string
  logoUrl: string | null
  faviconUrl: string | null
  splashLogoUrl: string | null
  customFont: string | null
}

export function generateBrandingFromColor(
  primaryHex: string,
  input: BrandingInput
): TenantBranding {
  const hex = sanitizeHex(primaryHex)
  const rgb = hexToRgb(hex)

  // Gera variações da cor
  const lightened = lightenHex(hex, 0.25)
  const darkened = darkenHex(hex, 0.35)

  // Calcula se o texto deve ser preto ou branco sobre a cor primária
  const luminance = getLuminance(rgb)
  const textOnPrimary = luminance > 0.35 ? '#0D0D0D' : '#FFFFFF'

  const branding: TenantBranding = {
    primaryColor: hex,
    primaryColorLight: lightened,
    primaryColorDark: darkened,
    primaryColorGlow: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.20)`,
    primaryColorBorder: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`,
    logoUrl: input.logoUrl,
    logoAltText: input.academyName,
    academyName: input.academyName,
    academyShortName: generateShortName(input.academyName),
    faviconUrl: input.faviconUrl,
    splashLogoUrl: input.splashLogoUrl ?? input.logoUrl,
    customFont: input.customFont,
    darkBg: '#0D0D0D',     // Poderia ser customizado no futuro
    cardBg: '#181818',
  }

  return branding
}

// ============================================================
// GERAÇÃO DE CSS VARS — injetadas no <html> ou via style tag
// ============================================================

export function generateCssVars(branding: TenantBranding): Record<string, string> {
  const rgb = hexToRgb(branding.primaryColor)
  const rgbLight = hexToRgb(branding.primaryColorLight)
  const rgbDark = hexToRgb(branding.primaryColorDark)

  return {
    // Cor primária da marca (substitui gold-500 do design system base)
    '--brand-primary':           branding.primaryColor,
    '--brand-primary-light':     branding.primaryColorLight,
    '--brand-primary-dark':      branding.primaryColorDark,
    '--brand-primary-glow':      branding.primaryColorGlow,
    '--brand-primary-border':    branding.primaryColorBorder,
    '--brand-primary-rgb':       `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    '--brand-primary-light-rgb': `${rgbLight.r}, ${rgbLight.g}, ${rgbLight.b}`,

    // Backgrounds (usados como fallback se o tenant customizar)
    '--tenant-bg-primary':  branding.darkBg,
    '--tenant-bg-card':     branding.cardBg,
    '--tenant-bg-tertiary': '#242424',

    // Fonte customizada (se habilitada no plano)
    '--tenant-font-display': branding.customFont
      ? `'${branding.customFont}', var(--font-geist-sans), sans-serif`
      : 'var(--font-geist-sans), sans-serif',

    // Sombra com cor da marca
    '--brand-shadow':    `0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
    '--brand-shadow-lg': `0 0 40px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.40)`,

    // Gradiente da marca (para botões, badges, hero)
    '--brand-gradient': `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColorLight} 50%, ${branding.primaryColor} 100%)`,
    '--brand-gradient-subtle': `linear-gradient(135deg, rgba(${rgb.r},${rgb.g},${rgb.b},0.15) 0%, rgba(${rgb.r},${rgb.g},${rgb.b},0.05) 100%)`,

    // Para o shimmer do skeleton
    '--brand-shimmer': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,

    // Nomes para exibição
    '--tenant-name':       branding.academyName,
    '--tenant-short-name': branding.academyShortName,
  }
}

// Gera a string style injetável no atributo style do <html>
export function cssVarsToStyleString(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

// Injeta vars como atributos no elemento html (client-side)
export function injectCssVarsIntoDocument(vars: Record<string, string>): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

// ============================================================
// COLOR UTILITIES
// ============================================================

function sanitizeHex(hex: string): string {
  const cleaned = hex.replace('#', '').trim()
  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return 'D4A017' // Fallback para dourado
  return `#${cleaned}`
}

interface RGB { r: number; g: number; b: number }

export function hexToRgb(hex: string): RGB {
  const cleaned = hex.replace('#', '')
  return {
    r: parseInt(cleaned.substring(0, 2), 16),
    g: parseInt(cleaned.substring(2, 4), 16),
    b: parseInt(cleaned.substring(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Luminância relativa (para calcular contraste WCAG)
function getLuminance(rgb: RGB): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b)
}

// Clareia a cor (para variante light)
function lightenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount
  )
}

// Escurece a cor (para variante dark)
function darkenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    r * (1 - amount),
    g * (1 - amount),
    b * (1 - amount)
  )
}

// Nome curto para UI compacta
function generateShortName(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return name.substring(0, 6)
  // Tenta usar sigla (K.S, etc.) se já tiver
  if (words[0].includes('.')) return words[0]
  // Usa 2 primeiras palavras
  return words.slice(0, 2).join(' ')
}

// ============================================================
// PRESET DE TEMAS — Temas prontos para seleção rápida no admin
// ============================================================
export const THEME_PRESETS: Array<{
  id: string
  name: string
  primaryColor: string
  preview: string
}> = [
  { id: 'gold',    name: 'Dourado Premium', primaryColor: '#D4A017', preview: 'bg-[#D4A017]' },
  { id: 'blue',    name: 'Azul Oceano',     primaryColor: '#0EA5E9', preview: 'bg-[#0EA5E9]' },
  { id: 'green',   name: 'Verde Esmeralda', primaryColor: '#10B981', preview: 'bg-[#10B981]' },
  { id: 'red',     name: 'Vermelho Fogo',   primaryColor: '#EF4444', preview: 'bg-[#EF4444]' },
  { id: 'purple',  name: 'Roxo Real',       primaryColor: '#8B5CF6', preview: 'bg-[#8B5CF6]' },
  { id: 'orange',  name: 'Laranja Atleta',  primaryColor: '#F97316', preview: 'bg-[#F97316]' },
  { id: 'teal',    name: 'Teal Água',       primaryColor: '#14B8A6', preview: 'bg-[#14B8A6]' },
  { id: 'rose',    name: 'Rosa Coral',      primaryColor: '#F43F5E', preview: 'bg-[#F43F5E]' },
]
