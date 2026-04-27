import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { APP_CONFIG } from '@/lib/constants';
import LoginForm from './LoginForm';

/**
 * Login page — server component.
 * If the user is already authenticated, redirects to /dashboard.
 * Otherwise renders the login card with Google OAuth and magic link options.
 *
 * Accepts optional `ref` search param for PSEO referral tracking.
 * Example: /login?ref=pseo-content-writing-riyadh
 */
export default async function LoginPage(props: {
  searchParams?: Promise<{ ref?: string }>;
}): Promise<React.ReactElement> {
  const session = await auth();

  // Already authenticated — redirect to dashboard
  if (session?.user?.id) {
    redirect('/dashboard');
  }

  // Read PSEO referral from search params
  const searchParams = await props.searchParams;
  const ref = searchParams?.ref ?? undefined;

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-surface px-4"
      dir="ltr"
    >
      <div className="w-full max-w-md">
        <LoginForm refParam={ref} />
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-text-muted">
        By continuing, you agree to{' '}
        <a
          href="/terms"
          className="underline underline-offset-2 hover:text-text-accent transition-colors"
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href="/privacy"
          className="underline underline-offset-2 hover:text-text-accent transition-colors"
        >
          Privacy Policy
        </a>
      </p>
    </main>
  );
}
