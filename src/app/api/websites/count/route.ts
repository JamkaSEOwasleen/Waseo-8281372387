import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWebsiteLimit } from '@/lib/utils';
import type { PlanType } from '@/types';

// ─── GET /api/websites/count ─────────────────────────────────────────────────
// Returns the current website count, limit, and whether more can be added.

export async function GET(): Promise<NextResponse> {
  try {
    const session = await requireSession();
    const supabase = createAdminClient();
    const plan = session.plan as PlanType;
    const limit = getWebsiteLimit(plan);

    // For agency/unlimited, return early without counting
    if (limit === Infinity) {
      return NextResponse.json(
        { count: 0, limit: Infinity, canAdd: true },
        { status: 200 }
      );
    }

    const { count, error } = await supabase
      .from('websites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.id);

    if (error) {
      console.error('Failed to count websites:', error);
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to fetch website count' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        count: count ?? 0,
        limit,
        canAdd: (count ?? 0) < limit,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && 'digest' in err && (err as Error & { digest: string }).digest === 'NEXT_REDIRECT') {
      throw err;
    }
    console.error('GET /api/websites/count error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
