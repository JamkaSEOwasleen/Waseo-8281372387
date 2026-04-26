'use server';

import { signIn, signOut } from '@/auth';
import { storePSEOReferralCookie } from '@/lib/pseo/referral-cookie';

// ─── Auth Actions ───────────────────────────────────────────────────────────

/**
 * Initiates Google OAuth sign-in flow.
 * Captures PSEO referral if provided.
 * Redirects to dashboard on success.
 */
export async function signInWithGoogle(ref?: string): Promise<void> {
  await storePSEOReferralCookie(ref);
  await signIn('google', { redirectTo: '/dashboard' });
}

/**
 * Sends a Resend magic link email for passwordless sign-in.
 * Captures PSEO referral if provided.
 * @param email - The user's email address
 */
export async function signInWithEmail(email: string, ref?: string): Promise<void> {
  await storePSEOReferralCookie(ref);
  await signIn('resend', { email, redirectTo: '/dashboard' });
}

/**
 * Signs out the current user and redirects to the landing page.
 */
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/' });
}
