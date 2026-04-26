# WasafSEO API Prompt Architecture — SACRED. DO NOT MODIFY.

## Overview
The content generation system uses exactly TWO deepseek API calls per generation.
This is a deliberate architectural decision. Never merge into one call.
Never reduce to one call to "save tokens" or "simplify".
Two calls = better output quality and lower hallucination rate.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## File Locations — Non-Negotiable
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All prompt logic lives in ONE file only:
  src/lib/prompts.ts

This file exports exactly these functions:
  buildContentSystemPrompt()     → returns Call 1 system prompt string
  buildSchemaSystemPrompt()      → returns Call 2 system prompt string
  buildContentUserMessage()      → returns Call 1 user message string
  buildSchemaUserMessage()       → returns Call 2 user message string

All deepseek API calls live in ONE file only:
  src/lib/deepseek.ts

This file exports exactly these functions:
  generateContentBrief(params)   → executes Call 1, returns parsed BriefOutput
  generateSchema(params)         → executes Call 2, returns parsed schema object

The API route at src/app/api/generate/route.ts:
  NEVER calls fetch("https://api.anthropic.com/...") directly
  ALWAYS calls generateContentBrief() and generateSchema() from src/lib/deepseek.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Deepseek API Configuration — Fixed Values
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Model**: `deepseek-chat` — never change this
  NEVER change this model name
  NEVER use a variable for model name — hardcode it

Call 1 max_tokens: 8000
  NEVER reduce this — brief output needs full token budget
  
Call 2 max_tokens: 4000
  NEVER reduce this — schema output needs sufficient tokens

API endpoint: https://api.anthropic.com/v1/messages
  Use ANTHROPIC_API_KEY from environment variable
  NEVER hardcode the API key anywhere

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## The System Prompts — Sacred Content
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The system prompts in src/lib/prompts.ts are the core product.
They must be copied EXACTLY as provided — every word, every rule,
every formatting mark, every Arabic character.

NEVER:
- Shorten or summarize the system prompts
- Rephrase any instruction in the system prompts
- Remove any section from the system prompts
- Add your own instructions to the system prompts
- Split the system prompts differently
- Combine the two system prompts into one

The system prompts contain:
- LANGUAGE RULE section → output always Arabic regardless of input language
- INTENT RULES section → 5 intent types with different output structures
- GEO/AIO CITATION RULES section → stats, quotes, E-E-A-T signals
- OUTPUT FORMAT section → exact JSON structure required
- CONDITIONAL BLOCKS section → comparisonTable and howToSteps rules

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## The JSON Output Structure — Fixed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Call 1 returns this exact top-level structure:
{
  "fundamentals": { ... },
  "content": { ... }
}

Call 2 returns this exact top-level structure:
{
  "@context": "https://schema.org",
  "@graph": [ ... ]
}

NEVER change these top-level keys.
NEVER add extra wrapper objects.
NEVER rename fundamentals, content, @context, or @graph.

The TypeScript types in src/types/index.ts define these structures.
The JSON output from deepseek MUST match these types exactly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## JSON Parsing — Required Pattern
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After every deepseek API response, parse like this:

const rawText = data.content.map(b => b.text || "").join("")
const cleanText = rawText.replace(/```json|```/g, "").trim()
const parsed = JSON.parse(cleanText)

This exact pattern handles deepseek sometimes wrapping JSON in markdown.
NEVER skip the .replace() step.
NEVER assume the response is already clean JSON.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Retry Logic — Required
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Both generateContentBrief() and generateSchema() must implement:
- Maximum 2 retries on JSON parse failure
- Wait 1000ms between retries
- On 3rd failure: throw descriptive error with which call failed
- Log the raw response text when parse fails (for debugging)
- NEVER silently return null or undefined on parse failure

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## API Route Order — Non-Negotiable
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The /api/generate/route.ts must execute in this EXACT order:

1. requireSession()                    → auth check first, always
2. Zod validation of request body      → validate before any DB call
3. checkUsageLimit(userId, plan)       → check limit before calling deepseek
4. Fetch website from Supabase         → verify ownership with user_id filter
5. generateContentBrief()             → Call 1 to deepseek
6. generateSchema()                   → Call 2 to deepseek with Call 1 output
7. Insert brief + schema to Supabase  → save after both calls succeed
8. incrementUsage(userId)             → increment ONLY after successful save
9. Return { brief, schema, briefId }  → return all three

NEVER increment usage before saving to Supabase.
NEVER save partial results (must have both brief AND schema).
NEVER return without briefId.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## User Message Templates — Dynamic Variables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Call 1 user message must include ALL of these variables:
  ${keyword}           → raw user input, any language
  ${intent}            → one of: how-to|informational|commercial|comparison|navigational
  ${location}          → target country name in English
  ${additionalInfo}    → user's free text or "None provided"
  ${website.domain}
  ${website.brandName}
  ${website.brandDescription}
  ${website.authorName}
  ${website.authorTitle}
  ${website.authorBio}
  ${website.authorTopics.join(", ")}
  ${website.authorLinkedin || "not provided"}
  ${website.authorPortfolio || "not provided"}
  ${new Date().toISOString().split("T")[0]}   → today's date

Call 2 user message must include ALL of these variables:
  ${website.domain}
  ${website.brandName}
  ${website.brandDescription}
  ${website.logoUrl || website.domain + "/logo.png"}
  ${website.twitter || "not provided"}
  ${website.linkedin || "not provided"}
  ${website.wikipedia || "not provided"}
  ${website.authorName}
  ${website.authorTitle}
  ${website.authorBio}
  ${website.authorTopics.join(", ")}
  ${website.authorLinkedin || "not provided"}
  ${website.authorPortfolio || "not provided"}
  ${JSON.stringify(contentBriefOutput, null, 2)}   → full Call 1 output
  ${new Date().toISOString().split("T")[0]}         → today's date
  ${intent}

NEVER omit any variable from the user messages.
NEVER pass undefined — always provide fallback values.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Vercel Configuration — Required
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
vercel.json must set maxDuration for generate route:
{
  "functions": {
    "src/app/api/generate/route.ts": { "maxDuration": 60 },
    "src/app/api/export/pdf/route.ts": { "maxDuration": 30 }
  }
}

Without maxDuration: 60, Vercel will timeout the generate route
at 10 seconds — killing both deepseek API calls before they complete.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Error Messages — Arabic Required
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All user-facing API errors must be in Arabic:

Usage limit reached:
  "لقد استنفدت حد الموجزات لهذا الشهر. يرجى ترقية خطتك للمتابعة."

Website not found:
  "الموقع غير موجود أو لا تملك صلاحية الوصول إليه."

Generation failed:
  "فشل إنشاء الموجز. يرجى المحاولة مرة أخرى."

Auth required:
  "يجب تسجيل الدخول للوصول إلى هذه الخدمة."

Internal server error:
  "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."