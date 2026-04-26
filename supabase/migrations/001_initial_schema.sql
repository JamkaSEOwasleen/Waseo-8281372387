-- ============================================
-- WasafSEO Complete Database Schema
-- Migration: 001_initial_schema.sql
-- Run in: Supabase SQL Editor
-- Last updated: 2026-04
-- ============================================

-- ============================================
-- TABLE 1: users
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                     text UNIQUE NOT NULL,
  name                      text,
  avatar_url                text,

  -- Plan & Access Control
  plan                      text NOT NULL DEFAULT 'none'
                            CHECK (plan IN ('none','starter','pro','agency')),
  trial_ends_at             timestamptz NULL,

  -- Lemon Squeezy References
  lemon_customer_id         text,
  lemon_subscription_id     text,

  -- Subscription State
  subscription_cancelled_at timestamptz NULL,
  subscription_paused_at    timestamptz NULL,
  payment_failed_at         timestamptz NULL,
  account_flagged           boolean NOT NULL DEFAULT false,

  created_at                timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 2: websites
-- ============================================
CREATE TABLE IF NOT EXISTS public.websites (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.users(id) 
                    ON DELETE CASCADE,

  -- Basic Info
  name              text NOT NULL,
  domain            text NOT NULL,
  logo_url          text,
  niche             text NOT NULL DEFAULT 'blog'
                    CHECK (niche IN ('blog','ecommerce','saas','news','portfolio')),
  target_country    text NOT NULL DEFAULT 'AE',

  -- Brand / Organization (feeds JSON-LD Organization node)
  brand_name        text,
  brand_description text,
  twitter_url       text,
  linkedin_url      text,
  wikipedia_url     text,

  -- Author / Person (feeds JSON-LD Person node)
  author_name       text,
  author_title      text,
  author_bio        text,
  author_linkedin   text,
  author_portfolio  text,
  author_topics     text[] NOT NULL DEFAULT '{}',

  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 3: briefs
-- ============================================
CREATE TABLE IF NOT EXISTS public.briefs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.users(id) 
                    ON DELETE CASCADE,
  website_id        uuid REFERENCES public.websites(id) 
                    ON DELETE SET NULL,

  -- User Inputs
  keyword           text NOT NULL,
  intent            text NOT NULL
                    CHECK (intent IN (
                      'how-to',
                      'informational',
                      'commercial',
                      'comparison',
                      'navigational'
                    )),
  target_country    text,
  additional_info   text,
  competitor_urls   text[] NOT NULL DEFAULT '{}',

  -- AI Outputs
  output            jsonb,
  schema_output     jsonb,
  word_count_actual integer,

  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 4: usage
-- ============================================
CREATE TABLE IF NOT EXISTS public.usage (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.users(id) 
                    ON DELETE CASCADE,
  month             text NOT NULL,
  briefs_generated  integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, month)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email 
  ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_users_plan 
  ON public.users(plan);

CREATE INDEX IF NOT EXISTS idx_users_lemon_customer 
  ON public.users(lemon_customer_id);

CREATE INDEX IF NOT EXISTS idx_users_lemon_subscription 
  ON public.users(lemon_subscription_id);

CREATE INDEX IF NOT EXISTS idx_websites_user_id 
  ON public.websites(user_id);

CREATE INDEX IF NOT EXISTS idx_briefs_user_id 
  ON public.briefs(user_id);

CREATE INDEX IF NOT EXISTS idx_briefs_website_id 
  ON public.briefs(website_id);

CREATE INDEX IF NOT EXISTS idx_briefs_created_at 
  ON public.briefs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_briefs_intent 
  ON public.briefs(intent);

CREATE INDEX IF NOT EXISTS idx_usage_user_month 
  ON public.usage(user_id, month);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.users   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage   ENABLE ROW LEVEL SECURITY;

-- Users: read and update own row only
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Websites: full access to own websites only
CREATE POLICY "websites_all_own" ON public.websites
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Briefs: full access to own briefs only
CREATE POLICY "briefs_all_own" ON public.briefs
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Usage: read own usage only
CREATE POLICY "usage_select_own" ON public.usage
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- ============================================
-- SERVICE ROLE BYPASS NOTE
-- ============================================
-- API routes use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
-- This is intentional for:
--   - Webhook handler updating users.plan
--   - Usage increment after generation
--   - Admin operations
-- Never expose service role key to browser/client.

-- ============================================
-- VERIFY MIGRATION
-- ============================================
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users','websites','briefs','usage')
GROUP BY table_name
ORDER BY table_name;

SELECT 'Migration 001 complete ✓' as status;