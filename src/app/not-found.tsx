import type { ReactElement } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import WasafSEOLogo from '@/components/logo/WasafSEOLogo';

// ─── 404 Page ────────────────────────────────────────────────────────────────

export default function NotFoundPage(): ReactElement {
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

      {/* 404 Graphic */}
      <h1 className="select-none text-[120px] font-black leading-none text-primary/20 lg:text-[200px]">
        404
      </h1>

      {/* Content */}
      <div className="-mt-6 text-center lg:-mt-10">
        <h2 className="text-2xl font-bold text-text-primary lg:text-4xl">
          Page not found
        </h2>
        <p className="mt-3 text-sm text-text-muted lg:text-base">
          The page you're looking for doesn't exist.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard"
          className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-95 lg:h-10"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <Link
          href="/"
          className="flex h-11 items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-6 text-sm font-medium text-text-primary transition-all hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-95 lg:h-10"
        >
          <Home size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
