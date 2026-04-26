// ────────────────────────────────────────────────────────────
// WasafSEO PSEO — Generate Content Queue
// Creates queue items from Cartesian join of:
//   locations × niches × intents × formats
//
// Usage:
//   npx tsx --env-file=.env.local scripts/pseo/generate-queue.ts
// ────────────────────────────────────────────────────────────

import { createPSEOAdminClient } from '../../src/lib/pseo/supabase';
import type {
  PSEOLocation,
  PSEONiche,
  PSEOIntent,
  PSEOFormat,
} from '../../src/types/pseo';

// ─── Inline format map (mirrors getFormatForIntent in utils.ts) ───

const FORMAT_MAP: Record<PSEOIntent, PSEOFormat[]> = {
  commercial: ['service-page', 'tool', 'geo', 'case-study'],
  informational: ['guide', 'list', 'blog', 'glossary'],
  'how-to': ['guide', 'blog', 'tool'],
  comparison: ['comparison', 'list'],
  navigational: ['hub', 'service-page'],
};

// ─── Inline priority score logic (mirrors getPriorityScore in utils.ts) ───

const INTENT_MULTIPLIERS: Record<PSEOIntent, number> = {
  commercial: 1.0,
  comparison: 0.8,
  'how-to': 0.6,
  informational: 0.4,
  navigational: 0.3,
};

