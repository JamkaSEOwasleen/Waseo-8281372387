import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { isTrialExpired } from '@/lib/utils';
import type { SessionUser, User } from '@/types';

/**
 * Retrieves the current authenticated session from Auth.js.
 * Returns the session user data or null if not authenticated.
 */
export async function getSession(): Promise<SessionUser | null> {
  const session = await auth();

  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    plan: session.user.plan ?? 'none',
    trialEndsAt: session.user.trialEndsAt ?? null,
    accountFlagged: session.user.accountFlagged ?? false,
    paymentFailedAt: session.user.paymentFailedAt ?? null,
    subscriptionCancelledAt: session.user.subscriptionCancelledAt ?? null,
  };
}

/**
 * Requires an authenticated session. Redirects to /login if not authenticated.
 * @returns The authenticated session user
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}

/**
 * Fetches the full user row from the Supabase users table.
 * Uses admin client to bypass RLS for server-side operations.
 * @param userId - The user's UUID
 * @returns The full User record or null if not found
 */
export async function getUserFromDb(userId: string): Promise<User | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
}

export interface AccountAccessResult {
  allowed: boolean;
  reason: string;
  redirectTo?: string;
}

/**
 * Checks a user's account access based on plan, trial, and flag status.
 * Returns whether access is allowed and a reason if denied.
 *
 * Check order:
 * 1. account_flagged → blocked
 * 2. plan = 'none' → blocked (no subscription)
 * 3. plan = 'starter' AND trial expired → blocked
 * 4. All good → allowed
 */
export function checkAccountAccess(user: User): AccountAccessResult {
  // 1. Account flagged
  if (user.account_flagged) {
    return {
      allowed: false,
      reason: 'flagged',
      redirectTo: '/contact',
    };
  }

  // 2. No active plan
  if (user.plan === 'none') {
    return {
      allowed: false,
      reason: 'no_plan',
      redirectTo: '/pricing',
    };
  }

  // 3. Starter trial expired
  if (user.plan === 'starter' && isTrialExpired(user.trial_ends_at)) {
    return {
      allowed: false,
      reason: 'trial_expired',
      redirectTo: '/pricing',
    };
  }

  // 4. All checks passed
  return {
    allowed: true,
    reason: '',
  };
}
