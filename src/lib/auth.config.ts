import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { consumePSEOReferralCookie } from '@/lib/pseo/referral-cookie';
import { WasafSEOAdapter } from '@/lib/auth-adapter';
import type { PlanType } from '@/types';

// ─── Helper: send verification email via Resend ──────────────────────────────

async function sendVerificationEmail(params: {
  identifier: string;
  url: string;
  provider: { from?: string };
}): Promise<void> {
  const { identifier: email, url, provider } = params;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: provider.from ?? 'WasafSEO <noreply@wasleen.com>',
      to: email,
      subject: 'رابط تسجيل الدخول إلى WasafSEO',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background-color:#080b14;font-family:system-ui,-apple-system,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:40px 16px;">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
                  <tr>
                    <td style="background:#0f1624;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:40px 32px;text-align:center;">
                      <h1 style="font-size:28px;font-weight:700;color:#e2e8f0;margin:0 0 8px;font-family:system-ui;">WasafSEO</h1>
                      <p style="font-size:16px;color:#a78bfa;margin:0 0 24px;">أداة توليد المحتوى العربي الذكي</p>
                      <div style="height:1px;background:rgba(255,255,255,0.07);margin:0 0 24px;"></div>
                      <p style="font-size:16px;color:#e2e8f0;margin:0 0 8px;line-height:1.6;">
                        مرحباً بك في WasafSEO
                      </p>
                      <p style="font-size:14px;color:#64748b;margin:0 0 24px;line-height:1.6;">
                        انقر على الرابط أدناه لتسجيل الدخول إلى حسابك
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                        <tr>
                          <td align="center" style="background:#7c3aed;border-radius:8px;padding:0;">
                            <a href="${url}"
                               style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                              تسجيل الدخول
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="font-size:12px;color:#64748b;margin:24px 0 0;line-height:1.6;">
                        إذا لم تطلب هذا الرابط، يمكنك تجاهل هذه الرسالة بأمان.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

// ─── Auth.js Configuration ───────────────────────────────────────────────────

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: 'WasafSEO <noreply@wasleen.com>',
      sendVerificationRequest: sendVerificationEmail,
    }),
  ],

  adapter: WasafSEOAdapter(),

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/login',
  },

  callbacks: {
    /**
     * JWT callback — runs on sign-in and token refresh.
     * Syncs user data from Supabase users table into the JWT token.
     */
    async jwt({ token, account }) {
      // Only run on sign-in (when account object exists)
      if (!account) return token;

      const email = token.email;
      if (!email) return token;

      const supabase = createAdminClient();

      // Attempt to find existing user by email
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, plan, trial_ends_at, account_flagged, payment_failed_at, subscription_cancelled_at')
        .eq('email', email)
        .single();

      if (existingUser) {
        // Existing user — add DB fields to token
        token.id = existingUser.id;
        token.plan = existingUser.plan as PlanType;
        token.trialEndsAt = existingUser.trial_ends_at;
        token.accountFlagged = existingUser.account_flagged;
        token.paymentFailedAt = existingUser.payment_failed_at;
        token.subscriptionCancelledAt = existingUser.subscription_cancelled_at;
      } else {
        // New user — grant 3-day free trial with plan='starter'
        const trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            email,
            name: token.name ?? null,
            avatar_url: token.picture ?? null,
            plan: 'starter',
            trial_ends_at: trialEndDate,
          })
          .select('id, plan, trial_ends_at, account_flagged, payment_failed_at, subscription_cancelled_at')
          .single();

        if (insertError || !newUser) {
          console.error('Failed to create user during sign-in:', insertError?.message);
          return token;
        }

        // ─── PSEO Referral Capture ────────────────────────────────────
        // Read the PSEO referral cookie (set during sign-in via ?ref=pseo-...)
        // and store it on the user row for analytics.
        try {
          const referral = await consumePSEOReferralCookie();
          if (referral) {
            const fullReferrer = `pseo-${referral.pillar}-${referral.location}`;
            await supabase
              .from('users')
              .update({
                pseo_referrer: fullReferrer,
                pseo_pillar: referral.pillar,
                pseo_location: referral.location,
                pseo_subtopic: referral.subtopic,
              })
              .eq('id', newUser.id);
          }
        } catch (referralError) {
          // Non-critical — don't block sign-in if referral tracking fails
          console.error('Failed to capture PSEO referral:', referralError);
        }
        // ─── End PSEO Referral Capture ────────────────────────────────

        token.id = newUser.id;
        token.plan = newUser.plan as PlanType;
        token.trialEndsAt = newUser.trial_ends_at;
        token.accountFlagged = newUser.account_flagged;
        token.paymentFailedAt = newUser.payment_failed_at;
        token.subscriptionCancelledAt = newUser.subscription_cancelled_at;
      }

      return token;
    },

    /**
     * Session callback — maps JWT claims to session.user.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.plan = (token.plan as PlanType) ?? 'none';
        session.user.trialEndsAt = (token.trialEndsAt as string | null) ?? null;
        session.user.accountFlagged = (token.accountFlagged as boolean) ?? false;
        session.user.paymentFailedAt = (token.paymentFailedAt as string | null) ?? null;
        session.user.subscriptionCancelledAt = (token.subscriptionCancelledAt as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
