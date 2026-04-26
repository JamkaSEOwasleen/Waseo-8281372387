// ────────────────────────────────────────────────────────────
// WasafSEO PSEO — ISR Revalidation API Route
// Called by scripts/pseo/revalidate-pages.ts and GitHub Actions
// to trigger Next.js on-demand ISR revalidation for PSEO pages.
//
// POST /api/pseo/revalidate
// Headers: x-revalidation-secret: <PSEO_REVALIDATION_SECRET>
// Body: { urlPath: "/pillar/location/intent/format" }
// ────────────────────────────────────────────────────────────

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// ─── Constants ──────────────────────────────────────────────────────────────────

const REVALIDATION_SECRET = process.env.PSEO_REVALIDATION_SECRET ?? '';
const PSEO_BASE_PATH = '/'; // Revalidate the full path under (pseo) route group

// ─── Types ───────────────────────────────────────────────────────────────────────

interface RevalidateRequest {
  urlPath: string;
}

interface RevalidateSuccessResponse {
  revalidated: boolean;
  urlPath: string;
  timestamp: string;
}

interface RevalidateErrorResponse {
  error: string;
  message: string;
}

// ─── Route Handler ──────────────────────────────────────────────────────────────

export async function POST(
  request: Request,
): Promise<NextResponse<RevalidateSuccessResponse | RevalidateErrorResponse>> {
  try {
    // ── Step 1: Verify secret ──
    const providedSecret = request.headers.get('x-revalidation-secret') ?? '';

    if (!REVALIDATION_SECRET) {
      return NextResponse.json(
        {
          error: 'server_error',
          message: 'لم يتم تكوين مفتاح إعادة التحقق. يرجى ضبط PSEO_REVALIDATION_SECRET.',
        },
        { status: 500 },
      );
    }

    if (providedSecret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'مفتاح إعادة التحقق غير صالح.',
        },
        { status: 401 },
      );
    }

    // ── Step 2: Parse and validate body ──
    const body: RevalidateRequest = await request.json();

    if (!body.urlPath || typeof body.urlPath !== 'string') {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'حقل urlPath مطلوب ويجب أن يكون نصاً.',
        },
        { status: 400 },
      );
    }

    const urlPath: string = body.urlPath;

    // Ensure urlPath starts with /
    const normalizedPath: string = urlPath.startsWith('/')
      ? urlPath
      : `/${urlPath}`;

    // ── Step 3: Revalidate the path ──
    // The PSEO pages live under the (pseo) route group.
    // revalidatePath with the full path triggers ISR for that specific page.
    revalidatePath(normalizedPath, 'page');

    console.log(`[PSEO Revalidate] Revalidated path: ${normalizedPath}`);

    return NextResponse.json(
      {
        revalidated: true,
        urlPath: normalizedPath,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PSEO Revalidate] Error:', message);

    return NextResponse.json(
      {
        error: 'server_error',
        message: 'حدث خطأ أثناء إعادة التحقق من المسار.',
      },
      { status: 500 },
    );
  }
}
