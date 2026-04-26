'use server';

import { signIn, signOut } from '@/auth';

/**
 * Initiates Google OAuth sign-in flow.
 * Redirects to dashboard on success.
 */
export async function signInWithGoogle(): Promise<void> {
  await signIn('google', { redirectTo: '/dashboard' });
}

/**
 * Sends a Resend magic link email for passwordless sign-in.
 * @param email - The user's email address
 */
export async function signInWithEmail(email: string): Promise<void> {
  await signIn('resend', { email, redirectTo: '/dashboard' });
}

/**
 * Signs out the current user and redirects to the landing page.
 */
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/' });
}
