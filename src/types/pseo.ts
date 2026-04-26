// ─── Union Types ──────────────────────────────────────────────────────────────

export type PSEOIntent = 'commercial' | 'informational' | 'how-to' | 'comparison' | 'navigational';

export type PSEOFormat = 'service-page' | 'guide' | 'comparison' | 'list' | 'tool' | 'glossary' | 'hub' | 'blog' | 'geo' | 'case-study';

export type PSEOQueueStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'skipped';

export type PSEOLocationType = 'city' | 'country' | 'region';

export type PSEOPillarType = 'primary' | 'secondary' | 'tertiary';

export type PSEOLogStatus = 'success' | 'failed' | 'timeout' | 'partial';

// ─── Database Row Types (match pseo schema exactly) ─────────────────────────

export interface PSEOLocation {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  country: string;
  country_ar: string;
  country_code: string;
  region: string | null;
  region_ar: string | null;
  location_type: PSEOLocationType;
  population: number;
  search_volume_estimate: number;
  priority: number;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
}

export interface PSEONiche {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  pillar_type: PSEOPillarType;
  description: string | null;
  search_volume_estimate: number;
  intent_types: PSEOIntent[];
  priority: number;
  icon_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PSEOQueueItem {
  id: number;
  location_id: number;
  niche_id: number;
  intent: PSEOIntent;
  format: PSEOFormat;
  url_slug: string;
  target_keyword_ar: string;
  target_keyword_en: string;
  search_volume: number;
  keyword_difficulty: number;
  priority_score: number;
  status: PSEOQueueStatus;
  scheduled_date: string | null;
  generated_at: string | null;
  published_at: string | null;
  quality_score: number | null;
  word_count: number | null;
  generation_attempts: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface PSEOPublishedPage {
  id: number;
  queue_id: number | null;
  url_path: string;
  title_ar: string;
  title_en: string | null;
  meta_description_ar: string;
  h1_ar: string;
  content_json: Record<string, unknown>;
  intro_text: string | null;
  sections: PSEOPageSection[] | null;
  benefits: string[] | null;
  faqs: PSEOFAQ[] | null;
  local_stats: PSEOStat[] | null;
  expert_quotes: PSEOExpertQuote[] | null;
  canonical_url: string | null;
  schema_json: Record<string, unknown> | null;
  internal_links: PSEOInternalLink[];
  related_pages: PSEORelatedPage[];
  quality_score: number | null;
  word_count: number | null;
  is_published: boolean;
  generated_at: string;
  last_updated: string;
  view_count: number;
  click_count: number;
  conversion_count: number;
}

// ─── Content Sub-types ───────────────────────────────────────────────────────

export interface PSEOPageSection {
  id: string;
  heading: string;
  content: string;
  type: 'paragraph' | 'list' | 'table' | 'blockquote' | 'cta';
}

export interface PSEOFAQ {
  question: string;
  answer: string;
}

export interface PSEOStat {
  label: string;
  value: string;
  source: string;
  sourceNeedsVerification: boolean;
}

export interface PSEOExpertQuote {
  text: string;
  expertName: string;
  expertTitle: string;
  isPlaceholder: boolean;
}

export interface PSEOInternalLink {
  text: string;
  href: string;
  type: 'hub' | 'spoke' | 'related' | 'nearby';
}

export interface PSEORelatedPage {
  title: string;
  url_path: string;
  pillar: string;
  location: string;
}

export interface PSEOPageContent {
  intro_text: string;
  sections: PSEOPageSection[];
  benefits: string[];
  faqs: PSEOFAQ[];
  local_stats: PSEOStat[];
  expert_quotes: PSEOExpertQuote[];
}

// ─── Logs & Keywords ─────────────────────────────────────────────────────────

export interface PSEOGenerationLog {
  id: number;
  queue_id: number | null;
  batch_id: string;
  status: PSEOLogStatus;
  error_message: string | null;
  api_tokens_used: number;
  generation_time_seconds: number;
  deepseek_call_1_tokens: number;
  deepseek_call_2_tokens: number;
  quality_score: number | null;
  created_at: string;
}

export interface PSEOKeyword {
  id: number;
  keyword_ar: string;
  keyword_en: string | null;
  niche_id: number | null;
  location_id: number | null;
  intent: PSEOIntent | null;
  search_volume: number;
  keyword_difficulty: number;
  cpc_estimate: number | null;
  url_path: string | null;
  ranking_position: number | null;
  ranking_updated_at: string | null;
  created_at: string;
}

// ─── Generation & Batch Types ────────────────────────────────────────────────

export interface PSEOBatchResult {
  batch_id: string;
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  duration_seconds: number;
  pages: PSEOBatchPageResult[];
}

export interface PSEOBatchPageResult {
  queue_id: number;
  url_path: string | null;
  status: 'success' | 'failed' | 'skipped';
  quality_score: number | null;
  error: string | null;
}

export interface PSEOGenerationConfig {
  limit: number;
  batchId: string;
  dryRun: boolean;
  maxRetries: number;
  qualityThreshold: number;
  deepseekModel: string;
  contentMaxTokens: number;
  schemaMaxTokens: number;
  contentTemperature: number;
  schemaTemperature: number;
}

export interface PSEOBatchItem {
  queue_id: number;
  location_slug: string;
  location_name_ar: string;
  location_name_en: string;
  country_code: string;
  country_ar: string;
  niche_slug: string;
  niche_name_ar: string;
  niche_name_en: string;
  intent: PSEOIntent;
  format: PSEOFormat;
  target_keyword_ar: string;
  target_keyword_en: string;
  priority_score: number;
}

// ─── Hub & Spoke ─────────────────────────────────────────────────────────────

export interface PSEOHubSpokeRule {
  pillarSlug: string;
  pillarNameAr: string;
  pillarNameEn: string;
  formats: PSEOFormat[];
  intents: PSEOIntent[];
  hubFormat: PSEOFormat;
  spokeFormats: PSEOFormat[];
  internalLinkCount: {
    min: number;
    max: number;
  };
}

export interface PSEOAnalytics {
  totalPages: number;
  publishedPages: number;
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  pagesByPillar: Record<string, number>;
  pagesByLocation: Record<string, number>;
  averageQualityScore: number;
  averageWordCount: number;
}

// ─── URL Parsing ─────────────────────────────────────────────────────────────

export interface PSEOParsedUrl {
  pillar: string;
  location: string;
  subtopic: string | null;
}
