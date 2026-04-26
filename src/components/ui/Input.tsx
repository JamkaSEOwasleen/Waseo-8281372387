'use client';

import { forwardRef, type InputHTMLAttributes, type ReactElement } from 'react';
import { cn } from '@/lib/utils';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text shown above the input */
  label?: string;
  /** Error message shown below the input */
  error?: string;
  /** Helper text shown below the input (not shown when error is present) */
  helperText?: string;
  /** Character counter suffix, e.g. "200" to show "0/200" */
  maxLength?: number;
  /** Current character count (must be provided with maxLength) */
  currentLength?: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      maxLength,
      currentLength,
      className,
      id,
      ...rest
    }: InputProps,
    ref
  ): ReactElement => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-text-muted"
          >
            {label}
          </label>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-11 w-full rounded-xl border bg-surface px-4 text-base text-text-primary transition-colors',
            'placeholder:text-text-muted/40',
            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
            'lg:h-10 lg:text-sm',
            error
              ? 'border-error/50 focus:border-error focus:ring-error'
              : 'border-surface-border',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...rest}
        />

        {/* Character counter */}
        {maxLength !== undefined && currentLength !== undefined && !error && (
          <div className="flex justify-end">
            <span
              className={cn(
                'text-xs',
                currentLength > maxLength
                  ? 'text-error'
                  : currentLength > maxLength * 0.9
                  ? 'text-warning'
                  : 'text-text-muted'
              )}
            >
              {currentLength}/{maxLength}
            </span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-error" role="alert">
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-xs text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
