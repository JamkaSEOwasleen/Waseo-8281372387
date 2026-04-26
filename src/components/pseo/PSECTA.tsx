'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PSECTAProps {
  pillar: string;
  location: string;
}

// ─── GA4 Event Tracking ───────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function trackCTAClick(pillar: string, location: string): void {
  try {
    const gtagFn = (window as any).gtag;
    if (typeof gtagFn === 'function') {
      gtagFn('event', 'pseo_cta_click', { pillar, location });
    }
  } catch {
    // Silently fail — tracking is non-critical
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── Component ─────────────────────────────────────────────────────────────────

export function PSECTA({ pillar, location }: PSECTAProps): ReactElement {
  return (
    <section className="border-b border-surface-border py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl',
            'bg-gradient-to-br from-primary/20 via-primary/10 to-surface-card',
            'border border-primary/20 p-8 lg:p-12',
          )}
        >
          {/* Background glow */}
          <div
            className={cn(
              'pointer-events-none absolute -inset-40',
              'bg-primary/5 blur-3xl',
            )}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="font-display text-2xl font-bold text-text-primary lg:text-3xl">
              ابدأ مع WasafSEO
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-text-muted lg:text-base">
              احصل على موجز محتوى متكامل مع تحسين SEO و JSON-LD وجاهز للنشر.
              جرب أول موجز مجاناً!
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href={`/login?ref=pseo-${pillar}-${location}`}
                onClick={() => trackCTAClick(pillar, location)}
                className={cn(
                  'inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-medium sm:w-auto lg:h-11',
                  'bg-primary text-white shadow-lg shadow-primary/20',
                  'transition-all hover:bg-primary-dark',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  'active:scale-[0.98]',
                )}
              >
                احصل على موجزك المجاني
              </Link>
              <Link
                href="/pricing"
                onClick={() => trackCTAClick(pillar, location)}
                className={cn(
                  'inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-medium sm:w-auto lg:h-11',
                  'border border-surface-border bg-surface-card text-text-primary',
                  'transition-all hover:bg-white/5',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  'active:scale-[0.98]',
                )}
              >
                تعرف أكثر
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
