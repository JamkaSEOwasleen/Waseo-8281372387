-- ============================================
-- WasafSEO Verification Tokens Table
-- Migration: 002_verification_tokens.sql
-- Required by Auth.js v5 Resend/Email provider
-- for passwordless magic link sign-in.
-- ============================================

CREATE TABLE IF NOT EXISTS public.verification_tokens (
  identifier  text NOT NULL,
  token       text NOT NULL UNIQUE,
  expires     timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (identifier, token)
);

-- Index for looking up tokens by token value
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token
  ON public.verification_tokens(token);

-- Index for cleaning up expired tokens
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires
  ON public.verification_tokens(expires);

-- Enable RLS (service role bypasses it, but good practice)
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "verification_tokens_service_role" ON public.verification_tokens
  FOR ALL USING (true);

-- ============================================
-- VERIFY MIGRATION
-- ============================================
SELECT 'Migration 002 complete ✓' as status;
