// ────────────────────────────────────────────────────────────
// WasafSEO PSEO — Seed Niches Script
// Reads scripts/pseo/data/niches.json and upserts into pseo.niches
//
// Usage:
//   npx tsx --env-file=.env.local scripts/pseo/seed-niches.ts
// ────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createPSEOAdminClient } from '../../src/lib/pseo/supabase';
import type { PSEOPillarType, PSEOIntent } from '../../src/types/pseo';

interface RawNiche {
  slug: string;
  name_ar: string;
  icon_name: string | null;
  description_ar: string;
  priority: string | null;
  tier: number | null;
  intent_types: string[];
  parent_slug: string | null;
}

/**
 * Maps tier number → pillar_type for the DB.
 * - tier 0 → 'primary'
 * - tier 1 → 'secondary'
 * - tier 2+ → 'tertiary'
 */
function getPillarType(tier: number | null): PSEOPillarType {
  if (tier === 0) return 'primary';
  if (tier === 1) return 'secondary';
  return 'tertiary';
}

/**
 * Maps priority string ("P0", "P1", null) → integer 1-100.
 * - "P0" → 100
 * - "P1" → 75
 * - null → 50
 */
function getPriorityScore(priority: string | null): number {
  if (priority === 'P0') return 100;
  if (priority === 'P1') return 75;
  return 50;
}

/**
 * Generates an English name from the slug for the name_en DB field.
 */
function slugToNameEn(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const BATCH_SIZE = 50;

async function seedNiches(): Promise<void> {
  console.log('📁 Loading niches.json...');

  const filePath = resolve(__dirname, 'data', 'niches.json');
  const raw = readFileSync(filePath, 'utf-8');
  const niches: RawNiche[] = JSON.parse(raw);

  console.log(`   Found ${niches.length} niches (primary + sub-niches)`);

  const supabase = createPSEOAdminClient();

  const batches: RawNiche[][] = [];
  for (let i = 0; i < niches.length; i += BATCH_SIZE) {
    batches.push(niches.slice(i, i + BATCH_SIZE));
  }

  console.log(`   Processing ${batches.length} batch(es) of ${BATCH_SIZE}...`);

  let upserted = 0;
  let errors = 0;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const dbRows = batch.map((niche) => ({
      name_ar: niche.name_ar,
      name_en: slugToNameEn(niche.slug),
      slug: niche.slug,
      pillar_type: getPillarType(niche.tier),
      description: niche.description_ar,
      search_volume_estimate: getSearchVolumeEstimate(niche.tier, niche.priority),
      intent_types: niche.intent_types.length > 0 ? niche.intent_types as PSEOIntent[] : [],
      priority: getPriorityScore(niche.priority),
      icon_name: niche.icon_name,
      is_active: true,
    }));

    const { error } = await supabase
      .from('niches')
      .upsert(dbRows, { onConflict: 'slug', ignoreDuplicates: false });

    if (error) {
      console.error(`   ❌ Batch ${batchIndex + 1} failed:`, error.message);
      errors += batch.length;
    } else {
      upserted += batch.length;
      console.log(`   ✅ Batch ${batchIndex + 1}/${batches.length} — ${batch.length} niches upserted`);
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`   ✅ Seed complete`);
  console.log(`   Upserted: ${upserted}`);
  console.log(`   Errors:   ${errors}`);
  console.log('═══════════════════════════════════════');

  if (errors > 0) {
    process.exit(1);
  }
}

/**
 * Estimates search volume based on tier and priority string.
 */
function getSearchVolumeEstimate(tier: number | null, priority: string | null): number {
  if (priority === 'P0') return 15000;
  if (priority === 'P1') return 8000;
  if (tier !== null && tier <= 1) return 5000;
  return 2000;
}

seedNiches().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('💥 Fatal error:', message);
  process.exit(1);
});
