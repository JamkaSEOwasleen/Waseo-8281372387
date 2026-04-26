import { createPSEOAdminClient } from '@/lib/pseo/supabase';
import type {
  PSEOBatchItem,
  PSEOPublishedPage,
  PSEOGenerationLog,
  PSEOAnalytics,
} from '@/types/pseo';

/**
 * Fetches a single published PSEO page by its URL path.
 * Returns null if not found.
 */
export async function getPublishedPage(
  urlPath: string,
): Promise<PSEOPublishedPage | null> {
  const supabase = createPSEOAdminClient();

  const { data, error } = await supabase
    .from('published_pages')
    .select('*')
    .eq('url_path', urlPath)
    .maybeSingle();

  if (error) {
    console.error('[PSEO] getPublishedPage error:', error.message);
    return null;
  }

  return data as PSEOPublishedPage | null;
}

/**
 * Fetches a published page by its content_queue reference ID.
 * Returns null if not found.
 */
export async function getPublishedPageByQueueId(
  queueId: number,
): Promise<PSEOPublishedPage | null> {
  const supabase = createPSEOAdminClient();

  const { data, error } = await supabase
    .from('published_pages')
    .select('*')
    .eq('queue_id', queueId)
    .maybeSingle();

  if (error) {
    console.error('[PSEO] getPublishedPageByQueueId error:', error.message);
    return null;
  }

  return data as PSEOPublishedPage | null;
}

/**
 * Lists all published pages for a given pillar slug.
 * Pages are ordered by quality score descending.
 */
export async function getPublishedPagesByPillar(
  pillarSlug: string,
): Promise<PSEOPublishedPage[]> {
  const supabase = createPSEOAdminClient();

  const { data, error } = await supabase
    .from('published_pages')
    .select('*')
    .ilike('url_path', `${pillarSlug}/%`)
    .eq('is_published', true)
    .order('quality_score', { ascending: false });

  if (error) {
    console.error('[PSEO] getPublishedPagesByPillar error:', error.message);
    return [];
  }

  return (data ?? []) as PSEOPublishedPage[];
}

/**
 * Lists all published pages for a given location slug.
 */
export async function getPublishedPagesByLocation(
  locationSlug: string,
): Promise<PSEOPublishedPage[]> {
  const supabase = createPSEOAdminClient();

  const { data, error } = await supabase
    .from('published_pages')
    .select('*')
    .ilike('url_path', `%/${locationSlug}%`)
    .eq('is_published', true)
    .order('quality_score', { ascending: false });

  if (error) {
    console.error('[PSEO] getPublishedPagesByLocation error:', error.message);
    return [];
  }

  return (data ?? []) as PSEOPublishedPage[];
}

/**
 * Finds related pages for internal linking.
 * Excludes the current page and returns pages from the same pillar or location.
 */
export async function getRelatedPages(
  pageId: number,
  limit: number = 10,
): Promise<PSEOPublishedPage[]> {
  const supabase = createPSEOAdminClient();

  const { data, error } = await supabase
    .from('published_pages')
    .select('*')
    .neq('id', pageId)
    .eq('is_published', true)
    .order('quality_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[PSEO] getRelatedPages error:', error.message);
    return [];
  }

  return (data ?? []) as PSEOPublishedPage[];
}

/**
 * Calls the pseo.get_next_batch() database function to fetch the highest-priority
 * pending queue items for generation.
 */
export async function getBatchForGeneration(
  limit: number = 100,
): Promise<PSEOBatchItem[]> {
  const supabase = createPSEOAdminClient();

  const { data, error } = await supabase.rpc('get_next_batch', {
    p_limit: limit,
  });

  if (error) {
    console.error('[PSEO] getBatchForGeneration error:', error.message);
    return [];
  }

  return (data ?? []) as PSEOBatchItem[];
}

/**
 * Inserts a generated page into pseo.published_pages.
 * Returns the inserted row ID or null on failure.
 */
export async function insertPublishedPage(
  data: Omit<
    PSEOPublishedPage,
    'id' | 'generated_at' | 'last_updated' | 'view_count' | 'click_count' | 'conversion_count'
  >,
): Promise<number | null> {
  const supabase = createPSEOAdminClient();

  const { data: inserted, error } = await supabase
    .from('published_pages')
    .insert({
      queue_id: data.queue_id,
      url_path: data.url_path,
      title_ar: data.title_ar,
      title_en: data.title_en,
      meta_description_ar: data.meta_description_ar,
      h1_ar: data.h1_ar,
      content_json: data.content_json,
      intro_text: data.intro_text,
      sections: data.sections,
      benefits: data.benefits,
      faqs: data.faqs,
      local_stats: data.local_stats,
      expert_quotes: data.expert_quotes,
      canonical_url: data.canonical_url,
      schema_json: data.schema_json,
      internal_links: data.internal_links,
      related_pages: data.related_pages,
      quality_score: data.quality_score,
      word_count: data.word_count,
      is_published: data.is_published,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[PSEO] insertPublishedPage error:', error.message);
    return null;
  }

  return inserted?.id ?? null;
}

/**
 * Updates a content queue item's status and optional fields after generation.
 */
export async function updateQueueItemStatus(
  id: number,
  status: 'completed' | 'failed' | 'skipped',
  fields?: {
    quality_score?: number;
    word_count?: number;
    error_message?: string;
    published_at?: string;
  },
): Promise<boolean> {
  const supabase = createPSEOAdminClient();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
    generated_at: new Date().toISOString(),
    ...(fields?.quality_score !== undefined && { quality_score: fields.quality_score }),
    ...(fields?.word_count !== undefined && { word_count: fields.word_count }),
    ...(fields?.error_message !== undefined && { error_message: fields.error_message }),
    ...(fields?.published_at !== undefined && { published_at: fields.published_at }),
  };

  const { error } = await supabase
    .from('content_queue')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('[PSEO] updateQueueItemStatus error:', error.message);
    return false;
  }

  return true;
}