const FORMAT_MULTIPLIERS: Record<PSEOFormat, number> = {
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

function calculatePriorityScore(
  searchVolume: number,
  difficulty: number,
  locationPriority: number,
  intent: PSEOIntent,
  format: PSEOFormat,
): number {
  const volume = Math.max(searchVolume, 10);
  const diff = Math.max(difficulty, 1);
  const intentMult = INTENT_MULTIPLIERS[intent] ?? 0.5;
  const formatMult = FORMAT_MULTIPLIERS[format] ?? 0.5;

  return Number(
    (
      (volume / diff) *
      (locationPriority / 100) *
      intentMult *
      formatMult
    ).toFixed(2),
  );
}

/**
 * Estimates keyword difficulty based on location priority and niche priority.
 * Higher priority = more competition = higher difficulty.
 */
function estimateDifficulty(locationPriority: number, nichePriority: number): number {
  const base = Math.round((100 - locationPriority) * 0.4 + (100 - nichePriority) * 0.3);
  return Math.max(10, Math.min(95, base + Math.round(Math.random() * 15)));
}

/**
 * Generates the target keyword in Arabic.
 */
function generateKeywordAr(
  nicheNameAr: string,
  locationNameAr: string,
  intent: PSEOIntent,
): string {
  switch (intent) {
    case 'commercial':
      return `أفضل ${nicheNameAr} في ${locationNameAr}`;
    case 'comparison':
      return `مقارنة أفضل ${nicheNameAr} في ${locationNameAr}`;
    case 'how-to':
      return `كيفية ${nicheNameAr} في ${locationNameAr}`;
    case 'informational':
      return `${nicheNameAr} في ${locationNameAr}`;
    case 'navigational':
      return `خدمات ${nicheNameAr} في ${locationNameAr}`;
    default:
      return `${nicheNameAr} ${locationNameAr}`;
  }
}

/**
 * Generates the target keyword in English.
 */
function generateKeywordEn(
  nicheNameEn: string,
  locationNameEn: string,
  intent: PSEOIntent,
): string {
  switch (intent) {
    case 'commercial':
      return `best ${nicheNameEn} in ${locationNameEn}`;
    case 'comparison':
      return `best ${nicheNameEn} comparison in ${locationNameEn}`;
    case 'how-to':
      return `how to do ${nicheNameEn} in ${locationNameEn}`;
    case 'informational':
      return `${nicheNameEn} in ${locationNameEn}`;
    case 'navigational':
      return `${nicheNameEn} services in ${locationNameEn}`;
    default:
      return `${nicheNameEn} ${locationNameEn}`;
  }
}

/**
 * Converts a slug to a readable English name.
 */
function slugToNameEn(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const BATCH_SIZE = 200;

interface QueueRow {
  location_id: number;
  niche_id: number;
  intent: string;
  format: string;
  url_slug: string;
  target_keyword_ar: string;
  target_keyword_en: string;
  search_volume: number;
  keyword_difficulty: number;
  priority_score: number;
  status: string;
}

async function generateQueue(): Promise<void> {
  console.log('🔍 Fetching active locations and niches...');

  const supabase = createPSEOAdminClient();

  // ── Fetch locations ──
  const { data: locations, error: locError } = await supabase
    .from('locations')
    .select('id, name_ar, name_en, slug, priority, search_volume_estimate')
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (locError) {
    throw new Error(`Failed to fetch locations: ${locError.message}`);
  }

  if (!locations || locations.length === 0) {
    console.warn('⚠️  No active locations found. Run seed-locations.ts first.');
    process.exit(0);
  }

  console.log(`   Found ${locations.length} locations`);

  // ── Fetch niches ──
  const { data: niches, error: nicheError } = await supabase
    .from('niches')
    .select('id, name_ar, slug, pillar_type, priority, intent_types, icon_name')
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (nicheError) {
    throw new Error(`Failed to fetch niches: ${nicheError.message}`);
  }

  if (!niches || niches.length === 0) {
    console.warn('⚠️  No active niches found. Run seed-niches.ts first.');
    process.exit(0);
  }

  console.log(`   Found ${niches.length} niches`);

  // ── Generate queue items ──
  const rows: QueueRow[] = [];
  const seenSlugs = new Set<string>();

  for (const niche of niches) {
    const nicheNameEn = slugToNameEn(niche.slug);
    const nicheIntentTypes: PSEOIntent[] = (niche.intent_types ?? []) as PSEOIntent[];

    if (nicheIntentTypes.length === 0) {
      console.log(`   ⏭️  Skipping niche "${niche.slug}" — no intent types`);
      continue;
    }

    let nicheItemCount = 0;

    for (const location of locations) {
      for (const intent of nicheIntentTypes) {
        const formats = FORMAT_MAP[intent];
        if (!formats || formats.length === 0) continue;

        for (const format of formats) {
          // Build unique URL slug
          const urlSlug = `${niche.slug}/${location.slug}/${intent}/${format}`;

          // Deduplicate by url_slug
          if (seenSlugs.has(urlSlug)) continue;
          seenSlugs.add(urlSlug);

          const targetKeywordAr = generateKeywordAr(
            niche.name_ar,
            location.name_ar,
            intent,
          );
          const targetKeywordEn = generateKeywordEn(
            nicheNameEn,
            location.name_en,
            intent,
          );

          // Estimate search volume from location SV * niche priority factor
          const nichePriorityFactor = niche.priority / 100;
          const searchVolume = Math.max(
            10,
            Math.round((location.search_volume_estimate ?? 100) * nichePriorityFactor * (0.8 + Math.random() * 0.4)),
          );

          const keywordDifficulty = estimateDifficulty(location.priority, niche.priority);

          const priorityScore = calculatePriorityScore(
            searchVolume,
            keywordDifficulty,
            location.priority,
            intent,
            format,
          );

          rows.push({
            location_id: location.id,
            niche_id: niche.id,
            intent,
            format,
            url_slug: urlSlug,
            target_keyword_ar: targetKeywordAr,
            target_keyword_en: targetKeywordEn,
            search_volume: searchVolume,
            keyword_difficulty: keywordDifficulty,
            priority_score: priorityScore,
            status: 'pending',
          });

          nicheItemCount++;
        }
      }
    }

    console.log(`   📝 Niche "${niche.slug}" → ${nicheItemCount} queue items`);
  }

  console.log(`\n📊 Total queue items to insert: ${rows.length}`);

  if (rows.length === 0) {
    console.log('⚠️  No queue items generated. Nothing to insert.');
    process.exit(0);
  }

  // ── Batch upsert ──
  const batches: QueueRow[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE));
  }

  console.log(`   Processing ${batches.length} batch(es) of ${BATCH_SIZE}...`);

  let upserted = 0;
  let errors = 0;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const { error } = await supabase
      .from('content_queue')
      .upsert(batch, {
        onConflict: 'location_id, niche_id, intent, format',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error(`   ❌ Batch ${batchIndex + 1} failed:`, error.message);
      errors += batch.length;
    } else {
      upserted += batch.length;
      console.log(`   ✅ Batch ${batchIndex + 1}/${batches.length} — ${batch.length} items upserted`);
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`   ✅ Queue generation complete`);
  console.log(`   Upserted: ${upserted}`);
  console.log(`   Errors:   ${errors}`);
  console.log('═══════════════════════════════════════');

  if (errors > 0) {
    process.exit(1);
  }
}

generateQueue().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('💥 Fatal error:', message);
  process.exit(1);
});
