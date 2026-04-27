import type {
  PSEOPublishedPage,
  PSEOIntent,
  PSEOFormat,
  PSEOParsedUrl,
  PSEOInternalLink,
  PSEORelatedPage,
} from '@/types/pseo';

/**
 * Builds a URL path from pillar, location, and optional subtopic segments.
 *
 * Examples:
 *   buildUrlPath('content-writing', 'riyadh')           → '/content-writing/riyadh'
 *   buildUrlPath('content-writing', 'riyadh', ['seo'])  → '/content-writing/riyadh/seo'
 */
export function buildUrlPath(
  pillar: string,
  location: string,
  subtopic?: string | string[],
): string {
  const parts = ['', pillar, location];

  if (subtopic) {
    const subParts = Array.isArray(subtopic) ? subtopic : [subtopic];
    parts.push(...subParts);
  }

  return parts.join('/');
}

/**
 * Parses a URL path into its pillar, location, and subtopic components.
 *
 * Examples:
 *   parseUrlPath('/content-writing/riyadh')        → { pillar: 'content-writing', location: 'riyadh', subtopic: null }
 *   parseUrlPath('/content-writing/riyadh/seo')    → { pillar: 'content-writing', location: 'riyadh', subtopic: 'seo' }
 */
export function parseUrlPath(urlPath: string): PSEOParsedUrl {
  const parts = urlPath.split('/').filter(Boolean);

  return {
    pillar: parts[0] ?? '',
    location: parts[1] ?? '',
    subtopic: parts[2] ?? null,
  };
}

/**
 * Calculates a quality score (0-100) for a generated PSEO page.
 *
 * Scoring factors:
 * - Word count (max 30 points): 1000+ words = 30, fewer = proportional
 * - Internal links (max 20 points): 8+ links = 20, fewer = proportional
 * - CTA presence (max 15 points): 15 if CTA found, 0 otherwise
 * - Arabic text ratio (max 20 points): >80% Arabic = 20, proportional
 * - FAQ count (max 15 points): 3+ FAQs = 15, fewer = proportional
 */
