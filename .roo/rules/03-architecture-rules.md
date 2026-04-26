# Architecture Rules

## Folder Structure — Strict
src/
  app/                    → Next.js App Router pages and API routes
  components/
    ui/                   → Reusable primitive components (Button, Input, Card, etc.)
    layout/               → Navbar, Footer, Sidebar, DashboardHeader
    auth/                 → UserMenu, AuthGuard
    website/              → WizardStep components
    brief/                → BriefTabs, SchemaViewer, OutlineTree, FAQList
    billing/              → UpgradeGate, UsageBanner, PlanBadge
  lib/
    supabase/             → client.ts, server.ts, middleware.ts, schema.sql
    deepseek.ts             → generateContentBrief(), generateSchema()
    prompts.ts            → buildContentSystemPrompt(), buildSchemaSystemPrompt(),
                            buildContentUserMessage(), buildSchemaUserMessage()
    lemonsqueezy.ts       → createCheckoutUrl(), getCustomerPortalUrl()
    session.ts            → getSession(), requireSession(), getUserPlan()
    usage.ts              → getMonthlyUsage(), incrementUsage(), checkUsageLimit()
    emails.ts             → all Resend email functions
    constants.ts          → PLANS, COUNTRIES, INTENT_OPTIONS, NICHE_OPTIONS
    utils.ts              → cn(), formatDate(), getPlanLimits(), etc.
  types/
    index.ts              → ALL TypeScript interfaces and types

## Data Flow Rules
- Page (server) → fetches data from Supabase → passes as props to components
- Client component → calls /api/* routes via fetch — never calls Supabase directly
- API routes → validate session → check limits → call Deepseek/Supabase → return typed response
- Webhooks → verify signature → update Supabase → return 200

## API Route Pattern (always follow this)
export async function POST(req: Request) {
  const session = await requireSession()        // 1. Auth check
  const body = schema.parse(await req.json())   // 2. Zod validation
  await checkUsageLimit(session.userId, session.plan)  // 3. Limit check
  // 4. Business logic
  // 5. Return typed response
}

## Component Pattern
- Props interface defined above the component — always explicit, never inline
- Server components fetch their own data — never pass fetched data through many layers
- Client components receive minimal data as props — fetch additional data via API routes
- No prop drilling beyond 2 levels — use composition or fetch in the component

## Error Boundaries
- src/app/error.tsx → catches all unhandled errors in app
- src/app/not-found.tsx → 404 page in Arabic
- Each API route returns typed error objects: { error: string, message: string }
- Arabic error messages for all user-facing errors

## Analytics Architecture

Google Analytics 4:
- Measurement ID from NEXT_PUBLIC_GA_MEASUREMENT_ID env variable
- Injected via next/script in root layout using 'afterInteractive' strategy
- Never use gtag.js directly — always through Next.js Script component
- Track these custom events:
  brief_generated (keyword, intent, location)
  website_created
  plan_upgraded (from_plan, to_plan)
  export_pdf
  schema_copied

Vercel Analytics:
- Import from @vercel/analytics/next
- Place <Analytics /> in root layout after {children}
- Zero configuration needed — works automatically

Vercel Speed Insights:
- Import from @vercel/speed-insights/next  
- Place <SpeedInsights /> in root layout after Analytics
- Tracks Core Web Vitals automatically

Google Search Console:
- Verification meta tag in root layout metadata
- Submit sitemap after launch: https://wasafseo.wasleen.com/sitemap.xml
- Next.js generates sitemap automatically via app/sitemap.ts