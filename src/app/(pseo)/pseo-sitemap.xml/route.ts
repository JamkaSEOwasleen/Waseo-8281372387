import { getAllPublishedPageUrls } from '@/lib/pseo/queries';
import { chunkArray } from '@/lib/pseo/utils';
import { APP_CONFIG } from '@/lib/constants';

// ─── Sitemap Configuration ──────────────────────────────────────────────────
// Google's limit is 50,000 URLs per sitemap. We use 45,000 to stay safe.
const MAX_URLS_PER_SITEMAP = 45_000;

// ─── XML Builders ────────────────────────────────────────────────────────────

/**
 * Generates a single sitemap XML string for a list of URLs.
 */
function generateSitemapXml(
  urls: { url_path: string; last_updated: string }[],
): string {
  const baseUrl = APP_CONFIG.url;

  const urlElements = urls
    .map(
      (page) => `  <url>
    <loc>${baseUrl}${page.url_path}</loc>
    <lastmod>${new Date(page.last_updated).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

/**
 * Generates a sitemap index XML string pointing to multiple sitemap files.
 */
function generateSitemapIndex(count: number): string {
  const baseUrl = APP_CONFIG.url;
  const sitemapElements: string[] = [];

  for (let index = 0; index < count; index++) {
    const sitemapUrl = `${baseUrl}/pseo-sitemap-${index}.xml`;
    sitemapElements.push(`  <sitemap>
    <loc>${sitemapUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements.join('\n')}
</sitemapindex>`;
}

// ─── Helpers for Multi-Sitemap Index ─────────────────────────────────────────

/**
 * Returns the chunk index from the route segment if present, or -1 for the base sitemap.
 *
 * Examples:
 *   /pseo-sitemap.xml       → -1  (returns sitemap index or single sitemap)
 *   /pseo-sitemap-0.xml     →  0  (returns chunk 0)
 *   /pseo-sitemap-3.xml     →  3  (returns chunk 3)
 */
function getChunkIndex(pathname: string): number {
  const match = pathname.match(/pseo-sitemap-(\d+)\.xml$/);
  return match ? parseInt(match[1], 10) : -1;
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function GET(req: Request): Promise<Response> {
  try {
    const pages = await getAllPublishedPageUrls();

    if (pages.length === 0) {
      // Return empty sitemap if no pages are published yet
      return new Response(generateSitemapXml([]), {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // Determine if this request is for a specific chunk
    const url = new URL(req.url);
    const pathname = url.pathname;
    const chunkIndex = getChunkIndex(pathname);

    if (chunkIndex >= 0) {
      // Return a specific chunk
      const chunks = chunkArray(pages, MAX_URLS_PER_SITEMAP);
      const chunk = chunks[chunkIndex];

      if (!chunk) {
        return new Response('Sitemap chunk not found', { status: 404 });
      }

      return new Response(generateSitemapXml(chunk), {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // Base sitemap route: decide between single sitemap or sitemap index
    if (pages.length <= MAX_URLS_PER_SITEMAP) {
      // Single sitemap
      return new Response(generateSitemapXml(pages), {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // Multiple sitemaps needed — return sitemap index
    const chunks = chunkArray(pages, MAX_URLS_PER_SITEMAP);

    return new Response(generateSitemapIndex(chunks.length), {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('[PSEO] Sitemap generation error:', error);
    return new Response('Failed to generate sitemap', { status: 500 });
  }
}