export function calculateQualityScore(
  page: Pick<
    PSEOPublishedPage,
    'word_count' | 'internal_links' | 'faqs' | 'content_json'
  >,
): number {
  let score = 0;

  // Word count: up to 30 points
  const wordCount = page.word_count ?? 0;
  if (wordCount >= 1000) {
    score += 30;
  } else {
    score += Math.round((wordCount / 1000) * 30);
  }

  // Internal links: up to 20 points
  const linkCount = page.internal_links?.length ?? 0;
  if (linkCount >= 8) {
    score += 20;
  } else {
    score += Math.round((linkCount / 8) * 20);
  }

  // CTA presence: up to 15 points
  const contentStr = JSON.stringify(page.content_json ?? {});
  const hasCTA =
    /(WasafSEO|Start|Try|Sign|Subscribe|Join)/i.test(contentStr);
  if (hasCTA) {
    score += 15;
  }

  // Arabic text ratio: up to 20 points
  const arabicChars = (contentStr.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) ?? [])
    .length;
  const totalChars = contentStr.length;
  const arabicRatio = totalChars > 0 ? arabicChars / totalChars : 0;
  if (arabicRatio >= 0.8) {
    score += 20;
  } else {
    score += Math.round(arabicRatio * 20);
  }

  // FAQ count: up to 15 points
  const faqCount = page.faqs?.length ?? 0;
  if (faqCount >= 3) {
    score += 15;
  } else {
    score += Math.round((faqCount / 3) * 15);
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Auto-generates internal links for a PSEO page.
 *
 * Rules:
 * - 8-15 total links
 * - First link always points back to the hub page
 * - Mix of hub, spoke, related, and nearby links
 * - Prefer higher-quality related pages
 */
export function generateInternalLinks(
  page: Pick<PSEOPublishedPage, 'url_path'>,
  relatedPages: PSEORelatedPage[],
): PSEOInternalLink[] {
  const parsed = parseUrlPath(page.url_path);
  const links: PSEOInternalLink[] = [];

  // Link back to hub page
  const hubPath = buildUrlPath(parsed.pillar, parsed.location);
  links.push({
    text: '',
    href: hubPath,
    type: 'hub',
  });

  // Add spoke links from related pages (same pillar + location)
  const samePillarLocation = relatedPages.filter(
    (rp) => rp.pillar === parsed.pillar && rp.location === parsed.location,
  );
  for (const rp of samePillarLocation.slice(0, 3)) {
    links.push({
      text: rp.title,
      href: rp.url_path,
      type: 'spoke',
    });
  }

  // Add related links (same pillar, different locations)
  const samePillarOther = relatedPages.filter(
    (rp) => rp.pillar === parsed.pillar && rp.location !== parsed.location,
  );
  for (const rp of samePillarOther.slice(0, 3)) {
    links.push({
      text: rp.title,
      href: rp.url_path,
      type: 'related',
    });
  }

  // Add nearby links (different pillar, same location)
  const nearby = relatedPages.filter(
    (rp) => rp.pillar !== parsed.pillar && rp.location === parsed.location,
  );
  for (const rp of nearby.slice(0, 3)) {
    links.push({
      text: rp.title,
      href: rp.url_path,
      type: 'nearby',
    });
  }

  // Fill remaining slots from any remaining related pages
  const usedPaths = new Set(links.map((l) => l.href));
  for (const rp of relatedPages) {
    if (links.length >= 15) break;
    if (!usedPaths.has(rp.url_path)) {
      links.push({
        text: rp.title,
        href: rp.url_path,
        type: 'related',
      });
      usedPaths.add(rp.url_path);
    }
  }

  return links;
}

/**
 * Generates an Arabic-safe URL slug from a text string.
 * Removes diacritics, replaces spaces with hyphens, and lowercases.
 */
export function slugifyArabic(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Calculates the priority score for a content queue item.
 *
 * Formula:
 *   (searchVolume / max(keywordDifficulty, 1)) * (locationPriority / 100) * intentMultiplier * formatMultiplier
 */
export function getPriorityScore(
  searchVolume: number,
  difficulty: number,
  locationPriority: number,
  intent: PSEOIntent,
  format: PSEOFormat,
): number {
  const intentMultipliers: Record<PSEOIntent, number> = {
    commercial: 1.0,
    comparison: 0.8,
    'how-to': 0.6,
    informational: 0.4,
    navigational: 0.3,
  };

  const formatMultipliers: Record<PSEOFormat, number> = {
    'service-page': 1.0,
    comparison: 0.8,
    guide: 0.6,
    list: 0.5,
    tool: 0.7,
    hub: 0.9,
    blog: 0.4,
    geo: 0.75,
    'case-study': 0.65,
    glossary: 0.3,
  };

  const volume = Math.max(searchVolume, 10);
  const diff = Math.max(difficulty, 1);
  const intentMult = intentMultipliers[intent] ?? 0.5;
  const formatMult = formatMultipliers[format] ?? 0.5;

  return (
    (volume / diff) *
    (locationPriority / 100) *
    intentMult *
    formatMult
  );
}

/**
 * Splits an array into chunks of the specified size.
 * Useful for sitemap generation.
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size));
  }
  return chunks;
}

/**
 * Maps a pillar slug to its display name and configuration.
 */
export function getPillarFromSlug(slug: string): {
  slug: string;
  nameEn: string;
} {
  const pillarMap: Record<string, { nameEn: string }> = {
    'content-writing': { nameEn: 'Content Writing' },
    'seo-services': { nameEn: 'SEO Services' },
    'geo-aio': { nameEn: 'GEO/AIO' },
    'jsonld-schema': { nameEn: 'JSON-LD Schema' },
    'content-marketing': { nameEn: 'Content Marketing' },
    'keyword-research': { nameEn: 'Keyword Research' },
    'ecommerce-seo': { nameEn: 'E-commerce SEO' },
    'content-strategy': { nameEn: 'Content Strategy' },
    'seo-tools': { nameEn: 'SEO Tools' },
    'article-writing': { nameEn: 'Article Writing' },
  };

  const entry = pillarMap[slug];
  if (entry) {
    return { slug, nameEn: entry.nameEn };
  }

  return { slug, nameEn: slug };
}

/**
 * Returns the best content format for a given intent.
 */
export function getFormatForIntent(intent: PSEOIntent): PSEOFormat[] {
  const formatMap: Record<PSEOIntent, PSEOFormat[]> = {
    commercial: ['service-page', 'tool', 'geo', 'case-study'],
    informational: ['guide', 'list', 'blog', 'glossary'],
    'how-to': ['guide', 'blog', 'tool'],
    comparison: ['comparison', 'list'],
    navigational: ['hub', 'service-page'],
  };

  return formatMap[intent] ?? ['blog'];
}

/**
 * Returns the database column reference string for an intent type.
 * Used in dynamic queries where column names match intent values.
 */
export function getColumnRefForIntent(intent: PSEOIntent): string {
  const columnMap: Record<PSEOIntent, string> = {
    commercial: 'commercial_count',
    informational: 'informational_count',
    'how-to': 'how_to_count',
    comparison: 'comparison_count',
    navigational: 'navigational_count',
  };

  return columnMap[intent] ?? 'other_count';
}
