# API Route Rules

## Security — Non-Negotiable
- Every API route (except /api/auth/* and /api/webhooks/*) must call requireSession()
- Webhook routes must verify signature before any processing
- Never expose SUPABASE_SERVICE_ROLE_KEY or DEEPSEEK_API_KEY to client
- Always verify resource ownership: user can only access their own websites/briefs
- Rate limiting must be enforced in /api/generate — check usage before calling Deepseek

## Response Format
Success: return Response.json({ data: ... }, { status: 200 })
Created: return Response.json({ data: ... }, { status: 201 })
Auth error: return Response.json({ error: 'unauthorized', message: '...' }, { status: 401 })
Forbidden: return Response.json({ error: 'forbidden', message: '...' }, { status: 403 })
Not found: return Response.json({ error: 'not_found', message: '...' }, { status: 404 })
Limit reached: return Response.json({ error: 'limit_reached', message: 'Arabic message' }, { status: 403 })
Server error: return Response.json({ error: 'server_error', message: '...' }, { status: 500 })

## /api/generate Specific Rules
- Must call generateContentBrief() first, then generateSchema() with brief as context
- Must save both brief and schema to Supabase before returning
- Must call incrementUsage() after successful save
- Must return { brief, schema, briefId } on success
- Deepseek API timeout: set in vercel.json as maxDuration: 60

## Lemon Squeezy Webhook Handler Rules

File location: src/app/api/webhooks/lemonsqueezy/route.ts

Security:
- Always verify X-Signature header using HMAC SHA256
- Use LEMON_SQUEEZY_WEBHOOK_SECRET from environment
- Reject all requests with invalid signature → return 400
- Return 200 for all valid events even if business logic fails

Variant ID to Plan Mapping:
- LEMON_SQUEEZY_STARTER_VARIANT_ID → 'starter'
- LEMON_SQUEEZY_PRO_VARIANT_ID     → 'pro'
- LEMON_SQUEEZY_AGENCY_VARIANT_ID  → 'agency'

Trial Logic on subscription_created:
- If plan = 'starter' → set trial_ends_at = now() + 3 days
- If plan = 'pro' or 'agency' → set trial_ends_at = null

Idempotency:
- All webhook handlers must be safe to run twice
- Use upsert patterns not insert where possible
- Never create duplicate records from duplicate webhook delivery

Access Control Check Order (every API route):
1. Verify session
2. Check account_flagged → 403 if true
3. Check plan !== 'none' → 403 if none
4. Check trial not expired → 403 if starter trial expired
5. Check usage limit → 403 if exceeded
6. Proceed with request

## /api/webhooks/lemonsqueezy Rules
- Verify X-Signature header using HMAC SHA256 — reject if invalid
- Handle events idempotently — same event processed twice must be safe
- Update users table plan immediately on subscription_created/updated
- Return 200 for all valid events even if business logic fails — requeue separately
- Log all webhook events for debugging

## Supabase Query Rules
- Always use server client in API routes
- Filter by user_id on every query: .eq('user_id', session.userId)
- Use .select() to specify only needed columns — never SELECT *
- Use .single() for expected single rows — handle PostgREST error code PGRST116 (not found)
- Wrap multi-step operations in Supabase transactions where possible