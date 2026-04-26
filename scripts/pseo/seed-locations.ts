// ────────────────────────────────────────────────────────────
// WasafSEO PSEO — Seed Locations Script
// Reads scripts/pseo/data/locations.json and upserts into pseo.locations
//
// Usage:
//   npx tsx --env-file=.env.local scripts/pseo/seed-locations.ts
// ────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createPSEOAdminClient } from '../../src/lib/pseo/supabase';

interface RawLocation {
  name_ar: string;
  name_en: string;
  slug: string;
  country: string;
  country_ar: string;
  country_code: string;
  region: string | null;
  region_ar: string | null;
  location_type: string;
  population: number;
  search_volume_estimate: number;
  priority: number;
}

const BATCH_SIZE = 100;

async function seedLocations(): Promise<void> {
  console.log('📁 Loading locations.json...');

  const filePath = resolve(__dirname, 'data', 'locations.json');
  const raw = readFileSync(filePath, 'utf-8');
  const locations: RawLocation[] = JSON.parse(raw);

  console.log(`   Found ${locations.length} locations`);

  const supabase = createPSEOAdminClient();

  const batches: RawLocation[][] = [];
  for (let i = 0; i < locations.length; i += BATCH_SIZE) {
    batches.push(locations.slice(i, i + BATCH_SIZE));
  }

  console.log(`   Processing ${batches.length} batch(es) of ${BATCH_SIZE}...`);

  let upserted = 0;
  let errors = 0;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const dbRows = batch.map((loc) => ({
      name_ar: loc.name_ar,
      name_en: loc.name_en,
      slug: loc.slug,
      country: loc.country,
      country_ar: loc.country_ar,
      country_code: loc.country_code,
      region: loc.region ?? null,
      region_ar: loc.region_ar ?? null,
      location_type: loc.location_type,
      population: loc.population,
      search_volume_estimate: loc.search_volume_estimate,
      priority: loc.priority,
      is_active: true,
    }));

    const { error } = await supabase
      .from('locations')
      .upsert(dbRows, { onConflict: 'slug', ignoreDuplicates: false });

    if (error) {
      console.error(`   ❌ Batch ${batchIndex + 1} failed:`, error.message);
      errors += batch.length;
    } else {
      upserted += batch.length;
      console.log(`   ✅ Batch ${batchIndex + 1}/${batches.length} — ${batch.length} locations upserted`);
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

seedLocations().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('💥 Fatal error:', message);
  process.exit(1);
});
