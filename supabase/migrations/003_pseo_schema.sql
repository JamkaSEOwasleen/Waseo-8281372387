-- ============================================
-- WasafSEO PSEO Schema
-- Migration: 003_pseo_schema.sql
-- Schema: pseo (separate from public schema)
-- Run in: Supabase SQL Editor
-- ============================================

-- ============================================
-- Step 1.1: Create the pseo schema
-- ============================================

CREATE SCHEMA IF NOT EXISTS pseo;

-- ============================================
-- Step 1.2: pseo.locations table
-- ============================================

CREATE TABLE IF NOT EXISTS pseo.locations (
  id SERIAL PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  country_ar TEXT NOT NULL,
  country_code TEXT NOT NULL,
  region TEXT,
  region_ar TEXT,
  location_type TEXT NOT NULL CHECK (location_type IN ('city', 'country', 'region')),
  population INTEGER DEFAULT 0,
  search_volume_estimate INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 50 CHECK (priority >= 1 AND priority <= 100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pseo_locations_priority ON pseo.locations(priority DESC, search_volume_estimate DESC);
CREATE INDEX IF NOT EXISTS idx_pseo_locations_country ON pseo.locations(country_code);
CREATE INDEX IF NOT EXISTS idx_pseo_locations_type ON pseo.locations(location_type);
CREATE INDEX IF NOT EXISTS idx_pseo_locations_active ON pseo.locations(is_active);

-- ============================================
-- Step 1.3: pseo.niches table
-- ============================================

CREATE TABLE IF NOT EXISTS pseo.niches (
  id SERIAL PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  pillar_type TEXT NOT NULL CHECK (pillar_type IN ('primary', 'secondary', 'tertiary')),
  description TEXT,
  search_volume_estimate INTEGER DEFAULT 0,
  intent_types TEXT[] NOT NULL DEFAULT '{}',
  priority INTEGER DEFAULT 50 CHECK (priority >= 1 AND priority <= 100),
  icon_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pseo_niches_priority ON pseo.niches(priority DESC);
CREATE INDEX IF NOT EXISTS idx_pseo_niches_active ON pseo.niches(is_active);

-- ============================================
-- Step 1.4: pseo.content_queue table
-- ============================================

CREATE TABLE IF NOT EXISTS pseo.content_queue (
  id SERIAL PRIMARY KEY,
  location_id INTEGER REFERENCES pseo.locations(id) ON DELETE CASCADE,
  niche_id INTEGER REFERENCES pseo.niches(id) ON DELETE CASCADE,
  intent TEXT NOT NULL CHECK (intent IN ('commercial', 'informational', 'how-to', 'comparison', 'navigational')),
  format TEXT NOT NULL CHECK (format IN ('service-page', 'guide', 'comparison', 'list', 'tool', 'glossary', 'hub', 'blog', 'geo', 'case-study')),
  url_slug TEXT NOT NULL UNIQUE,
  target_keyword_ar TEXT NOT NULL,
  target_keyword_en TEXT NOT NULL,
  search_volume INTEGER DEFAULT 0,
  keyword_difficulty INTEGER DEFAULT 50,
  priority_score DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed', 'skipped')),
  scheduled_date DATE,
  generated_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 100),
  word_count INTEGER,
  generation_attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pseo_queue_priority ON pseo.content_queue(status, priority_score DESC, scheduled_date ASC);
CREATE INDEX IF NOT EXISTS idx_pseo_queue_location ON pseo.content_queue(location_id);
CREATE INDEX IF NOT EXISTS idx_pseo_queue_niche ON pseo.content_queue(niche_id);
CREATE INDEX IF NOT EXISTS idx_pseo_queue_status ON pseo.content_queue(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pseo_queue_unique_combo ON pseo.content_queue(location_id, niche_id, intent, format);

-- ============================================
-- Step 1.5: pseo.published_pages table
-- ============================================

CREATE TABLE IF NOT EXISTS pseo.published_pages (
  id SERIAL PRIMARY KEY,
  queue_id INTEGER REFERENCES pseo.content_queue(id) ON DELETE SET NULL UNIQUE,
  url_path TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  meta_description_ar TEXT NOT NULL,
  h1_ar TEXT NOT NULL,
  content_json JSONB NOT NULL,
  intro_text TEXT,
  sections JSONB,
  benefits JSONB,
  faqs JSONB,
  local_stats JSONB,
  expert_quotes JSONB,
  canonical_url TEXT,
  schema_json JSONB,
  internal_links JSONB DEFAULT '[]'::jsonb,
  related_pages JSONB DEFAULT '[]'::jsonb,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 100),
  word_count INTEGER,
  is_published BOOLEAN DEFAULT false,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pseo_published_url ON pseo.published_pages(url_path);
CREATE INDEX IF NOT EXISTS idx_pseo_published_quality ON pseo.published_pages(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_pseo_published_date ON pseo.published_pages(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pseo_published_status ON pseo.published_pages(is_published);

-- ============================================
-- Step 1.6: pseo.generation_logs table
-- ============================================

CREATE TABLE IF NOT EXISTS pseo.generation_logs (
  id SERIAL PRIMARY KEY,
  queue_id INTEGER REFERENCES pseo.content_queue(id) ON DELETE SET NULL,
  batch_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'timeout', 'partial')),
  error_message TEXT,
  api_tokens_used INTEGER DEFAULT 0,
  generation_time_seconds INTEGER DEFAULT 0,
  deepseek_call_1_tokens INTEGER DEFAULT 0,
  deepseek_call_2_tokens INTEGER DEFAULT 0,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pseo_logs_batch ON pseo.generation_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_pseo_logs_status ON pseo.generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_pseo_logs_created ON pseo.generation_logs(created_at DESC);

-- ============================================
-- Step 1.7: pseo.keywords table
-- ============================================

CREATE TABLE IF NOT EXISTS pseo.keywords (
  id SERIAL PRIMARY KEY,
  keyword_ar TEXT NOT NULL,
  keyword_en TEXT,
  niche_id INTEGER REFERENCES pseo.niches(id) ON DELETE SET NULL,
  location_id INTEGER REFERENCES pseo.locations(id) ON DELETE SET NULL,
  intent TEXT CHECK (intent IN ('commercial', 'informational', 'how-to', 'comparison', 'navigational')),
  search_volume INTEGER DEFAULT 0,
  keyword_difficulty INTEGER DEFAULT 50,
  cpc_estimate DECIMAL(10, 2),
  url_path TEXT,
  ranking_position INTEGER,
  ranking_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pseo_keyword_niche ON pseo.keywords(niche_id);
CREATE INDEX IF NOT EXISTS idx_pseo_keyword_location ON pseo.keywords(location_id);
CREATE INDEX IF NOT EXISTS idx_pseo_keyword_volume ON pseo.keywords(search_volume DESC);

-- ============================================
-- Step 1.8: Database Functions
-- ============================================

-- Function: Get next batch of highest-priority items
CREATE OR REPLACE FUNCTION pseo.get_next_batch(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
  queue_id INTEGER,
  location_slug TEXT,
  location_name_ar TEXT,
  location_name_en TEXT,
  country_code TEXT,
  country_ar TEXT,
  niche_slug TEXT,
  niche_name_ar TEXT,
  niche_name_en TEXT,
  intent TEXT,
  format TEXT,
  target_keyword_ar TEXT,
  target_keyword_en TEXT,
  priority_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cq.id AS queue_id,
    l.slug AS location_slug,
    l.name_ar AS location_name_ar,
    l.name_en AS location_name_en,
    l.country_code,
    l.country_ar,
    n.slug AS niche_slug,
    n.name_ar AS niche_name_ar,
    n.name_en AS niche_name_en,
    cq.intent,
    cq.format,
    cq.target_keyword_ar,
    cq.target_keyword_en,
    cq.priority_score
  FROM pseo.content_queue cq
  JOIN pseo.locations l ON cq.location_id = l.id
  JOIN pseo.niches n ON cq.niche_id = n.id
  WHERE cq.status = 'pending'
    AND l.is_active = true
    AND n.is_active = true
    AND (cq.scheduled_date IS NULL OR cq.scheduled_date <= CURRENT_DATE)
  ORDER BY cq.priority_score DESC, cq.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Recalculate priority scores for all pending items
CREATE OR REPLACE FUNCTION pseo.recalculate_priorities()
RETURNS VOID AS $$
BEGIN
  UPDATE pseo.content_queue cq
  SET priority_score = (
    COALESCE(cq.search_volume, 10)::DECIMAL /
    GREATEST(COALESCE(cq.keyword_difficulty, 50), 1)::DECIMAL
  ) * (
    SELECT priority FROM pseo.locations WHERE id = cq.location_id
  )::DECIMAL / 100.0
  * CASE
    WHEN cq.intent = 'commercial' THEN 1.0
    WHEN cq.intent = 'comparison' THEN 0.8
    WHEN cq.intent = 'how-to' THEN 0.6
    WHEN cq.intent = 'informational' THEN 0.4
    WHEN cq.intent = 'navigational' THEN 0.3
    ELSE 0.5
  END
  * CASE
    WHEN cq.format = 'service-page' THEN 1.0
    WHEN cq.format = 'comparison' THEN 0.8
    WHEN cq.format = 'guide' THEN 0.6
    WHEN cq.format = 'list' THEN 0.5
    WHEN cq.format = 'tool' THEN 0.7
    WHEN cq.format = 'hub' THEN 0.9
    WHEN cq.format = 'blog' THEN 0.4
    WHEN cq.format = 'geo' THEN 0.75
    WHEN cq.format = 'case-study' THEN 0.65
    WHEN cq.format = 'glossary' THEN 0.3
    ELSE 0.5
  END
  WHERE cq.status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 1.9: Add PSEO referral tracking columns
-- to existing public.users table
-- ============================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pseo_referrer TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pseo_pillar TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pseo_location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pseo_subtopic TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- ============================================
-- Step 1.10: RLS Policies for PSEO Schema
-- ============================================

-- PSEO data is publicly readable (unlike app data which requires auth)
ALTER TABLE pseo.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pseo.niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pseo.content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE pseo.published_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pseo.generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pseo.keywords ENABLE ROW LEVEL SECURITY;

-- Published pages: public SELECT (anyone can read)
CREATE POLICY "pseo_published_pages_select_public" ON pseo.published_pages
  FOR SELECT USING (true);

-- Locations: public SELECT
CREATE POLICY "pseo_locations_select_public" ON pseo.locations
  FOR SELECT USING (true);

-- Niches: public SELECT
CREATE POLICY "pseo_niches_select_public" ON pseo.niches
  FOR SELECT USING (true);

-- Content queue: service role only (no public access)
CREATE POLICY "pseo_queue_service_role" ON pseo.content_queue
  FOR ALL USING (false);

-- Generation logs: service role only
CREATE POLICY "pseo_logs_service_role" ON pseo.generation_logs
  FOR ALL USING (false);

-- Keywords: service role only
CREATE POLICY "pseo_keywords_service_role" ON pseo.keywords
  FOR ALL USING (false);
