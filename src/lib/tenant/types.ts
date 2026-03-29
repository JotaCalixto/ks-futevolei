// src/lib/tenant/types.ts
// Tipos centrais do sistema multi-tenant

export interface TenantBranding {
  primaryColor: string        // ex: "#D4A017"
  primaryColorLight: string   // ex: "#FBBF24" (gerado automaticamente)
  primaryColorDark: string    // ex: "#92680A"
  primaryColorGlow: string    // ex: "rgba(212,160,23,0.2)"
  primaryColorBorder: string  // ex: "rgba(212,160,23,0.3)"
  logoUrl: string | null
  logoAltText: string
  academyName: string
  academyShortName: string    // Para bottom nav, badges
  faviconUrl: string | null
  splashLogoUrl: string | null
  customFont: string | null   // Nome da fonte Google (futuro)
  darkBg: string              // ex: "#0D0D0D" — pode ser customizado por tenant
  cardBg: string              // ex: "#181818"
}

export interface TenantSettings {
  defaultCapacity: number
  cancelDeadlineHours: number
  autoWaitlist: boolean
  membershipDueDay: number
  defaultMonthlyFee: number
  timezone: string
  cancelPolicy: string
  allowSelfCheckin: boolean
  customTexts: Record<string, string>
  socialLinks: Record<string, string>
  features: TenantFeatures
}

export interface TenantFeatures {
  chat: boolean
  waitlist: boolean
  attendance: boolean
  announcements: boolean
  memberships: boolean
  pushNotifications: boolean
  customDomain: boolean       // Plano pago
  multiCoach: boolean         // Plano pago
  analytics: boolean          // Plano pago
}

export interface TenantPlan {
  id: 'free' | 'starter' | 'pro' | 'enterprise'
  name: string
  maxStudents: number
  maxCoaches: number
  maxSlotsPerDay: number
}

export interface Tenant {
  id: string                  // academy_id no banco
  slug: string                // "ks-futevolei-floripa"
  customDomain: string | null // "futevolei-sc.com"
  subdomain: string | null    // "ks-floripa" → ks-floripa.suaapp.com.br
  branding: TenantBranding
  settings: TenantSettings
  plan: TenantPlan
  isActive: boolean
  coachProfileId: string      // profile_id do coach principal
}

// O que vai no contexto React — disponível em todo o app
export interface TenantContextValue {
  tenant: Tenant
  isLoading: boolean
  // CSS vars já calculadas como string injetável
  cssVars: Record<string, string>
}
