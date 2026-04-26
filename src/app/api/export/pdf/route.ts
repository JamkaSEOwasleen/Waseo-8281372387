import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import { WasafPdfDocument } from '@/lib/pdf-document';
import type { Brief, BriefOutput } from '@/types';

// ─── Validation ──────────────────────────────────────────────────────────────

const exportPdfSchema = z.object({
  briefId: z.string().uuid({ message: 'Invalid brief ID' }),
});

// ─── POST /api/export/pdf ─────────────────────────────────────────────────────
// Generates a PDF document for a given brief.

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await requireSession();
    const supabase = createAdminClient();

    // 1. Validate request body
    const body = exportPdfSchema.parse(await req.json());
    const { briefId } = body;

    // 2. Fetch brief and verify ownership
    const { data: briefData, error: briefError } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', briefId)
      .eq('user_id', session.id)
      .single();

    if (briefError || !briefData) {
      return NextResponse.json(
        { error: 'not_found', message: 'الموجز غير موجود أو لا تملك صلاحية الوصول إليه.' },
        { status: 404 }
      );
    }

    const brief = briefData as Brief;

    // 3. Validate that output exists
    if (!brief.output) {
      return NextResponse.json(
        { error: 'server_error', message: 'الموجز لا يحتوي على بيانات مكتملة.' },
        { status: 400 }
      );
    }

    // 4. Fetch website info if available
    let websiteName: string | null = null;
    let websiteDomain: string | null = null;
    let websiteLogoUrl: string | null = null;
    const isAgency = session.plan === 'agency';

    if (brief.website_id) {
      const { data: websiteData } = await supabase
        .from('websites')
        .select('name, domain, logo_url')
        .eq('id', brief.website_id)
        .single();

      if (websiteData) {
        websiteName = websiteData.name;
        websiteDomain = websiteData.domain;
        websiteLogoUrl = websiteData.logo_url;
      }
    }

    // 5. Render PDF to stream using React.createElement (API routes are .ts, no JSX)
    const pdfElement = React.createElement(WasafPdfDocument, {
      brief: brief.output as BriefOutput,
      keyword: brief.keyword,
      intent: brief.intent,
      targetCountry: brief.target_country,
      websiteName,
      websiteDomain,
      websiteLogoUrl,
      isAgency,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfStream = await renderToStream(pdfElement as any);

    // 6. Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream as unknown as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    // 7. Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="wasafseo-brief-${briefId.slice(0, 8)}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    if (err instanceof Error && 'digest' in err && (err as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'validation_error', message: 'بيانات غير صالحة' },
        { status: 400 }
      );
    }
    console.error('POST /api/export/pdf error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'فشل في إنشاء PDF. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}
