-- Migration: Create Domain ERD Tables with 't_' prefix and audit columns
-- Enforces Row Level Security (RLS) per database security rules

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. Brand Table (t_brand)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.t_brand (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    procedures_summary VARCHAR(2000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'system',
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    CONSTRAINT uq_t_brand_code UNIQUE (code)
);

ALTER TABLE public.t_brand ENABLE ROW LEVEL SECURITY;

CREATE POLICY "t_brand_read_policy" ON public.t_brand
    FOR SELECT USING (true);

CREATE POLICY "t_brand_write_policy" ON public.t_brand
    FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 2. User Table (t_user)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.t_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'system',
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    CONSTRAINT uq_t_user_account UNIQUE (account)
);

ALTER TABLE public.t_user ENABLE ROW LEVEL SECURITY;

CREATE POLICY "t_user_read_policy" ON public.t_user
    FOR SELECT USING (true);

CREATE POLICY "t_user_write_policy" ON public.t_user
    FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 3. Brand-User Mapping (t_brand_user)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.t_brand_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.t_brand(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.t_user(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'system',
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    CONSTRAINT uq_t_brand_user UNIQUE (brand_id, user_id)
);

ALTER TABLE public.t_brand_user ENABLE ROW LEVEL SECURITY;

CREATE POLICY "t_brand_user_read_policy" ON public.t_brand_user
    FOR SELECT USING (true);

CREATE POLICY "t_brand_user_write_policy" ON public.t_brand_user
    FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 4. Reply Table (t_reply)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.t_reply (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.t_brand(id) ON DELETE RESTRICT,
    specialist_id UUID NOT NULL REFERENCES public.t_user(id) ON DELETE RESTRICT,
    reply_date TIMESTAMPTZ NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'system',
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_t_reply_brand ON public.t_reply(brand_id);
CREATE INDEX IF NOT EXISTS idx_t_reply_specialist ON public.t_reply(specialist_id);

ALTER TABLE public.t_reply ENABLE ROW LEVEL SECURITY;

CREATE POLICY "t_reply_read_policy" ON public.t_reply
    FOR SELECT USING (true);

CREATE POLICY "t_reply_write_policy" ON public.t_reply
    FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 5. Evaluation Table (t_evaluation)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.t_evaluation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reply_id UUID NOT NULL REFERENCES public.t_reply(id) ON DELETE CASCADE,
    team_lead_id UUID NOT NULL REFERENCES public.t_user(id) ON DELETE RESTRICT,
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

CREATE INDEX IF NOT EXISTS idx_t_eval_reply ON public.t_evaluation(reply_id);
CREATE INDEX IF NOT EXISTS idx_t_eval_team_lead ON public.t_evaluation(team_lead_id);

ALTER TABLE public.t_evaluation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "t_evaluation_read_policy" ON public.t_evaluation
    FOR SELECT USING (true);

CREATE POLICY "t_evaluation_write_policy" ON public.t_evaluation
    FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- ==========================================
-- Initial Seed Data
-- ==========================================
INSERT INTO public.t_brand (id, code, name, procedures_summary, created_by)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'BRD-ACME', 'Acme Consumer Goods', 'Follow standard SOP-001 for all customer inquiries.', 'admin'),
    ('22222222-2222-2222-2222-222222222222', 'BRD-ZENITH', 'Zenith Electronics', 'SOP-004: Escalations require immediate supervisor tagging.', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.t_user (id, account, name, role, created_by)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'jdoe@quality.com', 'John Doe', 'specialist', 'admin'),
    ('44444444-4444-4444-4444-444444444444', 'asmith@quality.com', 'Alice Smith', 'team_lead', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.t_brand_user (brand_id, user_id, created_by)
VALUES
    ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'admin')
ON CONFLICT DO NOTHING;
