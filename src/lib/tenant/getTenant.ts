// src/lib/tenant/getTenant.ts
// Helper para Server Components — lê o tenant resolvido dos headers HTTP

import { headers } from 'next/headers'
import { cache } from 'react'
import type { Tenant, TenantBranding } from './types'
import { generateBrandingFromColor } from './brandingUtils'
import { resolvePlan } from './resolveTenant'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

// ============================================================
// LEITURA DO TENANT A PARTIR DOS HEADERS
// (injetados pelo middleware)
// ============================================================

// `cache()` do React — memoiza por request, evita re-fetches
export const getTenant = cache(async (): Promise<Tenant> => {
  const headerStore = await headers()

  const tenantId   = headerStore.get('x-tenant-id')
  const tenantSlug = headerStore.get('x-tenant-slug')
  const brandingRaw = headerStore.get('x-tenant-branding')

  // Se o middleware injetou o branding compacto, usa diretamente (rápido)
  if (tenantId && tenantSlug && brandingRaw) {
    try {
      const brandingPartial = JSON.parse(brandingRaw) as Partial<TenantBranding>
      const branding = generateBrandingFromColor(
        brandingPartial.primaryColor ?? '#D4A017',
        {
          academyName: brandingPartial.academyName ?? 'Academia',
          logoUrl: brandingPartial.logoUrl ?? null,
          faviconUrl: null,
          splashLogoUrl: brandingPartial.logoUrl ?? null,
          customFont: null,
        }
      )

      // Busca settings completos do banco (ainda necessário para regras de negócio)
      const settingsData = await fetchTenantSettings(tenantId)

      return {
        id: tenantId,
        slug: tenantSlug,
        customDomain: null,
        subdomain: null,
        branding,
        settings: settingsData,
        plan: resolvePlan('free'), // Atualizado no fetch completo
        isActive: true,
        coachProfileId: '',
      }
    } catch {
      // Fallback para fetch completo se JSON quebrar
    }
  }

  // Fallback: busca completa no banco (mais lento, mas seguro)
  const slug = tenantSlug ?? process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? 'ks-futevolei-floripa'
  return await fetchFullTenant(slug)
})

// ============================================================
// ACESSO RÁPIDO AO TENANT ID
// ============================================================
export const getTenantId = cache(async (): Promise<string> => {
  const t = await getTenant()
  return t.id
})

export const getTenantSlug = cache(async (): Promise<string> => {
  const t = await getTenant()
  return t.slug
})

// ============================================================
// HELPERS INTERNOS
// ============================================================

async function fetchTenantSettings(academyId: string) {
  const supabase = getSupabaseAdminClient()
  const { data } = await supabase
    .from('settings')
    .select('*')
    .eq('academy_id', academyId)
    .single()

  return {
    defaultCapacity: data?.default_capacity ?? 10,
    cancelDeadlineHours: data?.cancel_deadline_hours ?? 2,
    autoWaitlist: data?.auto_waitlist ?? true,
    membershipDueDay: data?.membership_due_day ?? 10,
    defaultMonthlyFee: data?.default_monthly_fee ?? 0,
    timezone: data?.timezone ?? 'America/Sao_Paulo',
    cancelPolicy: '2 horas antes do treino',
    allowSelfCheckin: data?.allow_self_checkin ?? false,
    customTexts: data?.custom_texts ?? {},
    socialLinks: data?.social_links ?? {},
    features: {
      chat: true, waitlist: true, attendance: true,
      announcements: true, memberships: true, pushNotifications: true,
      customDomain: false, multiCoach: false, analytics: false,
    },
  }
}

async function fetchFullTenant(slug: string): Promise<Tenant> {
  // Importa dinâmico para evitar ciclo de dependência
  const { resolveTenant } = await import('./resolveTenant')
  const { tenant } = await resolveTenant('', '', slug)
  if (!tenant) throw new Error(`Tenant "${slug}" não encontrado`)
  return tenant
}

// Re-exporta para conveniência nos Server Components
export { resolvePlan }
