// ────────────────────────────────────────────────────────────
// WasafSEO PSEO — Quality Check Script
// Evaluates generated content quality for published PSEO pages
// using calculateQualityScore() from the utils library.
//
// Usage:
//   npx tsx --env-file=.env.local scripts/pseo/quality-check.ts [limit]
//
//   limit: Number of pages to check (default: 20, max: 100)
//   threshold: Minimum acceptable quality score (default: 60)
//   Example: npx tsx --env-file=.env.local scripts/pseo/quality-check.ts 50
// ────────────────────────────────────────────────────────────

import { createPSEOAdminClient } from '../../src/lib/pseo/supabase';
import { calculateQualityScore } from '../../src/lib/pseo/utils';
import type { PSEOPublishedPage } from '../../src/types/pseo';

// ─── Config ─────────────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_THRESHOLD = 60;
const QUALITY_PASS_THRESHOLD = 70;

// ─── Helpers ────────────────────────────────────────────────────────────────────

interface QualityCheckResult {
  page_id: number;
  url_path: string;
  previous_score: number | null;
  score: number;
  passed: boolean;
  issues: string[];
}

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
 * Gets the quality threshold from CLI args (third arg).
 */
function getThreshold(): number {
  const arg = process.argv[3];
  if (!arg) return DEFAULT_THRESHOLD;
  const parsed = Number.parseInt(arg, 10);
  if (Number.isNaN(parsed) || parsed < 0) return DEFAULT_THRESHOLD;
  return Math.min(parsed, 100);
}

/**
 * Analyzes content_json for common quality issues.
 */
function analyzeIssues(page: PSEOPublishedPage): string[] {
  const issues: string[] = [];

  const content = page.content_json ?? {};

  // Check for placeholder expert quotes
  const quotes = page.expert_quotes ?? [];
  const placeholderQuotes = quotes.filter((q) => q.isPlaceholder);
  if (placeholderQuotes.length > 0) {
    issues.push(
      `${placeholderQuotes.length} expert quote(s) are placeholders (isPlaceholder=true)`,
    );
  }

  // Check for stats that need source verification
  const stats = page.local_stats ?? [];
  const unverifiedStats = stats.filter((s) => s.sourceNeedsVerification);
  if (unverifiedStats.length > 0) {
    issues.push(
      `${unverifiedStats.length} stat(s) have sourceNeedsVerification=true`,
    );
  }

  // Check section count
  const sections = page.sections ?? [];
  if (sections.length < 5) {
    issues.push(`Only ${sections.length} section(s) (minimum 5 recommended)`);
  }
  if (sections.length > 20) {
    issues.push(`Too many sections: ${sections.length} (maximum 20 recommended)`);
  }

  // Check FAQ count
  const faqs = page.faqs ?? [];
  if (faqs.length < 2) {
    issues.push(`Only ${faqs.length} FAQ(s) (minimum 2 recommended)`);
  }

  // Check benefits count
  const benefits = page.benefits ?? [];
  if (benefits.length < 3) {
    issues.push(`Only ${benefits.length} benefit(s) (minimum 3 recommended)`);
  }

  // Check internal links
  const internalLinks = page.internal_links ?? [];
  if (internalLinks.length < 3) {
    issues.push(
      `Only ${internalLinks.length} internal link(s) (minimum 3 recommended)`,
    );
  }

  // Check meta description length
  const metaDesc = page.meta_description_ar ?? '';
  if (metaDesc.length < 50) {
    issues.push(`Meta description too short: ${metaDesc.length} chars`);
  } else if (metaDesc.length > 165) {
    issues.push(`Meta description too long: ${metaDesc.length} chars (max 165)`);
  }

  // Check title length
  const title = page.title_ar ?? '';
  if (title.length < 20) {
    issues.push(`Title too short: ${title.length} chars`);
  } else if (title.length > 70) {
    issues.push(`Title too long: ${title.length} chars (max 70)`);
  }

  // Check schema_json exists
  if (!page.schema_json || Object.keys(page.schema_json).length === 0) {
    issues.push('Schema JSON is empty or missing');
  }

  return issues;
}

// ─── Main ───────────────────────────────────────────────────────────────────────

