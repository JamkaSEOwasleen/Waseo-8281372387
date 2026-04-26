import type { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/lib/constants';

// ─── Sitemap ────────────────────────────────────────────────────────────────
// Static sitemap for public pages only.
// Dynamic pages (dashboard, briefs) are excluded — they are private content.

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = APP_CONFIG.url;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
