# WasafSEO Project Context

## What This Project Is
WasafSEO is an Arabic SEO Content Brief Generator SaaS. It takes few inputs and a keyword (in any language) 
and generates a complete Arabic SEO content brief with JSON-LD schema using the Deepseek API. Output is ALWAYS in Arabic regardless of input language.

## Business Rules (Never Violate These)
- Output language is ALWAYS Arabic — this is a core product rule, not a preference
- JSON-LD schema must be fully populated from website data — never use placeholder values
- Usage limits must be enforced server-side — never trust client-side plan data
- Two Deepseek API calls per generation: first for content brief, second for JSON-LD schema
- All billing goes through Lemon Squeezy — never implement direct payment logic
## Plan Limits (Exact Values — Never Change Without Migration)
trial (starter in trial):  3 briefs/month,  1 website
starter (paying):          30 briefs/month, 1 website
pro:                       150 briefs/month, 3 websites
agency:                    unlimited,        unlimited websites

## Subscription State Rules
- plan = 'none' → no access to generate
- plan = 'starter' + trial_ends_at > now() → trial (3 brief limit)
- plan = 'starter' + trial_ends_at <= now() → paying (30 brief limit)
- plan = 'pro' → paying (150 brief limit)
- plan = 'agency' → paying (unlimited)
- account_flagged = true → block all access regardless of plan
- subscription_paused_at not null → plan already set to 'none'
- payment_failed_at not null → show warning but allow access

## Webhook Events We Handle
CRITICAL (update database):
  subscription_created, subscription_updated, subscription_cancelled,
  subscription_resumed, subscription_expired, subscription_paused,
  subscription_unpaused, subscription_payment_failed,
  subscription_payment_success, subscription_payment_recovered,
  subscription_plan_changed, order_refunded,
  dispute_created, dispute_resolved

USEFUL (email/log only):
  order_created, subscription_payment_refunded

IGNORE (return 200, no action):
  affiliate_activated, customer_updated

## Database Tables (4 only — never add tables without new migration file)
users, websites, briefs, usage

## User Tiers and Limits

- starter: 3-day trial 30 briefs/month, 1 website, $49/mo
- pro: 150 briefs/month, 5 websites, $149/mo  
- agency: unlimited briefs, unlimited websites, $399/mo

## Database Rules — CRITICAL

NEVER modify the Supabase database directly through any tool or API call.

When a database change is needed (new table, new column, new index, 
new RLS policy), Roo Code must:

1. Create a new migration file in /supabase/migrations/
   Named: NNN_description.sql (e.g. 005_add_author_topics.sql)
2. Write the SQL in that file
3. Tell the user: "Run this migration in Supabase SQL Editor: 
   /supabase/migrations/005_add_author_topics.sql"
4. STOP and wait — do not write application code that uses the 
   new schema until the user confirms the migration was run

Roo Code must NEVER:
- Call Supabase API to create/alter tables
- Assume a migration was run without user confirmation
- Write code referencing columns that don't exist in confirmed migrations
- Skip creating a migration file for any database change


## Environment Variables in Use
NEXTAUTH_URL, NEXTAUTH_SECRET
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
DEEPSEEK_API_KEY
RESEND_API_KEY
LEMON_SQUEEZY_API_KEY, LEMON_SQUEEZY_WEBHOOK_SECRET, LEMON_SQUEEZY_STORE_ID
LEMON_SQUEEZY_STARTER_VARIANT_ID, LEMON_SQUEEZY_PRO_VARIANT_ID, LEMON_SQUEEZY_AGENCY_VARIANT_ID
NEXT_PUBLIC_APP_URL