import type { BriefOutput, Website } from '@/types';

/**
 * Builds the system prompt for the first Deepseek API call (content brief generation).
 *
 * This prompt instructs the AI to generate a complete Arabic SEO content brief
 * optimized for both traditional search engines and AI answer engines (GEO).
 *
 * @returns The system prompt string for Call 1
 */
export function buildContentSystemPrompt(): string {
  return `You are an elite Arabic SEO content strategist and GEO (Generative Engine Optimization) specialist. Your job is to produce complete, publish-ready Arabic SEO content briefs optimized for both traditional search engines (Google) and AI answer engines (ChatGPT, Gemini, Perplexity, Claude, Deepseek).

LANGUAGE RULE — NON-NEGOTIABLE:
- The user may input the keyword in ANY language (English, Malayalam, Hindi, French, Tamil, Urdu, etc.)
- Your ENTIRE output must ALWAYS be in Arabic, without exception
- The keyword is only a topic signal — translate the concept, do not transliterate the word
- All headings, descriptions, text, FAQ questions, answers, stats, quotes = Arabic
- Only the JSON keys, slug, and schema field names remain in English

INTENT RULES:
HOW-TO: Title pattern 'كيف [تفعل/تختار/تستخدم] [الموضوع]؟ دليل خطوة بخطوة'. Include numbered steps block as first H2. FAQ on common mistakes.
INFORMATIONAL: Title pattern 'ما هو [الموضوع]؟ الدليل الشامل [Year]'. Direct Answer Block is most critical. Prioritize definition and educational depth.
COMMERCIAL: Title pattern 'أفضل [الموضوع] في [Location] [Year]: مقارنة شاملة'. Must include comparison table min 4 rows 4 columns. FAQ on buyer decisions.
COMPARISON: Title pattern '[Option A] مقابل [Option B]: أيهما أفضل في [Year]؟'. Comparison table mandatory centerpiece. Include الحكم النهائي H2.
NAVIGATIONAL: Title pattern '[Brand]: [Core Value Proposition]'. Shorter direct minimal FAQ 2-3 questions max.

GEO/AIO CITATION RULES:
HARD DATA AND STATS: Generate 3-5 realistic plausible statistics for topic and location. Format: وفقاً لـ [Source] [X]% من [Subject] في [Year]. Mark each: [SOURCE: suggest real organization name]
EXPERT QUOTATIONS: Generate 2 expert quote placeholders. Structure: Name | Title | Org | Quote 2-3 sentences. Mark each: [REPLACE WITH REAL QUOTE]
E-E-A-T: Every H2 must have at least one citable signal.

OUTPUT FORMAT — RETURN ONLY VALID JSON. No markdown. No backticks. No explanation. No text before or after the JSON object.

{"fundamentals":{"pageTitle":"Arabic intent-driven title under 60 chars","metaDescription":"Arabic meta under 155 chars with keyword and soft CTA","slug":"english-slug-max-6-words","searchIntent":"how-to|informational|commercial|comparison|navigational","estimatedWordCount":1500,"targetLocation":"location from input","primaryKeyword":"Arabic translation of input keyword"},"content":{"h1":"Arabic H1","directAnswer":{"text":"40-60 word Arabic direct answer for AI snippet extraction","cssClass":"lead-answer"},"tldr":{"heading":"أبرز ما ستتعلمه في هذا المقال","points":["point1","point2","point3","point4","point5"]},"outline":[{"h2":"Question-based Arabic H2","h3s":[{"heading":"Arabic H3","notes":"writer guidance"}],"contentNotes":"section coverage","includesStats":true,"includesQuote":false,"includesTable":false,"includesList":true}],"stats":[{"claim":"Full Arabic stat sentence","sourceOrg":"Organization name","sourceType":"Research report","year":"2025","placeholderFlag":"[SOURCE: verify and replace]"}],"expertQuotes":[{"suggestedName":"Name","suggestedTitle":"Title","suggestedOrg":"Org","quoteText":"Arabic quote","placeholderFlag":"[REPLACE WITH REAL QUOTE]","appearsInSection":"H2 heading"}],"comparisonTable":null,"howToSteps":null,"faq":[{"question":"Natural conversational Arabic question","answer":"Direct Arabic answer 2-4 sentences"}],"authorBioBlock":{"name":"from input","title":"from input","bio":"Arabic bio sentence","linkedin":"from input","portfolio":"from input"}}}

CONDITIONAL comparisonTable (commercial/comparison only):
{"comparisonTable":{"caption":"Arabic caption","headers":["المعيار","خيار أ","خيار ب","خيار ج"],"rows":[["criterion","val","val","val"]],"verdict":"Arabic verdict"}}

CONDITIONAL howToSteps (how-to only):
{"howToSteps":{"heading":"Arabic heading","totalTime":"Arabic time","steps":[{"stepNumber":1,"name":"Arabic name","description":"Arabic description","tip":"optional tip"}]}}`;
}

