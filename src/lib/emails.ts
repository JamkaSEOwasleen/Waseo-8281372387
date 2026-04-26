import { Resend } from 'resend';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wasafseo.wasleen.com';
const SUPPORT_EMAIL = 'support@wasleen.com';

/**
 * Returns an initialized Resend client.
 * Throws if RESEND_API_KEY is not configured.
 */
function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

// ─── Email Template Builder ───────────────────────────────────────────────────

/**
 * Wraps content in a dark-themed HTML email template matching the WasafSEO brand.
 */
function buildHtmlEmail(
  title: string,
  bodyHtml: string,
  ctaText?: string,
  ctaUrl?: string
): string {
  return `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#080b14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#080b14;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background-color:#0f1624;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#a78bfa;letter-spacing:-0.5px;">WasafSEO</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#64748b;">Arabic SEO Content Brief Generator</p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background:linear-gradient(to right,transparent,#7c3aed,transparent);"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- CTA Button -->
          ${ctaText && ctaUrl ? `
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="${ctaUrl}" style="display:inline-block;padding:14px 32px;border-radius:12px;background-color:#7c3aed;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
                ${ctaText}
              </a>
            </td>
          </tr>` : ''}
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0 0 8px;font-size:12px;color:#475569;text-align:center;">
                WasafSEO by <a href="https://wasleen.com" style="color:#7c3aed;text-decoration:none;">Wasleen</a>
              </p>
              <p style="margin:0;font-size:12px;color:#475569;text-align:center;">
                Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color:#7c3aed;text-decoration:none;">${SUPPORT_EMAIL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Email Functions ──────────────────────────────────────────────────────────

/**
 * Sends a welcome email after a successful order/subscription.
 * Non-blocking — fire-and-forget (do not await).
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  try {
    const resend = getResend();
    const displayName = name || 'there';

    await resend.emails.send({
      from: 'WasafSEO <noreply@wasleen.com>',
      to: email,
      subject: 'Welcome to WasafSEO 🌙',
      html: buildHtmlEmail(
        'Welcome to WasafSEO',
        `
          <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;">
            Hey ${displayName},
          </p>
          <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;">
            Welcome to <strong style="color:#a78bfa;">WasafSEO</strong> — your AI-powered Arabic SEO content brief generator.
            You're now ready to create ranking-ready content briefs in minutes.
          </p>
          <p style="margin:0 0 12px;font-size:16px;color:#e2e8f0;font-weight:600;">Get started in 3 steps:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;color:#e2e8f0;font-size:14px;line-height:1.5;">
                <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background-color:#7c3aed;color:#fff;text-align:center;line-height:24px;font-size:12px;font-weight:700;margin-right:8px;">1</span>
                Add your website & brand details
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#e2e8f0;font-size:14px;line-height:1.5;">
                <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background-color:#7c3aed;color:#fff;text-align:center;line-height:24px;font-size:12px;font-weight:700;margin-right:8px;">2</span>
                Enter a keyword and choose your intent
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#e2e8f0;font-size:14px;line-height:1.5;">
                <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background-color:#7c3aed;color:#fff;text-align:center;line-height:24px;font-size:12px;font-weight:700;margin-right:8px;">3</span>
                Get your complete Arabic SEO content brief
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:14px;color:#94a3b8;line-height:1.5;">
            Each brief includes page fundamentals, content outline with GEO/AIO citations,
            expert quotes, comparison tables, how-to steps, FAQ schema, and full JSON-LD markup.
          </p>
        `,
        'Go to Dashboard',
        `${APP_URL}/dashboard`
      ),
    });
  } catch (err) {
    // Log but never throw — email failures must not block the caller
    console.error('sendWelcomeEmail failed:', err);
  }
}

/**
 * Sends a warning email when the user's trial is about to expire.
 * Non-blocking — fire-and-forget (do not await).
 */
export async function sendTrialExpiringEmail(
  email: string,
  name: string,
  daysLeft: number
): Promise<void> {
  try {
    const resend = getResend();
    const displayName = name || 'there';

    await resend.emails.send({
      from: 'WasafSEO <noreply@wasleen.com>',
      to: email,
      subject: `Your WasafSEO trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
      html: buildHtmlEmail(
        'Trial Ending Soon',
        `
          <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;">
            Hey ${displayName},
          </p>
          <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;">
            Your <strong style="color:#f59e0b;">WasafSEO trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong>.
            Don't lose access to your generated content briefs and SEO insights.
          </p>
          <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;">
            Upgrade now to continue generating unlimited Arabic SEO content briefs
            with full JSON-LD schema, competitor analysis, and more.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(245,158,11,0.08);border-radius:12px;padding:16px;">
            <tr>
              <td style="color:#f59e0b;font-size:14px;font-weight:600;padding-bottom:8px;">⏳ ${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining</td>
            </tr>
            <tr>
              <td style="color:#94a3b8;font-size:13px;line-height:1.5;">
                Starter — 30 briefs/month · Pro — 150 briefs/month · Agency — Unlimited
              </td>
            </tr>
          </table>
        `,
        'Upgrade Now',
        `${APP_URL}/pricing`
      ),
    });
  } catch (err) {
    console.error('sendTrialExpiringEmail failed:', err);
  }
}

