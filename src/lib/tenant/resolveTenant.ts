// src/lib/tenant/resolveTenant.ts
// Resolve qual tenant/academy pertence a uma request HTTP
// Suporta 3 estratégias: subdomínio, domínio próprio, path-based

import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import type { Tenant, TenantBranding, TenantSettings, TenantFeatures, TenantPlan } from './types'
import { generateBrandingFromColor } from './brandingUtils'

// Cache em memória simples (em produção: use Redis ou Vercel KV)
const tenantCache = new Map<string, { tenant: Tenant; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

export type TenantResolutionStrategy = 'subdomain' | 'custom-domain' | 'path' | 'default'

export interface TenantResolutionResult {
  tenant: Tenant | null
  strategy: TenantResolutionStrategy
  notFound: boolean
}

// ============================================================
// FUNÇÃO PRINCIPAL — chamada no middleware do Next.js
// ============================================================
export async function resolveTenant(
  hostname: string,
  pathname: string,
  defaultSlug?: string
): Promise<TenantResolutionResult> {

  // Normaliza hostname (remove porta em dev)
  const host = hostname.split(':')[0].toLowerCase()

  // Estratégia 1: Slug padrão injetado (MVP single-tenant)
  if (defaultSlug && process.env.NEXT_PUBLIC_FORCE_TENANT_SLUG) {
    const tenant = await fetchTenantBySlug(defaultSlug)
    return { tenant, strategy: 'default', notFound: !tenant }
  }

  // Estratégia 2: Domínio próprio (futevolei-sc.com)
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'ks-futevolei.com.br'
  if (!host.endsWith(appDomain) && !host.includes('localhost') && !host.includes('vercel.app')) {
    const tenant = await fetchTenantByCustomDomain(host)
    return { tenant, strategy: 'custom-domain', notFound: !tenant }
  }

  // Estratégia 3: Subdomínio (floripa.ks-futevolei.com.br)
  const subdomain = extractSubdomain(host, appDomain)
  if (subdomain && subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'admin') {
    const tenant = await fetchTenantBySubdomain(subdomain)
    return { tenant, strategy: 'subdomain', notFound: !tenant }
  }

  // Estratégia 4: Path-based (/[slug]/...)
  const pathSlug = extractSlugFromPath(pathname)
  if (pathSlug) {
    const tenant = await fetchTenantBySlug(pathSlug)
    return { tenant, strategy: 'path', notFound: !tenant }
  }

  // Fallback: slug fixo do ambiente (MVP)
  const fallbackSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? 'ks-futevolei-floripa'
  const tenant = await fetchTenantBySlug(fallbackSlug)
  return { tenant, strategy: 'default', notFound: !tenant }
}

// ============================================================
// HELPERS DE RESOLUÇÃO
// ============================================================

function extractSubdomain(host: string, appDomain: string): string | null {
  if (!host.endsWith(`.${appDomain}`)) return null
  const subdomain = host.replace(`.${appDomain}`, '')
  return subdomain || null
}

function extractSlugFromPath(pathname: string): string | null {
  // Suporta rotas do tipo /[slug]/home, /[slug]/agenda, etc.
  const match = pathname.match(/^\/([a-z0-9-]+)\/(home|agenda|dashboard|login)/)
  return match ? match[1] : null
}

// ============================================================
// FETCH TENANT — com cache em memória
// ============================================================

async function fetchTenantBySlug(slug: string): Promise<Tenant | null> {
  const cacheKey = `slug:${slug}`
  const cached = tenantCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.tenant

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from('academies')
    .select(`
      *,
      settings(*),
      coaches(profile_id)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  const tenant = mapDatabaseRowToTenant(data)
  tenantCache.set(cacheKey, { tenant, expiresAt: Date.now() + CACHE_TTL_MS })
  // Popula também por domain e subdomain para cache cruzado
  if (data.custom_domain) {
    tenantCache.set(`domain:${data.custom_domain}`, { tenant, expiresAt: Date.now() + CACHE_TTL_MS })
  }
  if (data.subdomain) {
    tenantCache.set(`subdomain:${data.subdomain}`, { tenant, expiresAt: Date.now() + CACHE_TTL_MS })
  }

  return tenant
}

async function fetchTenantByCustomDomain(domain: string): Promise<Tenant | null> {
  const cacheKey = `domain:${domain}`
  const cached = tenantCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.tenant

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from('academies')
    .select(`*, settings(*), coaches(profile_id)`)
    .eq('custom_domain', domain)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  const tenant = mapDatabaseRowToTenant(data)
  tenantCache.set(cacheKey, { tenant, expiresAt: Date.now() + CACHE_TTL_MS })
  return tenant
}

async function fetchTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  const cacheKey = `subdomain:${subdomain}`
  const cached = tenantCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.tenant

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from('academies')
    .select(`*, settings(*), coaches(profile_id)`)
    .eq('subdomain', subdomain)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  const tenant = mapDatabaseRowToTenant(data)
  tenantCache.set(cacheKey, { tenant, expiresAt: Date.now() + CACHE_TTL_MS })
  return tenant
}

// ============================================================
// MAPPER — Database row → Tenant object
// ============================================================
function mapDatabaseRowToTenant(data: Record<string, unknown>): Tenant {
  const primaryColor = (data.primary_color as string) ?? '#D4A017'
  const branding = generateBrandingFromColor(primaryColor, {
    academyName: data.name as string,
    logoUrl: data.logo_url as string | null,
    faviconUrl: null,
    splashLogoUrl: data.logo_url as string | null,
    customFont: null,
  })

  const settings = data.settings as Record<string, unknown> | null
  const settingsData: TenantSettings = {
    defaultCapacity: (settings?.default_capacity as number) ?? 10,
    cancelDeadlineHours: (settings?.cancel_deadline_hours as number) ?? 2,
    autoWaitlist: (settings?.auto_waitlist as boolean) ?? true,
    membershipDueDay: (settings?.membership_due_day as number) ?? 10,
    defaultMonthlyFee: (settings?.default_monthly_fee as number) ?? 0,
    timezone: (settings?.timezone as string) ?? 'America/Sao_Paulo',
    cancelPolicy: '2 horas antes do treino',
    allowSelfCheckin: (settings?.allow_self_checkin as boolean) ?? false,
    customTexts: (settings?.custom_texts as Record<string, string>) ?? {},
    socialLinks: (settings?.social_links as Record<string, string>) ?? {},
    features: {
      chat: true,
      waitlist: true,
      attendance: true,
      announcements: true,
      memberships: true,
      pushNotifications: true,
      customDomain: (data.plan_id as string) !== 'free',
      multiCoach: (data.plan_id as string) === 'pro' || (data.plan_id as string) === 'enterprise',
      analytics: (data.plan_id as string) === 'pro' || (data.plan_id as string) === 'enterprise',
    } as TenantFeatures,
  }

  const coaches = data.coaches as Array<{ profile_id: string }> | null

  return {
    id: data.id as string,
    slug: data.slug as string,
    customDomain: data.custom_domain as string | null,
    subdomain: data.subdomain as string | null,
    branding,
    settings: settingsData,
    plan: resolvePlan((data.plan_id as string) ?? 'free'),
    isActive: data.is_active as boolean,
    coachProfileId: coaches?.[0]?.profile_id ?? '',
  }
}

function resolvePlan(planId: string): TenantPlan {
  const plans: Record<string, TenantPlan> = {
    free: { id: 'free', name: 'Gratuito', maxStudents: 20, maxCoaches: 1, maxSlotsPerDay: 3 },
    starter: { id: 'starter', name: 'Starter', maxStudents: 50, maxCoaches: 1, maxSlotsPerDay: 6 },
    pro: { id: 'pro', name: 'Pro', maxStudents: 200, maxCoaches: 5, maxSlotsPerDay: 12 },
    enterprise: { id: 'enterprise', name: 'Enterprise', maxStudents: 9999, maxCoaches: 99, maxSlotsPerDay: 99 },
  }
  return plans[planId] ?? plans.free
}

// ============================================================
// CACHE INVALIDATION — Chama ao atualizar branding no admin
// ============================================================
export function invalidateTenantCache(slug: string): void {
  for (const key of tenantCache.keys()) {
    if (key.includes(slug)) tenantCache.delete(key)
  }
}
