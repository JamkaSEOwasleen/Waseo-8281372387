'use client';

import { useState, useCallback, type ReactElement } from 'react';
import { ExternalLink } from 'lucide-react';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ManageBillingPortalProps {
  /** The label to display on the button */
  label?: string;
  /** Button variant */
  variant?: 'primary' | 'outline';
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ManageBillingPortal({
  label = 'Manage Billing',
  variant = 'primary',
}: ManageBillingPortalProps): ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenPortal = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/billing/portal');
      const json = await res.json();

      if (json.data?.url) {
        window.location.href = json.data.url;
      } else {
        setError(json.message || 'Failed to open billing portal');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={handleOpenPortal}
        disabled={isLoading}
        className={`flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 lg:h-10 ${
          variant === 'primary'
            ? 'bg-primary text-white hover:bg-primary/90'
            : 'border border-surface-border bg-surface-card text-text-primary hover:bg-white/5'
        }`}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <ExternalLink size={16} />
        )}
        {isLoading ? 'Loading...' : label}
      </button>

      {error && (
        <p className="mt-2 text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
