import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { websiteUpdateSchema } from '@/lib/validations';

// ─── Route Parameters ────────────────────────────────────────────────────────

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── GET /api/websites/[id] ──────────────────────────────────────────────────
// Returns a single website if the authenticated user owns it.

export async function GET(
  _req: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const session = await requireSession();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'not_found', message: 'Website not found or you do not have access.' },
          { status: 404 }
        );
      }
      console.error('Failed to fetch website:', error);
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to fetch website' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, error: null }, { status: 200 });
  } catch (err) {
    if (err instanceof Error && 'digest' in err && (err as Error & { digest: string }).digest === 'NEXT_REDIRECT') {
      throw err;
    }
    console.error('GET /api/websites/[id] error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// ─── PUT /api/websites/[id] ──────────────────────────────────────────────────
// Updates a website if the authenticated user owns it.

export async function PUT(
  req: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const session = await requireSession();
    const supabase = createAdminClient();

    // 1. Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('websites')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'not_found', message: 'Website not found or you do not have access.' },
        { status: 404 }
      );
    }

    // 2. Validate body
    const body = websiteUpdateSchema.parse(await req.json());

    // 3. Update
    const { data, error } = await supabase
      .from('websites')
      .update({
        ...body,
        logo_url: body.logo_url || null,
        twitter_url: body.twitter_url || null,
        linkedin_url: body.linkedin_url || null,
        wikipedia_url: body.wikipedia_url || null,
        author_linkedin: body.author_linkedin || null,
        author_portfolio: body.author_portfolio || null,
      })
      .eq('id', id)
      .eq('user_id', session.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update website:', error);
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to update website' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, error: null }, { status: 200 });
  } catch (err) {
    if (err instanceof Error && 'digest' in err && (err as Error & { digest: string }).digest === 'NEXT_REDIRECT') {
      throw err;
    }
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'validation_error', message: 'Invalid data', details: (err as { issues?: unknown[] }).issues },
        { status: 400 }
      );
    }
    console.error('PUT /api/websites/[id] error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/websites/[id] ───────────────────────────────────────────────
// Deletes a website if the authenticated user owns it.

export async function DELETE(
  _req: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const session = await requireSession();
    const supabase = createAdminClient();

    // 1. Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('websites')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'not_found', message: 'Website not found or you do not have access.' },
        { status: 404 }
      );
    }

    // 2. Delete (cascade handled by DB)
    const { error } = await supabase
      .from('websites')
      .delete()
      .eq('id', id)
      .eq('user_id', session.id);

    if (error) {
      console.error('Failed to delete website:', error);
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to delete website' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { deleted: true }, error: null }, { status: 200 });
  } catch (err) {
    if (err instanceof Error && 'digest' in err && (err as Error & { digest: string }).digest === 'NEXT_REDIRECT') {
      throw err;
    }
    console.error('DELETE /api/websites/[id] error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
