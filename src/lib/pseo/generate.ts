// ────────────────────────────────────────────────────────────
// WasafSEO PSEO — Generation Engine
// Deepseek API integration for PSEO content generation.
// Uses the same two-call pattern as the main app (Call 1: content,
// Call 2: schema) but with PSEO-specific prompt extensions.
//
// These functions are called by the batch generation script:
//   scripts/pseo/generate-pseo-content.ts
// ────────────────────────────────────────────────────────────

import {
  buildContentSystemPrompt,
  buildSchemaSystemPrompt,
} from '@/lib/prompts';
import {
  buildPSEOUserMessageExtension,
  buildPSEOContentSystemSupplement,
  buildPSEOSchemaSystemSupplement,
} from '@/lib/pseo/pseo-prompt-extensions';
import type {
  PSEOLocation,
  PSEONiche,
  PSEOPageContent,
  PSEOFAQ,
  PSEOStat,
  PSEOExpertQuote,
  PSEOPageSection,
  PSEOIntent,
  PSEOFormat,
} from '@/types/pseo';

// ─── Configuration ──────────────────────────────────────────────────────────────

const DEEPSEEK_CONFIG = {
  model: 'deepseek-chat' as const,
  endpoint: 'https://api.deepseek.com/v1/chat/completions',
  maxRetries: 2,
  retryDelayMs: 1000,
} as const;

const MAX_TOKENS_CONTENT = 8000;
const MAX_TOKENS_SCHEMA = 4000;

// ─── Output Types ───────────────────────────────────────────────────────────────

/**
 * The structured output expected from the PSEO content Deepseek call (Call 1).
 */
export interface PSEOContentOutput {
  title_ar: string;
  title_en: string;
  meta_description_ar: string;
  h1_ar: string;
  intro_text: string;
  sections: PSEOPageSection[];
  benefits: string[];
  faqs: PSEOFAQ[];
  local_stats: PSEOStat[];
  expert_quotes: PSEOExpertQuote[];
}

/**
 * The structured output expected from the PSEO schema Deepseek call (Call 2).
 */
export interface PSEOSchemaOutput {
  '@context': string;
  '@graph': Record<string, unknown>[];
}

// ─── Private Helpers ────────────────────────────────────────────────────────────

/**
 * Makes a single call to the Deepseek API.
 */
async function callDeepseek(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number,
  temperature: number,
): Promise<string> {
  const response = await fetch(DEEPSEEK_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_CONFIG.model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`Deepseek API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawText: string = data.choices?.[0]?.message?.content || '';

  if (!rawText) {
    throw new Error('Deepseek API returned empty response');
  }

  return rawText;
}

/**
 * Strips markdown code block markers and parses JSON.
 */
function parseJsonResponse<T>(rawText: string): T {
  const cleanText = rawText.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanText) as T;
}

/**
 * Builds the system prompt for the PSEO content call.
 * Appends the PSEO supplement to the existing content system prompt.
 */
function buildPSEOContentSystemPrompt(): string {
  const base = buildContentSystemPrompt();
  const supplement = buildPSEOContentSystemSupplement();
  return `${base}\n${supplement}`;
}

/**
 * Builds the system prompt for the PSEO schema call.
 * Appends the PSEO schema supplement to the existing schema system prompt.
 */
function buildPSEOSchemaSystemPrompt(): string {
  const base = buildSchemaSystemPrompt();
  const supplement = buildPSEOSchemaSystemSupplement();
  return `${base}\n${supplement}`;
}

// ─── Public API ─────────────────────────────────────────────────────────────────

/**
 * Call 1: Generates PSEO page content using Deepseek.
 *
 * @param params - Location, niche, intent, format, and keyword context
 * @returns Parsed PSEOContentOutput
 */
export async function generatePSEOContent(params: {
  location: PSEOLocation;
  niche: PSEONiche;
  intent: PSEOIntent;
  format: PSEOFormat;
  targetKeywordAr: string;
  targetKeywordEn: string;
}): Promise<PSEOContentOutput> {
  const userExtension = buildPSEOUserMessageExtension(params);
  const systemPrompt = buildPSEOContentSystemPrompt();

  // Build a user message that tells Deepseek what content to generate
  const userMessage = `Generate a complete Arabic SEO-optimized page for the following:

Target Keyword (Arabic): ${params.targetKeywordAr}
Target Keyword (English): ${params.targetKeywordEn}
Location: ${params.location.name_ar} (${params.location.name_en})
Country: ${params.location.country_ar}
Niche: ${params.niche.name_ar}
Intent: ${params.intent}
Format: ${params.format}

${userExtension}

Output the result as a JSON object with this exact structure:
{
  "title_ar": "Arabic page title (H1 equivalent, 50-60 chars)",
  "title_en": "English page title",
  "meta_description_ar": "Arabic meta description (150-160 chars)",
  "h1_ar": "Arabic H1 heading",
  "intro_text": "Arabic introductory paragraph (2-3 sentences)",
  "sections": [
    {
      "id": "unique-section-id",
      "heading": "Section heading in Arabic",
      "content": "Section content in Arabic (2-4 paragraphs)",
      "type": "paragraph | list | table | blockquote | cta"
    }
  ],
  "benefits": ["Benefit 1 in Arabic", "Benefit 2 in Arabic", ...],
  "faqs": [
    { "question": "FAQ question in Arabic", "answer": "FAQ answer in Arabic" }
  ],
  "local_stats": [
    {
      "label": "Stat label in Arabic",
      "value": "The statistic value",
      "source": "Source name",
      "sourceNeedsVerification": true
    }
  ],
  "expert_quotes": [
    {
      "text": "Quote text in Arabic",
      "expertName": "Expert name",
      "expertTitle": "Expert title",
      "isPlaceholder": true
    }
  ]
}

IMPORTANT: Generate between 8-15 sections. Minimum 1000 words total.
All text content must be in Arabic (except title_en).`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= DEEPSEEK_CONFIG.maxRetries; attempt++) {
    try {
      const rawText = await callDeepseek(messages, MAX_TOKENS_CONTENT, 0.7);
      const parsed = parseJsonResponse<PSEOContentOutput>(rawText);

      // Validate required fields exist
      if (!parsed.title_ar || !parsed.h1_ar || !parsed.intro_text) {
        throw new Error('Generated content missing required fields (title_ar, h1_ar, intro_text)');
      }

      return parsed;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < DEEPSEEK_CONFIG.maxRetries) {
        console.warn(`   ⚠️  Content generation attempt ${attempt + 1} failed, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, DEEPSEEK_CONFIG.retryDelayMs));
      }
    }
  }

  throw new Error(`PSEO content generation failed after 3 attempts: ${lastError?.message}`);
}

