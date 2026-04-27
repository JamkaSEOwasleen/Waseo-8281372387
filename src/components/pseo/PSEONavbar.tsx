'use client';

import { useState, type ReactElement } from 'react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Menu } from 'lucide-react';
import WasafSEOLogo from '@/components/logo/WasafSEOLogo';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PSEONavbarProps {
  pillar: string;
}

// ─── Nav Links ────────────────────────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Sign In', href: '/login' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function PSEONavbar({ pillar }: PSEONavbarProps): ReactElement {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 h-16',
        'border-b border-surface-border bg-surface/80 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* ── Logo ──────────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="WasafSEO"
        >
          <WasafSEOLogo size={32} className="shrink-0" />
          <span className="font-display text-lg font-bold text-text-primary">
            WasafSEO
          </span>
        </Link>

        {/* ── Desktop Nav ───────────────────────────────────────── */}
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary focus:text-text-primary focus:outline-none"
            >
              {label}
            </Link>
          ))}

          <Link
            href={`/login?ref=pseo-${pillar}`}
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-medium',
              'bg-primary text-white shadow-lg shadow-primary/20',
              'transition-all hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'active:scale-[0.98]',
            )}
          >
            Start Free
          </Link>
        </nav>

        {/* ── Mobile Hamburger ──────────────────────────────────── */}
        <button
          type="button"
          className="flex items-center justify-center p-3 text-text-muted hover:text-text-primary lg:hidden"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* ── Mobile Slide-out Dialog ─────────────────────────────── */}
      <Dialog.Root open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 transition-opacity duration-200" />
          <Dialog.Content
            className={cn(
              'fixed inset-y-0 right-0 z-50 w-[280px]',
              'bg-surface-card p-6 shadow-xl',
              'transition-transform duration-200',
            )}
          >
            {/* Close button */}
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-text-primary">
                WasafSEO
              </span>
              <button
                type="button"
                className="flex items-center justify-center p-3 text-text-muted hover:text-text-primary"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile nav links */}
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-base font-medium text-text-muted transition-colors hover:bg-primary/10 hover:text-text-primary"
                >
                  {label}
                </Link>
              ))}

              <div className="mt-4 border-t border-surface-border pt-4">
                <Link
                  href={`/login?ref=pseo-${pillar}`}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex h-12 w-full items-center justify-center rounded-xl text-sm font-medium',
                    'bg-primary text-white shadow-lg shadow-primary/20',
                    'transition-all hover:bg-primary-dark',
                    'active:scale-[0.98]',
                  )}
                >
                  Start Free
                </Link>
              </div>
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
