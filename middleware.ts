// middleware.ts — Raiz do projeto
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { resolveTenant } from '@/lib/tenant/resolveTenant'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') ?? ''

  const defaultSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG
  const { tenant, strategy, notFound } = await resolveTenant(hostname, pathname, defaultSlug)

  if (notFound) {
    const url = request.nextUrl.clone()
    url.pathname = '/tenant-not-found'
    return NextResponse.rewrite(url)
  }

  const response = await updateSession(request)

  if (tenant) {
    response.headers.set('x-tenant-id',       tenant.id)
    response.headers.set('x-tenant-slug',     tenant.slug)
    response.headers.set('x-tenant-strategy', strategy)
    response.headers.set('x-tenant-name',     tenant.branding.academyName)
    response.headers.set('x-tenant-color',    tenant.branding.primaryColor)
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

  if (strategy === 'path' && tenant) {
    const slugPrefix = `/${tenant.slug}`
    if (pathname.startsWith(slugPrefix)) {
      const newPath = pathname.replace(slugPrefix, '') || '/'
      const url = request.nextUrl.clone()
      url.pathname = newPath
      return NextResponse.rewrite(url, { headers: response.headers })
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.json|sounds|offline|api/webhooks|tenant-not-found).*)',
  ],
}
