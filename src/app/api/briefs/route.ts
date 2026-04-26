import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Brief } from '@/types';

// ─── Pagination Constants ──────────────────────────────────────────────────────

const BRIEFS_PER_PAGE = 12;

// ─── GET /api/briefs ──────────────────────────────────────────────────────────
// Returns briefs for the authenticated user with optional filters and pagination.
// Query params: search, websiteId, intent, sort (newest|oldest), page

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const session = await requireSession();
    const supabase = createAdminClient();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const websiteId = searchParams.get('websiteId') || '';
    const intent = searchParams.get('intent') || '';
    const sortParam = searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

    // 1. Build the query
    let query = supabase
      .from('briefs')
      .select('*', { count: 'exact' })
      .eq('user_id', session.id);

    // 2. Apply optional filters
    if (search) {
      query = query.ilike('keyword', `%${search}%`);
    }

    if (websiteId) {
      query = query.eq('website_id', websiteId);
    }

    if (intent) {
      query = query.eq('intent', intent);
    }

    // 3. Apply sorting
    if (sortParam === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // 4. Apply pagination
    const from = (page - 1) * BRIEFS_PER_PAGE;
    const to = from + BRIEFS_PER_PAGE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to fetch briefs:', error);
      return NextResponse.json(
        { error: 'server_error', message: 'فشل في جلب الموجزات' },
        { status: 500 }
      );
    }

    // 5. Fetch website names for joined display
    const briefs = (data ?? []) as Brief[];
    let websiteNames: Record<string, string> = {};
    const websiteIds = [...new Set(briefs.map((b) => b.website_id).filter(Boolean))] as string[];

    if (websiteIds.length > 0) {
      const { data: websites } = await supabase
        .from('websites')
        .select('id, name, domain')
        .in('id', websiteIds);

      if (websites) {
        websiteNames = Object.fromEntries(
          websites.map((w) => [w.id, { name: w.name, domain: w.domain }])
        );
      }
    }

    return NextResponse.json(
      {
        data: briefs,
        count: count ?? 0,
        page,
        totalPages: Math.ceil((count ?? 0) / BRIEFS_PER_PAGE),
        websiteNames,
        error: null,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && 'digest' in err && (err as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('GET /api/briefs error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
