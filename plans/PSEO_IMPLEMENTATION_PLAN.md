# 🚀 WasafSEO Programmatic SEO (PSEO) — Implementation Plan

> **Document Purpose:** Detailed, actionable implementation plan for adding a Programmatic SEO system to the existing WasafSEO application, following the strategy outlined in [`docs/WASAFSEO_PSEO_MEGA_PLAN.md`](docs/WASAFSEO_PSEO_MEGA_PLAN.md).
>
> **Golden Rule:** Do NOT modify any existing WasafSEO application code. The PSEO system is a **parallel, additive infrastructure** that reuses existing WasafSEO components but is architecturally separate.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Phased Implementation Roadmap](#2-phased-implementation-roadmap)
3. [Phase 1: Database & Foundation](#3-phase-1-database--foundation)
4. [Phase 2: Seed Data & Queue](#4-phase-2-seed-data--queue)
5. [Phase 3: Generation Engine](#5-phase-3-generation-engine)
6. [Phase 4: Frontend Routes & Components](#6-phase-4-frontend-routes--components)
7. [Phase 5: GitHub Actions Automation](#7-phase-5-github-actions-automation)
8. [Phase 6: Sitemaps & SEO Infrastructure](#8-phase-6-sitemaps--seo-infrastructure)
9. [Phase 7: Tracking & Analytics](#9-phase-7-tracking--analytics)
10. [Phase 8: Quality Assurance & Launch](#10-phase-8-quality-assurance--launch)
11. [Risk Assessment & Mitigation](#11-risk-assessment--mitigation)
12. [Cost Projection](#12-cost-projection)
13. [Files to Create (Complete List)](#13-files-to-create-complete-list)

---

## 1. Architecture Overview

### 1.1 How PSEO Integrates with WasafSEO

```
┌─────────────────────────────────────────────────────────────────────┐
│                     WasafSEO Application (EXISTING)                  │
│  src/app/dashboard/* │ src/app/api/* │ src/lib/* │ src/components/* │
│  Auth-protected SaaS │ Generate API  │ Prompts    │ UI primitives    │
└───────────────────────┴───────────────┴────────────┴──────────────────┘
                                ▲ REUSES (no modification)
                                │
┌──────────────────────────────────────────────────────────────────────┐
│                     PSEO System (NEW — Parallel)                      │
│                                                                      │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────────┐  │
│  │ PSEO DB     │  │ Generation       │  │ Frontend Routes         │  │
│  │ (6 tables)  │  │ Engine           │  │ app/[pillar]/[loc]/...  │  │
│  │             │  │                  │  │                         │  │
│  │ Separate    │  │ GitHub Action →  │  │ Server components       │  │
│  │ Supabase    │  │ Direct Deepseek  │  │ Reuse Navbar, Footer,   │  │
│  │ project     │  │ API call         │  │ Card, Button            │  │
│  └─────────────┘  └──────────────────┘  └─────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **PSEO Database** | Same Supabase project, separate schema (`pseo`) | Easier management, single backup. New migration file in existing `supabase/migrations/` |
| **Generation API calls** | Direct Deepseek API call (not through WasafSEO's `/api/generate`) | Avoids auth session requirement, usage tracking, and website ownership checks. PSEO is a system-to-system call |
| **Prompt usage** | Call existing `buildContentUserMessage()` / `buildSchemaUserMessage()` | Per rules: do NOT modify `src/lib/prompts.ts`. Add PSEO-specific context as additional user message content |
| **Route structure** | `app/(pseo)/[pillar]/[location]/[[...subtopic]]/page.tsx` | Group route isolates PSEO from existing routes. Catch-all for optional subtopic segment |
| **Middleware** | PSEO routes are PUBLIC — no auth check | Middleware only protects `/dashboard/*`. PSEO routes are under `/(pseo)/*` which is not matched |
| **ISR** | `revalidate = 604800` (7 days) | Balances freshness with server load. 100K pages on ISR is efficient |
| **Existing code** | NEVER modify `src/lib/prompts.ts`, `src/lib/deepseek.ts`, `src/app/api/generate/route.ts` | These are sacred per project rules |

### 1.3 Data Flow

```mermaid
flowchart TD
    A[GitHub Action: Daily Trigger] --> B[get_next_pseo_batch 100 pages]
    B --> C[For each queue item]
    C --> D[Build prompt with location_data + intent rules]
    D --> E[Call Deepseek API - Call 1: Content Brief]
    E --> F[Parse & validate JSON]
    F --> G{Quality >= 75?}
    G -->|Yes| H[Call Deepseek API - Call 2: Schema]
    G -->|No| I[Regenerate with enhanced prompt]
    I --> D
    H --> J[Insert into pseo_published_pages]
    J --> K[Insert into pseo_generation_logs]
    K --> L[Revalidate Vercel ISR cache]
    L --> M[Next queue item]
    M --> C
    C --> N[Done - next day]
    
    O[User visits PSEO page] --> P[app/(pseo)/ route]
    P --> Q[Fetch from pseo_published_pages]
    Q --> R[PSELandingPage component]
    R --> S[Send via ISR cached response]
```

---

## 2. Phased Implementation Roadmap

| Phase | What | Est. Effort | Dependencies |
|-------|------|-------------|--------------|
| **P1** | Database migration + seed scripts | High | None |
| **P2** | Seed data population + queue generation | Medium | P1 complete |
| **P3** | Generation engine (scripts) | High | P1, P2 complete |
| **P4** | Frontend routes + components | High | P1 complete |
| **P5** | GitHub Actions automation | Low | P3 complete |
| **P6** | Sitemaps + SEO infra | Medium | P4 complete |
| **P7** | Tracking + analytics | Medium | P4 complete |
| **P8** | QA, testing, launch prep | Medium | All above |

---

## 3. Phase 1: Database & Foundation

### 3.1 Migration File: `supabase/migrations/003_pseo_schema.sql`

Create a new migration file containing **6 PSEO tables** in a `pseo` schema within the **same Supabase project**. Having it in the same project simplifies management, but in a separate schema for logical isolation.

**Tables to create:**

1. **`pseo.locations`** — 346 locations (279 cities + 17 countries + 50 regions)
2. **`pseo.niches`** — 30 niches (10 primary + 20 sub-niches)
3. **`pseo.content_queue`** — 100K+ generation queue items
4. **`pseo.published_pages`** — Generated page content storage
5. **`pseo.generation_logs`** — Audit trail for all generations
6. **`pseo.keywords`** — Keyword research data

**Plus:**
- `get_next_pseo_batch()` function — returns highest-priority pending items
- `recalculate_priority_scores()` function — auto-calculates priority
- Indexes for performance
- RLS policies (PSEO data is PUBLIC-read, service-role-write)

**Also:** Migration to add PSEO referral tracking columns to the existing `users` table:
```sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pseo_referrer TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pseo_pillar TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pseo_location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pseo_subtopic TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
```

### 3.2 PSEO Types: `src/types/pseo.ts`

Create new TypeScript interfaces for all PSEO data structures:
- `PSEOLocation`, `PSEONiche`, `PSEOQueueItem`
- `PSEOPublishedPage`, `PSEOPageContent` (content sections, benefits, FAQs, stats, quotes, CTAs)
- `PSEOGenerationLog`, `PSEOKeyword`
- `PSEOIntent`, `PSEOFormat`, `PSEOStatus` unions
- `HubSpokeRule`, `PSEOIntentRules` interfaces

### 3.3 PSEO Database Queries: `src/lib/pseo/queries.ts`

Create a library file with:
- `getPublishedPage(urlPath)` — Fetch a single published page by URL
- `getPublishedPagesByPillar(pillarSlug)` — Fetch all pages for a pillar
- `getPublishedPagesByLocation(locationSlug)` — Fetch all pages for a location
- `getHubPage(pillarSlug, locationSlug)` — Fetch hub page
- `getRelatedPages(pageId, limit)` — Get related pages for internal linking
- `getPSEOStats()` — Aggregated stats (total pages, by pillar, by status)

### 3.4 PSEO Utilities: `src/lib/pseo/utils.ts`

Create utility functions:
- `buildUrlPath(pillar, location, subtopic?)` — Build URL from params
- `parseUrlPath(urlPath)` — Parse URL into pillar/location/subtopic
- `calculateQualityScore(page)` — Quality scoring formula
- `generateInternalLinks(page, relatedPages)` — Auto-link generation
- `slugifyArabic(text)` — Arabic-safe slug generation
- `getLocationData(locationSlug)` — Get location data for prompt injection

---

## 4. Phase 2: Seed Data & Queue

### 4.1 Seed Script: `scripts/pseo/seed-locations.ts`

- Insert 346 locations from the complete city/country data in the application summary
- Each location gets: Arabic name, English name, slug, country, region, population estimate, search volume estimate, priority score
- Priority tiers: Tier 0 (10 cities, priority 100) → Tier 4 (all cities, priority 25)
- Source location data from the application summary document (17 countries, detailed city lists)

### 4.2 Seed Script: `scripts/pseo/seed-niches.ts`

- Insert 10 primary niches + 20 sub-niches
- Each niche gets: Arabic name, English name, slug, pillar type, applicable intents, priority score
- Niches defined in the mega plan: Content Writing, SEO Services, GEO/AIO, Schema, Content Marketing, Keyword Research, Tool Pages, Comparisons, Country Hubs, Blog

### 4.3 Queue Generator: `scripts/pseo/generate-queue.ts`

- Generate the initial content queue by cross-referencing locations × niches × intents
- Calculate priority scores using the formula: `(search_volume / keyword_difficulty) × location_priority × intent_conversion_rate × format_multiplier`
- Generate in priority order: Tier 0 cities first, commercial intents first
- Use upsert pattern (unique composite index on location_id, niche_id, intent, format)
- Start with 10,000 items, generate up to 100K

### 4.4 Data: `scripts/pseo/data/locations.json`

Create a comprehensive JSON data file containing all 346 locations with full metadata (names, slugs, country info, population, region data, industry data, cultural notes). This is sourced from:

- [`docs/WASAFSEO_COMPLETE_APPLICATION_SUMMARY.md`](docs/WASAFSEO_COMPLETE_APPLICATION_SUMMARY.md) (sections 5.x — full country/city data)
- The mega plan's location dimension data (17 countries × 279 cities)

### 4.5 Data: `scripts/pseo/data/niches.json`

Create a JSON file with all 30 niches including:
- Pillar structure (hierarchy)
- Intent mappings (which intents apply)
- URL patterns
- Content template references
- Keyword cluster data

---

## 5. Phase 3: Generation Engine

### 5.1 Core Generator: `scripts/pseo/generate-pseo-content.ts`

This is the **most critical script**. It:

1. **Fetches batch**: Calls `get_next_pseo_batch(100)` from Supabase
2. **For each item**:
   - Builds the full prompt payload with location_data injection
   - Calls Deepseek API directly (not through WasafSEO's `/api/generate`)
   - **Call 1**: Content brief generation (8000 max_tokens, temp 0.7)
   - Validates JSON response structure
   - Calculates quality score
   - If quality < 75: regenerate with enhanced prompt (max 2 retries)
   - **Call 2**: Schema generation (4000 max_tokens, temp 0.3)
   - Transforms brief into landing page content structure
3. **Saves results**: Inserts into `pseo_published_pages` and `pseo_generation_logs`
4. **Revalidates**: Triggers Vercel ISR revalidation for new URLs

**Key design detail — Prompt layering:**

The script must NOT modify `src/lib/prompts.ts`. Instead, it:
1. Imports `buildContentSystemPrompt()` and `buildSchemaSystemPrompt()` from the existing prompts file (READ ONLY)
2. Builds an **extended user message** that includes:
   - The standard content from `buildContentUserMessage()` 
   - PLUS PSEO-specific instructions (location_data JSON, quality rules, E-E-A-T mandates, hallucination prevention rules from section 5 of the mega plan)
3. The extended user message is passed to Deepseek alongside the existing system prompt

This preserves the prompt architecture while adding PSEO-specific constraints.

### 5.2 Prompt Extension: `src/lib/pseo/pseo-prompt-extensions.ts`

Create a file containing the PSEO-specific prompt additions that get layered on top of existing prompts:

- `buildPSEOUserMessageExtension(params)` — The additional PSEO constraints
- `buildPSEOContentSystemSupplement()` — PSEO-specific system instruction additions
- `buildPSEOSchemaSystemSupplement()` — Schema-specific PSEO instructions

These are concatenated with (not replacing) the existing prompt functions from `src/lib/prompts.ts`.

### 5.3 Quality Check: `scripts/pseo/quality-check.ts`

Standalone script to audit published pages:
- Check word count ranges
- Verify internal links exist (3 per page)
- Validate JSON-LD schema
- Check for duplicate H2 structures across cluster pages
- Score pages and flag low-quality ones for regeneration
- Generate a quality report

### 5.4 Revalidation: `scripts/pseo/revalidate-pages.ts`

Script to trigger Vercel on-demand revalidation for PSEO pages:
- Sends POST to `/api/revalidate` with list of URL paths
- Uses `VERCEL_REVALIDATION_TOKEN` for authentication
- Can be called after generation or manually

---

## 6. Phase 4: Frontend Routes & Components

### 6.1 Route Group: `src/app/(pseo)/`

> **Critical routing consideration:** The existing app has known routes like `/dashboard`, `/pricing`, `/login`, `/api`, etc. PSEO routes use paths like `/[pillar]/[location]/[subtopic]`. To avoid conflicts, we use a **route group** `(pseo)` which creates a clean URL structure without adding a path segment.

**Route structure:**

```
src/app/(pseo)/[pillar]/[location]/[[...subtopic]]/page.tsx
```

The `[[...subtopic]]` catch-all optional segment handles both:
- `/content-writing/riyadh` (hub page — no subtopic)
- `/content-writing/riyadh/technical-seo-audit` (spoke page — with subtopic)
- `/content-writing/riyadh/ecommerce/pricing` (deep page — multiple segments)

**Why this works with existing routes:**
- Next.js tries exact matches first (`/dashboard`, `/pricing`, `/login`, `/api`) before falling through to dynamic segments
- The route group `(pseo)` keeps PSEO pages logically separate without affecting URL structure
- No middleware changes needed — `/(pseo)/*` is not in the matcher, so these are public

### 6.2 Page Component: `src/app/(pseo)/[pillar]/[location]/[[...subtopic]]/page.tsx`

Server component that:
1. Extracts `pillar`, `location`, and `subtopic` from params
2. Builds url_path from params
3. Fetches published page from `pseo_published_pages` table
4. Returns `notFound()` if no page exists
5. Renders `<PSELandingPage>` component with the data

**Metadata generation:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const page = await getPublishedPage(buildUrlPath(params));
  return {
    title: page.title_ar,
    description: page.meta_description_ar,
    alternates: { canonical: `https://wasafseo.wasleen.com${page.url_path}` },
    other: { 'application/ld+json': JSON.stringify(page.schema_json) }
  };
}
```

**ISR configuration:**
```typescript
export const revalidate = 604800; // 7 days
export const dynamicParams = true; // Allow ISR for new pages
```

### 6.3 Landing Page Component: `src/components/pseo/PSELandingPage.tsx`

The main component that renders a PSEO page. Reuses existing WasafSEO components:

```tsx
// Structure
<>
  <nav className="...">   ← Custom PSEO navigation (reuses WasafSEO brand elements)
    <WasafSEOLogo size={32} />
    <CTAButton href="/login" />
  </nav>
  
  <main>
    <PSEOHeroSection content={page} />
    <PSEOContentSection content={page} />
    <PSEOStatsSection stats={page.local_stats} />
    <PSEOFAQSection faqs={page.faqs} />
    <PSECTA pillar={pillar} location={location} />
  </main>
  
  <footer>  ← Reuses existing Footer component
  </footer>
</>
```

**Key rules:**
- RTL by default (`dir="rtl"` on the root element)
- Renders content JSON safely using `dangerouslySetInnerHTML` with sanitization
- All text is Arabic (as generated by Deepseek)
- Reuses `<WasafSEOLogo>`, `<Button>`, `<Card>`, `<Badge>` from existing UI library
- Mobile-first responsive design following the existing responsive rules

### 6.4 PSEO Sub-Components

All in `src/components/pseo/`:

| Component | Purpose | Notes |
|-----------|---------|-------|
| `PSELandingPage.tsx` | Main page shell | Orchestrates all sub-components |
| `PSEOHero.tsx` | Hero section with H1, subtitle | Includes sticky CTA |
| `PSEOContentSection.tsx` | Renders generated content body | Sanitized HTML renderer |
| `PSEOStatsSection.tsx` | Statistics display | With [SOURCE: verify] flags |
| `PSEOFAQSection.tsx` | FAQ accordion | Reuses Radix Accordion |
| `PSECTA.tsx` | Call-to-action card | Links to /login with tracking |
| `PSESchema.tsx` | Inline JSON-LD schema | Renders schema in script tag |
| `PSEOInternalLinks.tsx` | Related pages section | For internal linking mesh |

### 6.5 OG Image Generation: `src/app/(pseo)/[pillar]/[location]/[[...subtopic]]/opengraph-image.tsx`

Uses `@vercel/og` to auto-generate social share images for each PSEO page:
- Title, location, WasafSEO branding
- Dark background with violet gradient
- Syne font

---

## 7. Phase 5: GitHub Actions Automation

### 7.1 Workflow: `.github/workflows/pseo-daily-generation.yml`

```yaml
name: PSEO Daily Generation

on:
  schedule:
    - cron: '0 5 * * *'   # 5:00 AM UTC = 8:00 AM Dubai
  workflow_dispatch:        # Manual trigger

env:
  DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  VERCEL_REVALIDATION_TOKEN: ${{ secrets.VERCEL_REVALIDATION_TOKEN }}

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - name: Generate PSEO content (100 pages)
        run: npx tsx scripts/pseo/generate-pseo-content.ts --limit 100
      - name: Run quality check
        run: npx tsx scripts/pseo/quality-check.ts --batch latest
      - name: Revalidate new pages
        run: npx tsx scripts/pseo/revalidate-pages.ts --batch latest
```

### 7.2 Rate Limiting Strategy

- 100 pages/day = 200 Deepseek API calls (2 per page)
- Stagger calls with 500ms delay between each page
- Max 2 retries per call (already built into `src/lib/deepseek.ts`)
- Total runtime: ~10-15 minutes for 100 pages
- Deepseek standard tier supports 500+ RPM → no rate limit issues

---

## 8. Phase 6: Sitemaps & SEO Infrastructure

### 8.1 Dynamic Sitemap: `src/app/(pseo)/sitemap.ts`

Generate a sitemap index that includes all PSEO pages (max 50,000 URLs per sitemap):

```typescript
// Returns all published PSEO page URLs
export async function GET(): Promise<Response> {
  const pages = await getAllPublishedPageUrls();
  // Split into multiple sitemaps if > 50,000
  const sitemaps = chunk(pages, 45000).map((chunk, i) => ({
    url: `https://wasafseo.wasleen.com/pseo-sitemap-${i}.xml`,
    lastModified: new Date(),
  }));
  
  return new Response(generateSitemapIndex(sitemaps), {
    headers: { 'Content-Type': 'application/xml' },
  });
}
```

### 8.2 Sitemap Registration

Update the root [`src/app/sitemap.ts`](src/app/sitemap.ts) to include the PSEO sitemap index:

```typescript
// Add to the existing sitemap array
{
  url: `${baseUrl}/pseo-sitemap.xml`,
  lastModified: new Date(),
  changeFrequency: 'daily',
  priority: 0.9,
}
```

### 8.3 Robots.txt Update

The existing [`src/app/robots.ts`](src/app/robots.ts) should be updated (if it exists) or created to include PSEO sitemaps.

### 8.4 Internal Linking Architecture

The generation script enforces the **hub-and-spoke model**:
- Hub pages (`/{pillar}/{location}/`) link to all spoke pages
- Spoke pages link back to their hub
- Cross-pillar links: every page links to at least one page in a different pillar (same location)
- Geographic cluster links: link to same pillar in neighboring cities

This is enforced at generation time by the prompt extensions.

---

## 9. Phase 7: Tracking & Analytics

### 9.1 Referral Tracking in Login

The [`src/app/login/LoginForm.tsx`](src/app/login/LoginForm.tsx) needs a small addition:
- Read `ref` parameter from URL query string
- Pass it through to the auth callback
- Store `pseo_referrer`, `pseo_pillar`, `pseo_location`, `pseo_subtopic` in the users table on first signup

**File to modify:** `src/app/login/actions.ts` — Add PSEO referral parameter handling

### 9.2 PSEO Analytics Page: `src/app/dashboard/pseo-analytics/page.tsx`

A new dashboard page showing:
- Total PSEO page views (from Vercel Analytics)
- CTA click-through rate (from GA4 events)
- Signup conversion rate
- Paid conversion rate from PSEO-referred users
- Revenue attributed to PSEO

**Note:** This is a dashboard page that requires auth. It's added under the existing `/dashboard/*` structure.

### 9.3 GA4 Event Tracking

Add to `<PSECTA>` component:
```typescript
const handleClick = () => {
  gtag('event', 'pseo_cta_click', {
    pillar,
    location,
    subtopic,
    ref: `pseo-${pillar}-${location}`
  });
};
```

---

## 10. Phase 8: Quality Assurance & Launch

### 10.1 Pre-Launch Checklist

**Database:**
- [ ] Run PSEO migration (`supabase/migrations/003_pseo_schema.sql`)
- [ ] Verify all 6 tables created in `pseo` schema
- [ ] Seed locations (346 rows verified)
- [ ] Seed niches (30 rows verified)
- [ ] Generate initial queue (10,000 items minimum)
- [ ] Verify priority scores calculated correctly

**Scripts:**
- [ ] `seed-locations.ts` runs successfully
- [ ] `seed-niches.ts` runs successfully
- [ ] `generate-queue.ts` generates correct items
- [ ] `generate-pseo-content.ts` generates 1 test page successfully
- [ ] Quality check passes on test page (score ≥ 75)

**Frontend:**
- [ ] Generate 3 test pages (different cities, niches, intents)
- [ ] Verify pages render at correct URLs
- [ ] Verify RTL layout and Arabic text display
- [ ] Verify JSON-LD schema is valid (Google Rich Results Test)
- [ ] Verify all CTAs link to `/login?ref=...`
- [ ] Test mobile responsiveness (375px, 768px, 1280px)
- [ ] Test ISR caching (first load, second load speed)
- [ ] Test OG image generation

**GitHub Actions:**
- [ ] Workflow file created and committed
- [ ] Secrets added to GitHub repository
- [ ] Manual trigger tested (5 pages)
- [ ] Generation logs verified

### 10.2 Launch Sequence

| Day | Action | Success Criteria |
|-----|--------|-----------------|
| Day 1 | Trigger 10 page generation | All 10 pages published, indexed request submitted |
| Day 2 | Submit primary sitemaps to GSC | Sitemaps accepted, no errors |
| Day 3 | Increase to 25 pages/day | Indexing rate > 50% |
| Day 4-7 | Monitor quality scores | All scores > 75, no hallucinations flagged |
| Week 2 | Ramp to 50 pages/day | Indexing rate > 75% |
| Week 3 | Ramp to 100 pages/day | First organic visits appearing |
| Month 1 | Maintain 100 pages/day | 2,800+ pages published, indexing rate > 85% |

### 10.3 Monitoring & Alerts

- **Failure rate > 5%** in generation logs → Slack/email alert
- **Quality score < 70** on any page → Log review
- **Indexing rate < 50%** after 14 days → Manual SEO audit
- **Content refresh trigger**: Page gets < 50 visits/month after 6 months

---

## 11. Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Route conflicts** with existing pages | Low | High | Route group `(pseo)` isolates PSEO routes. Test all existing routes still work |
| **Deepseek API cost overruns** | Low | Low | ~$2/day for 100 pages. Set budget alert at $100/month |
| **Content quality degradation** at scale | Medium | Medium | Quality scoring before publish. Random 1% audit weekly |
| **Keyword cannibalization** across pages | Medium | Medium | Strict intent mapping enforced in generation. Unique URL index |
| **Google algorithm update** deindexing PSEO | Medium | High | Quality scoring ensures 85+/100. Real location data. Human oversight |
| **Indexing bottleneck** — 100 pages/day | Medium | Medium | Multiple sitemaps. Internal linking accelerates discovery. Start at 10/day |
| **PSEO page performance** slowing site | Low | Low | ISR makes pages static HTML. CDN cache absorbs traffic |
| **Hallucination** in generated content | Low | High | Citation protocol with [SOURCE: verify] flags. Monte Carlo sampling audit |

---

## 12. Cost Projection

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Deepseek API (100 pages/day × $0.02/page) | ~$60 | 200 calls/day, 6,000 calls/month |
| Supabase (existing Pro plan) | $0 | Already paying for the main app |
| GitHub Actions | $0 | Free tier sufficient (2,000 minutes/month) |
| Vercel (existing Pro plan) | $0 | ISR pages are efficient |
| **Total PSEO-specific** | **~$60/month** | |

vs. Manual content creation: $50/page × 3,000 pages/month = **$150,000/month** saved.

---

## 13. Files to Create (Complete List)

### Database
| File | Purpose |
|------|---------|
| `supabase/migrations/003_pseo_schema.sql` | 6 PSEO tables + functions + indexes |

### Types & Lib
| File | Purpose |
|------|---------|
| `src/types/pseo.ts` | All PSEO TypeScript interfaces |
| `src/lib/pseo/queries.ts` | Database query functions |
| `src/lib/pseo/utils.ts` | URL builders, transformers, quality calculator |
| `src/lib/pseo/pseo-prompt-extensions.ts` | PSEO-specific prompt additions (layered on existing prompts) |

### Seed Data
| File | Purpose |
|------|---------|
| `scripts/pseo/data/locations.json` | 346 location records |
| `scripts/pseo/data/niches.json` | 30 niche records |
| `scripts/pseo/seed-locations.ts` | Location seed script |
| `scripts/pseo/seed-niches.ts` | Niche seed script |
| `scripts/pseo/generate-queue.ts` | Queue generation script |

### Generation
| File | Purpose |
|------|---------|
| `scripts/pseo/generate-pseo-content.ts` | Main generation engine |
| `scripts/pseo/quality-check.ts` | Quality audit script |
| `scripts/pseo/revalidate-pages.ts` | Vercel ISR revalidation |

### Frontend
| File | Purpose |
|------|---------|
| `src/app/(pseo)/[pillar]/[location]/[[...subtopic]]/page.tsx` | Dynamic page renderer |
| `src/app/(pseo)/[pillar]/[location]/[[...subtopic]]/opengraph-image.tsx` | OG image generator |
| `src/app/(pseo)/pseo-sitemap.xml/route.ts` | Dynamic sitemap |
| `src/components/pseo/PSELandingPage.tsx` | Main landing page component |
| `src/components/pseo/PSEOHero.tsx` | Hero section |
| `src/components/pseo/PSEOContentSection.tsx` | Content body renderer |
| `src/components/pseo/PSEOStatsSection.tsx` | Statistics section |
| `src/components/pseo/PSEOFAQSection.tsx` | FAQ accordion |
| `src/components/pseo/PSECTA.tsx` | Call-to-action with tracking |
| `src/components/pseo/PSESchema.tsx` | JSON-LD schema renderer |
| `src/components/pseo/PSEOInternalLinks.tsx` | Internal linking section |

### Automation
| File | Purpose |
|------|---------|
| `.github/workflows/pseo-daily-generation.yml` | GitHub Actions workflow |

### Modified Files (Surgical Changes Only)
| File | Change |
|------|--------|
| `src/app/sitemap.ts` | Add PSEO sitemap entry |
| `src/app/login/actions.ts` | Add PSEO referral parameter capture |
| `src/types/index.ts` | Add `pseo_referrer` etc. to User interface |

---

## Summary

The PSEO system is a **parallel infrastructure** that adds 100,000+ Arabic SEO content pages to WasafSEO without modifying any existing application code. It leverages:

- **WasafSEO's own Deepseek prompts** (untouched — just extended with PSEO context)
- **Existing UI components** (Navbar, Footer, Button, Card — reused directly)
- **Existing Supabase project** (with new `pseo` schema)
- **Vercel ISR** (for efficient caching of 100K pages)
- **GitHub Actions** (for daily automated generation at **$0.02/page**)

The result: A self-reinforcing SEO flywheel where every PSEO page is a **living demonstration** of WasafSEO's content quality, driving signups and revenue while the system costs almost nothing to operate.
