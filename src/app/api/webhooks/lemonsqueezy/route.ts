import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlanFromVariantId } from '@/lib/lemonsqueezy';
import {
  sendWelcomeEmail,
  sendPaymentFailedEmail,
} from '@/lib/emails';
import type { PlanType } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: Record<string, unknown>;
  };
}

interface SubscriptionAttributes {
  customer_id?: number;
  variant_id?: number;
  variant_name?: string;
  status?: string;
  trial_ends_at?: string | null;
  product_name?: string;
  urls?: {
    customer_portal?: string;
    update_payment_method?: string;
  };
}

interface OrderAttributes {
  customer_id?: number;
  user_name?: string;
  email?: string;
  first_subscription_item?: {
    id?: number;
    subscription_id?: number;
  };
  status?: string;
}

// ─── Signature Verification ───────────────────────────────────────────────────

/**
 * Verifies the Lemon Squeezy webhook signature using HMAC SHA256.
 * The X-Signature header contains the HMAC of the raw request body.
 */
function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;

  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('LEMON_SQUEEZY_WEBHOOK_SECRET is not configured');
    return false;
  }

  // crypto is available in Edge/Node runtime
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const message = encoder.encode(rawBody);

  // Use Web Crypto API — available in Edge and Node 18+
  // Compute HMAC SHA256 synchronously for the webhook path
  const hmac = createHmacSha256(key, message);

  // Constant-time comparison to prevent timing attacks
  return constantTimeEqual(hexToBytes(signature), hmac);
}

/**
 * Creates an HMAC SHA256 hash using Node.js crypto module.
 * Returns the digest as a Uint8Array.
 */
function createHmacSha256(key: Uint8Array, message: Uint8Array): Uint8Array {
  return createHmac('sha256', Buffer.from(key))
    .update(Buffer.from(message))
    .digest() as unknown as Uint8Array;
}

/**
 * Converts a hex string to a Uint8Array.
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Constant-time comparison of two Uint8Arrays to prevent timing attacks.
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Finds a user by their user_id UUID (from custom_data) or by lemon_customer_id.
 * Returns the user row or null.
 */
async function findUser(
  userId?: string,
  customerId?: number
): Promise<Record<string, unknown> | null> {
  const supabase = createAdminClient();

  // First try by user_id (from custom_data)
  if (userId) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) return data;
  }

  // Fallback: find by lemon_customer_id
  if (customerId) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('lemon_customer_id', String(customerId))
      .single();
    if (data) return data;
  }

  return null;
}

/**
 * Adds 3 days to the current date for starter trial calculation.
 */
function getTrialEndDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString();
}

/**
 * Updates the users table with the given fields.
 * Uses the admin client to bypass RLS.
 */
async function updateUser(
  userId: string,
  updates: Record<string, unknown>
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error(`Failed to update user ${userId}:`, error.message);
  }
}

// ─── Event Handlers ───────────────────────────────────────────────────────────

async function handleSubscriptionCreated(payload: WebhookPayload): Promise<void> {
  const attrs = payload.data.attributes as SubscriptionAttributes;
  const variantId = String(attrs.variant_id ?? '');
  const plan = getPlanFromVariantId(variantId);
  const userId = payload.meta.custom_data?.user_id;
  const customerId = attrs.customer_id;
  const subscriptionId = payload.data.id;

  if (!plan || !userId) {
    console.warn('handleSubscriptionCreated: missing plan or userId', { variantId, userId, plan });
    return;
  }

  const updates: Record<string, unknown> = {
    plan,
    lemon_customer_id: String(customerId ?? ''),
    lemon_subscription_id: subscriptionId,
    subscription_cancelled_at: null,
    subscription_paused_at: null,
    payment_failed_at: null,
  };

  // Starter plan gets a 3-day trial
  if (plan === 'starter') {
    updates.trial_ends_at = getTrialEndDate();
  } else {
    // Pro/Agency: no trial
    updates.trial_ends_at = null;
  }

  await updateUser(userId, updates);
}

async function handleSubscriptionUpdated(payload: WebhookPayload): Promise<void> {
  const attrs = payload.data.attributes as SubscriptionAttributes;
  const variantId = String(attrs.variant_id ?? '');
  const plan = getPlanFromVariantId(variantId);
  const userId = payload.meta.custom_data?.user_id;
  const customerId = attrs.customer_id;

  if (!plan) return;

  const user = await findUser(userId, customerId);
  if (!user?.id) return;

  await updateUser(String(user.id), { plan });
}

async function handleSubscriptionCancelled(payload: WebhookPayload): Promise<void> {
  const userId = payload.meta.custom_data?.user_id;
  const attrs = payload.data.attributes as SubscriptionAttributes;
  const customerId = attrs.customer_id;

  const user = await findUser(userId, customerId);
  if (!user?.id) return;

  // Do NOT change plan — only mark cancelled_at
  await updateUser(String(user.id), {
    subscription_cancelled_at: new Date().toISOString(),
  });
}

