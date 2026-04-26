# 🚀 WasafSEO PSEO System — Complete Implementation Guide

> **Target:** 100,000+ Arabic SEO content pages | Zero modifications to existing app code
> **Codebase:** `d:/WasafSEO/wasafseo/`
> **Strategy Reference:** [`Wasaf pseo Mega plan.md`](../Wasaf%20pseo%20Mega%20plan.md)
> **App Summary:** [`WasafSEO ai web application Complete summary.md`](../WasafSEO%20ai%20web%20application%20Complete%20summary.md)

---

## 📋 TABLE OF CONTENTS

- [PART 1: PRE-BUILD PREPARATION](#part-1-pre-build-preparation)
  - [P1.1 Environment & Project Assessment](#p11-environment--project-assessment)
  - [P1.2 Supabase Setup (Same Project, New Schema)](#p12-supabase-setup-same-project-new-schema)
  - [P1.3 Environment Variables & Secrets](#p13-environment-variables--secrets)
  - [P1.4 GitHub Repository Configuration](#p14-github-repository-configuration)
  - [P1.5 Vercel Configuration Updates](#p15-vercel-configuration-updates)
  - [P1.6 Install Required Dependencies](#p16-install-required-dependencies)
  - [P1.7 Create Directory Structure](#p17-create-directory-structure)
  - [P1.8 Critical Rules Checklist (Read Before Build)](#p18-critical-rules-checklist-read-before-build)
- [PART 2: PHASE-BY-PHASE BUILD](#part-2-phase-by-phase-build)
  - [Phase 1: Database Migration & Schema](#phase-1-database-migration--schema)
  - [Phase 2: TypeScript Types & Lib Utilities](#phase-2-typescript-types--lib-utilities)
  - [Phase 3: Seed Data Files](#phase-3-seed-data-files)
  - [Phase 4: Seed Scripts (Locations, Niches, Queue)](#phase-4-seed-scripts-locations-niches-queue)
  - [Phase 5: Generation Engine Scripts](#phase-5-generation-engine-scripts)
  - [Phase 6: Frontend Routes & Components](#phase-6-frontend-routes--components)
  - [Phase 7: Sitemaps & SEO Infrastructure](#phase-7-sitemaps--seo-infrastructure)
  - [Phase 8: GitHub Actions Automation](#phase-8-github-actions-automation)
  - [Phase 9: Analytics & Referral Tracking](#phase-9-analytics--referral-tracking)
  - [Phase 10: Quality Assurance & Testing](#phase-10-quality-assurance--testing)
  - [Phase 11: Launch Sequence](#phase-11-launch-sequence)
- [Complete File Manifest](#complete-file-manifest)
- [Roo Code Prompts for Each Phase](#roo-code-prompts-for-each-phase)

---

# PART 1: PRE-BUILD PREPARATION

## P1.1 Environment & Project Assessment

### Step 1: Verify Current Project State

Before any build work, confirm these facts about the existing project at `d:/WasafSEO/wasafseo/`:

| Check                | Current State                                 | Action Required                       |
| -------------------- | --------------------------------------------- | ------------------------------------- |
| **Next.js Version**  | 16.2.4                                        | ✅ Compatible with ISR                |
| **Supabase Project** | Existing at `wasafseo.wasleen.com`            | Use same project, add `pseo` schema   |
| **Supabase Tables**  | `users`, `websites`, `briefs`, `usage`        | Do NOT modify these                   |
| **Auth System**      | Auth.js v5 (Google OAuth + Resend Magic Link) | PSEO routes are PUBLIC                |
| **Middleware**       | Protects only `/dashboard/*`                  | PSEO routes auto-public               |
| **Sitemap**          | Static, 2 URLs only                           | Will add PSEO sitemaps                |
| **Robots.txt**       | Allows only `/`, `/pricing`                   | Must update for PSEO pages            |
| **Deepseek API**     | Already configured in `src/lib/deepseek.ts`   | PSEO scripts call Deepseek DIRECTLY   |
| **Existing Prompts** | `src/lib/prompts.ts`                          | NEVER modify — extend with PSEO layer |
| **Vercel Config**    | `maxDuration: 60s` for generate route         | Add PSEO routes config                |

### Step 2: Verify Environment Variables Exist

Check that these variables are already set in `.env.local` (for the existing app):

```
NEXTAUTH_URL
NEXTAUTH_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DEEPSEEK_API_KEY
```

**PSEO-specific** — may need to be added if not present:

```
VERCEL_REVALIDATION_TOKEN    # For on-demand ISR revalidation
```

### Step 3: Verify Supabase Access

1. Log into [Supabase Dashboard](https://supabase.com)
2. Select the project for `wasafseo.wasleen.com`
3. Go to **SQL Editor**
4. Run a test query: `SELECT * FROM information_schema.tables WHERE table_schema = 'public'`
5. Verify you can see: `users`, `websites`, `briefs`, `usage`
6. Note the **Project Settings → Database → Connection string** (for reference)
7. Verify **Project Settings → API → Project API keys** (anon key and service_role key)

### Step 4: Verify GitHub Repository Access

1. Ensure the project is pushed to GitHub
2. Verify you can access **Settings → Secrets and variables → Actions**
3. Confirm these secrets exist (or note to add them):
   - `DEEPSEEK_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VERCEL_REVALIDATION_TOKEN`
   - `NEXT_PUBLIC_APP_URL`

---

## P1.2 Supabase Setup (Same Project, New Schema)

### Decision: Same Project, New Schema

The PSEO data lives in the **same Supabase project** as the main app, but in a **separate `pseo` schema**. This gives us:

- ✅ Single backup/management
- ✅ Logical isolation from app data
- ✅ No cross-contamination of RLS policies
- ✅ Can reference `public.users` for referral tracking
- ❌ Not a separate billing entity

### Step 1: Create the `pseo` Schema

In Supabase SQL Editor, run:

```sql
CREATE SCHEMA IF NOT EXISTS pseo;
```

### Step 2: Verify Schema Creation

```sql
SELECT * FROM information_schema.schemata WHERE schema_name = 'pseo';
```

### Step 3: Note Service Role Key Access

The PSEO generation scripts use `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS. This is the **same service role key** the main app uses. It can access both the `public` schema (existing app data) and the `pseo` schema (PSEO data).

---

## P1.3 Environment Variables & Secrets

### Local Development (`.env.local`)

Ensure `.env.local` has these variables (add any missing ones):

```
# Existing (verify present)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<existing>
NEXT_PUBLIC_SUPABASE_URL=<existing>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<existing>
SUPABASE_SERVICE_ROLE_KEY=<existing>
DEEPSEEK_API_KEY=<existing>

# PSEO-specific (add if missing)
VERCEL_REVALIDATION_TOKEN=<generate-a-random-token>
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### GitHub Secrets

Add these to **GitHub → Settings → Secrets and variables → Actions → Secrets**:

```
DEEPSEEK_API_KEY           → Same as local
SUPABASE_URL               → Same as NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY  → Same as local
VERCEL_REVALIDATION_TOKEN  → Same as generated above
NEXT_PUBLIC_APP_URL        → https://wasafseo.wasleen.com
```

---

## P1.4 GitHub Repository Configuration

### Step 1: Verify Repository

```bash
cd d:/WasafSEO/wasafseo
git remote -v
# Should show: origin  https://github.com/your-org/wasafseo.git (or similar)
```

### Step 2: Add Secrets to GitHub

Navigate to: `https://github.com/{owner}/{repo}/settings/secrets/actions`

Click **"New repository secret"** and add each variable from [P1.3](#p13-environment-variables--secrets).

### Step 3: Verify GitHub Actions Are Enabled

Go to **Settings → Actions → General**

- Ensure "Allow all actions and reusable workflows" is checked
- Ensure "Workflow permissions" has "Read and write permissions" checked

---

## P1.5 Vercel Configuration Updates

### Step 1: Current `vercel.json`

```json
{
  "functions": {
    "src/app/api/generate/route.ts": { "maxDuration": 60 },
    "src/app/api/export/pdf/route.ts": { "maxDuration": 30 }
  },
  "headers": [
    {
      "source": "/api/webhooks/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "no-store" }]
    }
  ]
}
```

### Step 2: Add PSEO Revalidation API Route Config

The PSEO system needs a lightweight revalidation API. This runs as a serverless function:

```json
{
  "functions": {
    "src/app/api/generate/route.ts": { "maxDuration": 60 },
    "src/app/api/export/pdf/route.ts": { "maxDuration": 30 },
    "src/app/api/pseo/revalidate/route.ts": { "maxDuration": 10 }
  },
  "headers": [
    {
      "source": "/api/webhooks/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "no-store" }]
    },
    {
      "source": "/api/pseo/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "no-store" }]
    }
  ]
}
```

### Step 3: Vercel ISR Notes

- PSEO dynamic pages use `revalidate = 604800` (7 days)
- Newly generated pages are immediately available via ISR (first request triggers build)
- On-demand revalidation via the API route for immediate updates
- No Vercel plan upgrade needed — ISR is included in Pro plan

---

## P1.6 Install Required Dependencies

No new npm packages are required. The PSEO system reuses:

- `@supabase/supabase-js` — already installed
- `next` — already installed
- `typescript` — already installed
- `tsx` — needed for running scripts locally: `npm install -D tsx`

Install tsx:

```bash
cd d:/WasafSEO/wasafseo
npm install -D tsx
```

---

## P1.7 Create Directory Structure

Create these directories (they don't exist yet):

```
src/lib/pseo/          → PSEO library utilities
src/components/pseo/   → PSEO frontend components
src/app/(pseo)/        → PSEO route group (isolated from existing routes)
scripts/pseo/          → PSEO generation scripts
scripts/pseo/data/     → Seed data JSON files
.github/workflows/     → GitHub Actions workflows
```

Run these commands:

```bash
cd d:/WasafSEO/wasafseo
mkdir -p src/lib/pseo
mkdir -p src/components/pseo
mkdir -p src/app/\(pseo\)/\[pillar\]/\[location\]/\[\[...subtopic\]\]
mkdir -p scripts/pseo/data
mkdir -p .github/workflows
```

---

## P1.8 Critical Rules Checklist (Read Before Build)

### 🚫 NEVER DO THESE

1. **NEVER modify** `src/lib/prompts.ts` — The existing prompts are sacred
2. **NEVER modify** `src/lib/deepseek.ts` — The generation API wrapper is untouchable
3. **NEVER modify** existing Supabase tables (`users`, `websites`, `briefs`, `usage`)
4. **NEVER delete** or rename existing files
5. **NEVER change** existing middleware behavior (it already allows public routes through)
6. **NEVER change** existing RLS policies
7. **NEVER change** the existing sitemap structure — add PSEO sitemaps as separate entries

### ✅ ALWAYS DO THESE

1. **ALWAYS** put PSEO routes in `src/app/(pseo)/` route group
2. **ALWAYS** put PSEO components in `src/components/pseo/`
3. **ALWAYS** put PSEO types in `src/types/pseo.ts` (new file)
4. **ALWAYS** use the `pseo` database schema for PSEO tables
5. **ALWAYS** call Deepseek directly in PSEO scripts (not through `/api/generate`)
6. **ALWAYS** import existing prompts as-is and extend with PSEO context
7. **ALWAYS** use `SUPABASE_SERVICE_ROLE_KEY` for PSEO database operations
8. **ALWAYS** verify each phase builds successfully before moving to next

---

# PART 2: PHASE-BY-PHASE BUILD

## Phase 1: Database Migration & Schema

### File to Create: `supabase/migrations/002_pseo_schema.sql`

> **Note:** The existing migration is `001_initial_schema.sql`. This is `002`.

### Step 1.1 — Create the PSEO Schema

```sql
-- ============================================
-- WasafSEO PSEO Schema
-- Migration: 002_pseo_schema.sql
-- Schema: pseo (separate from public schema)
-- Run in: Supabase SQL Editor
-- ============================================

CREATE SCHEMA IF NOT EXISTS pseo;
```

### Step 1.2 — Create `pseo.locations` Table

```sql
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
```

### Step 1.3 — Create `pseo.niches` Table

```sql
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
```

### Step 1.4 — Create `pseo.content_queue` Table

```sql
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
```

### Step 1.5 — Create `pseo.published_pages` Table

```sql
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
```

### Step 1.6 — Create `pseo.generation_logs` Table

```sql
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
```

### Step 1.7 — Create `pseo.keywords` Table

```sql
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
```

### Step 1.8 — Create Database Functions

```sql
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
```

```sql
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
```

```sql
-- Function: Add PSEO referral tracking columns to existing users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pseo_referrer TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pseo_pillar TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pseo_location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pseo_subtopic TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
```

### Step 1.9 — Set RLS Policies for PSEO Schema

```sql
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
```

### Step 1.10 — Run This Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire SQL from steps 1.1 through 1.9
3. Execute the SQL
4. Verify: `SELECT * FROM information_schema.tables WHERE table_schema = 'pseo'`
5. Should return 6 tables

---

## Phase 2: TypeScript Types & Lib Utilities

### File to Create: `src/types/pseo.ts`

This file defines ALL TypeScript interfaces for the PSEO system. It does NOT modify `src/types/index.ts`.

**Content structure** (what to include):

```
1. Union type: PSEOIntent, PSEOFormat, PSEOStatus, PSEOLocationType, PSEOPillarType
2. Interface: PSEOLocation
3. Interface: PSEONiche
4. Interface: PSEOQueueItem
5. Interface: PSEOPublishedPage
6. Interface: PSEOPageContent (sections, benefits, FAQs, stats, quotes, CTAs)
7. Interface: PSEOGenerationLog
8. Interface: PSEOKeyword
9. Interface: PSEOBatchResult
10. Interface: PSEOGenerationConfig
11. Interface: PSEOHubSpokeRule
12. Interface: PSEOAnalytics
```

### File to Create: `src/lib/pseo/supabase.ts`

Creates a Supabase admin client configured for the `pseo` schema. This uses the same `SUPABASE_SERVICE_ROLE_KEY` as the main app.

**Key points:**

- Uses `createAdminClient()` or creates a new one pointing to `pseo` schema
- All PSEO operations use service role (bypasses RLS)
- Used by both frontend (SSR) and backend scripts

### File to Create: `src/lib/pseo/queries.ts`

Database query functions for fetching PSEO data:

| Function                                    | Purpose                        | Used By                   |
| ------------------------------------------- | ------------------------------ | ------------------------- |
| `getPublishedPage(urlPath)`                 | Fetch single page by URL path  | Frontend page component   |
| `getPublishedPageByQueueId(queueId)`        | Fetch page by queue reference  | Generation script         |
| `getPublishedPagesByPillar(pillarSlug)`     | List all pages for a pillar    | Sitemaps, hub pages       |
| `getPublishedPagesByLocation(locationSlug)` | List all pages for a location  | Hub pages, internal links |
| `getRelatedPages(pageId, limit)`            | Find related pages for linking | Internal linking section  |
| `getHubPage(pillarSlug, locationSlug)`      | Fetch hub page                 | Hub page routing          |
| `getBatchForGeneration(limit)`              | Call `pseo.get_next_batch()`   | Generation script         |
| `getPSEOStats()`                            | Aggregated statistics          | Analytics dashboard       |
| `countPublishedPages()`                     | Total published count          | Sitemaps                  |
| `insertPublishedPage(data)`                 | Insert generated page          | Generation script         |
| `updateQueueItemStatus(id, status)`         | Update queue after generation  | Generation script         |
| `insertGenerationLog(data)`                 | Log generation result          | Generation script         |

### File to Create: `src/lib/pseo/utils.ts`

Utility functions:

| Function                                                                       | Purpose                                                    |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `buildUrlPath(pillar, location, subtopic?)`                                    | Build URL from params → `/services/content-writing/riyadh` |
| `parseUrlPath(urlPath)`                                                        | Parse URL into `{pillar, location, subtopic}` components   |
| `calculateQualityScore(page)`                                                  | Quality scoring (see Mega Plan §Quality Scoring Formula)   |
| `generateInternalLinks(page, relatedPages)`                                    | Auto-generate 8-15 internal links                          |
| `slugifyArabic(text)`                                                          | Arabic-safe slug generation                                |
| `getLocationData(locationSlug)`                                                | Get location metadata for prompt injection                 |
| `getPriorityScore(searchVolume, difficulty, locationPriority, intent, format)` | Calculate priority score                                   |
| `chunkArray(array, size)`                                                      | Split array into chunks (for sitemaps)                     |
| `getPillarFromSlug(slug)`                                                      | Map slug to pillar config                                  |
| `getFormatForIntent(intent)`                                                   | Determine best format for intent                           |
| `getColumnRefForIntent(intent)`                                                | Helper for database queries                                |

---

## Phase 3: Seed Data Files

### File to Create: `scripts/pseo/data/locations.json`

A JSON array of 346 location objects. Each object has:

```json
{
  "name_ar": "الرياض",
  "name_en": "Riyadh",
  "slug": "riyadh",
  "country": "saudi-arabia",
  "country_ar": "المملكة العربية السعودية",
  "country_code": "SA",
  "region": "Riyadh Province",
  "region_ar": "منطقة الرياض",
  "location_type": "city",
  "population": 7700000,
  "search_volume_estimate": 24000,
  "priority": 100
}
```

**Priority tier system:**

- **Tier 0** (priority: 100, 10 cities): Riyadh, Jeddah, Dubai, Abu Dhabi, Cairo, Doha, Kuwait City, Manama, Muscat, Amman
- **Tier 1** (priority: 80, 20 cities): Dammam, Khobar, Mecca, Medina, Sharjah, Al Ain, Alexandria, Giza, Sohar, Salalah, etc.
- **Tier 2** (priority: 60, 30 cities): Major cities from all 17 countries
- **Tier 3** (priority: 40, 50 cities): Mid-tier cities
- **Tier 4** (priority: 25, ~165 cities): All remaining cities

**Data source:** [`WasafSEO ai web application Complete summary.md`](../WasafSEO%20ai%20web%20application%20Complete%20summary.md) §Section 5

### File to Create: `scripts/pseo/data/niches.json`

A JSON array of 30 niche objects. Each object has:

```json
{
  "name_ar": "كتابة المحتوى",
  "name_en": "Content Writing",
  "slug": "content-writing",
  "pillar_type": "primary",
  "description": "Arabic SEO content writing services and guides",
  "search_volume_estimate": 2500000,
  "intent_types": ["commercial", "how-to", "informational", "comparison"],
  "priority": 100,
  "icon_name": "FileText"
}
```

**10 Primary Niches:**

1. content-writing (كتابة المحتوى) — P0
2. seo-services (تحسين محركات البحث) — P0
3. geo-aio (تحسين البحث الذكي GEO/AIO) — P0
4. jsonld-schema (شيفرة Schema) — P1
5. content-marketing (التسويق بالمحتوى) — P0
6. keyword-research (تحليل الكلمات المفتاحية) — P0
7. ecommerce-seo (تحسين المتاجر الإلكترونية) — P1
8. content-strategy (استراتيجية المحتوى) — P1
9. seo-tools (أدوات السيو) — P0
10. article-writing (كتابة المقالات) — P0

**20 Sub-Niches:**
local-seo, technical-seo, link-building, seo-consulting, video-seo, voice-search-seo, mobile-seo, international-seo, saas-content, b2b-content, social-media-content, seo-audit, competitor-analysis, content-calendar, content-roi, schema-markup, eeat-optimization, readability, content-distribution, content-repurposing

---

## Phase 4: Seed Scripts

### File to Create: `scripts/pseo/seed-locations.ts`

**Purpose:** Read `data/locations.json` and insert all 346 locations into `pseo.locations`.

**Implementation:**

1. Import Supabase admin client (using `SUPABASE_SERVICE_ROLE_KEY`)
2. Read and parse `data/locations.json`
3. Use upsert pattern: `supabase.from('locations').upsert(data, { onConflict: 'slug', ignoreDuplicates: false })`
4. Schema-qualified: Use `{ schema: 'pseo' }` option
5. Log success/failure for each batch of 50
6. Verify count: `SELECT COUNT(*) FROM pseo.locations` — should be 346

**Execution:**

```bash
cd d:/WasafSEO/wasafseo
npx tsx scripts/pseo/seed-locations.ts
```

### File to Create: `scripts/pseo/seed-niches.ts`

**Purpose:** Read `data/niches.json` and insert all 30 niches into `pseo.niches`.

**Implementation:**

1. Same pattern as seed-locations
2. Upsert on `slug` column
3. Verify count: `SELECT COUNT(*) FROM pseo.niches` — should be 30

### File to Create: `scripts/pseo/generate-queue.ts`

**Purpose:** Generate the initial content queue by cross-referencing locations × niches × intents.

**Algorithm:**

```
for each location in pseo.locations (where is_active = true):
  for each niche in pseo.niches (where is_active = true):
    for each intent in niche.intent_types:
      for each format in getFormatsForIntent(intent):
        generate queue item with:
          - url_slug = buildUrlPath(niche.slug, location.slug, format)
          - target_keyword_ar = buildArabicKeyword(niche, location, intent, format)
          - target_keyword_en = buildEnglishKeyword(niche, location, intent, format)
          - search_volume = location.search_volume_estimate * modifier
          - keyword_difficulty = getDifficulty(niche, location)
          - priority_score = calculatePriorityScore(...)
          - status = 'pending'
```

**Priority Generation Order:**

1. Tier 0 cities (10 cities) × 10 primary niches × 5 intents = 500 items
2. Tier 1 cities (20 cities) × 10 primary niches × 3 intents = 600 items
3. Tier 2+ cities × primary niches × commercial/high-intent first

**Upsert Pattern:** Use the unique composite index to avoid duplicates.

**Execution:**

```bash
cd d:/WasafSEO/wasafseo
npx tsx scripts/pseo/generate-queue.ts --count 10000
```

---

## Phase 5: Generation Engine Scripts

### File to Create: `src/lib/pseo/pseo-prompt-extensions.ts`

**Purpose:** PSEO-specific prompt additions that get LAYERED ON TOP of existing prompts (never replacing them).

**Key functions:**

```typescript
// Builds the PSEO-specific user message extension
export function buildPSEOUserMessageExtension(params: {
  location: PSEOLocation;
  niche: PSEONiche;
  intent: string;
  format: string;
  targetKeywordAr: string;
  targetKeywordEn: string;
}): string {
  // Returns PSEO-specific instructions including:
  // - Location data injection (city name, country, regional stats)
  // - Format-specific output rules
  // - Quality requirements
  // - CTA requirements (link to WasafSEO signup)
  // - Internal linking requirements
  // - Schema requirements
}

// Builds the PSEO system prompt supplement
export function buildPSEOContentSystemSupplement(): string {
  // Returns additional system instructions:
  // - "This content is for WasafSEO's own website"
  // - "Every page must include a CTA to sign up for WasafSEO"
  // - "Include real location-specific data"
  // - "Quality must be 85+/100"
  // - "Anti-hallucination rules"
}

// Builds PSEO schema supplement
export function buildPSEOSchemaSystemSupplement(): string {
  // Returns schema-specific instructions:
  // - "Use wasafseo.wasleen.com as the domain"
  // - "Include Organization, WebSite, WebPage, Article, FAQPage nodes"
  // - "inLanguage must be 'ar'"
  // - "Generate realistic statistics with [SOURCE: verify] flags"
}
```

### File to Create: `scripts/pseo/generate-pseo-content.ts`

**Purpose:** THE MAIN GENERATION SCRIPT. This is the most critical file.

**Architecture:**

```
1. Parse CLI arguments (--limit, --batch-id, --dry-run)
2. Generate a batch ID (YYYYMMDD-HHMMSS)
3. Fetch batch: call pseo.get_next_batch(limit) via Supabase
4. For each queue item:
   a. Load location + niche data
   b. Build PSEO-extended prompts:
      - systemPrompt = buildContentSystemPrompt() + buildPSEOContentSystemSupplement()
      - userMessage = buildContentUserMessage({...PSEO params}) + buildPSEOUserMessageExtension({...})
   c. CALL DEEPSEEK DIRECTLY (not through /api/generate):
      - Same callDeepseek() logic as src/lib/deepseek.ts
      - max_tokens: 8000, temperature: 0.7
   d. Parse & validate JSON response
   e. Calculate quality score
   f. If quality < 75: regenerate (max 2 retries)
   g. Call Deepseek Call 2 for Schema:
      - systemPrompt = buildSchemaSystemPrompt() + buildPSEOSchemaSystemSupplement()
      - userMessage = buildSchemaUserMessage({...}) + PSEO extension
      - max_tokens: 4000, temperature: 0.3
   h. Transform brief → landing page content structure
   i. Insert into pseo.published_pages
   j. Update queue item status to 'completed'
   k. Insert generation log
5. Return summary: { total, succeeded, failed, skipped }
```

**Critical Design Decisions:**

1. **DO NOT** import `callDeepseek()` from `src/lib/deepseek.ts` — reimplement the Deepseek API call inline in this script to avoid pulling in app-specific logic
2. **DO** import `buildContentSystemPrompt()`, `buildContentUserMessage()`, `buildSchemaSystemPrompt()`, `buildSchemaUserMessage()` from `@/lib/prompts` — these are the existing, proven prompts
3. **DO NOT** modify any existing files
4. Use `SUPABASE_SERVICE_ROLE_KEY` directly (not through the app's session system)

**Error Handling:**

- JSON parse failure → retry (max 2)
- Deepseek API error → log, mark queue as 'failed'
- Quality score < 75 → retry with enhanced prompt (add "This page needs more specific data about {city}" to user message)
- Hallucination detection → check for common Arabic AI hallucination patterns

### File to Create: `scripts/pseo/quality-check.ts`

**Purpose:** Audit published pages for quality.

**Checks performed:**

1. Word count range (min 1000, max 3500)
2. Internal links present (minimum 3 per page)
3. JSON-LD schema validity (try parse, check required fields)
4. Duplicate H2 detection (within same cluster/niche)
5. CTA presence (check for "WasafSEO" or "ابدأ" or "جرب" keywords)
6. Arabic text ratio (should be > 80% Arabic characters)
7. Hallucination flag check ("[SOURCE: verify]" still present? = acceptable. Missing entirely? = concerning)

**Output:** JSON report with scores, flags, and recommendations.

### File to Create: `scripts/pseo/revalidate-pages.ts`

**Purpose:** Trigger Vercel on-demand ISR revalidation for newly generated pages.

**How it works:**

1. Reads a list of URL paths (from stdin, file, or batch query)
2. For each URL path, sends POST to `https://wasafseo.wasleen.com/api/pseo/revalidate`
3. Uses `VERCEL_REVALIDATION_TOKEN` as Bearer token
4. Logs success/failure for each path

### File to Create: `src/app/api/pseo/revalidate/route.ts`

**Purpose:** Vercel on-demand ISR revalidation endpoint.

```typescript
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token !== process.env.VERCEL_REVALIDATION_TOKEN) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { urlPath } = await req.json();
  await revalidatePath(urlPath);

  return Response.json({ revalidated: true, urlPath });
}
```

---

## Phase 6: Frontend Routes & Components

### Route Structure

```
src/app/(pseo)/[pillar]/[location]/[[...subtopic]]/page.tsx
```

This handles ALL PSEO URL patterns:

- `/content-writing/riyadh` → hub page (no subtopic)
- `/services/content-writing/riyadh` → service page
- `/geo/google-sge/dubai` → GEO page
- `/compare/wasafseo-vs-frase` → comparison page

### File to Create: `src/app/(pseo)/[pillar]/[location]/[[...subtopic]]/page.tsx`

**Server component that:**

1. Extracts `pillar`, `location`, `subtopic` from `params`
2. Builds URL path: `pillar/location` or `pillar/location/subtopic`
3. Fetches published page via `getPublishedPage(urlPath)`
4. Returns `notFound()` if no page exists
5. Renders `<PSELandingPage>` component

**Metadata generation:**

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const page = await getPublishedPage(buildUrlPath(params));
  if (!page) return {};
  return {
    title: page.title_ar,
    description: page.meta_description_ar,
    alternates: { canonical: `https://wasafseo.wasleen.com${page.url_path}` },
    other: { "application/ld+json": JSON.stringify(page.schema_json) },
  };
}
```

**ISR config:**

```typescript
export const revalidate = 604800; // 7 days
export const dynamicParams = true;
```

### Files to Create: `src/components/pseo/` Components

#### `PSELandingPage.tsx` — Main Page Shell

- Receives `page: PSEOPublishedPage` and `pillar: string, location: string`
- Orchestrates all sub-components
- Wraps in article semantic HTML

#### `PSEOHero.tsx` — Hero Section

- Renders H1 from `h1_ar`
- Subtitle / intro text from `intro_text`
- Sticky CTA button (only on mobile, fixed at bottom)
- Gradient background based on pillar

#### `PSEOContentSection.tsx` — Content Body

- Renders generated sections from `sections` JSON
- Uses `dangerouslySetInnerHTML` with basic sanitization
- Responsive typography (RTL, Arabic-optimized)
- Handles: lists, tables, blockquotes, headings

#### `PSEOStatsSection.tsx` — Statistics Display

- Renders stats from `local_stats` JSON
- Card-based layout with icons
- Shows `[SOURCE: verify]` flags as badges

#### `PSEOFAQSection.tsx` — FAQ Accordion

- Uses existing `@radix-ui/react-accordion` component
- Renders Q&A pairs from `faqs` JSON
- FAQ schema already included in generated schema

#### `PSECTA.tsx` — Call-to-Action

- Card with heading, description, button
- Button links to `/login?ref=pseo-{pillar}-{location}`
- GA4 event tracking on click
- Two variants: primary (signup) and secondary (learn more)

#### `PSESchema.tsx` — JSON-LD Renderer

- Renders `<script type="application/ld+json">` tag
- Uses `schema_json` from the published page
- Placed in the page head or body

#### `PSEOInternalLinks.tsx` — Related Pages

- Displays "اقرأ أيضاً" (Read Also) section
- Links to related pages from `internal_links` JSON
- Grid layout, 3-4 columns on desktop

#### `PSEONavbar.tsx` — Lightweight PSEO Navigation

- Minimal top bar with WasafSEO logo + CTA button
- Does NOT include dashboard link (these are public pages)
- Links to: Home, Pricing, Login

#### `PSEOFooter.tsx` — PSEO Footer

- Reuses existing `<Footer>` component styling
- Adds: About, Privacy, Terms links
- Copyright notice

### Component Dependencies

```
PSELandingPage
├── PSEONavbar (wasafseo.wasleen.com logo + login CTA)
├── PSEOHero (H1 + intro + sticky CTA)
├── PSEOContentSection (sections content)
├── PSEOStatsSection (statistics cards)
├── PSEOFAQSection (accordion)
├── PSEOInternalLinks (related pages grid)
├── PSECTA (signup CTA card)
├── PSEOFooter (site footer)
└── PSESchema (JSON-LD script tag)
```

---

## Phase 7: Sitemaps & SEO Infrastructure

### File to Create: `src/app/(pseo)/pseo-sitemap.xml/route.ts`

**Purpose:** Dynamic sitemap that returns ALL published PSEO pages.

**Implementation:**

```typescript
export async function GET() {
  const pages = await getAllPublishedPageUrls();
  // Max 45,000 URLs per sitemap (Google limit is 50,000)
  const sitemaps = chunkArray(pages, 45000);

  if (sitemaps.length === 1) {
    // Return single sitemap
    return new Response(generateSitemapXml(sitemaps[0]), {
      headers: { "Content-Type": "application/xml" },
    });
  }

  // Return sitemap index
  return new Response(generateSitemapIndex(sitemaps), {
    headers: { "Content-Type": "application/xml" },
  });
}
```

### File Modification: `src/app/sitemap.ts`

**Add PSEO sitemap entry to existing sitemap:**

```typescript
{
  url: `${baseUrl}/pseo-sitemap.xml`,
  lastModified: new Date(),
  changeFrequency: 'daily' as const,
  priority: 0.9,
}
```

### File Modification: `src/app/robots.ts`

**Update to allow PSEO pages:**

```typescript
rules: {
  userAgent: '*',
  allow: ['/', '/pricing', '/*'],  // PSEO pages use dynamic routes
  disallow: '/dashboard/',
},
sitemap: `${APP_CONFIG.url}/sitemap.xml`,
```

> **Note:** The `allow: '/*'` allows all public paths including PSEO dynamic routes. The middleware already protects `/dashboard/*` separately.

### Internal Linking Architecture (Enforced at Generation)

The generation script auto-generates internal links following this pattern:

```
Hub Page: /{pillar}/{location}/
  → Links to all spoke pages in same pillar+location
  → Links to same pillar in neighboring cities
  → Links to country hub pages

Spoke Page: /{pillar}/{location}/{subtopic}/
  → Links back to hub page
  → Links to 2-3 related spoke pages in same location
  → Links to 2-3 same-pillar pages in nearby cities
  → Links to 2-3 tool/product pages

Link Density: 8-15 internal links per page
```

---

## Phase 8: GitHub Actions Automation

### File to Create: `.github/workflows/pseo-daily-generation.yml`

```yaml
name: PSEO Daily Generation

on:
  schedule:
    - cron: "0 5 * * *" # 5:00 AM UTC = 8:00 AM Dubai
  workflow_dispatch: # Manual trigger for testing

env:
  DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  VERCEL_REVALIDATION_TOKEN: ${{ secrets.VERCEL_REVALIDATION_TOKEN }}
  NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate PSEO content
        run: npx tsx scripts/pseo/generate-pseo-content.ts --limit 100
        env:
          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

      - name: Quality check on generated pages
        run: npx tsx scripts/pseo/quality-check.ts --batch latest
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

      - name: Revalidate new pages on Vercel
        run: npx tsx scripts/pseo/revalidate-pages.ts --batch latest
        env:
          VERCEL_REVALIDATION_TOKEN: ${{ secrets.VERCEL_REVALIDATION_TOKEN }}
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
```

### Rate Limiting Strategy (Within Generation Script)

```
for each page in batch:
  if index > 0:
    await sleep(500ms)      # Stagger to avoid rate limits

  attempt = 0
  while attempt <= 2:       # Max 3 attempts
    try:
      call Deepseek API     # Call 1: Content
      if quality >= 75:
        call Deepseek API   # Call 2: Schema
        save to DB
        break
      attempt++
    catch:
      attempt++

  if failed after 3 attempts:
    log error
    mark queue as 'failed'
```

**Total runtime for 100 pages:** ~10-15 minutes (200 API calls × ~3 seconds each + 500ms delays)

---

## Phase 9: Analytics & Referral Tracking

### File Modification: `src/app/login/actions.ts`

**Add PSEO referral parameter handling:**

```typescript
"use server";

import { signIn, signOut } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Reads PSEO referral params from URL and stores them during signup.
 */
async function capturePSEOReferral(ref?: string): Promise<void> {
  if (!ref || !ref.startsWith("pseo-")) return;

  const parts = ref.replace("pseo-", "").split("-");
  const pillar = parts[0] || null;
  const location = parts.slice(1).join("-") || null;

  // Store in session/state to be saved on user creation
  // This is handled by the auth callback/adapter
}

export async function signInWithGoogle(ref?: string): Promise<void> {
  await capturePSEOReferral(ref);
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signInWithEmail(
  email: string,
  ref?: string,
): Promise<void> {
  await capturePSEOReferral(ref);
  await signIn("resend", { email, redirectTo: "/dashboard" });
}
```

### File Modification: `src/app/login/page.tsx`

**Read `ref` query parameter and pass to login actions:**

Add logic to:

1. Read `ref` from searchParams
2. Pass it to `signInWithGoogle(ref)` and `signInWithEmail(email, ref)`
3. This requires reading `searchParams` from the page component

### GA4 Event Tracking in `<PSECTA>`

The PSEO CTA component tracks clicks:

```typescript
const handleClick = () => {
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as any).gtag("event", "pseo_cta_click", {
      pillar,
      location,
      subtopic: subtopic || null,
      ref: `pseo-${pillar}-${location}`,
    });
  }
};
```

---

## Phase 10: Quality Assurance & Testing

### Pre-Deployment Checklist

**Database Tests:**

```sql
-- Verify all 6 tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'pseo';

-- Verify locations seeded
SELECT COUNT(*) FROM pseo.locations; -- expect 346

-- Verify niches seeded
SELECT COUNT(*) FROM pseo.niches; -- expect 30

-- Verify queue generated
SELECT COUNT(*) FROM pseo.content_queue WHERE status = 'pending';

-- Verify priority scores calculated
SELECT COUNT(*) FROM pseo.content_queue WHERE priority_score > 0;

-- Verify functions exist
SELECT proname FROM pg_proc WHERE proname IN ('get_next_batch', 'recalculate_priorities');
```

**Script Tests:**

1. Run `seed-locations.ts` → verify 346 rows
2. Run `seed-niches.ts` → verify 30 rows
3. Run `generate-queue.ts --count 100` → verify 100 queue items
4. Run `generate-pseo-content.ts --limit 1 --dry-run` → verify prompt building without API call
5. Run `generate-pseo-content.ts --limit 1` → generate 1 real page
6. Verify the generated page in `pseo.published_pages`
7. Run `quality-check.ts --batch latest` → verify quality report

**Frontend Tests:**

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3001/services/content-writing/riyadh` (or whatever the test page URL is)
3. Verify: page renders, RTL works, Arabic text displays correctly
4. Verify: metadata includes title, description, canonical
5. Verify: JSON-LD schema script tag present
6. Verify: CTA button links to `/login?ref=...`
7. Verify: mobile responsive (use DevTools device mode)
8. Test ISR: load page → check response header `x-vercel-cache: MISS` → reload → `x-vercel-cache: HIT`

---

## Phase 11: Launch Sequence

### Day 1: Soft Launch (10 pages)

1. Trigger GitHub Action manually with `--limit 10`
2. Monitor generation logs in `pseo.generation_logs`
3. Verify all 10 pages published in `pseo.published_pages`
4. Manually visit each page URL, verify rendering
5. Submit initial sitemaps to Google Search Console

### Day 2-3: Ramp Up

1. Increase to 25 pages/day
2. Submit PSEO sitemap to GSC
3. Monitor indexing rate in GSC
4. Check quality scores (target: all > 75)

### Week 1: Steady State

1. 50 pages/day
2. Monitor daily generation logs
3. Run quality check weekly
4. Track first organic visits in GA4

### Week 2-4: Scale to 100/day

1. Increase to 100 pages/day
2. Monitor Deepseek API costs (~$2/day)
3. Track signup conversion from PSEO pages
4. Iterate on prompt quality based on analytics

### Ongoing Monitoring

| Metric                  | Target  | Alert If |
| ----------------------- | ------- | -------- |
| Generation success rate | > 95%   | < 90%    |
| Average quality score   | > 80    | < 70     |
| Pages published/day     | 100     | < 50     |
| Indexing rate (14 days) | > 80%   | < 50%    |
| Cost per page           | < $0.05 | > $0.10  |
| CTA click rate          | > 3%    | < 1%     |

---

## Complete File Manifest

### New Files to Create (29 files)

```
# Database
supabase/migrations/002_pseo_schema.sql

# Types
src/types/pseo.ts

# Lib
src/lib/pseo/supabase.ts
src/lib/pseo/queries.ts
src/lib/pseo/utils.ts
src/lib/pseo/pseo-prompt-extensions.ts

# Seed Data
scripts/pseo/data/locations.json
scripts/pseo/data/niches.json

# Seed Scripts
scripts/pseo/seed-locations.ts
scripts/pseo/seed-niches.ts
scripts/pseo/generate-queue.ts

# Generation Scripts
scripts/pseo/generate-pseo-content.ts
scripts/pseo/quality-check.ts
scripts/pseo/revalidate-pages.ts

# Frontend - Route
src/app/(pseo)/[pillar]/[location]/[[...subtopic]]/page.tsx

# Frontend - Components
src/components/pseo/PSELandingPage.tsx
src/components/pseo/PSEOHero.tsx
src/components/pseo/PSEOContentSection.tsx
src/components/pseo/PSEOStatsSection.tsx
src/components/pseo/PSEOFAQSection.tsx
src/components/pseo/PSECTA.tsx
src/components/pseo/PSESchema.tsx
src/components/pseo/PSEOInternalLinks.tsx
src/components/pseo/PSEONavbar.tsx
src/components/pseo/PSEOFooter.tsx

# API
src/app/api/pseo/revalidate/route.ts

# Sitemap
src/app/(pseo)/pseo-sitemap.xml/route.ts

# GitHub Actions
.github/workflows/pseo-daily-generation.yml
```

### Files to Modify (3 files, surgical changes only)

```
src/app/sitemap.ts              ← Add PSEO sitemap entry
src/app/robots.ts               ← Update allow rules for PSEO pages
src/app/login/actions.ts        ← Add PSEO referral parameter capture
src/app/login/page.tsx          ← Read ref from searchParams (if needed)
src/types/index.ts              ← Add pseo_referrer etc. to User interface (optional)
```

---

## Roo Code Prompts for Each Phase

### Prompt for Phase 1 (Database Migration)

> Switch to Code mode. Create file `supabase/migrations/002_pseo_schema.sql` at the project root `d:/WasafSEO/wasafseo/`. This is a PSEO database migration that creates a new schema called `pseo` in the existing Supabase project. The migration must:
>
> 1. Create schema `IF NOT EXISTS pseo`
> 2. Create 6 tables: `pseo.locations`, `pseo.niches`, `pseo.content_queue`, `pseo.published_pages`, `pseo.generation_logs`, `pseo.keywords` with indexes and constraints as specified in the Mega Plan SQL schema
> 3. Create 2 database functions: `pseo.get_next_batch(limit)` and `pseo.recalculate_priorities()`
> 4. Add PSEO referral tracking columns to existing `public.users` table
> 5. Set RLS policies (public SELECT on locations, niches, published_pages; service role only on queue, logs, keywords)
>
> Do NOT modify the existing `001_initial_schema.sql`. This is a separate migration file.
>
> After creating the file, run it in Supabase SQL Editor and verify all 6 tables exist.

### Prompt for Phase 2 (Types & Lib)

> Switch to Code mode. Create the following files in the existing WasafSEO project at `d:/WasafSEO/wasafseo/`. Do NOT modify any existing files. These are new files only.
>
> 1. `src/types/pseo.ts` — Define ALL PSEO TypeScript interfaces: PSEOLocation, PSEONiche, PSEOQueueItem, PSEOPublishedPage, PSEOPageContent, PSEOGenerationLog, PSEOKeyword, PSEOBatchResult, PSEOGenerationConfig, plus union types for PSEOIntent, PSEOFormat, PSEOStatus, PSEOLocationType, PSEOPillarType.
> 2. `src/lib/pseo/supabase.ts` — Create a Supabase admin client factory that uses the existing `SUPABASE_SERVICE_ROLE_KEY` env var and targets the `pseo` schema. Do NOT modify `src/lib/supabase/admin.ts`.
> 3. `src/lib/pseo/queries.ts` — Database query functions using the pseo admin client:
>    - `getPublishedPage(urlPath)` → fetches single page by url_path
>    - `getPublishedPagesByPillar(pillarSlug)` → fetches all pages for a pillar
>    - `getPublishedPagesByLocation(locationSlug)` → fetches all pages for a location
>    - `getRelatedPages(pageId, limit)` → finds related pages
>    - `getBatchForGeneration(limit)` → calls `pseo.get_next_batch()` function
>    - `insertPublishedPage(data)` → inserts into published_pages
>    - `updateQueueItemStatus(id, status)` → updates queue status
>    - `insertGenerationLog(data)` → logs generation result
>    - `countPublishedPages()` → returns total count
>    - `getPSEOStats()` → returns aggregate stats
> 4. `src/lib/pseo/utils.ts` — Utility functions:
>    - `buildUrlPath(pillar, location, subtopic?)` → builds URL path
>    - `parseUrlPath(urlPath)` → parses URL into components
>    - `calculateQualityScore(page)` → quality scoring formula
>    - `generateInternalLinks(page, relatedPages)` → auto-link generation
>    - `slugifyArabic(text)` → Arabic-safe slug generation
>    - `getPriorityScore(searchVolume, difficulty, locationPriority, intent, format)` → priority calculation
>    - `chunkArray(array, size)` → array chunking for sitemaps
> 5. `src/lib/pseo/pseo-prompt-extensions.ts` — PSEO prompt extensions that layer on top of existing prompts:
>    - `buildPSEOUserMessageExtension(params)` → returns PSEO-specific instructions for location data, format rules, quality reqs, CTA requirements, internal linking
>    - `buildPSEOContentSystemSupplement()` → returns additional system-level instructions for WasafSEO's own website content
>    - `buildPSEOSchemaSystemSupplement()` → returns schema-specific PSEO instructions

### Prompt for Phase 3 (Seed Data JSON)

> Switch to Code mode. Create two large JSON data files:
>
> 1. `scripts/pseo/data/locations.json` — A JSON array of 346 location objects, sourced from the geographic data in the WasafSEO application summary document. Each object has: name_ar (Arabic name), name_en (English name), slug (URL-safe), country, country_ar, country_code, region, region_ar, location_type ('city'|'country'|'region'), population, search_volume_estimate, priority (1-100). Include all 279 cities from 17 countries plus 17 country entries and 50 region entries. Priority tiers: Tier 0 (10 cities, priority 100), Tier 1 (20 cities, priority 80), Tier 2 (30 cities, priority 60), Tier 3 (50 cities, priority 40), Tier 4 (remaining cities, priority 25).
> 2. `scripts/pseo/data/niches.json` — A JSON array of 30 niche objects. Each has: name_ar, name_en, slug, pillar_type ('primary'|'secondary'|'tertiary'), description, search_volume_estimate, intent_types (array of applicable intents), priority (1-100), icon_name (Lucide icon name). Include 10 primary niches (content-writing, seo-services, geo-aio, jsonld-schema, content-marketing, keyword-research, ecommerce-seo, content-strategy, seo-tools, article-writing) and 20 sub-niches.

### Prompt for Phase 4 (Seed Scripts)

> Switch to Code mode. Create three seed scripts in `scripts/pseo/`:
>
> 1. `scripts/pseo/seed-locations.ts` — Reads `data/locations.json`, creates a Supabase admin client using `SUPABASE_SERVICE_ROLE_KEY` env var and `SUPABASE_URL` env var, and upserts all 346 locations into `pseo.locations` table. Use `{ schema: 'pseo' }` option for Supabase queries. Log progress in batches of 50. Verify final count.
> 2. `scripts/pseo/seed-niches.ts` — Same pattern, reads `data/niches.json`, upserts 30 niches into `pseo.niches`.
> 3. `scripts/pseo/generate-queue.ts` — Cross-references all active locations × active niches × applicable intents to generate the content queue. Uses CLI arg `--count` to limit (default 10000). Calculates priority_score for each item. Uses upsert pattern with the unique composite index on (location_id, niche_id, intent, format). Generates URL slugs and Arabic/English keywords for each combination. Logs generation progress.

### Prompt for Phase 5 (Generation Engine)

> Switch to Code mode. Create the core generation engine:
>
> 1. `scripts/pseo/generate-pseo-content.ts` — The main generation script. Flow:
>    - Parse CLI: `--limit` (default 100), `--batch-id` (auto-generated if not provided), `--dry-run` (boolean)
>    - Fetch next batch from `pseo.get_next_batch(limit)` via Supabase
>    - For each queue item: build PSEO-extended prompts by importing `buildContentSystemPrompt()`, `buildContentUserMessage()`, `buildSchemaSystemPrompt()`, `buildSchemaUserMessage()` from `@/lib/prompts` AND adding PSEO extensions from `@/lib/pseo/pseo-prompt-extensions`
>    - Call Deepseek API directly (re-implement the fetch call, do NOT import from `@/lib/deepseek.ts`)
>    - Call 1: 8000 max_tokens, temp 0.7 for content brief
>    - Calculate quality score. If < 75, retry (max 2)
>    - Call 2: 4000 max_tokens, temp 0.3 for schema
>    - Transform brief into PSEOPublishedPage structure
>    - Insert into pseo.published_pages
>    - Update queue item status
>    - Insert generation log
>    - Return summary
> 2. `scripts/pseo/quality-check.ts` — Audits published pages for: word count, internal links count, JSON-LD validity, duplicate H2 detection, CTA presence, Arabic text ratio, hallucination flags. Outputs JSON report.
> 3. `scripts/pseo/revalidate-pages.ts` — Sends POST requests to the Vercel revalidation API endpoint for newly generated pages.
> 4. `src/app/api/pseo/revalidate/route.ts` — A lightweight API route that accepts POST with `{ urlPath }` and Bearer token auth, calls `revalidatePath(urlPath)`, returns `{ revalidated: true }`.

### Prompt for Phase 6 (Frontend Routes)

> Switch to Code mode. Create the PSEO frontend components and dynamic route:
>
> 1. `src/app/(pseo)/[pillar]/[location]/[[...subtopic]]/page.tsx` — A Next.js server component that:
>    - Accepts `params: { pillar: string, location: string, subtopic?: string[] }`
>    - Builds URL path using `buildUrlPath()` from `@/lib/pseo/utils`
>    - Fetches published page using `getPublishedPage()` from `@/lib/pseo/queries`
>    - Returns `notFound()` if no page
>    - Has `generateMetadata()` that returns SEO-optimized metadata (title from page.title_ar, description from page.meta_description_ar, canonical URL, JSON-LD schema)
>    - Has `revalidate = 604800` (7 day ISR) and `dynamicParams = true`
>    - Renders `<PSELandingPage page={page} pillar={pillar} location={location} />`
> 2. Create ALL components in `src/components/pseo/`:
>    - `PSELandingPage.tsx` — Main shell orchestrating all sub-components
>    - `PSEOHero.tsx` — H1, intro text, sticky CTA
>    - `PSEOContentSection.tsx` — Renders sections with `dangerouslySetInnerHTML`
>    - `PSEOStatsSection.tsx` — Stats cards with source badges
>    - `PSEOFAQSection.tsx` — FAQ accordion using Radix Accordion
>    - `PSECTA.tsx` — CTA card linking to /login with ref param + GA4 event
>    - `PSESchema.tsx` — JSON-LD script tag renderer
>    - `PSEOInternalLinks.tsx` — Related pages grid
>    - `PSEONavbar.tsx` — Minimal top bar with logo + login CTA
>    - `PSEOFooter.tsx` — Footer with links
>
> All components must be RTL-compatible, mobile-responsive, and follow the existing Tailwind CSS v4 conventions used in the WasafSEO app. Reuse existing UI primitives (Button, Card, Badge) from `@/components/ui/` where possible.

### Prompt for Phase 7 (Sitemaps & SEO)

> Switch to Code mode. Create the PSEO sitemap infrastructure and update SEO files:
>
> 1. `src/app/(pseo)/pseo-sitemap.xml/route.ts` — A Next.js route handler that:
>    - Fetches all published page URLs from `pseo.published_pages`
>    - If > 45,000 URLs, generates a sitemap index pointing to multiple sitemap files
>    - If <= 45,000, generates a single sitemap
>    - Returns XML with proper Content-Type header
> 2. MODIFY `src/app/sitemap.ts` — Add ONE new entry to the existing sitemap array:
>    `{ url: `${baseUrl}/pseo-sitemap.xml`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 }`
>    Do NOT remove the existing 2 entries.
> 3. MODIFY `src/app/robots.ts` — Change the allow rule from `['/', '/pricing']` to `['/']` so all public paths including PSEO dynamic routes are allowed. Keep the dashboard disallow rule. Do NOT change anything else.

### Prompt for Phase 8 (GitHub Actions)

> Switch to Code mode. Create `.github/workflows/pseo-daily-generation.yml` — A GitHub Actions workflow that:
>
> - Triggers daily at 5:00 AM UTC via cron and manually via workflow_dispatch
> - Uses node 20, checks out code, caches npm dependencies
> - Has env section with: DEEPSEEK_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VERCEL_REVALIDATION_TOKEN, NEXT_PUBLIC_APP_URL
> - Job steps: checkout → setup-node → npm ci → generate content (100 pages via tsx) → quality check → revalidate pages
> - References all secrets from GitHub repo secrets

### Prompt for Phase 9 (Analytics & Referrals)

> Switch to Code mode. Make surgical modifications to existing files:
>
> 1. MODIFY `src/app/login/actions.ts` — Add PSEO referral capture:
>    - Add a `capturePSEOReferral(ref?: string)` function that parses `ref` param (format: `pseo-{pillar}-{location}`)
>    - Modify `signInWithGoogle()` to accept optional `ref` param
>    - Modify `signInWithEmail()` to accept optional `ref` param
>    - Do NOT change other existing functionality
> 2. Also add GA4 event tracking to the PSECTA component's onClick handler.

---

## 🚨 CRITICAL REMINDERS FOR ROO CODE

When executing each phase in Code mode, the AI agent MUST:

1. **Always work from `d:/WasafSEO/wasafseo/`** — This is the project root
2. **Never touch these existing files:** `src/lib/prompts.ts`, `src/lib/deepseek.ts`, `src/lib/supabase/admin.ts`, `src/app/api/generate/route.ts`
3. **Always use `{ schema: 'pseo' }`** when making Supabase queries for PSEO data
4. **Always use `SUPABASE_SERVICE_ROLE_KEY`** for PSEO database operations
5. **Always test locally** after each phase before moving to the next
6. **Import from `@/lib/prompts`** for existing prompt functions (read-only access)
7. **Re-implement Deepseek calls** in generation scripts — don't import from `@/lib/deepseek.ts`
8. **Use route group `(pseo)`** for all PSEO frontend routes
9. **Keep surgical modifications minimal** — only add, never remove existing code
10. **Verify build succeeds** after each phase: `npm run build`

---

_This guide was created from the [`Wasaf pseo Mega plan.md`](../Wasaf%20pseo%20Mega%20plan.md) and [`WasafSEO ai web application Complete summary.md`](../WasafSEO%20ai%20web%20application%20Complete%20summary.md) documents._
