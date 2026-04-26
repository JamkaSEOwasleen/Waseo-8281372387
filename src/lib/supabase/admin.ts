import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client using the service role key.
 * Bypasses Row Level Security (RLS) — use only in server-side
 * API routes and webhook handlers.
 *
 * @warning Server-only. Never import in client components.
 * @warning Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
