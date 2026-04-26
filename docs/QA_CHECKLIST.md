# WasafSEO QA Checklist

> Complete this checklist before deploying to production.
> Each item must pass before the release is considered ready.

---

## AUTH

- [ ] Google login works end to end
- [ ] Magic link email received and works
- [ ] Session persists on page refresh
- [ ] Logout clears session
- [ ] `/dashboard` redirects to `/login` when not authed
- [ ] `/api/*` routes return 401 without valid session

---

## ONBOARDING

- [ ] New user created in Supabase on first login
- [ ] Website wizard all 4 steps work
- [ ] Tag input for author topics works (add and remove)
- [ ] Website saved correctly in Supabase
- [ ] Website count reflects in dashboard stats
- [ ] Website appears in generate form dropdown

---

## GENERATION

- [ ] Form validation works (required fields)
- [ ] Cannot generate without website
- [ ] Cannot generate without keyword
- [ ] Deepseek API called successfully (Call 1 — content brief)
- [ ] Deepseek API called successfully (Call 2 — JSON-LD schema)
- [ ] Both calls complete (brief + schema)
- [ ] Arabic output verified in all tabs
  - [ ] الأساسيات tab
  - [ ] هيكل المحتوى tab
  - [ ] عناصر GEO tab
  - [ ] Schema JSON-LD tab
  - [ ] التصدير tab
- [ ] JSON-LD schema valid (test in [Google Rich Results Test](https://search.google.com/test/rich-results))
- [ ] Brief saved to Supabase after generation
- [ ] Usage incremented after generation
- [ ] Copy button works on schema tab
- [ ] Download .json works
- [ ] PDF export downloads correctly
- [ ] Error state displays Arabic error message
- [ ] Loading state shows animated progress messages

---

## BILLING

- [ ] Checkout URL generates correctly for all plans
  - [ ] Starter ($49/mo)
  - [ ] Pro ($149/mo)
  - [ ] Agency ($299/mo)
- [ ] Webhook signature verification works
- [ ] Plan updates in Supabase after `subscription_created`
- [ ] Trial ends in 3 days for Starter
- [ ] Pro and Agency have no trial
- [ ] Cancelled state shows banner but keeps access
- [ ] Expired state sets plan to `none`
- [ ] Payment failed shows warning banner
- [ ] Customer portal URL works
- [ ] All webhook events handled correctly:
  - [ ] `subscription_created`
  - [ ] `subscription_updated`
  - [ ] `subscription_cancelled`
  - [ ] `subscription_resumed`
  - [ ] `subscription_expired`
  - [ ] `subscription_paused`
  - [ ] `subscription_unpaused`
  - [ ] `subscription_payment_failed`
  - [ ] `subscription_payment_success`
  - [ ] `subscription_payment_recovered`
  - [ ] `subscription_plan_changed`
  - [ ] `order_refunded`
  - [ ] `dispute_created`
  - [ ] `dispute_resolved`

---

## LIMITS

- [ ] Trial users blocked at 3 briefs
- [ ] Starter users blocked at 30 briefs
- [ ] Pro users blocked at 150 briefs
- [ ] Agency users have no limit
- [ ] Usage bar in sidebar accurate
- [ ] `UpgradeGate` blocks Pro features for Starter users
- [ ] Website limit enforced (1 for Starter, 3 for Pro, ∞ for Agency)
- [ ] `checkUsageLimit` returns 403 when limit reached
- [ ] Account flagged blocks all access
- [ ] Trial expired blocks generation

---

## MOBILE (375px)

- [ ] Landing page — no overflow, all content visible
- [ ] Login page — form fits, buttons tappable
- [ ] Pricing page — cards stack vertically
- [ ] Dashboard — sidebar hidden, hamburger works
- [ ] Dashboard — stats row shows 2-column grid
- [ ] Generate form — all fields accessible
- [ ] Generate form — intent cards stack vertically
- [ ] Results tabs — horizontal scroll works
- [ ] Results tabs — tab labels readable
- [ ] Briefs list — cards stack (not table)
- [ ] Navigation — hamburger opens/closes correctly
- [ ] Inputs do not trigger iOS zoom (font-size >= 16px)
- [ ] All tap targets >= 44px
- [ ] No horizontal scroll anywhere

## TABLET (768px)

- [ ] Dashboard stats show 4-column grid
- [ ] Sidebar or bottom nav appropriate
- [ ] Touch targets still 44px+

## DESKTOP (1280px)

- [ ] Max-width container prevents over-stretching
- [ ] Sidebar visible and functional
- [ ] Hover states work correctly
- [ ] Tables display properly
- [ ] Content width comfortable (max-w-5xl / max-w-6xl)

## LARGE DESKTOP (1536px)

- [ ] Content not stretching too wide
- [ ] Whitespace feels intentional
- [ ] Nothing looks tiny on large screen

---

## PERFORMANCE

- [ ] Lighthouse score > 90 on landing page
  - [ ] Performance
  - [ ] Accessibility
  - [ ] Best Practices
  - [ ] SEO
- [ ] Dashboard loads < 2s (first contentful paint)
- [ ] Generate response < 30s
- [ ] No layout shift on page load
- [ ] Images properly sized (next/image with width/height)
- [ ] Fonts loaded with `display: swap`
- [ ] No render-blocking resources

---

## ANALYTICS

- [ ] GA4 events firing (check [GA4 DebugView](https://developers.google.com/tag-platform/devguides/debugview))
  - [ ] `brief_generated`
  - [ ] `website_created`
  - [ ] `plan_upgraded`
  - [ ] `export_pdf`
  - [ ] `schema_copied`
- [ ] Vercel Analytics recording page views
- [ ] Speed Insights showing Core Web Vitals
- [ ] Google Search Console verification meta tag present

---

## 404 & ERROR PAGES

- [ ] Visiting `/nonexistent` shows styled 404 page
- [ ] 404 page has "Back to Dashboard" button
- [ ] 404 page has "Back to Home" button
- [ ] `/dashboard/nonexistent` shows styled 404 within dashboard layout
- [ ] Error boundary catches unhandled errors
- [ ] Error page has "Try Again" button
- [ ] Error page has "Back to Dashboard" button

---

## LOADING STATES

- [ ] Dashboard shows skeleton on load
- [ ] Generate form shows skeleton on load
- [ ] Briefs page shows card grid skeleton on load
- [ ] No blank white flash between loading states
- [ ] Skeletons match shape of loaded content
- [ ] Skeletons are responsive (mobile vs desktop)

---

## SEO

- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Sitemap includes `/` and `/pricing`
- [ ] Sitemap excludes `/dashboard/*`
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] Robots.txt disallows `/dashboard/`
- [ ] Sitemap URL in robots.txt is correct
- [ ] `metadataBase` set to production URL
- [ ] OG tags render correctly
- [ ] Twitter card renders correctly
- [ ] Favicon shows in browser tab

---

## FINAL DEPLOYMENT CHECKS

- [ ] `npm run build` completes with zero errors
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] No TypeScript `any` types in new code
- [ ] No `console.log` in production code
- [ ] No TODO comments in committed code
- [ ] Environment variables set in Vercel
- [ ] Vercel deployment logs show no errors
- [ ] Production URL accessible: https://wasafseo.wasleen.com
- [ ] Google login works on production
- [ ] One brief generation test passes on production
- [ ] Sitemap submitted in Google Search Console
- [ ] Lemon Squeezy live mode enabled (test mode disabled)
- [ ] `.env` files excluded from git
- [ ] `git push origin main` triggers Vercel auto-deploy
