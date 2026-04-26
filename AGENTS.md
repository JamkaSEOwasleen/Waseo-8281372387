# WasafSEO  Agent Rules

## Primary Objective
Build WasafSEO  as a production-grade Arabic SEO Content Brief Generator SaaS.
Every decision must serve reliability, security, and Arabic-first UX.

## Decision Framework
When facing a technical decision, evaluate in this order:
1. Does it break any rule in .roo/rules/?
2. Does it introduce a security vulnerability?
3. Does it degrade performance for the user?
4. Is it the simplest solution that works correctly?
Choose the option that passes all 4 checks.

## Phase Awareness
The project is built in 8 phases. Before any task:
- Confirm which phase is active
- Only build what belongs to the current phase
- Do not import or reference code from future phases
- If a dependency from a future phase is needed, create a stub/placeholder

## Deepseek Reasoning Optimization
Since this project uses Deepseek reasoning API:
- Think through the full implementation before writing any code
- Identify all files that need to change before touching any of them
- For complex tasks, break into sub-tasks and complete each fully
- Prefer explicit over clever — Deepseek reasons better with clear intent
- State assumptions explicitly before acting on them

## Git Commit Convention
feat: new feature
fix: bug fix
refactor: code improvement without behavior change
types: TypeScript type changes
style: formatting only
docs: documentation only
chore: dependencies, config, tooling

## What Never To Do
- Never expose API keys or secrets in any file
- Never skip Auth session check in protected routes
- Never call Deepseek API without checking usage limits first
- Never write Arabic text using Google Translate quality
- Never use placeholder values in JSON-LD schema output
- Never commit .env files
- Never use 'any' TypeScript type
- Never bypass RLS policies in Supabase
- Never process Lemon Squeezy webhooks without signature verification

## Prompt Architecture Protection

The most critical files in this project are:
  src/lib/prompts.ts   → system prompts and user message builders
  src/lib/deepseek.ts    → deepseek API call logic with retry
  src/app/api/generate/route.ts → generation orchestration

These files implement a carefully designed two-call deepseek API architecture.
The system prompts inside prompts.ts are the core product value.

Before modifying ANY of these three files:
1. State exactly what you are changing and why
2. Confirm the change does not alter the prompt content
3. Confirm the two-call structure is preserved
4. Confirm the JSON output structure is unchanged
5. Confirm retry logic is intact

If a task requires changes to these files, make surgical edits only.
Never rewrite these files from scratch.