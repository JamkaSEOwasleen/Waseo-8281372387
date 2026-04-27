import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCustomerPortalUrl } from '@/lib/lemonsqueezy';

// ─── GET /api/billing/portal ───────────────────────────────────────────────────
// Returns the Lemon Squeezy customer portal URL for managing subscriptions.

export async function GET(): Promise<NextResponse> {
  try {
    const session = await requireSession();
    const supabase = createAdminClient();

    // Fetch the user's lemon_customer_id from the database
    const { data: user, error } = await supabase
      .from('users')
      .select('lemon_customer_id')
      .eq('id', session.id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'not_found', message: 'User not found.' },
        { status: 404 }
      );
    }

    if (!user.lemon_customer_id) {
      return NextResponse.json(
        {
          error: 'not_found',
          message: 'No billing account found. Please subscribe first.',
        },
        { status: 404 }
      );
    }

    const portalUrl = await getCustomerPortalUrl(user.lemon_customer_id);

    if (!portalUrl) {
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to get billing portal link.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: { url: portalUrl }, error: null },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && 'digest' in err && (err as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('GET /api/billing/portal error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
