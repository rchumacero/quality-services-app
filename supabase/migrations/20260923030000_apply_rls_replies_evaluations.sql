-- Migration: Implement Row Level Security (RLS) on treply and tevaluation
-- Enforces role-based data access for 'specialist' and 'team_lead' roles
-- Includes helper functions for current user and role identification

-- Ensure standard Supabase roles exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Ensure auth schema and auth.uid() exist for maximum compatibility
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
$$;

-- ============================================================================
-- 1. Helper Functions
-- ============================================================================

-- Function: current_user_id()
-- Resolves user UUID from session setting (app.current_user_id), JWT sub, or auth.uid()
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('app.current_user_id', true), '')::UUID,
    NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID,
    auth.uid()
  );
$$;

-- Function: current_user_role()
-- Returns role ('specialist', 'team_lead', 'admin') of current user
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS VARCHAR
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.tuser WHERE id = public.current_user_id();
$$;

-- Function: can_access_reply(brand_id, specialist_id)
-- Specialist: can only view their own replies
-- Team Lead: can view their own replies, plus replies from specialists assigned to brands managed by this team lead
CREATE OR REPLACE FUNCTION public.can_access_reply(p_brand_id UUID, p_specialist_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    -- Specialist role
    WHEN public.current_user_role() = 'specialist' THEN
      p_specialist_id = public.current_user_id()

    -- Team Lead role
    WHEN public.current_user_role() = 'team_lead' THEN
      (
        p_specialist_id = public.current_user_id()
        OR (
          -- Brand is managed by this team lead
          EXISTS (
            SELECT 1 FROM public.tbrand_user bu_lead
            WHERE bu_lead.user_id = public.current_user_id()
              AND bu_lead.brand_id = p_brand_id
          )
          AND
          -- Specialist is assigned to this brand
          EXISTS (
            SELECT 1 FROM public.tbrand_user bu_spec
            WHERE bu_spec.user_id = p_specialist_id
              AND bu_spec.brand_id = p_brand_id
          )
        )
      )

    -- Admin or elevated role
    WHEN public.current_user_role() = 'admin' THEN TRUE
    ELSE FALSE
  END;
$$;

-- Function: can_access_evaluation(reply_id, team_lead_id)
-- Specialist: can view evaluations where they are the evaluator or author of the evaluated reply
-- Team Lead: can view evaluations they created or evaluations on replies of specialists on brands they manage
CREATE OR REPLACE FUNCTION public.can_access_evaluation(p_reply_id UUID, p_team_lead_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    -- Specialist role
    WHEN public.current_user_role() = 'specialist' THEN
      (
        p_team_lead_id = public.current_user_id()
        OR EXISTS (
          SELECT 1 FROM public.treply r
          WHERE r.id = p_reply_id
            AND r.specialist_id = public.current_user_id()
        )
      )

    -- Team Lead role
    WHEN public.current_user_role() = 'team_lead' THEN
      (
        p_team_lead_id = public.current_user_id()
        OR EXISTS (
          SELECT 1 FROM public.treply r
          WHERE r.id = p_reply_id
            AND public.can_access_reply(r.brand_id, r.specialist_id)
        )
      )

    -- Admin or elevated role
    WHEN public.current_user_role() = 'admin' THEN TRUE
    ELSE FALSE
  END;
$$;

-- ============================================================================
-- 2. Force Row Level Security on treply and tevaluation
-- Ensures RLS applies even to table owners / superuser connections
-- ============================================================================
ALTER TABLE public.treply ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treply FORCE ROW LEVEL SECURITY;

ALTER TABLE public.tevaluation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tevaluation FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. Policies on treply
-- ============================================================================
DROP POLICY IF EXISTS "treply_read_policy" ON public.treply;
DROP POLICY IF EXISTS "treply_select_policy" ON public.treply;
DROP POLICY IF EXISTS "treply_write_policy" ON public.treply;
DROP POLICY IF EXISTS "treply_insert_policy" ON public.treply;
DROP POLICY IF EXISTS "treply_update_policy" ON public.treply;
DROP POLICY IF EXISTS "treply_delete_policy" ON public.treply;

-- SELECT Policy
CREATE POLICY "treply_select_policy"
ON public.treply
FOR SELECT
USING (public.can_access_reply(brand_id, specialist_id));

-- INSERT Policy
CREATE POLICY "treply_insert_policy"
ON public.treply
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- UPDATE Policy
CREATE POLICY "treply_update_policy"
ON public.treply
FOR UPDATE
TO authenticated, service_role
USING (public.can_access_reply(brand_id, specialist_id))
WITH CHECK (public.can_access_reply(brand_id, specialist_id));

-- DELETE Policy
CREATE POLICY "treply_delete_policy"
ON public.treply
FOR DELETE
TO authenticated, service_role
USING (public.can_access_reply(brand_id, specialist_id));

-- ============================================================================
-- 4. Policies on tevaluation
-- ============================================================================
DROP POLICY IF EXISTS "tevaluation_read_policy" ON public.tevaluation;
DROP POLICY IF EXISTS "tevaluation_select_policy" ON public.tevaluation;
DROP POLICY IF EXISTS "tevaluation_write_policy" ON public.tevaluation;
DROP POLICY IF EXISTS "tevaluation_insert_policy" ON public.tevaluation;
DROP POLICY IF EXISTS "tevaluation_update_policy" ON public.tevaluation;
DROP POLICY IF EXISTS "tevaluation_delete_policy" ON public.tevaluation;

-- SELECT Policy
CREATE POLICY "tevaluation_select_policy"
ON public.tevaluation
FOR SELECT
USING (public.can_access_evaluation(reply_id, team_lead_id));

-- INSERT Policy
CREATE POLICY "tevaluation_insert_policy"
ON public.tevaluation
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- UPDATE Policy
CREATE POLICY "tevaluation_update_policy"
ON public.tevaluation
FOR UPDATE
TO authenticated, service_role
USING (public.can_access_evaluation(reply_id, team_lead_id))
WITH CHECK (public.can_access_evaluation(reply_id, team_lead_id));

-- DELETE Policy
CREATE POLICY "tevaluation_delete_policy"
ON public.tevaluation
FOR DELETE
TO authenticated, service_role
USING (public.can_access_evaluation(reply_id, team_lead_id));
