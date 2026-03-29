// src/app/(super-admin)/admin/academias/page.tsx
// Painel do Super Admin — visão de todas as academias do SaaS

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AcademiasClient from './AcademiasClient'

export default async function AcademiasPage() {
  const supabase = await getSupabaseServerClient()

  // Verifica se o usuário é super_admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/dashboard')

  // Busca todas as academias
  const { data: academias } = await supabase
    .from('academies')
    .select(`
      id, name, slug, subdomain, custom_domain,
      primary_color, logo_url, plan_id, is_active,
      created_at, owner_email,
      settings(default_monthly_fee, default_capacity)
    `)
    .order('created_at', { ascending: false })

  // Busca stats de cada academia (contagem de alunos e reservas)
  const { data: stats } = await supabase
    .from('tenant_summary')
    .select('*')

  return <AcademiasClient academias={academias ?? []} stats={stats ?? []} />
}