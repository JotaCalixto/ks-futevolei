-- ============================================================
-- MIGRATION: 002_multitenant_upgrade.sql
-- Adiciona suporte completo a multi-tenancy na tabela academies
-- e reforça isolamento via RLS
-- ============================================================

-- ──────────────────────────────────────────────────
-- 1. NOVAS COLUNAS NA TABELA academies
-- ──────────────────────────────────────────────────

ALTER TABLE academies
  ADD COLUMN IF NOT EXISTS subdomain       TEXT UNIQUE,         -- ex: "ks-floripa"
  ADD COLUMN IF NOT EXISTS custom_domain   TEXT UNIQUE,         -- ex: "futevolei-sc.com"
  ADD COLUMN IF NOT EXISTS plan_id         TEXT NOT NULL DEFAULT 'free'
                                           CHECK (plan_id IN ('free','starter','pro','enterprise')),
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS logo_url        TEXT,
  ADD COLUMN IF NOT EXISTS favicon_url     TEXT,
  ADD COLUMN IF NOT EXISTS custom_font     TEXT,                -- Nome de fonte Google
  ADD COLUMN IF NOT EXISTS dark_bg_color   TEXT DEFAULT '#0D0D0D',
  ADD COLUMN IF NOT EXISTS card_bg_color   TEXT DEFAULT '#181818',
  ADD COLUMN IF NOT EXISTS owner_email     TEXT,               -- Email do dono da conta SaaS
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,           -- Para cobrança SaaS futura
  ADD COLUMN IF NOT EXISTS trial_ends_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata        JSONB DEFAULT '{}'::JSONB;

