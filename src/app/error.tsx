'use client';

import type { ReactElement } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, LayoutDashboard, AlertCircle } from 'lucide-react';
import WasafSEOLogo from '@/components/logo/WasafSEOLogo';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// ─── Error Page ──────────────────────────────────────────────────────────────

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps): ReactElement {
  useEffect((): void => {
    // Log the error to an error reporting service in production
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      {/* Logo */}
      <Link
        href="/"
        className="mb-12 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        aria-label="WasafSEO Home"
      >
        <WasafSEOLogo size={48} />
      </Link>

      {/* Error Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-error/10 lg:h-24 lg:w-24">
        <AlertCircle size={40} className="text-error lg:size-[48px]" />
      </div>

      {/* Content */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary lg:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-text-muted lg:text-base">
          An unexpected error occurred. Please try again.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-95 lg:h-10"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="flex h-11 items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-6 text-sm font-medium text-text-primary transition-all hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-95 lg:h-10"
        >
          <LayoutDashboard size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
