// ─── Google Analytics 4 Custom Event Tracking ──────────────────────────────
//
// These functions fire custom GA4 events for tracking user actions.
// All functions safely check for window.gtag before calling.
//
// Usage:
//   import { trackBriefGenerated } from '@/lib/analytics';
//   trackBriefGenerated('keyword', 'informational', 'AE');

// ─── Type Declarations ─────────────────────────────────────────────────────

interface GtagEvent {
  (command: 'event', action: string, params?: Record<string, string>): void;
}

interface GtagGlobal {
  gtag: GtagEvent;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Safely calls gtag if it exists in the global scope.
 * Prevents errors when GA4 script hasn't loaded or is blocked.
 */
function safeGtag(
  action: string,
  params?: Record<string, string>
): void {
  if (typeof window !== 'undefined' && typeof (window as unknown as GtagGlobal).gtag === 'function') {
    (window as unknown as GtagGlobal).gtag('event', action, params);
  }
}

// ─── Tracking Functions ────────────────────────────────────────────────────

/**
 * Fires when a content brief is successfully generated.
 * @param keyword - The keyword used for generation
 * @param intent - Search intent type (how-to, informational, etc.)
 * @param location - Target country code (AE, SA, etc.)
 */
export function trackBriefGenerated(
  keyword: string,
  intent: string,
  location: string
): void {
  safeGtag('brief_generated', {
    keyword,
    intent,
    location,
  });
}

/**
 * Fires when a user adds a new website.
 */
export function trackWebsiteCreated(): void {
  safeGtag('website_created');
}

/**
 * Fires when a user upgrades their subscription plan.
 * @param fromPlan - Previous plan type ('starter', 'pro', etc.)
 * @param toPlan - New plan type ('pro', 'agency', etc.)
 */
export function trackPlanUpgraded(
  fromPlan: string,
  toPlan: string
): void {
  safeGtag('plan_upgraded', {
    from_plan: fromPlan,
    to_plan: toPlan,
  });
}

/**
 * Fires when a user exports a brief as PDF.
 */
export function trackExportPDF(): void {
  safeGtag('export_pdf');
}

/**
 * Fires when a user copies the JSON-LD schema to clipboard.
 */
export function trackSchemaCopied(): void {
  safeGtag('schema_copied');
}
