-- ============================================
-- WasafSEO PSEO — Public Schema Views
-- Migration: 005_pseo_views.sql
-- Purpose: Expose pseo.* tables via public schema views
--          so PostgREST can access them without schema config.
-- ============================================
--
-- PROBLEM:
--   createPSEOAdminClient() uses `db: { schema: 'pseo' }` which sends
--   Accept-Profile: pseo header. PostgREST returns 406 "Invalid schema"
--   because `pseo` is not in its exposed schemas list.
--
--   Modern Supabase manages PostgREST config via infrastructure layer
--   (not database tables), so there is no SQL to add pseo to the
--   extra_search_path.
--
-- SOLUTION:
--   Create views in the `public` schema that mirror pseo.* tables.
--   The Supabase JS client defaults to `public` schema, so queries
--   against these views work without any schema configuration.
--
--   Table references in code change from:
--     .from('published_pages')    → .from('pseo_published_pages')
--     .from('content_queue')      → .from('pseo_content_queue')
--     .from('generation_logs')    → .from('pseo_generation_logs')
--     .from('locations')          → .from('pseo_locations')
--     .from('niches')             → .from('pseo_niches')
--     .from('keywords')           → .from('pseo_keywords')
--     .rpc('get_next_batch')      → .rpc('pseo_get_next_batch')
--
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- View 1: pseo_published_pages
-- ============================================
CREATE OR REPLACE VIEW public.pseo_published_pages AS
  SELECT * FROM pseo.published_pages;

-- ============================================
-- View 2: pseo_locations
-- ============================================
CREATE OR REPLACE VIEW public.pseo_locations AS
  SELECT * FROM pseo.locations;

-- ============================================
-- View 3: pseo_niches
-- ============================================
CREATE OR REPLACE VIEW public.pseo_niches AS
  SELECT * FROM pseo.niches;

-- ============================================
-- View 4: pseo_content_queue
-- ============================================
CREATE OR REPLACE VIEW public.pseo_content_queue AS
  SELECT * FROM pseo.content_queue;

-- ============================================
-- View 5: pseo_generation_logs
-- ============================================
CREATE OR REPLACE VIEW public.pseo_generation_logs AS
  SELECT * FROM pseo.generation_logs;

-- ============================================
-- View 6: pseo_keywords
-- ============================================
CREATE OR REPLACE VIEW public.pseo_keywords AS
  SELECT * FROM pseo.keywords;

-- ============================================
-- Wrapper Function: pseo_get_next_batch
-- ============================================
-- The original function pseo.get_next_batch() is in the pseo schema.
-- This wrapper in the public schema delegates to it so the Supabase
-- JS client can call it via .rpc('pseo_get_next_batch', ...).
CREATE OR REPLACE FUNCTION public.pseo_get_next_batch(p_limit INTEGER DEFAULT 100)
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
  SELECT * FROM pseo.get_next_batch(p_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grant Permissions on Views
-- ============================================

-- Public views need SELECT for anon/authenticated (published pages are public)
GRANT SELECT ON public.pseo_published_pages TO anon;
GRANT SELECT ON public.pseo_published_pages TO authenticated;
GRANT ALL ON public.pseo_published_pages TO service_role;

GRANT SELECT ON public.pseo_locations TO anon;
GRANT SELECT ON public.pseo_locations TO authenticated;
GRANT ALL ON public.pseo_locations TO service_role;

GRANT SELECT ON public.pseo_niches TO anon;
GRANT SELECT ON public.pseo_niches TO authenticated;
GRANT ALL ON public.pseo_niches TO service_role;

-- Content queue, generation logs, keywords are service_role only
GRANT ALL ON public.pseo_content_queue TO service_role;
GRANT ALL ON public.pseo_generation_logs TO service_role;
GRANT ALL ON public.pseo_keywords TO service_role;

-- Wrapper function: service_role only (called by scripts and admin)
GRANT EXECUTE ON FUNCTION public.pseo_get_next_batch TO service_role;

-- ============================================
-- Verification Query (Run After Migration)
-- ============================================
--
-- Run these queries to verify the views work:
--
--   SELECT * FROM public.pseo_locations LIMIT 5;
--   SELECT * FROM public.pseo_niches LIMIT 5;
--   SELECT * FROM public.pseo_published_pages LIMIT 5;
--   SELECT * FROM public.pseo_content_queue LIMIT 5;
--   SELECT * FROM public.pseo_generation_logs LIMIT 5;
--   SELECT * FROM public.pseo_keywords LIMIT 5;
--   SELECT * FROM public.pseo_get_next_batch(5);
--
-- If all return results (even empty), the views work correctly.