/**
 * Inserts a generation log entry.
 */
export async function insertGenerationLog(
  log: Omit<PSEOGenerationLog, 'id' | 'created_at'>,
): Promise<boolean> {
  const supabase = createPSEOAdminClient();

  const { error } = await supabase.from('generation_logs').insert({
    queue_id: log.queue_id,
    batch_id: log.batch_id,
    status: log.status,
    error_message: log.error_message,
    api_tokens_used: log.api_tokens_used,
    generation_time_seconds: log.generation_time_seconds,
    deepseek_call_1_tokens: log.deepseek_call_1_tokens,
    deepseek_call_2_tokens: log.deepseek_call_2_tokens,
    quality_score: log.quality_score,
  });

  if (error) {
    console.error('[PSEO] insertGenerationLog error:', error.message);
    return false;
  }

  return true;
}

/**
 * Returns the total count of published pages.
 */
export async function countPublishedPages(): Promise<number> {
  const supabase = createPSEOAdminClient();

  const { count, error } = await supabase
    .from('published_pages')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  if (error) {
    console.error('[PSEO] countPublishedPages error:', error.message);
    return 0;
  }

  return count ?? 0;
}

/**
 * Fetches all published page URLs for sitemap generation.
 * Returns only the url_path and last_updated fields for efficiency.
 */
export async function getAllPublishedPageUrls(): Promise<
  { url_path: string; last_updated: string }[]
> {
  const supabase = createPSEOAdminClient();

  const { data, error } = await supabase
    .from('published_pages')
    .select('url_path, last_updated')
    .eq('is_published', true)
    .order('url_path', { ascending: true });

  if (error) {
    console.error('[PSEO] getAllPublishedPageUrls error:', error.message);
    return [];
  }

  return (data ?? []) as { url_path: string; last_updated: string }[];
}

/**
 * Returns aggregated analytics for all published PSEO pages.
 */
export async function getPSEOStats(): Promise<PSEOAnalytics> {
  const supabase = createPSEOAdminClient();

  const { data: pages, error } = await supabase
    .from('published_pages')
    .select('*')
    .eq('is_published', true);

  if (error) {
    console.error('[PSEO] getPSEOStats error:', error.message);
    return {
      totalPages: 0,
      publishedPages: 0,
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
      pagesByPillar: {},
      pagesByLocation: {},
      averageQualityScore: 0,
      averageWordCount: 0,
    };
  }

  const published = pages ?? [];
  const pagesByPillar: Record<string, number> = {};
  const pagesByLocation: Record<string, number> = {};

  for (const page of published) {
    const path = page.url_path as string;
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 0) {
      pagesByPillar[parts[0]] = (pagesByPillar[parts[0]] ?? 0) + 1;
    }
    if (parts.length > 1) {
      pagesByLocation[parts[1]] = (pagesByLocation[parts[1]] ?? 0) + 1;
    }
  }

  const avgQuality =
    published.length > 0
      ? published.reduce(
          (sum: number, p: Record<string, unknown>) =>
            sum + ((p.quality_score as number) ?? 0),
          0,
        ) / published.length
      : 0;

  const avgWords =
    published.length > 0
      ? published.reduce(
          (sum: number, p: Record<string, unknown>) =>
            sum + ((p.word_count as number) ?? 0),
          0,
        ) / published.length
      : 0;

  return {
    totalPages: published.length,
    publishedPages: published.length,
    totalViews: published.reduce(
      (sum: number, p: Record<string, unknown>) =>
        sum + ((p.view_count as number) ?? 0),
      0,
    ),
    totalClicks: published.reduce(
      (sum: number, p: Record<string, unknown>) =>
        sum + ((p.click_count as number) ?? 0),
      0,
    ),
    totalConversions: published.reduce(
      (sum: number, p: Record<string, unknown>) =>
        sum + ((p.conversion_count as number) ?? 0),
      0,
    ),
    pagesByPillar,
    pagesByLocation,
    averageQualityScore: Math.round(avgQuality * 100) / 100,
    averageWordCount: Math.round(avgWords),
  };
}
