'use client';

import { useState, useCallback } from 'react';
import WasafSEOLogo from '@/components/logo/WasafSEOLogo';
import { signInWithGoogle, signInWithEmail } from './actions';
import { APP_CONFIG } from '@/lib/constants';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface LoginFormProps {
  /**
   * PSEO referral parameter (format: pseo-{pillar}-{location}).
   * Captured from the ?ref= search param in the URL.
   */
  refParam?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LoginForm({ refParam }: LoginFormProps): React.ReactElement {
  const [email, setEmail] = useState<string>('');
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [isEmailLoading, setIsEmailLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = useCallback(async (): Promise<void> => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      await signInWithGoogle(refParam);
    } catch {
      setError('An error occurred during sign in. Please try again.');
      setIsGoogleLoading(false);
    }
  }, [refParam]);

  const handleEmailSignIn = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      if (!email.trim()) return;

      try {
        setIsEmailLoading(true);
        setError(null);
        await signInWithEmail(email.trim(), refParam);
        setEmailSent(true);
      } catch {
        setError('An error occurred sending the login link. Please try again.');
        setIsEmailLoading(false);
      }
    },
    [email, refParam]
  );

  return (
    <div className="w-full rounded-2xl border border-surface-border bg-surface-card p-8">
      {/* Logo & Headline */}
      <div className="mb-6 text-center">
        <div className="mb-4 flex justify-center">
          <WasafSEOLogo size={48} />
        </div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {APP_CONFIG.name}
        </h1>
        <p className="mt-2 text-sm text-text-accent">
          AI-Powered Arabic Content Generator
        </p>
        <p className="text-xs text-text-muted">Arabic pages. Ranked.</p>
      </div>

      {/* Trial Badge */}
      <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-success/10 px-4 py-2">
        <span className="text-sm text-success">✓</span>
        <span className="text-xs font-medium text-success">
          3-day free trial with Starter plan
        </span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 rounded-lg bg-error/10 px-4 py-3 text-center text-sm text-error">
          {error}
        </div>
      )}

      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-surface-border bg-white px-4 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
      >
        {isGoogleLoading ? (
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-surface-border" />
        <span className="text-xs text-text-muted">or</span>
        <div className="h-px flex-1 bg-surface-border" />
      </div>

      {/* Magic Link Form */}
      {emailSent ? (
        <div className="rounded-lg bg-success/10 px-4 py-6 text-center">
          <p className="text-sm font-medium text-success">✓ Sent!</p>
          <p className="mt-1 text-xs text-text-muted">
            Check your email for the login link
          </p>
        </div>
      ) : (
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-xs font-medium text-text-muted"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e): void => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="h-11 w-full rounded-xl border border-surface-border bg-surface px-4 text-base text-text-primary placeholder-text-muted/50 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:h-10 lg:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isEmailLoading || !email.trim()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white transition-all hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
          >
            {isEmailLoading ? (
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : null}
            <span>Send Login Link</span>
          </button>
        </form>
      )}
    </div>
  );
}
