// ─── Account Page ─────────────────────────────────────────────────────────
// /dashboard/account
// Server component that fetches user profile, plan, usage data and renders
// client interactive sections.

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getMonthlyUsage,
} from '@/lib/usage';
import {
  computeUsageState,
  getWebsiteLimit,
  isTrialActive,
  getTrialDaysRemaining,
  formatDateEn as formatDate,
} from '@/lib/utils';
import { getInitials } from '@/lib/utils';
import type { User, UsageState } from '@/types';
import { AccountClient } from './AccountClient';
import { AccountActions } from './AccountActions';

// ─── Metadata ───────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Account - WasafSEO',
  description: 'Manage your personal account and subscription plan',
};

// ─── Page Component ─────────────────────────────────────────────────────────

export default async function AccountPage(): Promise<React.ReactElement> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const supabase = createAdminClient();

  // 1. Fetch user profile
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (userError || !userData) {
    redirect('/dashboard');
  }

  const user = userData as User;

  // 2. Compute usage state
  const monthlyUsage = await getMonthlyUsage(user.id);
  const isInTrial = user.plan === 'starter' && isTrialActive(user.trial_ends_at);
  const usageState: UsageState = computeUsageState(
    monthlyUsage,
    user.plan,
    user.trial_ends_at
  );

  // 3. Compute website info
  const { count: websiteCount } = await supabase
    .from('websites')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const websiteLimit = getWebsiteLimit(user.plan);
  const isWebsiteUnlimited = websiteLimit === Infinity;

  // 4. Fetch usage history (last 3 months)
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
  }

  const { data: usageHistoryData } = await supabase
    .from('usage')
    .select('month, briefs_generated')
    .eq('user_id', user.id)
    .in('month', months)
    .order('month', { ascending: false });

  const usageHistoryMap = new Map<string, number>();
  if (usageHistoryData) {
    for (const row of usageHistoryData) {
      usageHistoryMap.set(row.month, row.briefs_generated);
    }
  }

  const usageHistory = months.map((month) => ({
    month,
    count: usageHistoryMap.get(month) ?? 0,
  }));

  // 5. Trial info
  const trialDaysRemaining = isInTrial
    ? getTrialDaysRemaining(user.trial_ends_at)
    : null;

  // 6. Has subscription (for managing billing)
  const hasSubscription = !!user.lemon_customer_id;

  // 7. Plan display name
  const planLabels: Record<string, string> = {
    starter: 'Starter',
    pro: 'Pro',
    agency: 'Agency',
    none: 'Free',
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary lg:text-4xl">
          Account
        </h1>
        <p className="mt-2 text-sm text-text-muted lg:text-base">
          Manage your profile, subscription plan, and settings
        </p>
      </div>

      {/* ── Profile Section ───────────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-semibold text-text-primary lg:text-2xl">
            Profile
          </h2>
          <div className="h-px flex-1 bg-surface-border" />
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-4 lg:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            {/* Avatar */}
            <div className="flex items-center gap-4 lg:flex-col lg:items-center">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name ?? 'User'}
                  className="h-16 w-16 rounded-full object-cover lg:h-24 lg:w-24"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary lg:h-24 lg:w-24 lg:text-3xl">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="lg:text-center">
                <div className="text-sm font-medium text-text-primary lg:text-base">
                  {user.name ?? 'User'}
                </div>
                <div className="text-xs text-text-muted lg:text-sm">
                  {user.email}
                </div>
              </div>
            </div>

            {/* Editable fields — handled by client component */}
            <div className="flex-1">
              <AccountClient
                userId={user.id}
                initialName={user.name}
                email={user.email}
                avatarUrl={user.avatar_url}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Plan & Usage Section ──────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-semibold text-text-primary lg:text-2xl">
            Plan & Usage
          </h2>
          <div className="h-px flex-1 bg-surface-border" />
        </div>

        <div className="space-y-4">
          {/* Current Plan Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {planLabels[user.plan] ?? 'No Plan'}
                  </h3>
                  {user.plan === 'starter' && (
                    <span className="rounded-full bg-warning/20 px-2.5 py-0.5 text-xs font-medium text-warning">
                      {isInTrial ? 'Trial' : 'Starter'}
                    </span>
                  )}
                  {user.plan === 'pro' && (
                    <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary-light">
                      Pro
                    </span>
                  )}
                  {user.plan === 'agency' && (
                    <span className="rounded-full bg-success/20 px-2.5 py-0.5 text-xs font-medium text-success">
                      Agency
                    </span>
                  )}
                  {user.plan === 'none' && (
                    <span className="rounded-full bg-error/20 px-2.5 py-0.5 text-xs font-medium text-error">
                      No Plan
                    </span>
                  )}
                </div>

                {/* Trial info */}
                {isInTrial && trialDaysRemaining !== null && (
                  <p className="mt-1 text-sm text-warning">
                    {trialDaysRemaining.toLocaleString('en-US')} days remaining
                    in your trial
                  </p>
                )}

                {/* Subscription cancelled */}
                {user.subscription_cancelled_at && (
                  <p className="mt-1 text-sm text-error">
                    Subscription cancelled on{' '}
                    {formatDate(user.subscription_cancelled_at)}
                  </p>
                )}

                {/* Payment failed */}
                {user.payment_failed_at && (
                  <p className="mt-1 text-sm text-error">
                    Payment failed. Please update your payment method.
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 lg:flex-row">
                <AccountActions
                  hasSubscription={hasSubscription}
                  userEmail={user.email}
                  userPlan={user.plan}
                  mode="billing"
                />
              </div>
            </div>
          </div>

          {/* Usage Progress */}
          <div className="rounded-xl border border-surface-border bg-surface-card p-4 lg:p-6">
            <h3 className="mb-4 text-base font-semibold text-text-primary lg:text-lg">
              Briefs Usage
            </h3>

            {!usageState.isUnlimited ? (
              <>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-text-muted">
                    {usageState.current.toLocaleString('en-US')} /{' '}
                    {usageState.limit.toLocaleString('en-US')} briefs this month
                  </span>
                  <span className="text-text-primary">
                    {usageState.percentUsed}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      usageState.percentUsed >= 80
                        ? 'bg-warning'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(usageState.percentUsed, 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-success">
                Unlimited usage — no monthly limit
              </p>
            )}

            {/* Website count */}
            <div className="mt-4 border-t border-surface-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Websites</span>
                <span className="text-text-primary">
                  {websiteCount?.toLocaleString('en-US') ?? 0}
                  {!isWebsiteUnlimited
                    ? ` / ${websiteLimit.toLocaleString('ar-AE')}`
                    : ' / Unlimited'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Usage History ─────────────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-semibold text-text-primary lg:text-2xl">
            Usage History
          </h2>
          <div className="h-px flex-1 bg-surface-border" />
        </div>

        <div className="overflow-hidden rounded-xl border border-surface-border">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-surface-border bg-white/[0.02]">
                <th className="px-4 py-3 text-sm font-medium text-text-muted">
                  Month
                </th>
                <th className="px-4 py-3 text-sm font-medium text-text-muted">
                  Briefs Generated
                </th>
              </tr>
            </thead>
            <tbody>
              {usageHistory.map((row) => {
                const [year, month] = row.month.split('-');
                const monthNames = [
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                ];
                const monthName = monthNames[parseInt(month, 10) - 1] ?? month;
                return (
                  <tr
                    key={row.month}
                    className="border-b border-surface-border last:border-b-0"
                  >
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {monthName} {year}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {row.count.toLocaleString('en-US')} briefs
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Danger Zone ───────────────────────────────────────────────────── */}
      <AccountActions
        hasSubscription={hasSubscription}
        userEmail={user.email}
        userPlan={user.plan}
        mode="danger"
      />
    </div>
  );
}

