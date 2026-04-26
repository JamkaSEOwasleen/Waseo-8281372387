import type { Adapter, AdapterUser, AdapterSession, VerificationToken } from 'next-auth/adapters';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Custom WasafSEO Auth.js adapter.
 *
 * This adapter only implements the methods required by the Resend/Email
 * provider for magic link verification tokens. User management is handled
 * in the JWT callback (auth.config.ts), so we don't need full CRUD adapters.
 *
 * Methods implemented:
 * - createVerificationToken — stores a token for email verification
 * - useVerificationToken — retrieves and deletes a used token
 * - getUserByEmail — required by Auth.js interface, delegates to Supabase
 */
export function WasafSEOAdapter(): Adapter {
  const supabase = createAdminClient();

  return {
    /**
     * Creates a verification token for email magic link flow.
     */
    async createVerificationToken(
      verificationToken: VerificationToken
    ): Promise<VerificationToken | null | undefined> {
      const { error } = await supabase.from('verification_tokens').insert({
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires.toISOString(),
      });

      if (error) {
        console.error('Failed to create verification token:', error.message);
        return null;
      }

      return verificationToken;
    },

    /**
     * Retrieves a verification token by identifier + token pair,
     * then deletes it (one-time use).
     */
    async useVerificationToken(params: {
      identifier: string;
      token: string;
    }): Promise<VerificationToken | null> {
      const { data, error } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('identifier', params.identifier)
        .eq('token', params.token)
        .single();

      if (error || !data) {
        return null;
      }

      // Delete the token after use (one-time use)
      await supabase
        .from('verification_tokens')
        .delete()
        .eq('identifier', params.identifier)
        .eq('token', params.token);

      return {
        identifier: data.identifier,
        token: data.token,
        expires: new Date(data.expires),
      };
    },

    /**
     * Retrieves a user by email from the Supabase users table.
     * Required by the Adapter interface.
     */
    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, avatar_url')
        .eq('email', email)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        emailVerified: null,
        image: data.avatar_url,
      };
    },

    // ─── Unimplemented methods ─────────────────────────────────────────────
    // These are required by the Adapter interface but not used in our
    // JWT-strategy setup. They throw descriptive errors if called.

    async createUser(): Promise<AdapterUser> {
      throw new Error('createUser is not implemented — user creation happens in JWT callback');
    },

    async getUser(): Promise<AdapterUser | null> {
      throw new Error('getUser is not implemented — use JWT/session instead');
    },

    async getUserByAccount(): Promise<AdapterUser | null> {
      return null;
    },

    async updateUser(): Promise<AdapterUser> {
      throw new Error('updateUser is not implemented — user updates go through /api/user');
    },

    async deleteUser(): Promise<void> {
      throw new Error('deleteUser is not implemented');
    },

    async linkAccount(): Promise<void> {
      // No-op: account linking not needed with JWT strategy
    },

    async unlinkAccount(): Promise<void> {
      // No-op: account unlinking not needed with JWT strategy
    },

    async createSession(): Promise<AdapterSession & { id: unknown }> {
      throw new Error('createSession is not implemented — session is JWT-based');
    },

    async getSessionAndUser(): Promise<null> {
      return null;
    },

    async updateSession(): Promise<AdapterSession | null | undefined> {
      return null;
    },

    async deleteSession(): Promise<void> {
      // No-op: session is JWT-based
    },
  };
}
