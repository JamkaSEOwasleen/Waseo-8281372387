import { NextResponse } from 'next/server';
import { requireSession, getUserFromDb, checkAccountAccess } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSchema } from '@/lib/validations';
import { checkUsageLimit, incrementUsage } from '@/lib/usage';
import { generateContentBrief, generateSchema as generateDeepseekSchema } from '@/lib/deepseek';
import type { Website, PlanType } from '@/types';

// ─── POST /api/generate ───────────────────────────────────────────────────────
// Generates a complete Arabic SEO content brief with JSON-LD schema.
// Execution order is strictly enforced — see .roo/rules/07-api-prompts.md.

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // 1. Auth check
    const session = await requireSession();

    // 2. Fetch full user for account checks
    const user = await getUserFromDb(session.id);
    if (!user) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'يجب تسجيل الدخول للوصول إلى هذه الخدمة.' },
        { status: 401 }
      );
    }

    // 3. Check account access (flagged / no plan / trial expired)
    const access = checkAccountAccess(user);
    if (!access.allowed) {
      if (access.reason === 'flagged') {
        return NextResponse.json(
          { error: 'forbidden', message: 'تم تعليق حسابك. يرجى التواصل مع الدعم.' },
          { status: 403 }
        );
      }
      if (access.reason === 'no_plan') {
        return NextResponse.json(
          { error: 'forbidden', message: 'لا يوجد اشتراك نشط. يرجى الاشتراك للمتابعة.' },
          { status: 403 }
        );
      }
      if (access.reason === 'trial_expired') {
        return NextResponse.json(
          { error: 'forbidden', message: 'انتهت الفترة التجريبية. يرجى ترقية خطتك للمتابعة.' },
          { status: 403 }
        );
      }
    }

    // 4. Zod validate request body
    const body = generateSchema.parse(await req.json());
    const { keyword, intent, location, additionalInfo, websiteId, competitorUrls } = body;

    // 5. Check usage limit before calling Deepseek
    const usageCheck = await checkUsageLimit(session.id, user.plan as PlanType, user.trial_ends_at);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: 'limit_reached', message: usageCheck.message },
        { status: 403 }
      );
    }

    // 6. Fetch website and verify ownership
    const supabase = createAdminClient();
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('*')
      .eq('id', websiteId)
      .eq('user_id', session.id)
      .single();

    if (websiteError || !website) {
      return NextResponse.json(
        { error: 'not_found', message: 'الموقع غير موجود أو لا تملك صلاحية الوصول إليه.' },
        { status: 404 }
      );
    }

    const typedWebsite = website as Website;

    // 7. Call 1: Generate content brief
    const brief = await generateContentBrief({
      keyword,
      intent,
      location,
      additionalInfo: additionalInfo || '',
      website: typedWebsite,
    });

    // 8. Call 2: Generate JSON-LD schema with brief as context
    const schema = await generateDeepseekSchema({
      website: typedWebsite,
      brief,
      intent,
    });

    // 9. Insert brief + schema to Supabase
    const wordCountActual = brief.fundamentals?.estimatedWordCount ?? null;
    const { data: insertedBrief, error: insertError } = await supabase
      .from('briefs')
      .insert({
        user_id: session.id,
        website_id: websiteId,
        keyword,
        intent,
        target_country: location,
        additional_info: additionalInfo || null,
        competitor_urls: competitorUrls || [],
        output: brief,
        schema_output: schema,
        word_count_actual: wordCountActual,
      })
      .select('id')
      .single();

    if (insertError || !insertedBrief) {
      console.error('Failed to save brief:', insertError);
      return NextResponse.json(
        { error: 'server_error', message: 'فشل حفظ الموجز. يرجى المحاولة مرة أخرى.' },
        { status: 500 }
      );
    }

    // 10. Increment usage ONLY after successful save
    try {
      await incrementUsage(session.id);
    } catch (usageError) {
      // Log but don't fail the request — brief is already saved
      console.error('Failed to increment usage:', usageError);
    }

    // 11. Return success
    return NextResponse.json(
      {
        data: {
          brief,
          schema,
          briefId: insertedBrief.id,
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (err) {
    // Re-throw Next.js redirect errors (digest format: 'NEXT_REDIRECT;replace;...')
    if (err instanceof Error && 'digest' in err && (err as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }

    // Zod validation errors
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'validation_error', message: 'بيانات غير صالحة' },
        { status: 400 }
      );
    }

    // Deepseek generation errors
    if (err instanceof Error && (err.message.includes('Content brief generation failed') || err.message.includes('Schema generation failed'))) {
      return NextResponse.json(
        { error: 'server_error', message: 'فشل إنشاء الموجز. يرجى المحاولة مرة أخرى.' },
        { status: 500 }
      );
    }

    console.error('POST /api/generate error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}
