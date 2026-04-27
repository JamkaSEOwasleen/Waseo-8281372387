import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Brief } from '@/types';

// ─── Route Parameters ────────────────────────────────────────────────────────

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── GET /api/briefs/[id] ─────────────────────────────────────────────────────
// Returns a single brief with full output and schema, verifying ownership.

export async function GET(
  _req: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const session = await requireSession();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'not_found', message: 'Brief not found or you do not have access.' },
          { status: 404 }
        );
      }
      console.error('Failed to fetch brief:', error);
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to fetch brief' },
        { status: 500 }
      );
    }

    // Fetch website info if available
    const brief = data as Brief;
    let website: { name: string; domain: string } | null = null;

    if (brief.website_id) {
      const { data: websiteData } = await supabase
        .from('websites')
        .select('name, domain')
        .eq('id', brief.website_id)
        .single();

      if (websiteData) {
        website = websiteData;
      }
    }

    return NextResponse.json(
      { data: { ...brief, website }, error: null },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && 'digest' in err && (err as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('GET /api/briefs/[id] error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/briefs/[id] ──────────────────────────────────────────────────
// Deletes a brief if the authenticated user owns it.

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
      .from('briefs')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'not_found', message: 'Brief not found or you do not have access.' },
        { status: 404 }
      );
    }

    // 2. Delete
    const { error } = await supabase
      .from('briefs')
      .delete()
      .eq('id', id)
      .eq('user_id', session.id);

    if (error) {
      console.error('Failed to delete brief:', error);
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to delete brief' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: { deleted: true }, error: null },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && 'digest' in err && (err as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('DELETE /api/briefs/[id] error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
