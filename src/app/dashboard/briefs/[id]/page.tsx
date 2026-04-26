// ─── Single Brief View Page ────────────────────────────────────────────────
// /dashboard/briefs/[id]
// Server component that fetches a brief by ID and verifies ownership.
// Renders BriefResults and action buttons (Generate Similar, Delete).

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { BriefViewClient } from './BriefViewClient';
import type { Brief, BriefOutput, SchemaOutput } from '@/types';

// ─── Metadata (dynamic) ─────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default async function SingleBriefPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const session = await requireSession();
  const supabase = createAdminClient();

  // 1. Fetch brief with ownership verification
  const { data, error } = await supabase
    .from('briefs')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const brief = data as Brief;

  // 2. Redirect if brief has no output (incomplete generation)
  if (!brief.output) {
    redirect('/dashboard/briefs');
  }

  // 3. Fetch website info if available
  let websiteName: string | null = null;
  let websiteDomain: string | null = null;

  if (brief.website_id) {
    const { data: websiteData } = await supabase
      .from('websites')
      .select('name, domain')
      .eq('id', brief.website_id)
      .single();

    if (websiteData) {
      websiteName = websiteData.name;
      websiteDomain = websiteData.domain;
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* ── Back Navigation ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/briefs"
          className="flex h-11 items-center gap-2 text-sm text-text-muted transition-colors hover:text-text-primary lg:h-10"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          العودة إلى الموجزات
        </Link>
      </div>

      {/* ── Brief Header ─────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-text-primary lg:text-4xl">
          {brief.keyword}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
          {websiteName && (
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              {websiteName}
              {websiteDomain && <span>— {websiteDomain}</span>}
            </span>
          )}
          <span>|</span>
          <span>{brief.intent}</span>
          {brief.target_country && (
            <>
              <span>|</span>
              <span>{brief.target_country}</span>
            </>
          )}
        </div>
      </div>

      {/* ── Brief Results ────────────────────────────────────────────────── */}
      {/* BriefResults is a client component, we pass data as props */}
      <BriefViewClient
        brief={brief.output as BriefOutput}
        schema={brief.schema_output as SchemaOutput}
        briefId={brief.id}
        keyword={brief.keyword}
      />
    </div>
  );
}

// ─── Metadata Generation ────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<{ title: string; description: string }> {
  const { id } = await params;

  try {
    const session = await requireSession();
    const supabase = createAdminClient();

    const { data } = await supabase
      .from('briefs')
      .select('keyword')
      .eq('id', id)
      .eq('user_id', session.id)
      .single();

    if (data) {
      return {
        title: `${data.keyword} - WasafSEO`,
        description: `موجز محتوى لكلمة "${data.keyword}"`,
      };
    }
  } catch {
    // Ignore errors, return defaults
  }

  return {
    title: 'الموجز - WasafSEO',
    description: 'عرض موجز المحتوى',
  };
}
