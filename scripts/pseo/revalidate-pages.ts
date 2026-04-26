// ────────────────────────────────────────────────────────────
// WasafSEO PSEO — ISR Revalidation Script
// Triggers Next.js ISR revalidation for published PSEO pages
// by calling the /api/pseo/revalidate endpoint.
//
// Usage:
//   npx tsx --env-file=.env.local scripts/pseo/revalidate-pages.ts [limit]
//
//   limit: Number of recent pages to revalidate (default: 10, max: 100)
//   all:   Pass "all" as second arg to revalidate ALL published pages
//   Example: npx tsx --env-file=.env.local scripts/pseo/revalidate-pages.ts 20
//   Example: npx tsx --env-file=.env.local scripts/pseo/revalidate-pages.ts 0 all
// ────────────────────────────────────────────────────────────

import { createPSEOAdminClient } from '../../src/lib/pseo/supabase';

// ─── Config ─────────────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// ─── Helpers ────────────────────────────────────────────────────────────────────

interface RevalidationResult {
  url_path: string;
  success: boolean;
  statusCode: number;
  error: string | null;
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
 * Checks if "all" flag is passed (revalidate everything).
 */
function isRevalidateAll(): boolean {
  return process.argv.includes('all');
}

/**
 * Gets the revalidation secret from environment.
 */
function getRevalidationSecret(): string {
  return process.env.PSEO_REVALIDATION_SECRET ?? '';
}

/**
 * Gets the app URL from environment.
 */
function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

// ─── Main ───────────────────────────────────────────────────────────────────────

async function revalidatePages(): Promise<void> {
  const limit = getLimit();
  const revalidateAll = isRevalidateAll();
  const startTime = Date.now();

  console.log('═══════════════════════════════════════');
  console.log('  PSEO ISR Revalidation');
  console.log(`  Mode: ${revalidateAll ? '🔄 ALL PAGES' : `📄 Recent ${limit}`}`);
  console.log('═══════════════════════════════════════\n');

  const supabase = createPSEOAdminClient();

  // ── Step 1: Fetch pages to revalidate ──
  console.log('📋 Fetching published pages...');

  let query = supabase
    .from('published_pages')
    .select('url_path')
    .eq('is_published', true)
    .order('last_updated', { ascending: false });

  if (!revalidateAll) {
    query = query.limit(limit);
  }

  const { data: pages, error: fetchError } = await query;

  if (fetchError) {
    throw new Error(`Failed to fetch pages: ${fetchError.message}`);
  }

  const urlPaths: string[] = (pages ?? []).map(
    (p: { url_path: string }) => p.url_path,
  );

  if (urlPaths.length === 0) {
    console.log('✅ No published pages to revalidate.');
    process.exit(0);
  }

  console.log(`   Found ${urlPaths.length} page(s) to revalidate\n`);

  // ── Step 2: Call revalidation API for each page ──
  const appUrl = getAppUrl();
  const secret = getRevalidationSecret();
  const results: RevalidationResult[] = [];
  let succeeded = 0;
  let failed = 0;

  if (!secret) {
    console.warn(
      '   ⚠️  PSEO_REVALIDATION_SECRET not set. Revalidation will be skipped.',
    );
    console.warn(
      '       Set this env variable to enable ISR revalidation via API.',
    );
    console.warn(
      '       Pages can still be revalidated manually via Next.js on-demand ISR.\n',
    );
    process.exit(0);
  }

  for (let index = 0; index < urlPaths.length; index++) {
    const urlPath = urlPaths[index];

    try {
      const response = await fetch(
        `${appUrl}/api/pseo/revalidate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-revalidation-secret': secret,
          },
          body: JSON.stringify({ urlPath }),
        },
      );

      const responseData = await response
        .json()
        .catch(() => ({ error: 'unknown' }));

      const isSuccess = response.ok;

      results.push({
        url_path: urlPath,
        success: isSuccess,
        statusCode: response.status,
        error: isSuccess ? null : (responseData.error ?? 'Unknown error'),
      });

      if (isSuccess) {
        succeeded++;
      } else {
        failed++;
      }

      const icon = isSuccess ? '✅' : '❌';
      console.log(
        `   ${icon} [${index + 1}/${urlPaths.length}] ${urlPath}` +
          (isSuccess ? '' : ` (${response.status})`),
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      results.push({
        url_path: urlPath,
        success: false,
        statusCode: 0,
        error: errorMessage,
      });

      failed++;
      console.error(`   ❌ [${index + 1}/${urlPaths.length}] ${urlPath} — ${errorMessage}`);
    }
  }

  // ── Summary ──
  const totalSeconds = (Date.now() - startTime) / 1000;

  console.log('\n═══════════════════════════════════════');
  console.log('  📊 REVALIDATION SUMMARY');
  console.log(`  Duration:   ${totalSeconds.toFixed(1)}s`);
  console.log(`  Total:      ${results.length}`);
  console.log(`  Succeeded:  ${succeeded}`);
  console.log(`  Failed:     ${failed}`);
  console.log('═══════════════════════════════════════');

  if (failed > 0) {
    process.exit(1);
  }
}

revalidatePages().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('💥 Fatal error:', message);
  process.exit(1);
});
