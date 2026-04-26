# Tech Stack Rules

## Framework
- Next.js 15 App Router ONLY — never use Pages Router patterns
- All routes are server components by default
- Add 'use client' ONLY when the component needs: useState, useEffect, 
  event handlers, browser APIs, or third-party client libs
- Add 'use server' ONLY for server actions called from client components

## TypeScript
- All types defined in src/types/index.ts — never inline complex types
- Use the types already defined — never redefine User, Website, Brief, etc.
- Zod schemas for all API input validation — never validate manually
- react-hook-form + zod for all form validation — never use uncontrolled forms

## Supabase
- Browser client (createBrowserClient) → client components only
- Server client (createServerClient with cookies) → server components and API routes
- Service role client → API routes that need to bypass RLS (usage tracking, webhooks)
- NEVER use service role key in client components or exposed to browser
- Always filter queries by user_id — never fetch all rows without user context
- Use .single() when expecting one row — handle null explicitly

## Authentication (Auth.js v5)
- requireSession() from src/lib/session.ts for all protected routes
- Session contains: userId, email, name, plan
- Never store sensitive data in JWT beyond what's defined in auth callbacks
- Protected routes: all /dashboard/* — enforced in middleware.ts

## Deepseek API
- **Model**: `deepseek-chat`— never change this
- **Output token limits** (⚠️ Deepseek cap is 8000):
  - Content brief: `max_tokens` **8000** 
  - Schema generation: `max_tokens` **4000**
- **API endpoint**: `https://api.deepseek.com/v1/chat/completions`
- **Authentication**: `Authorization: Bearer ${DEEPSEEK_API_KEY}`
- **Always strip markdown backticks** before `JSON.parse` (Deepseek may also wrap JSON in ```json ... ```)
- **Always implement retry logic** (max 2 retries) for parse failures or API 5xx errors
- **Both calls in `src/lib/deepseek.ts`** – never call Deepseek API directly in route handlers
- **Note on context**: Input context up to 128k tokens, but output is limited to 8k. Plan accordingly.


## Styling
- Tailwind CSS v4 only — no inline styles, no CSS modules, no styled-components
- Design tokens defined in tailwind.config.ts — never use raw hex values in components
-Brand Name: WasafSEO
Primary:      #7c3aed (violet)
Background:   #080b14 (dark navy)
Card:         #0f1624
Accent:       #a78bfa (light violet)
Success:      #10b981 (green)
Warning:      #f59e0b (amber)
Error:        #ef4444 (red)
- Lucide React for all icons — no other icon libraries
- Framer Motion for animations — keep animations subtle and purposeful
-Brand Style: Modern and Futuristic. 
-Dashboard UI: Minimal and easy to Navigate.

## Fonts
- Typography: Geist (Sans for UI) paired with JetBrains Mono (for JSON-LD and code blocks).
- Syne → headings and display text (font-display)
- Always loaded via next/font/google in root layout