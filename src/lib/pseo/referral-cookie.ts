import { cookies } from 'next/headers';

// ─── PSEO Referral Data ───────────────────────────────────────────────────────

export interface PSEOReferralData {
  pillar: string | null;
  location: string | null;
  subtopic: string | null;
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

/**
 * Parses a PSEO referral parameter (format: pseo-{pillar}-{location}).
 * Returns parsed components or null if invalid.
 */
export function parsePSEOReferral(ref?: string): PSEOReferralData | null {
  if (!ref || !ref.startsWith('pseo-')) return null;

  const rest = ref.replace('pseo-', '');
  const parts = rest.split('-');

  if (parts.length < 2) return null;

  return {
    pillar: parts[0] ?? null,
    location: parts.slice(1).join('-') || null,
    subtopic: null,
  };
}

// ─── Cookie Storage ───────────────────────────────────────────────────────────

const REFERRAL_COOKIE_NAME = 'pseo_referral';
const REFERRAL_COOKIE_TTL = 60 * 10; // 10 minutes — enough for OAuth redirect

/**
 * Stores PSEO referral data in a cookie for the JWT callback to read.
 * The cookie is consumed once during user creation and then deleted.
 */
export async function storePSEOReferralCookie(ref?: string): Promise<void> {
  const parsed = parsePSEOReferral(ref);
  if (!parsed) return;

  const cookieStore = await cookies();

  cookieStore.set(REFERRAL_COOKIE_NAME, JSON.stringify(parsed), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: REFERRAL_COOKIE_TTL,
  });
}

/**
 * Reads and clears the PSEO referral cookie.
 * Called by the JWT callback during new user creation.
 * Also importable from server actions that need to check referral state.
 */
export async function consumePSEOReferralCookie(): Promise<PSEOReferralData | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(REFERRAL_COOKIE_NAME);

  if (!cookie?.value) return null;

  // Delete cookie after reading (one-time use)
  cookieStore.delete(REFERRAL_COOKIE_NAME);

  try {
    return JSON.parse(cookie.value) as PSEOReferralData;
  } catch {
    return null;
  }
}
