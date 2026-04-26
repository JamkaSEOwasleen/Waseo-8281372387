import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ─── Card ────────────────────────────────────────────────────────────────────

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: 'default' | 'hover' | 'active';
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const CARD_VARIANTS: Record<string, string> = {
  default: 'bg-surface-card border border-surface-border',
  hover:
    'bg-surface-card border border-surface-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200',
  active:
    'bg-primary/5 border border-primary/30 ring-1 ring-primary/20',
};

const CARD_PADDING: Record<string, string> = {
  sm: 'p-3',
  md: 'p-4 lg:p-6',
  lg: 'p-6 lg:p-8',
};

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...rest
}: CardProps): ReactElement {
  return (
    <div
      className={cn(
        'rounded-xl',
        CARD_VARIANTS[variant],
        CARD_PADDING[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

// ─── CardHeader ──────────────────────────────────────────────────────────────

export interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: CardHeaderProps): ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="space-y-0.5">
        <h3 className="text-base font-semibold text-text-primary lg:text-lg">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-text-muted">{description}</p>
        )}
      </div>
      {action && <div className="mt-2 sm:mt-0">{action}</div>}
    </div>
  );
}
