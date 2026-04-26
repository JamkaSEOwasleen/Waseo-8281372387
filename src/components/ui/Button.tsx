'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactElement } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Show loading spinner and disable button */
  isLoading?: boolean;
  /** Full width on mobile */
  fullWidth?: boolean;
}

// ─── Variant Styles ──────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<string, string> = {
  primary:
    'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark focus-visible:ring-primary',
  secondary:
    'border border-surface-border bg-surface-card text-text-primary hover:bg-white/5 focus-visible:ring-primary',
  ghost:
    'text-text-muted hover:bg-primary/10 hover:text-text-primary focus-visible:ring-primary',
  danger:
    'bg-error/10 text-error border border-error/20 hover:bg-error/20 focus-visible:ring-error',
};

const SIZE_STYLES: Record<string, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-11 lg:h-10 px-4 text-sm gap-2',
  lg: 'h-12 lg:h-11 px-6 text-sm gap-2',
};

// ─── Component ───────────────────────────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      type = 'button',
      ...rest
    }: ButtonProps,
    ref
  ): ReactElement => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card',
          'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          fullWidth && 'w-full',
          className
        )}
        {...rest}
      >
        {isLoading && (
          <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin shrink-0" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
