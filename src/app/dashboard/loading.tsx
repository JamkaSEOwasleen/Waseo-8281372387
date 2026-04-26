import type { ReactElement } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── Dashboard Loading Skeleton ──────────────────────────────────────────────
// Matches the exact layout of src/app/dashboard/page.tsx

export default function DashboardLoading(): ReactElement {
  return (
    <div className="space-y-8">
      {/* ── Welcome Section ────────────────────────────────────────────── */}
      <div>
        <Skeleton className="mb-2 h-8 w-3/5 lg:h-10" />
        <Skeleton className="h-5 w-2/5" />
      </div>

      {/* ── Stats Row (4 skeleton cards) ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="rounded-xl border border-surface-border bg-surface-card p-4 lg:p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="mb-2 h-3 w-3/4" />
                <Skeleton className="h-7 w-1/2 lg:h-8" />
              </div>
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions (2 skeleton cards) ────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="rounded-xl border border-surface-border bg-surface-card p-4 lg:p-6"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="mb-1.5 h-5 w-2/3" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Onboarding Banner Skeleton ─────────────────────────────────── */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 lg:p-6">
        <div className="flex flex-col items-center py-6 text-center lg:flex-row lg:gap-6 lg:text-left">
          <Skeleton className="mb-4 h-16 w-16 shrink-0 rounded-2xl lg:mb-0" />
          <div className="flex-1">
            <Skeleton className="mb-1.5 h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-5/6" />
          </div>
          <Skeleton className="mt-4 h-11 w-40 rounded-xl lg:mt-0" />
        </div>
      </div>

      {/* ── Recent Briefs Section ──────────────────────────────────────── */}
      <div>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Skeleton className="mb-1 h-6 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>

        {/* Desktop table skeleton (hidden on mobile) */}
        <div className="hidden overflow-hidden rounded-xl border border-surface-border md:block">
          {/* Table header */}
          <div className="flex items-center gap-4 border-b border-surface-border px-4 py-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-14" />
            <div className="ml-auto" />
          </div>
          {/* 5 skeleton rows */}
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b border-surface-border px-4 py-3 last:border-0"
            >
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="ml-auto h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Mobile card list skeleton (hidden on desktop) */}
        <div className="space-y-3 md:hidden">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="rounded-xl border border-surface-border bg-surface-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <Skeleton className="mb-1.5 h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="mr-3 h-6 w-16 shrink-0 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
