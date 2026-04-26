import type { ReactElement } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── Generate Page Loading Skeleton ──────────────────────────────────────────
// Matches the exact layout of src/app/dashboard/generate/page.tsx

export default function GenerateLoading(): ReactElement {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <Skeleton className="mb-2 h-8 w-3/5 lg:h-10" />
        <Skeleton className="h-5 w-4/5" />
      </div>

      {/* ── Form Card Skeleton ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-4 lg:p-6">
        <div className="space-y-6">
          {/* Website selector */}
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-11 w-full rounded-xl lg:h-10" />
          </div>

          {/* Keyword input */}
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-11 w-full rounded-xl lg:h-10" />
            <Skeleton className="h-3 w-3/5" />
          </div>

          {/* Intent selector (cards grid) */}
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-24" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface p-4"
                >
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Location selector */}
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-11 w-full rounded-xl lg:h-10" />
          </div>

          {/* Additional info textarea */}
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>

          {/* Generate button */}
          <Skeleton className="h-12 w-full rounded-xl lg:h-11" />

          {/* Usage counter */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
