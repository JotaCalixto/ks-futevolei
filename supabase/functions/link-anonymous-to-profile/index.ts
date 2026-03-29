import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })
  const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
  if (!user) return new Response('Unauthorized', { status: 401 })
  const { p_profile_id } = await req.json()
  const { data: existingProfile } = await supabaseAdmin.from('profiles').select('id').eq('id', p_profile_id).single()
  if (!existingProfile) return new Response('Profile not found', { status: 404 })
  await supabaseAdmin.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', p_profile_id)
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
})
