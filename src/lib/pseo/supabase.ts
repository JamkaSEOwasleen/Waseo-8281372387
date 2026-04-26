import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client configured for the `pseo` schema.
 * Uses the same SUPABASE_SERVICE_ROLE_KEY as the main app (bypasses RLS).
 *
 * @warning Server-only. Never import in client components.
 * @warning Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createPSEOAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'pseo',
      },
    },
  );
}