async function runQualityCheck(): Promise<void> {
  const limit = getLimit();
  const threshold = getThreshold();
  const startTime = Date.now();

  console.log('═══════════════════════════════════════');
  console.log('  PSEO Quality Check');
  console.log(`  Limit:     ${limit}`);
  console.log(`  Threshold: ${threshold}`);
  console.log('═══════════════════════════════════════\n');

  const supabase = createPSEOAdminClient();

  // ── Step 1: Fetch pages that need quality scoring ──
  console.log('📋 Fetching pages for quality check...');

  const { data: pages, error: fetchError } = await supabase
    .from('published_pages')
    .select('*')
    .is('quality_score', null)
    .order('generated_at', { ascending: false })
    .limit(limit);

  if (fetchError) {
    throw new Error(`Failed to fetch pages: ${fetchError.message}`);
  }

  const pagesToCheck = (pages ?? []) as PSEOPublishedPage[];

  if (pagesToCheck.length === 0) {
    // Try fetching pages below threshold instead
    console.log('   No unscored pages found. Checking pages below threshold...');

    const { data: lowScorePages, error: lowScoreError } = await supabase
      .from('published_pages')
      .select('*')
      .lt('quality_score', QUALITY_PASS_THRESHOLD)
      .order('quality_score', { ascending: true })
      .limit(limit);

    if (lowScoreError) {
      throw new Error(`Failed to fetch low-score pages: ${lowScoreError.message}`);
    }

    pagesToCheck.push(
      ...((lowScorePages ?? []) as PSEOPublishedPage[]),
    );
  }

  if (pagesToCheck.length === 0) {
    console.log('✅ No pages need quality checking.');
    process.exit(0);
  }

  console.log(`   Found ${pagesToCheck.length} page(s) to check\n`);

  // ── Step 2: Calculate quality scores ──
  const results: QualityCheckResult[] = [];
  let passed = 0;
  let failed = 0;

  for (let index = 0; index < pagesToCheck.length; index++) {
    const page = pagesToCheck[index];
    const previousScore = page.quality_score;

    const score = calculateQualityScore({
      word_count: page.word_count,
      internal_links: page.internal_links,
      faqs: page.faqs,
      content_json: page.content_json,
    });

    const issues = analyzeIssues(page);
    const isPassing = score >= threshold;

    results.push({
      page_id: page.id,
      url_path: page.url_path,
      previous_score: previousScore,
      score,
      passed: isPassing,
      issues,
    });

    if (isPassing) {
      passed++;
    } else {
      failed++;
    }

    // Update quality_score on published_pages
    await supabase
      .from('published_pages')
      .update({
        quality_score: score,
        last_updated: new Date().toISOString(),
      })
      .eq('id', page.id);

    // Also update the content_queue if there's a queue_id
    if (page.queue_id !== null) {
      await supabase
        .from('content_queue')
        .update({
          quality_score: score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', page.queue_id);
    }

    const statusIcon = isPassing ? '✅' : '⚠️';
    const scoreColor = score >= QUALITY_PASS_THRESHOLD ? 'PASS' : 'LOW';

    console.log(
      `   ${statusIcon} [${index + 1}/${pagesToCheck.length}] ${page.url_path}`,
    );
    console.log(
      `       Score: ${score}/100 (${scoreColor})` +
        (previousScore !== null ? ` | Previous: ${previousScore}` : ''),
    );

    if (issues.length > 0 && !isPassing) {
      for (const issue of issues) {
        console.log(`       ⚠️  ${issue}`);
      }
    }
  }

  // ── Summary ──
  const totalSeconds = (Date.now() - startTime) / 1000;

  console.log('\n═══════════════════════════════════════');
  console.log('  📊 QUALITY CHECK SUMMARY');
  console.log(`  Duration:   ${totalSeconds.toFixed(1)}s`);
  console.log(`  Total:      ${results.length}`);
  console.log(`  Passed:     ${passed}`);
  console.log(`  Failed:     ${failed}`);
  console.log(`  Threshold:  ${threshold}/100`);

  // Show low-quality items that need attention
  const lowQuality = results.filter((r) => !r.passed);
  if (lowQuality.length > 0) {
    console.log('\n  ⚠️  Pages needing attention:');
    for (const item of lowQuality) {
      console.log(`     - [${item.score}/100] ${item.url_path}`);
      for (const issue of item.issues.slice(0, 3)) {
        console.log(`       • ${issue}`);
      }
    }
  }

  console.log('═══════════════════════════════════════');

  if (failed > 0) {
    process.exit(1);
  }
}

runQualityCheck().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('💥 Fatal error:', message);
  process.exit(1);
});