async function handleSubscriptionResumed(payload: WebhookPayload): Promise<void> {
  const userId = payload.meta.custom_data?.user_id;
  const attrs = payload.data.attributes as SubscriptionAttributes;
  const customerId = attrs.customer_id;

  const user = await findUser(userId, customerId);
  if (!user?.id) return;

  await updateUser(String(user.id), {
    subscription_cancelled_at: null,
  });
}

async function handleSubscriptionExpired(payload: WebhookPayload): Promise<void> {
  const userId = payload.meta.custom_data?.user_id;
  const attrs = payload.data.attributes as SubscriptionAttributes;
  const customerId = attrs.customer_id;

  const user = await findUser(userId, customerId);
  if (!user?.id) return;

  await updateUser(String(user.id), {
    plan: 'none',
    trial_ends_at: null,
  });
}

async function handleSubscriptionPaused(payload: WebhookPayload): Promise<void> {
  const userId = payload.meta.custom_data?.user_id;
  const attrs = payload.data.attributes as SubscriptionAttributes;
  const customerId = attrs.customer_id;

  const user = await findUser(userId, customerId);
  if (!user?.id) return;

  await updateUser(String(user.id), {
    plan: 'none',
    subscription_paused_at: new Date().toISOString(),
  });
}

async function handleSubscriptionUnpaused(payload: WebhookPayload): Promise<void> {
  const attrs = payload.data.attributes as SubscriptionAttributes;
  const variantId = String(attrs.variant_id ?? '');
  const plan = getPlanFromVariantId(variantId);
  const userId = payload.meta.custom_data?.user_id;
  const customerId = attrs.customer_id;

  const user = await findUser(userId, customerId);
  if (!user?.id || !plan) return;

  await updateUser(String(user.id), {
    plan,
    subscription_paused_at: null,
  });
}

async function handleSubscriptionPaymentFailed(payload: WebhookPayload): Promise<void> {
  const userId = payload.meta.custom_data?.user_id;
  const attrs = payload.data.attributes as SubscriptionAttributes;
  const customerId = attrs.customer_id;

  const user = await findUser(userId, customerId);
  if (!user?.id) return;

  await updateUser(String(user.id), {
    payment_failed_at: new Date().toISOString(),
  });

  // Send payment failed email (fire-and-forget, do not await)
  const email = String(user.email ?? '');
  const name = String(user.name ?? '');
  if (email) {
    sendPaymentFailedEmail(email, name);
  }
}

async function handleSubscriptionPaymentSuccess(payload: WebhookPayload): Promise<void> {
  const userId = payload.meta.custom_data?.user_id;
  const attrs = payload.data.attributes as SubscriptionAttributes;
  const customerId = attrs.customer_id;

  const user = await findUser(userId, customerId);
  if (!user?.id) return;

  await updateUser(String(user.id), {
    payment_failed_at: null,
  });
}

async function handleSubscriptionPaymentRecovered(payload: WebhookPayload): Promise<void> {
  const userId = payload.meta.custom_data?.user_id;
  const attrs = payload.data.attributes as SubscriptionAttributes;
  const customerId = attrs.customer_id;

  const user = await findUser(userId, customerId);
  if (!user?.id) return;

  await updateUser(String(user.id), {
    payment_failed_at: null,
  });
}

async function handleSubscriptionPlanChanged(payload: WebhookPayload): Promise<void> {
  const attrs = payload.data.attributes as SubscriptionAttributes;
  const variantId = String(attrs.variant_id ?? '');
  const plan = getPlanFromVariantId(variantId);
  const userId = payload.meta.custom_data?.user_id;
  const customerId = attrs.customer_id;

  const user = await findUser(userId, customerId);
  if (!user?.id || !plan) return;

  await updateUser(String(user.id), {
    plan,
    trial_ends_at: null,
  });
}

async function handleOrderCreated(payload: WebhookPayload): Promise<void> {
  const attrs = payload.data.attributes as OrderAttributes;
  const userId = payload.meta.custom_data?.user_id;
  const customerId = attrs.customer_id;

  const user = await findUser(userId, customerId);
  if (!user?.id) return;

  // Send welcome email (fire-and-forget, do not await)
  const email = String(user.email ?? '');
  const name = String(user.name ?? '');
  if (email) {
    sendWelcomeEmail(email, name);
  }
}

async function handleOrderRefunded(payload: WebhookPayload): Promise<void> {
  const userId = payload.meta.custom_data?.user_id;
  const attrs = payload.data.attributes as OrderAttributes;
  const customerId = attrs.customer_id;

  const user = await findUser(userId, customerId);
  if (!user?.id) return;

  await updateUser(String(user.id), {
    plan: 'none',
  });
}

async function handleSubscriptionPaymentRefunded(_payload: WebhookPayload): Promise<void> {
  // Log only — no database action required
  console.log('subscription_payment_refunded event received (no action taken)');
}

