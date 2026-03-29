'use client'
import React, { createContext, useContext } from 'react'

const defaultTenant = {
  id: 'a1b2c3d4-0000-0000-0000-000000000001',
  slug: 'ks-futevolei-floripa',
  customDomain: null,
  subdomain: null,
  branding: {
    primaryColor: '#D4A017',
    primaryColorLight: '#FBBF24',
    primaryColorDark: '#92680A',
    primaryColorGlow: 'rgba(212,160,23,0.2)',
    primaryColorBorder: 'rgba(212,160,23,0.3)',
    logoUrl: null,
    logoAltText: 'K.S Futevôlei',
    academyName: 'K.S Futevôlei',
    academyShortName: 'K.S',
    faviconUrl: null,
    splashLogoUrl: null,
    customFont: null,
    darkBg: '#0D0D0D',
    cardBg: '#181818',
  },
  settings: {
    defaultCapacity: 10,
    cancelDeadlineHours: 2,
    autoWaitlist: true,
    membershipDueDay: 10,
    defaultMonthlyFee: 250,
    timezone: 'America/Sao_Paulo',
    cancelPolicy: '2 horas antes do treino',
    allowSelfCheckin: false,
    customTexts: {},
    socialLinks: {},
    features: {
      chat: true,
      waitlist: true,
      attendance: true,
      announcements: true,
      memberships: true,
      pushNotifications: false,
      customDomain: false,
      multiCoach: false,
      analytics: false,
    },
  },
  plan: {
    id: 'pro' as const,
    name: 'Pro',
    maxStudents: 200,
    maxCoaches: 5,
    maxSlotsPerDay: 12,
  },
  isActive: true,
  coachProfileId: '',
}

const TenantContext = createContext<{ tenant: typeof defaultTenant }>({
  tenant: defaultTenant,
})

export function useTenant() {
  return useContext(TenantContext)
}

export function useBranding() {
  return useContext(TenantContext).tenant.branding
}

export function useTenantSettings() {
  return useContext(TenantContext).tenant.settings
}

export function useTenantFeatures() {
  return useContext(TenantContext).tenant.settings.features
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  return (
    <TenantContext.Provider value={{ tenant: defaultTenant }}>
      {children}
    </TenantContext.Provider>
  )
}

export function TenantLayout({ children, tenant, className }: {
  children: React.ReactNode
  tenant?: typeof defaultTenant
  className?: string
}) {
  return (
    <TenantProvider>
      <div className={className}>{children}</div>
    </TenantProvider>
  )
}