-- Índices para resolução de tenant
CREATE INDEX IF NOT EXISTS idx_academies_subdomain     ON academies(subdomain) WHERE subdomain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_academies_custom_domain ON academies(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_academies_slug          ON academies(slug);
CREATE INDEX IF NOT EXISTS idx_academies_plan          ON academies(plan_id);

-- ──────────────────────────────────────────────────
-- 2. TABELA DE DOMÍNIOS VERIFICADOS (futuro)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS domain_verifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  domain          TEXT NOT NULL UNIQUE,
  verification_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  verified_at     TIMESTAMPTZ,
  is_verified     BOOLEAN DEFAULT FALSE,
  dns_record_type TEXT DEFAULT 'CNAME',
  dns_record_value TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────
-- 3. TABELA DE PLANOS (referência)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
  id              TEXT PRIMARY KEY,  -- 'free', 'starter', 'pro', 'enterprise'
  name            TEXT NOT NULL,
  max_students    INT NOT NULL DEFAULT 20,
  max_coaches     INT NOT NULL DEFAULT 1,
  max_slots_day   INT NOT NULL DEFAULT 3,
  price_monthly   DECIMAL(10,2) DEFAULT 0,
  features        JSONB DEFAULT '{}'::JSONB,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO plans (id, name, max_students, max_coaches, max_slots_day, price_monthly, features) VALUES
('free',       'Gratuito',   20,   1, 3,  0,     '{"chat":true,"waitlist":true,"customDomain":false,"analytics":false}'::JSONB),
('starter',    'Starter',    50,   1, 6,  49.90, '{"chat":true,"waitlist":true,"customDomain":false,"analytics":false}'::JSONB),
('pro',        'Pro',        200,  5, 12, 99.90, '{"chat":true,"waitlist":true,"customDomain":true,"analytics":true,"multiCoach":true}'::JSONB),
('enterprise', 'Enterprise', 9999, 99,99, 249.90,'{"chat":true,"waitlist":true,"customDomain":true,"analytics":true,"multiCoach":true}'::JSONB)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────
-- 4. FUNÇÃO: verifica se o tenant pode executar a ação
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_tenant_plan_limit(
  p_academy_id UUID,
  p_resource TEXT,   -- 'students', 'coaches', 'slots_per_day'
  p_current_count INT
) RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id TEXT;
  v_plan plans%ROWTYPE;
BEGIN
  SELECT plan_id INTO v_plan_id FROM academies WHERE id = p_academy_id;
  SELECT * INTO v_plan FROM plans WHERE id = v_plan_id;

  IF NOT FOUND THEN RETURN FALSE; END IF;

  RETURN CASE p_resource
    WHEN 'students'      THEN p_current_count < v_plan.max_students
    WHEN 'coaches'       THEN p_current_count < v_plan.max_coaches
    WHEN 'slots_per_day' THEN p_current_count < v_plan.max_slots_day
    ELSE TRUE
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────────
-- 5. RLS REFORÇADA — garante isolamento total por academy_id
-- ──────────────────────────────────────────────────

-- Helper: retorna o academy_id do usuário atual
CREATE OR REPLACE FUNCTION get_current_academy_id()
RETURNS UUID AS $$
  SELECT academy_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper: retorna o role do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper: verifica se é super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'super_admin' FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Re-cria policies usando as helpers (mais eficiente — evita subquery por row)

-- TRAINING DAYS
DROP POLICY IF EXISTS "training_days_academy_read" ON training_days;
DROP POLICY IF EXISTS "training_days_coach_write" ON training_days;

CREATE POLICY "training_days_same_academy"
  ON training_days FOR SELECT
  USING (academy_id = get_current_academy_id() OR is_super_admin());

CREATE POLICY "training_days_coach_all"
  ON training_days FOR ALL
  USING (
    academy_id = get_current_academy_id()
    AND get_current_user_role() IN ('coach', 'super_admin')
  );

-- TRAINING SLOTS
DROP POLICY IF EXISTS "training_slots_academy_read" ON training_slots;
DROP POLICY IF EXISTS "training_slots_coach_write" ON training_slots;

CREATE POLICY "training_slots_same_academy"
  ON training_slots FOR SELECT
  USING (academy_id = get_current_academy_id() OR is_super_admin());

CREATE POLICY "training_slots_coach_all"
  ON training_slots FOR ALL
  USING (
    academy_id = get_current_academy_id()
    AND get_current_user_role() IN ('coach', 'super_admin')
  );

-- STUDENTS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_same_academy" ON students;
CREATE POLICY "students_same_academy"
  ON students FOR SELECT
  USING (
    academy_id = get_current_academy_id()
    AND (
      profile_id = auth.uid()                             -- O próprio aluno
      OR get_current_user_role() IN ('coach','super_admin') -- Professor/admin
    )
  );

CREATE POLICY "students_coach_manage"
  ON students FOR ALL
  USING (
    academy_id = get_current_academy_id()
    AND get_current_user_role() IN ('coach', 'super_admin')
  );

-- COACHES
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coaches_same_academy"
  ON coaches FOR SELECT
  USING (academy_id = get_current_academy_id() OR is_super_admin());

CREATE POLICY "coaches_self_manage"
  ON coaches FOR ALL
  USING (
    profile_id = auth.uid()
    OR is_super_admin()
  );

-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "announcements_academy_read" ON announcements;
DROP POLICY IF EXISTS "announcements_coach_write" ON announcements;

CREATE POLICY "announcements_same_academy"
  ON announcements FOR SELECT
  USING (academy_id = get_current_academy_id() OR is_super_admin());

CREATE POLICY "announcements_coach_all"
  ON announcements FOR ALL
  USING (
    academy_id = get_current_academy_id()
    AND get_current_user_role() IN ('coach', 'super_admin')
  );

-- SETTINGS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_same_academy"
  ON settings FOR SELECT
  USING (academy_id = get_current_academy_id() OR is_super_admin());

CREATE POLICY "settings_coach_manage"
  ON settings FOR ALL
  USING (
    academy_id = get_current_academy_id()
    AND get_current_user_role() IN ('coach', 'super_admin')
  );

-- ──────────────────────────────────────────────────
-- 6. SEED: Atualiza a academia K.S com os novos campos
-- ──────────────────────────────────────────────────
UPDATE academies SET
  subdomain    = 'ks-floripa',
  plan_id      = 'pro',
  logo_url     = '/logo.png',  -- Substituir pela URL real no Supabase Storage
  custom_font  = NULL,         -- Sem fonte customizada (usa Geist padrão)
  dark_bg_color = '#0D0D0D',
  card_bg_color = '#181818',
  owner_email  = 'professor@ksfutevolei.com.br'
WHERE slug = 'ks-futevolei-floripa';

-- ──────────────────────────────────────────────────
-- 7. VIEW: tenant_summary — facilita queries do super admin
-- ──────────────────────────────────────────────────
CREATE OR REPLACE VIEW tenant_summary AS
SELECT
  a.id,
  a.name,
  a.slug,
  a.subdomain,
  a.custom_domain,
  a.plan_id,
  a.primary_color,
  a.logo_url,
  a.is_active,
  a.created_at,
  p.name    AS plan_name,
  p.max_students,
  (SELECT COUNT(*) FROM students s WHERE s.academy_id = a.id AND s.is_active = TRUE)  AS current_students,
  (SELECT COUNT(*) FROM coaches  c WHERE c.academy_id = a.id)                          AS current_coaches,
  (SELECT COUNT(*) FROM bookings b WHERE b.academy_id = a.id AND b.status = 'confirmed'
    AND b.created_at >= NOW() - INTERVAL '30 days')                                   AS bookings_last_30d
FROM academies a
LEFT JOIN plans p ON p.id = a.plan_id
ORDER BY a.created_at DESC;