async function handleDisputeCreated(payload: WebhookPayload): Promise<void> {
  const userId = payload.meta.custom_data?.user_id;
  const attrs = payload.data.attributes as { customer_id?: number };
  const customerId = attrs.customer_id;

  const user = await findUser(userId, customerId);
  if (!user?.id) return;

  await updateUser(String(user.id), {
    account_flagged: true,
    plan: 'none',
  });
}

async function handleDisputeResolved(payload: WebhookPayload): Promise<void> {
  const userId = payload.meta.custom_data?.user_id;
  const attrs = payload.data.attributes as {
    customer_id?: number;
    status?: string;
  };
  const customerId = attrs.customer_id;

  const user = await findUser(userId, customerId);
  if (!user?.id) return;

  // Clear the account flag
  await updateUser(String(user.id), {
    account_flagged: false,
  });

  // If the merchant won the dispute, we can try to restore the plan
  // The meta data may contain the resolution outcome
  const outcome = (payload.meta as Record<string, unknown>)?.outcome ?? 'lost';

  if (outcome === 'won') {
    // Try to restore plan from subscription — find the active subscription
    // The dispute_created set plan to 'none', so we need to check if
    // the subscription is still active
    const supabase = createAdminClient();
    const { data: subData } = await supabase
      .from('users')
      .select('lemon_subscription_id')
      .eq('id', String(user.id))
      .single();

    if (subData?.lemon_subscription_id) {
      // Fetch subscription from Lemon Squeezy to get current variant
      const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
      if (apiKey) {
        try {
          const response = await fetch(
            `https://api.lemonsqueezy.com/v1/subscriptions/${subData.lemon_subscription_id}`,
            { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } }
          );
          if (response.ok) {
            const subResult = await response.json();
            const variantId = String(subResult?.data?.attributes?.variant_id ?? '');
            const restoredPlan = getPlanFromVariantId(variantId);
            if (restoredPlan) {
              await updateUser(String(user.id), { plan: restoredPlan });
            }
          }
        } catch (err) {
          console.error('Failed to fetch subscription for plan restoration:', err);
        }
      }
    }
  }
  // If lost: plan stays as 'none' — no further action
}

// ─── Event Router ─────────────────────────────────────────────────────────────

const EVENT_HANDLERS: Record<string, (payload: WebhookPayload) => Promise<void>> = {
  subscription_created: handleSubscriptionCreated,
  subscription_updated: handleSubscriptionUpdated,
  subscription_cancelled: handleSubscriptionCancelled,
  subscription_resumed: handleSubscriptionResumed,
  subscription_expired: handleSubscriptionExpired,
  subscription_paused: handleSubscriptionPaused,
  subscription_unpaused: handleSubscriptionUnpaused,
  subscription_payment_failed: handleSubscriptionPaymentFailed,
  subscription_payment_success: handleSubscriptionPaymentSuccess,
  subscription_payment_recovered: handleSubscriptionPaymentRecovered,
  subscription_plan_changed: handleSubscriptionPlanChanged,
  order_created: handleOrderCreated,
  order_refunded: handleOrderRefunded,
  subscription_payment_refunded: handleSubscriptionPaymentRefunded,
  dispute_created: handleDisputeCreated,
  dispute_resolved: handleDisputeResolved,
};

// Events that should be silently acknowledged with 200 (no action)
const IGNORED_EVENTS = new Set([
  'affiliate_activated',
  'customer_updated',
]);

// ─── POST /api/webhooks/lemonsqueezy ──────────────────────────────────────────
// Receives and processes Lemon Squeezy webhook events.
// No authentication — signature verification is used instead.

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // 1. Read raw body for signature verification
    const rawBody = await req.text();

    // 2. Verify X-Signature header
    const signature = req.headers.get('X-Signature');
    if (!verifySignature(rawBody, signature)) {
      console.warn('Invalid webhook signature received');
      return NextResponse.json(
        { error: 'invalid_signature' },
        { status: 400 }
      );
    }

    // 3. Parse the webhook payload
    const payload: WebhookPayload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;

    if (!eventName) {
      console.warn('Webhook missing event_name');
      return NextResponse.json(
        { error: 'missing_event_name' },
        { status: 400 }
      );
    }

    // 4. Check if this is an ignored event
    if (IGNORED_EVENTS.has(eventName)) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 5. Route to the appropriate handler
    const handler = EVENT_HANDLERS[eventName];
    if (handler) {
      // Fire-and-forget — handlers run asynchronously
      // We catch errors so the webhook always returns 200
      handler(payload).catch((err) => {
        console.error(`Webhook handler failed for event "${eventName}":`, err);
      });
    } else {
      console.warn(`Unknown webhook event: "${eventName}"`);
    }

    // 6. Always return 200 for valid events
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json(
      { error: 'webhook_error' },
      { status: 200 } // Still return 200 to prevent Lemon Squeezy retries
    );
  }
}
