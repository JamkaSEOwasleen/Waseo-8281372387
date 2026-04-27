import {
  buildContentSystemPrompt,
  buildContentUserMessage,
  buildSchemaSystemPrompt,
  buildSchemaUserMessage,
} from '@/lib/prompts';
import type { BriefOutput, SchemaOutput, Website } from '@/types';

/**
 * Deepseek API configuration — never change these values.
 */
const DEEPSEEK_CONFIG = {
  model: 'deepseek-chat' as const,
  endpoint: 'https://api.deepseek.com/v1/chat/completions',
  maxRetries: 2,
  retryDelayMs: 1000,
  /** Per-fetch timeout in ms — prevents hanging when Deepseek is overloaded */
  fetchTimeoutMs: 25000,
} as const;

/**
 * Maximum tokens for each call — critical for output quality.
 * Call 1 (content brief): 8000 — never reduce, brief needs full budget
 * Call 2 (schema): 4000 — never reduce, schema needs sufficient tokens
 */
const MAX_TOKENS_CONTENT = 8000;
const MAX_TOKENS_SCHEMA = 4000;

/**
 * Generic call to the Deepseek API.
 *
 * @param messages - Array of system and user messages
 * @param maxTokens - Maximum output tokens for this call
 * @param temperature - Temperature for generation (0.0 - 1.0)
 * @returns The raw text content from the API response
 */
async function callDeepseek(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number,
  temperature: number
): Promise<string> {
  // AbortController prevents fetch from hanging indefinitely when Deepseek is overloaded
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    DEEPSEEK_CONFIG.fetchTimeoutMs
  );

  let response: Response;
  try {
    response = await fetch(DEEPSEEK_CONFIG.endpoint, {
      signal: controller.signal,
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
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`Deepseek API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  // Extract text from response, handling both stream and non-stream formats
  const rawText = data.choices?.[0]?.message?.content || '';

  if (!rawText) {
    throw new Error('Deepseek API returned empty response');
  }

  return rawText;
}

/**
 * Attempts to parse JSON from Deepseek response, stripping markdown code blocks.
 * Deepseek sometimes wraps JSON in ```json or ``` backticks.
 */
function parseJsonResponse<T>(rawText: string): T {
  // Strip markdown code block markers
  const cleanText = rawText.replace(/```json|```/g, '').trim();

  // Validate that the content looks like JSON before parsing.
  // Deepseek sometimes returns HTTP 200 with an error message in the content
  // field instead of valid JSON (e.g. "An error occurred while processing...").
  if (!cleanText.startsWith('{') && !cleanText.startsWith('[')) {
    throw new Error(
      `Deepseek returned non-JSON content. First 100 chars: "${cleanText.slice(0, 100)}"`
    );
  }

  return JSON.parse(cleanText) as T;
}

/**
 * Generates a complete Arabic SEO content brief using the Deepseek API.
 *
 * Call 1 of the two-call architecture.
 * Makes up to (maxRetries + 1) attempts on JSON parse failure.
 *
 * @param params - Input parameters including keyword, intent, location, website
 * @returns Parsed BriefOutput matching the BriefOutput type
 * @throws Error if generation fails after all retries
 */
export async function generateContentBrief(params: {
  keyword: string;
  intent: string;
  location: string;
  additionalInfo: string;
  website: Website;
}): Promise<BriefOutput> {
  const today = new Date().toISOString().split('T')[0];

  const messages = [
    { role: 'system', content: buildContentSystemPrompt() },
    {
      role: 'user',
      content: buildContentUserMessage({ ...params, today }),
    },
  ];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= DEEPSEEK_CONFIG.maxRetries; attempt++) {
    try {
      const rawText = await callDeepseek(messages, MAX_TOKENS_CONTENT, 0.7);
      const parsed = parseJsonResponse<BriefOutput>(rawText);
      return parsed;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < DEEPSEEK_CONFIG.maxRetries) {
        // Wait before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, DEEPSEEK_CONFIG.retryDelayMs)
        );
      }
    }
  }

  throw new Error(`Content brief generation failed after 3 attempts: ${lastError?.message}`);
}

/**
 * Generates Schema.org JSON-LD for the content brief using the Deepseek API.
 *
 * Call 2 of the two-call architecture — always called after generateContentBrief.
 * Makes up to (maxRetries + 1) attempts on JSON parse failure.
 *
 * @param params - Website context, the generated brief output, and intent
 * @returns Parsed SchemaOutput matching the SchemaOutput type
 * @throws Error if generation fails after all retries
 */
export async function generateSchema(params: {
  website: Website;
  brief: BriefOutput;
  intent: string;
}): Promise<SchemaOutput> {
  const today = new Date().toISOString().split('T')[0];

  const messages = [
    { role: 'system', content: buildSchemaSystemPrompt() },
    {
      role: 'user',
      content: buildSchemaUserMessage({ ...params, today }),
    },
  ];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= DEEPSEEK_CONFIG.maxRetries; attempt++) {
    try {
      const rawText = await callDeepseek(messages, MAX_TOKENS_SCHEMA, 0.3);
      const parsed = parseJsonResponse<SchemaOutput>(rawText);
      return parsed;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < DEEPSEEK_CONFIG.maxRetries) {
        // Wait before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, DEEPSEEK_CONFIG.retryDelayMs)
        );
      }
    }
  }

  throw new Error(`Schema generation failed after 3 attempts: ${lastError?.message}`);
}
