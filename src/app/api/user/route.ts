import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { User } from '@/types';
import { z } from 'zod/v4';

// ─── Validation Schemas ──────────────────────────────────────────────────────

const updateNameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

const deleteAccountSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ─── GET /api/user ───────────────────────────────────────────────────────────
// Returns the authenticated user's full profile from the database.

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'You must be logged in to access this service.' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'not_found', message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user as User }, { status: 200 });
  } catch (error) {
    console.error('GET /api/user error:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/user ─────────────────────────────────────────────────────────
// Updates the authenticated user's profile (name only for now).

export async function PATCH(req: Request): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'You must be logged in to access this service.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = updateNameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: parsed.error?.issues?.[0]?.message ?? 'Invalid data.',
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ name: parsed.data.name })
      .eq('id', session.user.id)
      .select('*')
      .single();

    if (error || !updatedUser) {
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to update profile.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedUser as User }, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/user error:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/user ─────────────────────────────────────────────────────────
// Deletes the authenticated user's account and all associated data.
// Requires email confirmation in the request body.

export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'You must be logged in to access this service.' },
        { status: 401 }
      );
    }

    // 1. Validate request body — require email confirmation
    const body = await req.json();
    const parsed = deleteAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: parsed.error?.issues?.[0]?.message ?? 'Invalid data.',
        },
        { status: 400 }
      );
    }

    // 2. Verify the confirmed email matches the session user's email
    if (parsed.data.email !== session.user.email) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Email does not match. Please confirm using your registered email.' },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    // 3. Delete all related records (order matters)
    const { error: briefsError } = await supabase
      .from('briefs')
      .delete()
      .eq('user_id', session.user.id);

    if (briefsError) {
      console.error('Failed to delete user briefs:', briefsError);
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to delete account. Please try again.' },
        { status: 500 }
      );
    }

    const { error: websitesError } = await supabase
      .from('websites')
      .delete()
      .eq('user_id', session.user.id);

    if (websitesError) {
      console.error('Failed to delete user websites:', websitesError);
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to delete account. Please try again.' },
        { status: 500 }
      );
    }

    const { error: usageError } = await supabase
      .from('usage')
      .delete()
      .eq('user_id', session.user.id);

    if (usageError) {
      console.error('Failed to delete user usage records:', usageError);
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to delete account. Please try again.' },
        { status: 500 }
      );
    }

    // 4. Delete the user record
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', session.user.id);

    if (userError) {
      console.error('Failed to delete user:', userError);
      return NextResponse.json(
        { error: 'server_error', message: 'Failed to delete account. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: { deleted: true }, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/user error:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
