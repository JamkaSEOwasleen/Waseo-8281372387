import { redirect } from 'next/navigation';
import { requireSession, getUserFromDb, checkAccountAccess } from '@/lib/session';
import { getMonthlyUsage } from '@/lib/usage';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentMonth, getWebsiteLimit, computeUsageState, getTrialDaysRemaining } from '@/lib/utils';
import DashboardClientLayout from './DashboardClientLayout';
import type { PlanType, UsageState } from '@/types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// ─── Layout Component ────────────────────────────────────────────────────────

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<React.ReactElement> {
  // 1. Require authentication
  const session = await requireSession();

  // 2. Fetch full user data for account checks
  const user = await getUserFromDb(session.id);

  if (!user) {
    redirect('/login');
  }

  // 3. Check account access (flagged, no plan, trial expired)
  const access = checkAccountAccess(user);

  if (!access.allowed) {
    if (access.redirectTo) {
      redirect(access.redirectTo);
    }
  }

  // 4. Fetch monthly usage
  const briefsGenerated = await getMonthlyUsage(session.id);

  // 5. Compute usage state
  const usageState = computeUsageState(briefsGenerated, user.plan as PlanType, user.trial_ends_at);

  // 6. Fetch website count for sidebar
  const supabase = createAdminClient();
  const { count: websiteCount } = await supabase
    .from('websites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.id);

  // 7. Compute website limit info
  const websiteLimit = getWebsiteLimit(user.plan as PlanType);

  // 8. Determine trial days remaining
  const trialDaysRemaining = usageState.isInTrial
    ? getTrialDaysRemaining(user.trial_ends_at)
    : 0;

  // 9. Get payment/cancellation info
  const paymentFailed = !!user.payment_failed_at;
  const cancelledAt = user.subscription_cancelled_at;

  // 10. Serialize user data for client
  const userData = {
    id: user.id,
    name: user.name ?? '',
    email: user.email,
    avatar_url: user.avatar_url,
    plan: user.plan,
    trial_ends_at: user.trial_ends_at,
    payment_failed_at: user.payment_failed_at,
    subscription_cancelled_at: user.subscription_cancelled_at,
  };

  return (
    <DashboardClientLayout
      user={userData}
      usageState={usageState}
      websiteCount={websiteCount ?? 0}
      websiteLimit={websiteLimit}
      trialDaysRemaining={trialDaysRemaining}
      paymentFailed={paymentFailed}
      cancelledAt={cancelledAt}
    >
      {children}
    </DashboardClientLayout>
  );
}
