// middleware.ts — Raiz do projeto
// Multi-tenant aware: resolve o tenant antes de qualquer route handler

import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { resolveTenant } from '@/lib/tenant/resolveTenant'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') ?? ''

  // ── 1. RESOLVE TENANT ──────────────────────────────────────
  const { tenant, strategy, notFound } = await resolveTenant(hostname, pathname)

  // Tenant não encontrado → página de erro customizada
  if (notFound) {
    const url = request.nextUrl.clone()
    url.pathname = '/tenant-not-found'
    return NextResponse.rewrite(url)
  }

  // ── 2. ATUALIZA SESSÃO SUPABASE ────────────────────────────
  const response = await updateSession(request)

  // ── 3. INJETA TENANT NOS HEADERS ──────────────────────────
  // Os Server Components leem esses headers via getTenantFromHeaders()
  if (tenant) {
    response.headers.set('x-tenant-id',     tenant.id)
    response.headers.set('x-tenant-slug',   tenant.slug)
    response.headers.set('x-tenant-strategy', strategy)
    response.headers.set('x-tenant-name',   tenant.branding.academyName)
    response.headers.set('x-tenant-color',  tenant.branding.primaryColor)
    // Serializa branding compacto para não explodir o header
    response.headers.set('x-tenant-branding', JSON.stringify({
      primaryColor:       tenant.branding.primaryColor,
      primaryColorLight:  tenant.branding.primaryColorLight,
      primaryColorDark:   tenant.branding.primaryColorDark,
      primaryColorGlow:   tenant.branding.primaryColorGlow,
      primaryColorBorder: tenant.branding.primaryColorBorder,
      logoUrl:            tenant.branding.logoUrl,
      academyName:        tenant.branding.academyName,
      academyShortName:   tenant.branding.academyShortName,
      darkBg:             tenant.branding.darkBg,
      cardBg:             tenant.branding.cardBg,
    }))
  }

  // ── 4. REDIRECIONA PATH-BASED → ROTAS LIMPAS ──────────────
  // Se estiver usando estratégia path-based (/[slug]/...), faz rewrite
  // para remover o slug da URL interna
  if (strategy === 'path' && tenant) {
    const slugPrefix = `/${tenant.slug}`
    if (pathname.startsWith(slugPrefix)) {
      const newPath = pathname.replace(slugPrefix, '') || '/'
      const url = request.nextUrl.clone()
      url.pathname = newPath
      return NextResponse.rewrite(url, {
        headers: response.headers,
      })
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.json|sounds|offline|api/webhooks|tenant-not-found).*)',
  ],
}
