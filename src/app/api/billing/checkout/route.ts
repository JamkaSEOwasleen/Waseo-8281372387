import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { createCheckoutUrl } from '@/lib/lemonsqueezy';
import { z } from 'zod';

// ─── Validation ──────────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  plan: z.enum(['starter', 'pro', 'agency'] as const, {
    message: 'Invalid plan selection',
  }),
});

// ─── POST /api/billing/checkout ──────────────────────────────────────────────
// Creates a Lemon Squeezy checkout URL for the requested plan.

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await requireSession();

    const body = checkoutSchema.parse(await req.json());

    const checkoutUrl = await createCheckoutUrl(
      session.id,
      session.email,
      body.plan
    );

    return NextResponse.json(
      { data: { url: checkoutUrl }, error: null },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && 'digest' in err && (err as Error & { digest: string }).digest === 'NEXT_REDIRECT') {
      throw err;
    }
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'validation_error', message: 'Invalid data' },
        { status: 400 }
      );
    }
    console.error('POST /api/billing/checkout error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Failed to create checkout link' },
      { status: 500 }
    );
  }
}