/**
 * Sends a notification when the user has reached their monthly brief limit.
 * Non-blocking — fire-and-forget (do not await).
 */
export async function sendLimitReachedEmail(
  email: string,
  name: string,
  plan: string
): Promise<void> {
  try {
    const resend = getResend();
    const displayName = name || 'there';

    await resend.emails.send({
      from: 'WasafSEO <noreply@wasleen.com>',
      to: email,
      subject: "You've reached your monthly brief limit",
      html: buildHtmlEmail(
        'Monthly Limit Reached',
        `
          <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;">
            Hey ${displayName},
          </p>
          <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;">
            You've reached the monthly brief limit on your <strong style="color:#a78bfa;">${plan}</strong> plan.
          </p>
          <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;">
            Upgrade to a higher plan to continue generating content briefs without interruption.
            Here's how the plans compare:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);color:#e2e8f0;font-size:14px;font-weight:600;">Plan</td>
              <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);color:#e2e8f0;font-size:14px;font-weight:600;">Briefs/mo</td>
              <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);color:#e2e8f0;font-size:14px;font-weight:600;">Price</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);color:#94a3b8;font-size:14px;">Pro</td>
              <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);color:#e2e8f0;font-size:14px;">150</td>
              <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);color:#10b981;font-size:14px;">\$149/mo</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;color:#94a3b8;font-size:14px;">Agency</td>
              <td style="padding:10px 12px;color:#e2e8f0;font-size:14px;">Unlimited</td>
              <td style="padding:10px 12px;color:#10b981;font-size:14px;">\$399/mo</td>
            </tr>
          </table>
        `,
        'Compare Plans',
        `${APP_URL}/pricing`
      ),
    });
  } catch (err) {
    console.error('sendLimitReachedEmail failed:', err);
  }
}

/**
 * Sends a notification when a payment has failed.
 * Non-blocking — fire-and-forget (do not await).
 */
export async function sendPaymentFailedEmail(
  email: string,
  name: string
): Promise<void> {
  try {
    const resend = getResend();
    const displayName = name || 'there';

    await resend.emails.send({
      from: 'WasafSEO <noreply@wasleen.com>',
      to: email,
      subject: 'Action required: Payment failed',
      html: buildHtmlEmail(
        'Payment Failed',
        `
          <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;">
            Hey ${displayName},
          </p>
          <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;">
            <span style="color:#ef4444;">⚠️</span> We were unable to process your payment for WasafSEO.
          </p>
          <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;">
            Please update your billing information to avoid any interruption to your service.
            You can manage your payment method through the customer portal.
          </p>
          <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.5;">
            If you need assistance, reply to this email or contact <a href="mailto:${SUPPORT_EMAIL}" style="color:#7c3aed;text-decoration:none;">${SUPPORT_EMAIL}</a>.
          </p>
        `,
        'Update Billing',
        `${APP_URL}/dashboard/account`
      ),
    });
  } catch (err) {
    console.error('sendPaymentFailedEmail failed:', err);
  }
}
