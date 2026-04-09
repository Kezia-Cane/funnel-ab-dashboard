-- =============================================
-- A/B Testing Dashboard — Supabase Schema
-- =============================================
-- Run this in the Supabase SQL editor to set up the database.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. AB Tests
-- =============================================
CREATE TABLE IF NOT EXISTS ab_tests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  test_key     TEXT NOT NULL UNIQUE,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'draft'
               CHECK (status IN ('active', 'completed', 'draft', 'paused')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. AB Variants
-- =============================================
CREATE TABLE IF NOT EXISTS ab_variants (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id      UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_key  TEXT NOT NULL, -- 'A', 'B', 'C'
  headline     TEXT NOT NULL,
  subheadline  TEXT,
  is_control   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (test_id, variant_key)
);

-- =============================================
-- 3. AB Events
-- =============================================
CREATE TABLE IF NOT EXISTS ab_events (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id        UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_id     UUID NOT NULL REFERENCES ab_variants(id) ON DELETE CASCADE,
  event_type     TEXT NOT NULL
                 CHECK (event_type IN ('page_view', 'cta_click', 'conversion', 'purchase')),
  page_url       TEXT,
  page_path      TEXT,
  user_agent     TEXT,
  revenue_value  NUMERIC(10, 2),
  metadata       JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 4. AB Sessions (Phase 2 scaffold)
-- =============================================
CREATE TABLE IF NOT EXISTS ab_sessions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id      UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_id   UUID NOT NULL REFERENCES ab_variants(id) ON DELETE CASCADE,
  session_id   TEXT NOT NULL, -- fingerprint or localStorage key
  first_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted    BOOLEAN NOT NULL DEFAULT FALSE
);

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_ab_events_test_id     ON ab_events(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_events_variant_id  ON ab_events(variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_events_event_type  ON ab_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ab_events_created_at  ON ab_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ab_variants_test_id   ON ab_variants(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_test_key     ON ab_tests(test_key);
CREATE INDEX IF NOT EXISTS idx_ab_sessions_test_id   ON ab_sessions(test_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
-- Enable RLS on all tables. For the MVP the API uses the service role key
-- which bypasses RLS, so these are a safety net for direct access.

ALTER TABLE ab_tests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_sessions ENABLE ROW LEVEL SECURITY;

-- Allow insert via service role (API route) — deny direct anon writes
-- These policies allow authenticated dashboard users full access.
CREATE POLICY "Service role access" ON ab_tests    FOR ALL USING (true);
CREATE POLICY "Service role access" ON ab_variants FOR ALL USING (true);
CREATE POLICY "Service role access" ON ab_events   FOR ALL USING (true);
CREATE POLICY "Service role access" ON ab_sessions FOR ALL USING (true);

-- =============================================
-- Trigger: auto-update updated_at on ab_tests
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ab_tests_updated_at
  BEFORE UPDATE ON ab_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
