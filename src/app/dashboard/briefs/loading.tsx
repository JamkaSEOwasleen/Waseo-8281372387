import type { ReactElement } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── Briefs Page Loading Skeleton ────────────────────────────────────────────
// Matches the layout of src/app/dashboard/briefs/page.tsx with a grid of 6 cards

export default function BriefsLoading(): ReactElement {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div>
        <Skeleton className="mb-2 h-8 w-1/3 lg:h-10" />
        <Skeleton className="h-5 w-2/5" />
      </div>

      {/* ── Filters Row ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-11 w-full rounded-xl sm:w-64 lg:h-10" />
        <Skeleton className="h-11 w-32 rounded-xl lg:h-10" />
        <div className="flex-1" />
        <Skeleton className="h-11 w-24 rounded-xl lg:h-10" />
      </div>

      {/* ── Brief Cards Grid (6 cards) ──────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className="rounded-xl border border-surface-border bg-surface-card p-4 lg:p-6"
          >
            {/* Card header */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="mb-1.5 h-5 w-4/5" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
            </div>

            {/* Card metadata */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            {/* Card footer */}
            <div className="mt-4 flex items-center justify-between border-t border-surface-border pt-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Pagination Skeleton ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}
