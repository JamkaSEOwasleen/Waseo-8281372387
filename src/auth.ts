import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import type { DefaultSession } from 'next-auth';
import type { PlanType } from '@/types';

// ─── Type Augmentation ───────────────────────────────────────────────────────
// Extends the default Auth.js types with WasafSEO custom fields.

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      plan: PlanType;
      trialEndsAt: string | null;
      accountFlagged: boolean;
      paymentFailedAt: string | null;
      subscriptionCancelledAt: string | null;
    } & DefaultSession['user'];
  }

  interface JWT {
    id: string;
    plan: PlanType;
    trialEndsAt: string | null;
    accountFlagged: boolean;
    paymentFailedAt: string | null;
    subscriptionCancelledAt: string | null;
  }
}

// ─── Auth Instance ───────────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
