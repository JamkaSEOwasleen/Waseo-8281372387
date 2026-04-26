import type { PSEOLocation, PSEONiche } from '@/types/pseo';

/**
 * Builds the PSEO-specific user message extension that gets appended to
 * the existing content user message from src/lib/prompts.ts.
 *
 * This adds location data, format rules, quality requirements,
 * CTA requirements, and internal linking instructions.
 */
export function buildPSEOUserMessageExtension(params: {
  location: PSEOLocation;
  niche: PSEONiche;
  intent: string;
  format: string;
  targetKeywordAr: string;
  targetKeywordEn: string;
}): string {
  return `
━━━━ PSEO LOCATION & FORMAT CONTEXT ━━━━

Target Location: ${params.location.name_ar} (${params.location.name_en})
Target Country: ${params.location.country_ar} (${params.location.country})
Location Type: ${params.location.location_type}
Location Population: ${params.location.population.toLocaleString()}

Target Keyword (Arabic): ${params.targetKeywordAr}
Target Keyword (English): ${params.targetKeywordEn}

Niche: ${params.niche.name_ar} (${params.niche.name_en})
Intent: ${params.intent}
Format: ${params.format}

━━━━ FORMAT-SPECIFIC RULES ━━━━

This page uses the "${params.format}" format. Follow these output rules:

${getFormatRules(params.format, params.location, params.niche)}

━━━━ QUALITY REQUIREMENTS ━━━━

1. Word count: minimum 1000 words, maximum 3500 words
2. Include at least 3 internal links to other WasafSEO pages
3. Include a Call-to-Action (CTA) to sign up for WasafSEO
4. Use high-quality Arabic — professional, clear, natural
5. Include at least one location-specific statistic about ${params.location.name_ar}
6. Include at least 3 FAQ questions relevant to ${params.targetKeywordAr}
7. All statistics must have [SOURCE: verify] markers if they are approximate
8. Content must be 85%+ unique — do not copy from other SEO sites

━━━━ CTA REQUIREMENTS ━━━━

Every page must include at least one CTA that:
- Encourages the reader to try WasafSEO for their SEO content needs
- Links to: https://wasafseo.wasleen.com/login?ref=pseo-${params.niche.slug}-${params.location.slug}
- Uses natural Arabic phrasing (not spammy)
- Fits the context of the section it appears in

━━━━ INTERNAL LINKING REQUIREMENTS ━━━━

Include contextual internal links to:
1. The main ${params.niche.name_ar} hub page for ${params.location.name_ar}
2. Other ${params.niche.name_ar} service pages
3. Related service pages in ${params.location.name_ar}
4. WasafSEO tool/product pages where relevant

━━━━ ANTI-HALLUCINATION RULES ━━━━

1. If you cannot find a real statistic for ${params.location.name_ar}, use an estimate with "[SOURCE: verify]" flag
2. Do not invent expert names — use "[REPLACE WITH REAL QUOTE]" for placeholder quotes
3. Do not claim specific business results without evidence
4. Do not fabricate local authority figures or government programs
5. If unsure about a fact, phrase it as a general industry observation
`;
}

/**
 * Builds the PSEO system prompt supplement that gets APPENDED to
 * the existing content system prompt from src/lib/prompts.ts.
 * It is NEVER added before the existing prompt.
 */
export function buildPSEOContentSystemSupplement(): string {
  return `

━━━━ PSEO SYSTEM SUPPLEMENT ━━━━

ADDITIONAL RULES FOR THIS CONTENT:

1. This content is for WasafSEO's own website (wasafseo.wasleen.com)
2. Every page must include a CTA to sign up for WasafSEO
3. Include real location-specific data where available
4. Quality must be 85+/100 — professional, accurate, valuable
5. Use [SOURCE: verify] for any statistic that is estimated
6. Use [REPLACE WITH REAL QUOTE] for placeholder expert quotes
7. All content must be in Arabic (output language is ALWAYS Arabic)
8. Include JSON-LD schema markup in the output where appropriate
9. The page should establish E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)
10. Do not mention specific competitors by name — refer to "other tools" or "alternative services"
`;
}

/**
 * Builds the PSEO schema system prompt supplement that gets APPENDED to
 * the existing schema system prompt from src/lib/prompts.ts.
 */
