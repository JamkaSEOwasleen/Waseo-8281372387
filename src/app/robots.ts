import type { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/lib/constants';

// ─── Robots.txt Configuration ──────────────────────────────────────────────
// Allow all crawlers on public pages.
// Disallow /dashboard/* (private content, requires authentication).
// Sitemap points to the static sitemap.xml.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/dashboard/',
    },
    sitemap: `${APP_CONFIG.url}/sitemap.xml`,
  };
}
