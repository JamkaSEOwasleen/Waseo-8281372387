import { lemonSqueezySetup, createCheckout, getCustomer } from '@lemonsqueezy/lemonsqueezy.js';
import type { PlanType } from '@/types';

// ─── SDK Initialization ───────────────────────────────────────────────────────

/**
 * Initializes the Lemon Squeezy JS SDK with the API key.
 * Must be called before any SDK functions.
 */
function ensureSetup(): void {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error('LEMON_SQUEEZY_API_KEY is not configured');
  }
  lemonSqueezySetup({ apiKey });
}

// ─── Variant ID Helpers ───────────────────────────────────────────────────────

/**
 * Returns the Lemon Squeezy variant ID for the given plan name.
 */
function getVariantId(plan: PlanType): string {
  switch (plan) {
    case 'starter':
      return process.env.LEMON_SQUEEZY_STARTER_VARIANT_ID ?? '';
    case 'pro':
      return process.env.LEMON_SQUEEZY_PRO_VARIANT_ID ?? '';
    case 'agency':
      return process.env.LEMON_SQUEEZY_AGENCY_VARIANT_ID ?? '';
    default:
      throw new Error(`Unknown plan: ${plan}`);
  }
}

/**
 * Maps a Lemon Squeezy variant ID to the corresponding plan name.
 * Returns null if the variant ID does not match any configured plan.
 */
export function getPlanFromVariantId(variantId: string): PlanType | null {
  const starterId = process.env.LEMON_SQUEEZY_STARTER_VARIANT_ID;
  const proId = process.env.LEMON_SQUEEZY_PRO_VARIANT_ID;
  const agencyId = process.env.LEMON_SQUEEZY_AGENCY_VARIANT_ID;

  if (variantId === starterId) return 'starter';
  if (variantId === proId) return 'pro';
  if (variantId === agencyId) return 'agency';
  return null;
}

// ─── Create Checkout URL ──────────────────────────────────────────────────────

/**
 * Creates a Lemon Squeezy hosted checkout URL for the given plan.
 *
 * @param userId   - The authenticated user's UUID (stored as custom_data)
 * @param email    - The user's email for pre-filling the checkout form
 * @param plan     - The plan to subscribe to (starter, pro, or agency)
 * @returns        - The hosted checkout page URL
 */
export async function createCheckoutUrl(
  userId: string,
  email: string,
  plan: Extract<PlanType, 'starter' | 'pro' | 'agency'>
): Promise<string> {
  ensureSetup();

  const variantId = getVariantId(plan);
  if (!variantId) {
    throw new Error(`No variant ID configured for plan: ${plan}`);
  }

  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
  if (!storeId) {
    throw new Error('LEMON_SQUEEZY_STORE_ID is not configured');
  }

  const { error, data } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email,
      custom: {
        user_id: userId,
      },
    },
  });

  if (error) {
    throw new Error(
      `Lemon Squeezy createCheckout error: ${error.message ?? JSON.stringify(error)}`
    );
  }

  const url = data?.data?.attributes?.url;
  if (!url) {
    throw new Error('Lemon Squeezy did not return a checkout URL');
  }

  return url;
}

// ─── Get Customer Portal URL ──────────────────────────────────────────────────

/**
 * Retrieves the Lemon Squeezy customer portal URL for managing subscriptions.
 *
 * @param lemonCustomerId - The Lemon Squeezy customer ID (stored in users.lemon_customer_id)
 * @returns              - The customer portal URL
 */
export async function getCustomerPortalUrl(lemonCustomerId: string): Promise<string> {
  ensureSetup();

  const { error, data } = await getCustomer(lemonCustomerId);

  if (error) {
    throw new Error(
      `Lemon Squeezy getCustomer error: ${error.message ?? JSON.stringify(error)}`
    );
  }

  const portalUrl = data?.data?.attributes?.urls?.customer_portal;
  if (!portalUrl) {
    throw new Error('Lemon Squeezy did not return a customer portal URL');
  }

  return portalUrl;
}