/**
 * Call 2: Generates Schema.org JSON-LD for the PSEO page using Deepseek.
 *
 * @param params - Location, niche, generated content, and intent
 * @returns Parsed PSEOSchemaOutput
 */
export async function generatePSEOSchema(params: {
  location: PSEOLocation;
  niche: PSEONiche;
  contentOutput: PSEOContentOutput;
  intent: PSEOIntent;
}): Promise<PSEOSchemaOutput> {
  const systemPrompt = buildPSEOSchemaSystemPrompt();

  const userMessage = `Generate Schema.org JSON-LD markup for a page about ${params.niche.name_ar} in ${params.location.name_ar}.

Page Title: ${params.contentOutput.title_ar}
Page Description: ${params.contentOutput.meta_description_ar}
H1: ${params.contentOutput.h1_ar}
FAQ count: ${params.contentOutput.faqs.length}
Sections count: ${params.contentOutput.sections.length}

Domain: wasafseo.wasleen.com
inLanguage: ar

Output valid JSON-LD with @context and @graph array containing:
1. Organization node for WasafSEO
2. WebSite node
3. WebPage node for this specific page
4. Article node with the page content
5. FAQPage node with the Q&A pairs
6. LocalBusiness node for ${params.location.name_ar} if applicable

IMPORTANT: All schema content must be in Arabic. Use wasafseo.wasleen.com as the base URL.
The page URL path is: /${params.niche.slug}/${params.location.slug}/${params.intent}/[format]`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= DEEPSEEK_CONFIG.maxRetries; attempt++) {
    try {
      const rawText = await callDeepseek(messages, MAX_TOKENS_SCHEMA, 0.3);
      const parsed = parseJsonResponse<PSEOSchemaOutput>(rawText);

      if (!parsed['@context'] || !parsed['@graph']) {
        throw new Error('Generated schema missing required fields (@context, @graph)');
      }

      return parsed;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < DEEPSEEK_CONFIG.maxRetries) {
        console.warn(`   ⚠️  Schema generation attempt ${attempt + 1} failed, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, DEEPSEEK_CONFIG.retryDelayMs));
      }
    }
  }

  throw new Error(`PSEO schema generation failed after 3 attempts: ${lastError?.message}`);
}

/**
 * Estimates word count of generated content from sections.
 */
export function estimateWordCount(content: PSEOContentOutput): number {
  const texts = [
    content.intro_text,
    ...content.sections.map((s) => `${s.heading} ${s.content}`),
    ...content.benefits,
    ...content.faqs.map((f) => `${f.question} ${f.answer}`),
  ];

  return texts.reduce((total, text) => {
    return total + (text ? text.split(/\s+/).length : 0);
  }, 0);
}
