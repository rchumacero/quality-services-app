-- Migration: Create Domain ERD Tables with 't' prefix (tbrand, tuser, tbrand_user, treply, tevaluation)
-- Enforces Row Level Security (RLS) per database security rules

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. Brand Table (tbrand)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tbrand (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    procedures_summary VARCHAR(2000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'system',
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    CONSTRAINT uq_tbrand_code UNIQUE (code)
);

ALTER TABLE public.tbrand ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tbrand_read_policy" ON public.tbrand
    FOR SELECT USING (true);

CREATE POLICY "tbrand_write_policy" ON public.tbrand
    FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 2. User Table (tuser)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tuser (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'system',
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    CONSTRAINT uq_tuser_account UNIQUE (account)
);

ALTER TABLE public.tuser ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tuser_read_policy" ON public.tuser
    FOR SELECT USING (true);

CREATE POLICY "tuser_write_policy" ON public.tuser
    FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 3. Brand-User Mapping (tbrand_user)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tbrand_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.tbrand(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.tuser(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'system',
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    CONSTRAINT uq_tbrand_user UNIQUE (brand_id, user_id)
);

ALTER TABLE public.tbrand_user ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tbrand_user_read_policy" ON public.tbrand_user
    FOR SELECT USING (true);

CREATE POLICY "tbrand_user_write_policy" ON public.tbrand_user
    FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 4. Reply Table (treply)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.treply (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.tbrand(id) ON DELETE RESTRICT,
    specialist_id UUID NOT NULL REFERENCES public.tuser(id) ON DELETE RESTRICT,
    reply_date TIMESTAMPTZ NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'system',
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_treply_brand ON public.treply(brand_id);
CREATE INDEX IF NOT EXISTS idx_treply_specialist ON public.treply(specialist_id);

ALTER TABLE public.treply ENABLE ROW LEVEL SECURITY;

CREATE POLICY "treply_read_policy" ON public.treply
    FOR SELECT USING (true);

CREATE POLICY "treply_write_policy" ON public.treply
    FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 5. Evaluation Table (tevaluation)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tevaluation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reply_id UUID NOT NULL REFERENCES public.treply(id) ON DELETE CASCADE,
    team_lead_id UUID NOT NULL REFERENCES public.tuser(id) ON DELETE RESTRICT,
    evaluation_date TIMESTAMPTZ NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    error_tags VARCHAR(100),
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'system',
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_teval_reply ON public.tevaluation(reply_id);
CREATE INDEX IF NOT EXISTS idx_teval_team_lead ON public.tevaluation(team_lead_id);

ALTER TABLE public.tevaluation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tevaluation_read_policy" ON public.tevaluation
    FOR SELECT USING (true);

CREATE POLICY "tevaluation_write_policy" ON public.tevaluation
    FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- ==========================================
-- Initial Seed Data
-- ==========================================
INSERT INTO public.tbrand (id, code, name, procedures_summary, created_by)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'BRD-ACME', 'Acme Consumer Goods', 'Follow standard SOP-001 for all customer inquiries.', 'admin'),
    ('22222222-2222-2222-2222-222222222222', 'BRD-ZENITH', 'Zenith Electronics', 'SOP-004: Escalations require immediate supervisor tagging.', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tuser (id, account, name, role, created_by)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'jdoe@quality.com', 'John Doe', 'specialist', 'admin'),
    ('44444444-4444-4444-4444-444444444444', 'asmith@quality.com', 'Alice Smith', 'team_lead', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tbrand_user (brand_id, user_id, created_by)
VALUES
    ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'admin')
ON CONFLICT DO NOTHING;
