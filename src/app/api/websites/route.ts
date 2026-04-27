import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { websiteSchema } from '@/lib/validations';
import { getWebsiteLimit } from '@/lib/utils';
import type { PlanType } from '@/types';

// ─── GET /api/websites ───────────────────────────────────────────────────────
// Returns all websites for the authenticated user, ordered by created_at desc.

export async function GET(): Promise<NextResponse> {
  try {
    const session = await requireSession();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('user_id', session.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch websites:', error);
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to fetch websites' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, error: null }, { status: 200 });
  } catch (err) {
    if (err instanceof Error && 'digest' in err && (err as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('GET /api/websites error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// ─── POST /api/websites ──────────────────────────────────────────────────────
// Creates a new website for the authenticated user.
// Checks website limit before inserting.

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await requireSession();
    const supabase = createAdminClient();

    // 1. Validate request body
    const body = websiteSchema.parse(await req.json());

    // 2. Access control check — plan must not be 'none'
    const plan = session.plan as PlanType;
    if (plan === 'none') {
      return NextResponse.json(
        {
          error: 'forbidden',
          message: 'You do not have an active plan. Please subscribe to add websites.',
        },
        { status: 403 }
      );
    }

    // 3. Check website limit
    const limit = getWebsiteLimit(plan);

    if (limit !== Infinity) {
      const { count, error: countError } = await supabase
        .from('websites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.id);

      if (countError) {
        console.error('Failed to count websites:', countError);
        return NextResponse.json(
          { error: 'server_error', message: 'Failed to verify website count.' },
          { status: 500 }
        );
      }

      if (count !== null && count >= limit && limit > 0) {
        return NextResponse.json(
          {
            error: 'limit_reached',
            message: `You have reached the maximum number of websites (${limit}). Please upgrade your plan to add more websites.`,
          },
          { status: 403 }
        );
      }
    }

    // 4. Insert website
    const { data, error } = await supabase
      .from('websites')
      .insert({
        user_id: session.id,
        name: body.name,
        domain: body.domain,
        logo_url: body.logo_url || null,
        niche: body.niche,
        target_country: body.target_country,
        brand_name: body.brand_name,
        brand_description: body.brand_description,
        twitter_url: body.twitter_url || null,
        linkedin_url: body.linkedin_url || null,
        wikipedia_url: body.wikipedia_url || null,
        author_name: body.author_name,
        author_title: body.author_title,
        author_bio: body.author_bio,
        author_linkedin: body.author_linkedin || null,
        author_portfolio: body.author_portfolio || null,
        author_topics: body.author_topics,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create website:', error);
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to create website' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && 'digest' in err && (err as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'validation_error', message: 'Invalid data', details: (err as { issues?: unknown[] }).issues },
        { status: 400 }
      );
    }
    console.error('POST /api/websites error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
