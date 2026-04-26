import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { PlanType, UsageState } from '@/types';

/**
 * Merges Tailwind CSS classes with proper conflict resolution.
 * Combines clsx (conditional class logic) with tailwind-merge (conflict resolution).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string using Arabic (UAE) locale.
 * @param date - ISO date string
 * @returns Formatted date string in Arabic, e.g. "٢٥ أبريل ٢٠٢٦"
 */
export function formatDateAr(date: string): string {
  return new Intl.DateTimeFormat('ar-AE', { dateStyle: 'medium' }).format(new Date(date));
}

/**
 * Formats a date string using English (UAE) locale.
 * @param date - ISO date string
 * @returns Formatted date string in English, e.g. "Apr 25, 2026"
 */
export function formatDateEn(date: string): string {
  return new Intl.DateTimeFormat('en-AE', { dateStyle: 'medium' }).format(new Date(date));
}

/**
 * Returns the current month as "YYYY-MM" string.
 * Used for usage tracking and monthly limit checks.
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Checks if a trial period is still active.
 * @param trialEndsAt - ISO date string of trial end date, or null
 * @returns true if trial_ends_at is a future date
 */
export function isTrialActive(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt) > new Date();
}

/**
 * Checks if a trial period has expired.
 * @param trialEndsAt - ISO date string of trial end date, or null
 * @returns true if trial_ends_at is in the past or null
 */
export function isTrialExpired(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return true;
  return new Date(trialEndsAt) <= new Date();
}

/**
 * Returns the number of days remaining in a trial period.
 * @param trialEndsAt - ISO date string of trial end date, or null
 * @returns Days remaining (0 if expired or null)
 */
export function getTrialDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  const now = new Date();
  const end = new Date(trialEndsAt);
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Returns the monthly brief limit for a given plan and trial status.
 * @param plan - The user's plan type
 * @param isInTrial - Whether the user is in trial period
 * @returns Brief limit count (Infinity for agency)
 */
export function getPlanLimit(plan: PlanType, isInTrial: boolean): number {
  if (plan === 'agency') return Infinity;
  if (plan === 'pro') return 150;
  if (plan === 'starter' && isInTrial) return 3;
  if (plan === 'starter' && !isInTrial) return 30;
  return 0;
}

/**
 * Returns the website limit for a given plan.
 * @param plan - The user's plan type
 * @returns Website limit count (Infinity for agency)
 */
export function getWebsiteLimit(plan: PlanType): number {
  if (plan === 'agency') return Infinity;
  if (plan === 'pro') return 3;
  if (plan === 'starter') return 1;
  return 0;
}

/**
 * Checks if a user's plan meets the required plan level.
 * Order: none < starter < pro < agency
 * @param plan - The user's current plan
 * @param requiredPlan - The minimum plan required
 * @returns true if user's plan is at least the required level
 */
export function canAccessFeature(plan: PlanType, requiredPlan: PlanType): boolean {
  const hierarchy: Record<PlanType, number> = {
    none: 0,
    starter: 1,
    pro: 2,
    agency: 3,
  };

  return hierarchy[plan] >= hierarchy[requiredPlan];
}

/**
 * Converts text to a URL-safe slug.
 * Lowercases, replaces spaces with hyphens, removes special characters.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Truncates a string to the specified length, appending ellipsis if truncated.
 * @param str - The string to truncate
 * @param length - Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

/**
 * Extracts up to 2 initials from a name string.
 * Returns "U" as fallback if name is null.
 * @param name - The full name or null
 * @returns Initials (1-2 characters)
 */
export function getInitials(name: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Computes a complete usage state object from raw usage data, plan, and trial info.
 * @param briefsGenerated - Number of briefs generated this month
 * @param plan - The user's plan type
 * @param trialEndsAt - ISO date string of trial end date, or null
 * @returns Complete usage state with computed flags
 */
export function computeUsageState(
  briefsGenerated: number,
  plan: PlanType,
  trialEndsAt: string | null
): UsageState {
  const isInTrial = plan === 'starter' && isTrialActive(trialEndsAt);
  const limit = getPlanLimit(plan, isInTrial);
  const isUnlimited = limit === Infinity;
  const current = isUnlimited ? 0 : briefsGenerated;
  const percentUsed = isUnlimited ? 0 : Math.round((current / limit) * 100);
  const trialDaysRemaining = isInTrial ? getTrialDaysRemaining(trialEndsAt) : null;

  return {
    current,
    limit,
    isUnlimited,
    percentUsed,
    isNearLimit: percentUsed >= 80,
    isAtLimit: current >= limit,
    isInTrial,
    trialDaysRemaining,
  };
}
