// ────────────────────────────────────────────────────────────
// WasafSEO PSEO — Batch Content Generation Script
// Fetches the next batch of queue items from pseo.get_next_batch(),
// generates content via Deepseek (two calls per item), saves to
// pseo.published_pages, and updates queue status.
//
// Usage:
//   npx tsx --env-file=.env.local scripts/pseo/generate-pseo-content.ts [limit]
//
//   limit: Number of items to process (default: 5, max: 50)
//   dry-run: Pass "dry-run" as second arg to preview without generating
//   Example: npx tsx --env-file=.env.local scripts/pseo/generate-pseo-content.ts 10 dry-run
// ────────────────────────────────────────────────────────────

import { randomUUID } from 'node:crypto';
import { createPSEOAdminClient } from '../../src/lib/pseo/supabase';
import {
  generatePSEOContent,
  generatePSEOSchema,
  estimateWordCount,
} from '../../src/lib/pseo/generate';
import type {
  PSEOLocation,
  PSEONiche,
  PSEOIntent,
  PSEOFormat,
  PSEOBatchResult,
  PSEOBatchPageResult,
  PSEOQueueItem,
} from '../../src/types/pseo';

// ─── Config ─────────────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Gets the limit from CLI args.
 */
function getLimit(): number {
  const arg = process.argv[2];
  if (!arg) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(arg, 10);
  if (Number.isNaN(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

/**
 * Checks if dry-run mode is enabled.
 */
function isDryRun(): boolean {
  return process.argv.includes('dry-run');
}

/**
 * Builds the URL path for a PSEO page.
 */
function buildPageUrlPath(
  nicheSlug: string,
  locationSlug: string,
  intent: string,
  format: string,
): string {
  return `/${nicheSlug}/${locationSlug}/${intent}/${format}`;
}

// ─── Main ───────────────────────────────────────────────────────────────────────

async function generatePSEOContentBatch(): Promise<void> {
  const limit = getLimit();
  const dryRun = isDryRun();
  const batchId = randomUUID();
  const startTime = Date.now();

  console.log('═══════════════════════════════════════');
  console.log('  PSEO Batch Content Generation');
  console.log(`  Batch ID: ${batchId}`);
  console.log(`  Limit:    ${limit}`);
  console.log(`  Mode:     ${dryRun ? '🔍 DRY RUN' : '🚀 LIVE'}`);
  console.log('═══════════════════════════════════════\n');

  const supabase = createPSEOAdminClient();

  // ── Step 1: Fetch next batch from queue ──
  console.log('📋 Fetching next batch from queue...');

  const { data: queueItems, error: queueError } = await supabase
    .rpc('pseo_get_next_batch', { p_limit: limit });

  if (queueError) {
    throw new Error(`Failed to fetch batch: ${queueError.message}`);
  }

  // The RPC returns items with joined data (queue_id, location_slug, niche_slug, etc.)
  // Cast to our batch item type
  const items = (queueItems ?? []) as Array<{
    queue_id: number;
    location_slug: string;
    niche_slug: string;
    intent: string;
    format: string;
    target_keyword_ar: string;
    target_keyword_en: string;
    priority_score: number;
  }>;

  if (items.length === 0) {
    console.log('✅ No pending items in queue. Nothing to generate.');
    process.exit(0);
  }

  console.log(`   Found ${items.length} item(s) to process\n`);

  // ── Step 2: For dry-run, just show what would be generated ──
  if (dryRun) {
    console.log('🔍 DRY RUN — items that would be processed:');
    for (const item of items) {
      const urlPath = buildPageUrlPath(item.niche_slug, item.location_slug, item.intent, item.format);
      console.log(`   📄 [${item.queue_id}] ${urlPath}`);
      console.log(`       Keyword AR: ${item.target_keyword_ar}`);
      console.log(`       Intent: ${item.intent} | Format: ${item.format}`);
      console.log(`       Priority: ${item.priority_score}`);
      console.log('');
    }
    console.log(`🔍 Dry run complete. ${items.length} item(s) would be processed.`);
    process.exit(0);
  }

  // ── Step 3: Mark items as 'generating' ──
  const queueIds = items.map((item) => item.queue_id);
  const { error: markError } = await supabase
    .from('pseo_content_queue')
    .update({ status: 'generating', updated_at: new Date().toISOString() })
    .in('id', queueIds);

  if (markError) {
    throw new Error(`Failed to mark items as generating: ${markError.message}`);
  }

  console.log(`   Marked ${queueIds.length} item(s) as 'generating'\n`);

  // ── Step 4: Generate content for each item ──
  const pageResults: PSEOBatchPageResult[] = [];
  let succeeded = 0;
  let failed = 0;

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const itemStartTime = Date.now();
    const urlPath = buildPageUrlPath(item.niche_slug, item.location_slug, item.intent, item.format);

    console.log(`\n─── Item ${index + 1}/${items.length}: [${item.queue_id}] ${urlPath} ───`);

    try {
      // Fetch the location and niche data
      const [locationResult, nicheResult] = await Promise.all([
        supabase
          .from('pseo_locations')
          .select('*')
          .eq('slug', item.location_slug)
          .single(),
        supabase
          .from('pseo_niches')
          .select('*')
          .eq('slug', item.niche_slug)
          .single(),
      ]);

      if (locationResult.error || !locationResult.data) {
        throw new Error(`Location not found: ${item.location_slug}`);
      }

      if (nicheResult.error || !nicheResult.data) {
        throw new Error(`Niche not found: ${item.niche_slug}`);
      }

      const location = locationResult.data as PSEOLocation;
      const niche = nicheResult.data as PSEONiche;

      // Call 1: Generate content
      console.log(`   🧠 Call 1/2: Generating content...`);
      const contentOutput = await generatePSEOContent({
        location,
        niche,
        intent: item.intent as PSEOIntent,
        format: item.format as PSEOFormat,
        targetKeywordAr: item.target_keyword_ar,
        targetKeywordEn: item.target_keyword_en,
      });
      console.log(`   ✅ Content generated (${estimateWordCount(contentOutput)} words estimated)`);

      // Call 2: Generate schema
      console.log(`   🧠 Call 2/2: Generating schema...`);
      const schemaOutput = await generatePSEOSchema({
        location,
        niche,
        contentOutput,
        intent: item.intent as PSEOIntent,
      });
      console.log(`   ✅ Schema generated (${schemaOutput['@graph']?.length ?? 0} graph nodes)`);

      // ── Save to published_pages ──
      const pageRow = {
        queue_id: item.queue_id,
        url_path: urlPath,
        title_ar: contentOutput.title_ar,
        title_en: contentOutput.title_en ?? null,
        meta_description_ar: contentOutput.meta_description_ar,
        h1_ar: contentOutput.h1_ar,
        content_json: contentOutput as unknown as Record<string, unknown>,
        intro_text: contentOutput.intro_text,
        sections: contentOutput.sections,
        benefits: contentOutput.benefits,
        faqs: contentOutput.faqs,
        local_stats: contentOutput.local_stats,
        expert_quotes: contentOutput.expert_quotes,
        canonical_url: `https://wasafseo.wasleen.com${urlPath}`,
        schema_json: schemaOutput as unknown as Record<string, unknown>,
        internal_links: [],
        related_pages: [],
        is_published: true,
        generated_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from('pseo_published_pages')
        .insert(pageRow);

      if (insertError) {
        throw new Error(`Failed to save published page: ${insertError.message}`);
      }

      // ── Update queue item status ──
      const wordCount = estimateWordCount(contentOutput);

      await supabase
        .from('pseo_content_queue')
        .update({
          status: 'completed',
          generated_at: new Date().toISOString(),
          published_at: new Date().toISOString(),
          quality_score: null, // Will be filled by quality-check script
          word_count: wordCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.queue_id);

      // ── Log generation ──
      const generationTimeSeconds = (Date.now() - itemStartTime) / 1000;

      await supabase
        .from('pseo_generation_logs')
        .insert({
          queue_id: item.queue_id,
          batch_id: batchId,
          status: 'success',
          error_message: null,
          api_tokens_used: MAX_TOKENS_CONTENT_ESTIMATE,
          generation_time_seconds: Math.round(generationTimeSeconds * 10) / 10,
          deepseek_call_1_tokens: MAX_TOKENS_CONTENT_ESTIMATE,
          deepseek_call_2_tokens: MAX_TOKENS_SCHEMA_ESTIMATE,
          quality_score: null,
        });

      succeeded++;
      pageResults.push({
        queue_id: item.queue_id,
        url_path: urlPath,
        status: 'success',
        quality_score: null,
        error: null,
      });

      console.log(`   ✅ Completed in ${generationTimeSeconds.toFixed(1)}s`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Failed: ${errorMessage}`);

      // Fetch current generation_attempts to increment manually
      const { data: currentAttemptsData } = await supabase
        .from('pseo_content_queue')
        .select('generation_attempts')
        .eq('id', item.queue_id)
        .single();

      const currentAttempts = (currentAttemptsData?.generation_attempts ?? 0) + 1;

      // Mark queue item as failed
      await supabase
        .from('pseo_content_queue')
        .update({
          status: 'failed',
          error_message: errorMessage.substring(0, 500),
          generation_attempts: currentAttempts,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.queue_id);

      // Log the failure
      await supabase
        .from('pseo_generation_logs')
        .insert({
          queue_id: item.queue_id,
          batch_id: batchId,
          status: 'failed',
          error_message: errorMessage.substring(0, 500),
          api_tokens_used: 0,
          generation_time_seconds: (Date.now() - itemStartTime) / 1000,
          deepseek_call_1_tokens: 0,
          deepseek_call_2_tokens: 0,
          quality_score: null,
        });

      failed++;
      pageResults.push({
        queue_id: item.queue_id,
        url_path: null,
        status: 'failed',
        quality_score: null,
        error: errorMessage,
      });
    }
  }

  // ── Summary ──
  const totalSeconds = (Date.now() - startTime) / 1000;

  const result: PSEOBatchResult = {
    batch_id: batchId,
    total: items.length,
    succeeded,
    failed,
    skipped: 0,
    duration_seconds: Math.round(totalSeconds * 10) / 10,
    pages: pageResults,
  };

  console.log('\n═══════════════════════════════════════');
  console.log('  📊 BATCH SUMMARY');
  console.log(`  Batch ID:     ${result.batch_id}`);
  console.log(`  Duration:     ${result.duration_seconds}s`);
  console.log(`  Total:        ${result.total}`);
  console.log(`  Succeeded:    ${result.succeeded}`);
  console.log(`  Failed:       ${result.failed}`);
  console.log('═══════════════════════════════════════');

  if (result.failed > 0) {
    process.exit(1);
  }
}

// Token estimates (actual counts would come from API response)
const MAX_TOKENS_CONTENT_ESTIMATE = 8000;
const MAX_TOKENS_SCHEMA_ESTIMATE = 4000;

generatePSEOContentBatch().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('💥 Fatal error:', message);
  process.exit(1);
});