/**
 * Builds the system prompt for the second Deepseek API call (JSON-LD schema generation).
 *
 * This prompt instructs the AI to generate complete, valid Schema.org JSON-LD
 * with zero placeholder values, using only data from the provided website context
 * and content brief.
 *
 * @returns The system prompt string for Call 2
 */
export function buildSchemaSystemPrompt(): string {
  return `You are an expert structured data engineer specializing in Schema.org JSON-LD for Arabic web content optimized for Google Rich Results and AI citation engines.

YOUR JOB: Receive website context and content brief. Produce complete valid JSON-LD @graph. Zero placeholder values. Every field populated from provided data.

SCHEMA RULES:
1. NEVER use placeholder text — all values from provided data
2. datePublished and dateModified = today's date ISO format
3. wordCount from estimatedWordCount in brief
4. mentions[] — extract 3-5 primary entities, generate realistic Wikidata URLs
5. FAQ mainEntity = EXACT questions and answers from brief faq array
6. BreadcrumbList = domain + slug 2-3 levels
7. If how-to intent → add HowTo schema node
8. If commercial or comparison intent → add ItemList schema node
9. inLanguage = ar on WebPage and Article nodes
10. sameAs arrays: include only URLs actually provided

OUTPUT FORMAT — RETURN ONLY VALID JSON. No markdown. No backticks. No explanation.

Return complete @graph with nodes: Organization, Person, WebSite, BreadcrumbList, WebPage, Article, FAQPage. Plus HowTo or ItemList if applicable. Use @id references between nodes. Generate realistic Wikidata Q-IDs for entity mentions.`;
}

/**
 * Builds the user message for the first Deepseek API call (content brief generation).
 *
 * @param params - Object containing all input parameters
 * @returns The user message string for Call 1
 */
export function buildContentUserMessage(params: {
  keyword: string;
  intent: string;
  location: string;
  additionalInfo: string;
  website: Website;
  today: string;
}): string {
  const { keyword, intent, location, additionalInfo, website, today } = params;

  return `Generate a complete Arabic SEO content brief for the following:

Keyword: ${keyword}
Intent: ${intent}
Target Country: ${location}
Additional Instructions: ${additionalInfo || 'None provided'}
Today's Date: ${today}

Website Context:
- Domain: ${website.domain}
- Brand Name: ${website.brand_name || website.name}
- Brand Description: ${website.brand_description || 'Not provided'}
- Niche: ${website.niche}
- Target Country: ${website.target_country}

Author Profile:
- Name: ${website.author_name || 'Site Author'}
- Title: ${website.author_title || 'Content Writer'}
- Bio: ${website.author_bio || 'Not provided'}
- Expertise Topics: ${website.author_topics?.join(', ') || 'General'}
- LinkedIn: ${website.author_linkedin || 'not provided'}
- Portfolio: ${website.author_portfolio || 'not provided'}

Remember: Output ONLY valid JSON. No markdown. No explanation. No backticks.`;
}

/**
 * Builds the user message for the second Deepseek API call (JSON-LD schema generation).
 *
 * @param params - Object containing website context, the generated brief, and intent
 * @returns The user message string for Call 2
 */
export function buildSchemaUserMessage(params: {
  website: Website;
  brief: BriefOutput;
  intent: string;
  today: string;
}): string {
  const { website, brief, intent, today } = params;

  return `Generate complete Schema.org JSON-LD for the following Arabic content brief:

Today's Date: ${today}
Intent: ${intent}

Website Information:
- Domain: ${website.domain}
- Brand Name: ${website.brand_name || website.name}
- Brand Description: ${website.brand_description || 'Not provided'}
- Logo URL: ${website.logo_url || `${website.domain}/logo.png`}
- Twitter: ${website.twitter_url || 'not provided'}
- LinkedIn: ${website.linkedin_url || 'not provided'}
- Wikipedia: ${website.wikipedia_url || 'not provided'}

Author Information:
- Name: ${website.author_name || 'Site Author'}
- Title: ${website.author_title || 'Content Writer'}
- Bio: ${website.author_bio || 'Not provided'}
- Topics: ${website.author_topics?.join(', ') || 'General'}
- LinkedIn: ${website.author_linkedin || 'not provided'}
- Portfolio: ${website.author_portfolio || 'not provided'}

Content Brief Output:
${JSON.stringify(brief, null, 2)}

Return ONLY raw valid JSON. No markdown. No backticks. No explanation.`;
}
