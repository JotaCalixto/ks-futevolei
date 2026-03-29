import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

let supabaseAdminClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY não definido')
    supabaseAdminClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return supabaseAdminClient
}
