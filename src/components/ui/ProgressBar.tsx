'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { cn } from '@/lib/utils';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ProgressBarProps {
  /** Current value */
  current: number;
  /** Maximum value */
  max: number;
  /** Show label like "3/30" */
  showLabel?: boolean;
  /** Custom label (overrides default X/max) */
  label?: string;
  /** Visual variant based on usage percentage */
  variant?: 'default' | 'warning' | 'danger';
  /** Additional CSS classes */
  className?: string;
  /** Bar height */
  barHeight?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProgressBar({
  current,
  max,
  showLabel = true,
  label,
  variant,
  className,
  barHeight = 'h-2',
}: ProgressBarProps): ReactElement {
  const percent = max === Infinity ? 0 : Math.min(Math.round((current / max) * 100), 100);
  const [animatedWidth, setAnimatedWidth] = useState<number>(0);

  // Determine variant based on percentage if not explicitly set
  const resolvedVariant =
    variant ?? (percent >= 100 ? 'danger' : percent >= 80 ? 'warning' : 'default');

  // Animate progress bar on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(percent);
    }, 100);
    return (): void => clearTimeout(timer);
  }, [percent]);

  const variantStyles: Record<string, string> = {
    default: 'bg-primary',
    warning: 'bg-warning',
    danger: 'bg-error',
  };

  const trackStyles: Record<string, string> = {
    default: 'bg-primary/10',
    warning: 'bg-warning/10',
    danger: 'bg-error/10',
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'text-xs font-medium',
              resolvedVariant === 'danger'
                ? 'text-error'
                : resolvedVariant === 'warning'
                ? 'text-warning'
                : 'text-text-muted'
            )}
          >
            {label ?? (max === Infinity ? `${current} used` : `${current}/${max}`)}
          </span>
          {max !== Infinity && (
            <span className="text-[11px] text-text-muted">{percent}%</span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full',
          trackStyles[resolvedVariant],
          barHeight
        )}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max === Infinity ? 100 : max}
        aria-label={label ?? `${current} of ${max}`}
      >
        {/* Fill */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            variantStyles[resolvedVariant],
            percent === 0 ? 'w-0' : ''
          )}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
    </div>
  );
}
