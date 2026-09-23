-- Initial migration for Quality Services Schema
-- Enforces Row Level Security (RLS) on all tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Quality Services Table
CREATE TABLE IF NOT EXISTS public.quality_services (
    id TEXT PRIMARY KEY DEFAULT ('svc-' || substr(md5(random()::text), 1, 8)),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('audit', 'inspection', 'certification', 'consulting')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_review', 'inactive', 'archived')),
    sla_hours INTEGER NOT NULL CHECK (sla_hours > 0),
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.quality_services ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active services
CREATE POLICY "Allow public read access to active services"
    ON public.quality_services
    FOR SELECT
    USING (status = 'active' OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Policy: Authenticated users / service role can insert
CREATE POLICY "Allow authenticated insert"
    ON public.quality_services
    FOR INSERT
    TO authenticated, service_role
    WITH CHECK (true);

-- Policy: Service role or admin can update
CREATE POLICY "Allow authenticated update"
    ON public.quality_services
    FOR UPDATE
    TO authenticated, service_role
    USING (true);

-- Seed Initial Data
INSERT INTO public.quality_services (id, name, description, category, status, sla_hours, price)
VALUES
    ('svc-001', 'ISO 9001 Quality Management Audit', 'Full systematic audit verifying conformity with ISO 9001 standard procedures.', 'audit', 'active', 48, 1500.00),
    ('svc-002', 'Pre-Shipment Container Inspection', 'Random sampling and testing prior to warehouse dispatch to prevent returns.', 'inspection', 'active', 24, 490.00),
    ('svc-003', 'CE Marking Compliance Verification', 'Regulatory review of technical files for European market commercialization.', 'certification', 'in_review', 96, 2100.00),
    ('svc-004', 'Supplier Quality Engineering Consulting', 'Dedicated QE specialist support for root cause analysis and CAPA implementation.', 'consulting', 'active', 72, 3200.00)
ON CONFLICT (id) DO NOTHING;