export function buildPSEOSchemaSystemSupplement(): string {
  return `

━━━━ PSEO SCHEMA SUPPLEMENT ━━━━

ADDITIONAL SCHEMA RULES:

1. Use wasafseo.wasleen.com as the domain
2. Include these schema.org nodes: Organization, WebSite, WebPage, Article, FAQPage
3. Organization node must include:
   - name: "WasafSEO"
   - url: "https://wasafseo.wasleen.com"
   - description: "منصة متخصصة في كتابة وتحسين المحتوى العربي لمحركات البحث"
   - sameAs: ["https://twitter.com/wasafseo", "https://linkedin.com/company/wasafseo"]
4. WebSite node must include:
   - url: "https://wasafseo.wasleen.com"
   - inLanguage: "ar"
5. WebPage/Article node must include:
   - inLanguage: "ar"
   - author reference pointing to the Organization
6. FAQPage node must include the Q&A pairs from the content
7. Generate realistic statistics with [SOURCE: verify] flags
8. inLanguage must ALWAYS be "ar" even if the keyword was in English
`;
}

/**
 * Returns format-specific rules for the user message extension.
 */
function getFormatRules(
  format: string,
  location: PSEOLocation,
  niche: PSEONiche,
): string {
  const rules: Record<string, string> = {
    'service-page': `This is a SERVICE PAGE for ${niche.name_ar} in ${location.name_ar}.
- Structure: Hero → What We Offer → Benefits → Process → Pricing → FAQ → CTA
- Focus on how WasafSEO's ${niche.name_ar} services benefit businesses in ${location.name_ar}
- Include local context and why ${location.name_ar} businesses need this service
- Emphasize Arabic-first approach and local market understanding`,

    guide: `This is a COMPREHENSIVE GUIDE about ${niche.name_ar} in ${location.name_ar}.
- Structure: Introduction → Step-by-step sections → Tips → Common mistakes → FAQ → CTA
- Provide actionable, detailed guidance
- Reference local regulations or practices in ${location.country_ar} where relevant
- Include examples specific to ${location.name_ar}`,

    comparison: `This is a COMPARISON PAGE comparing WasafSEO's ${niche.name_ar} with alternatives.
- Structure: Introduction → Feature comparison table → Pricing comparison → Pros/Cons → Verdict → CTA
- Compare WasafSEO with "other tools" (do not name competitors)
- Focus on Arabic-language advantages and local market knowledge
- Include a clear "Why WasafSEO" section`,

    list: `This is a LISTICLE about top ${niche.name_ar} tips/resources for ${location.name_ar}.
- Structure: Introduction → Numbered list items → Summary → CTA
- Each list item should have a clear heading and 2-3 paragraphs
- Include local examples from ${location.name_ar}
- Minimum 7 list items`,

    tool: `This is a TOOL PAGE about WasafSEO's ${niche.name_ar} capabilities for ${location.name_ar}.
- Structure: Problem → Solution → Features → Benefits → How to use → FAQ → CTA
- Focus on practical applications for ${location.name_ar} businesses
- Include specific features that address local market needs
- Show before/after or with/without scenarios`,

    hub: `This is a HUB PAGE for ${niche.name_ar} in ${location.name_ar}.
- Structure: Hero → Overview → Service categories → Featured guides → CTA → Related locations
- Link to all sub-pages within this niche+location combination
- Provide a comprehensive overview of the topic
- Include a table of contents linking to main sections`,

    blog: `This is a BLOG POST about ${niche.name_ar} in ${location.name_ar}.
- Structure: Hook → Body sections → Conclusion → CTA
- Engaging, readable style suitable for a blog audience
- Include practical tips and actionable advice
- Reference local events or trends in ${location.country_ar}`,

    geo: `This is a GEO/AIO OPTIMIZATION page about ${niche.name_ar} for ${location.name_ar}.
- Structure: Current AI search landscape → Optimization strategies → Implementation → FAQ → CTA
- Focus on how AI search engines (SGE/Bard/ChatGPT) handle ${niche.name_ar} queries in Arabic
- Include strategies specific to the Arabic language market
- Reference AI search trends in the Middle East`,

    'case-study': `This is a CASE STUDY page for ${niche.name_ar} in ${location.name_ar}.
- Structure: Client background → Challenge → Solution → Results → Testimonial → CTA
- Use anonymized client data ("a leading company in ${location.name_ar}")
- Include specific metrics and results
- Show the transformation process clearly`,

    glossary: `This is a GLOSSARY page for ${niche.name_ar} terms relevant to ${location.name_ar}.
- Structure: Introduction → Glossary terms (alphabetical/thematic) → Related resources → CTA
- Define 15-20 key terms with Arabic explanations
- Each term: term name (Arabic + English) → brief definition → why it matters
- Terms should be relevant to the ${location.name_ar} market`,
  };

  return rules[format] ?? `Standard content format for ${format}.`;
}
