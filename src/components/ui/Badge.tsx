import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface BadgeProps {
  /** Visual variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** Size */
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

// ─── Variant Styles ──────────────────────────────────────────────────────────

const BADGE_VARIANTS: Record<string, string> = {
  default: 'bg-white/5 text-text-muted',
  primary: 'bg-primary/10 text-primary-light',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
};

const BADGE_SIZES: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
}: BadgeProps): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium leading-none',
        BADGE_VARIANTS[variant],
        BADGE_SIZES[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── Plan Badge ──────────────────────────────────────────────────────────────

const PLAN_BADGE_MAP: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  trial: { label: 'Trial', variant: 'warning' },
  starter: { label: 'Starter', variant: 'primary' },
  pro: { label: 'Pro', variant: 'success' },
  agency: { label: 'Agency', variant: 'info' },
};

export interface PlanBadgeProps {
  plan: string;
  isTrial?: boolean;
  className?: string;
}

export function PlanBadge({
  plan,
  isTrial = false,
  className,
}: PlanBadgeProps): ReactElement {
  const key = isTrial ? 'trial' : plan;
  const config = PLAN_BADGE_MAP[key] ?? { label: plan, variant: 'default' as const };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

// ─── Intent Badge ────────────────────────────────────────────────────────────

const INTENT_BADGE_MAP: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  'how-to': { label: 'How-To', variant: 'info' },
  informational: { label: 'Info', variant: 'primary' },
  commercial: { label: 'Commercial', variant: 'success' },
  comparison: { label: 'Comparison', variant: 'warning' },
  navigational: { label: 'Navigational', variant: 'default' },
};

export interface IntentBadgeProps {
  intent: string;
  className?: string;
}

export function IntentBadge({
  intent,
  className,
}: IntentBadgeProps): ReactElement {
  const config = INTENT_BADGE_MAP[intent] ?? { label: intent, variant: 'default' as const };

  return (
    <Badge variant={config.variant} size="sm" className={className}>
      {config.label}
    </Badge>
  );
}

// ─── Niche Badge ─────────────────────────────────────────────────────────────

const NICHE_BADGE_MAP: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  blog: { label: 'Blog', variant: 'primary' },
  ecommerce: { label: 'E-Commerce', variant: 'success' },
  saas: { label: 'SaaS', variant: 'info' },
  news: { label: 'News', variant: 'warning' },
  portfolio: { label: 'Portfolio', variant: 'default' },
};

export interface NicheBadgeProps {
  niche: string;
  className?: string;
}

export function NicheBadge({
  niche,
  className,
}: NicheBadgeProps): ReactElement {
  const config = NICHE_BADGE_MAP[niche] ?? { label: niche, variant: 'default' as const };

  return (
    <Badge variant={config.variant} size="sm" className={className}>
      {config.label}
    </Badge>
  );
}
