'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import WasafSEOLogo from '@/components/logo/WasafSEOLogo';
import UserMenu from '@/components/auth/UserMenu';
import { cn } from '@/lib/utils';
import type { SessionUser } from '@/types';

// ─── Nav Links ────────────────────────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How It Works', href: '/#how-it-works' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar(): React.ReactElement {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const { data: session, status } = useSession();

  // Hide public navbar on dashboard routes — dashboard has its own layout
  if (pathname.startsWith('/dashboard')) {
    return <></>;
  }

  // Intersection observer for scroll detection (sentinel div at top of page)
  useEffect(() => {
    const sentinel = document.getElementById('navbar-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);

    return (): void => {
      observer.disconnect();
    };
  }, []);

  const closeMobile = useCallback((): void => {
    setMobileOpen(false);
  }, []);

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  return (
    <>
      {/* Sentinel div for scroll detection */}
      <div id="navbar-sentinel" className="pointer-events-none absolute left-0 top-0 h-px w-full" />

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 h-16 transition-all duration-300 lg:h-[68px]',
          isScrolled
            ? 'border-b border-surface-border bg-surface-card/95 shadow-lg shadow-black/10 backdrop-blur-md'
            : 'bg-transparent'
        )}
      >
        <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 lg:px-8">
          {/* ── Logo ───────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card"
            aria-label="WasafSEO Home"
          >
            <WasafSEOLogo size={32} className="shrink-0" />
            <span className="hidden font-display text-xl font-bold text-text-primary sm:inline">
              WasafSEO
            </span>
          </Link>

          {/* ── Desktop Nav Links ──────────────────────────────────────── */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-primary/10 hover:text-text-primary focus:bg-primary/10 focus:text-text-primary focus:outline-none"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Right side ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            {/* Desktop auth */}
            <div className="hidden items-center gap-3 lg:flex">
              {isLoading ? (
                <div className="h-10 w-20 animate-pulse rounded-lg bg-white/5" />
              ) : isAuthenticated && session?.user ? (
                <UserMenu user={session.user as SessionUser} />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex h-11 items-center rounded-lg px-4 text-sm font-medium text-text-muted transition-colors hover:bg-primary/10 hover:text-text-primary focus:bg-primary/10 focus:text-text-primary focus:outline-none lg:h-10"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    className="flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card active:scale-95 lg:h-10"
                  >
                    Start Free Trial
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={(): void => setMobileOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-primary/10 focus:bg-primary/10 focus:outline-none lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </nav>
      </header>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16 lg:h-[68px]" />

      {/* ── Mobile Sheet (Radix Dialog) ────────────────────────────────── */}
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          {/* Backdrop */}
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

          {/* Sheet Content — slides from left */}
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-surface-card p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
            {/* Close button */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <WasafSEOLogo size={28} className="shrink-0" />
                <Dialog.Title className="font-display text-lg font-bold text-text-primary">
                  WasafSEO
                </Dialog.Title>
              </div>
              <button
                type="button"
                onClick={closeMobile}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-primary/10 hover:text-text-primary focus:bg-primary/10 focus:outline-none"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile nav links */}
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobile}
                  className="rounded-lg px-4 py-3 text-base font-medium text-text-muted transition-colors hover:bg-primary/10 hover:text-text-primary focus:bg-primary/10 focus:text-text-primary focus:outline-none"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Mobile auth buttons */}
            <div className="mt-auto flex flex-col gap-3 pt-8">
              {isAuthenticated && session?.user ? (
                <div className="rounded-lg border border-surface-border p-4">
                  <p className="text-sm font-medium text-text-primary">
                    {session.user.name ?? 'User'}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{session.user.email}</p>
                  <Link
                    href="/dashboard"
                    onClick={closeMobile}
                    className="mt-3 flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-medium text-white transition-all hover:bg-primary-dark active:scale-95"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/login"
                    onClick={closeMobile}
                    className="mt-2 flex h-11 items-center justify-center rounded-lg text-sm font-medium text-text-muted transition-colors hover:bg-primary/10 hover:text-text-primary"
                  >
                    Sign Out
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobile}
                    className="flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-medium text-white transition-all hover:bg-primary-dark active:scale-95"
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    href="/login"
                    onClick={closeMobile}
                    className="flex h-11 items-center justify-center rounded-lg text-sm font-medium text-text-muted transition-colors hover:bg-primary/10 hover:text-text-primary"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
