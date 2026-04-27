'use client';

import { useState, useCallback, type ReactElement, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { PlanType } from '@/types';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface UpgradeGateProps {
  /** The minimum plan required to access the feature */
  requiredPlan: PlanType;
  /** The user's current plan */
  currentPlan: PlanType;
  /** The feature name shown in the upgrade message */
  feature: string;
  /** Children to render if plan is sufficient */
  children: ReactNode;
}

// ─── Plan Display Names ──────────────────────────────────────────────────────

const PLAN_NAMES: Record<PlanType, string> = {
  none: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  agency: 'Agency',
};

// ─── Plan Hierarchy ──────────────────────────────────────────────────────────

const PLAN_HIERARCHY: Record<PlanType, number> = {
  none: 0,
  starter: 1,
  pro: 2,
  agency: 3,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function UpgradeGate({
  requiredPlan,
  currentPlan,
  feature,
  children,
}: UpgradeGateProps): ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canAccess = PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[requiredPlan];

  const handleUpgrade = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: requiredPlan }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? 'Upgrade failed');
      }

      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  }, [requiredPlan]);

  // If plan is sufficient, render children
  if (canAccess) {
    return <>{children}</>;
  }

  // Otherwise, show upgrade gate
  return (
    <Card variant="default" className="relative">
      {/* Overlay lock */}
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Lock size={24} className="text-primary-light" />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-text-primary">
          Upgrade to {PLAN_NAMES[requiredPlan]}
        </h3>

        <p className="mb-1 text-sm text-text-muted">
          {feature} is available on the {PLAN_NAMES[requiredPlan]} plan and above.
        </p>

        <p className="mb-6 text-xs text-text-muted">
          Your current plan: {PLAN_NAMES[currentPlan]}
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
            {error}
          </p>
        )}

        <Button
          variant="primary"
          size="lg"
          isLoading={isLoading}
          onClick={handleUpgrade}
          fullWidth
        >
          Upgrade to {PLAN_NAMES[requiredPlan]}
        </Button>
      </div>
    </Card>
  );
}
