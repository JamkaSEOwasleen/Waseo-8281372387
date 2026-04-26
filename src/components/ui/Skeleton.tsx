import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface SkeletonProps {
  /** CSS classes for width, height, border-radius */
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Skeleton({ className }: SkeletonProps): ReactElement {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-white/5',
        className
      )}
      aria-hidden="true"
    />
  );
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────

export interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps): ReactElement {
  return (
    <div
      className={cn(
        'rounded-xl border border-surface-border bg-surface-card p-4 lg:p-6',
        className
      )}
    >
      <Skeleton className="mb-3 h-4 w-3/4" />
      <Skeleton className="mb-2 h-3 w-full" />
      <Skeleton className="mb-2 h-3 w-5/6" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// ─── Skeleton Table Row ──────────────────────────────────────────────────────

export function SkeletonTableRow(): ReactElement {
  return (
    <div className="flex items-center gap-4 border-b border-surface-border py-3">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/5" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-4 w-1/6" />
      <Skeleton className="ml-auto h-8 w-20 rounded-lg" />
    </div>
  );
}
