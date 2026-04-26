// ─── Billing Page ──────────────────────────────────────────────────────────
// /dashboard/billing
// Server component that fetches user billing info and renders plan management.

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getMonthlyUsage } from '@/lib/usage';
import {
  computeUsageState,
  getWebsiteLimit,
  isTrialActive,
  getTrialDaysRemaining,
  formatDateAr,
} from '@/lib/utils';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ManageBillingPortal } from '@/components/billing/ManageBillingPortal';
import type { User, UsageState } from '@/types';
import {
  CreditCard,
  Receipt,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Zap,
  Building2,
} from 'lucide-react';

// ─── Metadata ───────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Billing - WasafSEO',
  description: 'Manage your subscription and billing information',
};

// ─── Plan Data ──────────────────────────────────────────────────────────────

interface PlanInfo {
  name: string;
  nameAr: string;
  price: string;
  briefLimit: string;
  websiteLimit: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const PLAN_INFO: Record<string, PlanInfo> = {
  none: {
    name: 'Free',
    nameAr: 'مجاني',
    price: '$0/mo',
    briefLimit: '0 briefs',
    websiteLimit: '0 websites',
    icon: <Receipt size={20} />,
    color: 'text-text-muted',
    bgColor: 'bg-white/5',
    borderColor: 'border-surface-border',
  },
  starter: {
    name: 'Starter',
    nameAr: 'المبتدئ',
    price: '$49/mo',
    briefLimit: '30 briefs/mo',
    websiteLimit: '1 website',
    icon: <Zap size={20} />,
    color: 'text-warning',
    bgColor: 'bg-warning/5',
    borderColor: 'border-warning/20',
  },
  pro: {
    name: 'Pro',
    nameAr: 'احترافي',
    price: '$149/mo',
    briefLimit: '150 briefs/mo',
    websiteLimit: '5 websites',
    icon: <ShieldCheck size={20} />,
    color: 'text-primary-light',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary/20',
  },
  agency: {
    name: 'Agency',
    nameAr: 'وكالة',
    price: '$399/mo',
    briefLimit: 'Unlimited',
    websiteLimit: 'Unlimited',
    icon: <Building2 size={20} />,
    color: 'text-success',
    bgColor: 'bg-success/5',
    borderColor: 'border-success/20',
  },
};

// ─── Page Component ─────────────────────────────────────────────────────────

export default async function BillingPage(): Promise<React.ReactElement> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const supabase = createAdminClient();

  // 1. Fetch user data
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

  // 4. Check if user has a subscription
  const hasSubscription = !!user.lemon_customer_id;
  const planInfo = PLAN_INFO[user.plan] ?? PLAN_INFO.none;
  const isCancelled = !!user.subscription_cancelled_at;
  const paymentFailed = !!user.payment_failed_at;
  const trialDaysRemaining = isInTrial
    ? getTrialDaysRemaining(user.trial_ends_at)
    : null;

  // 5. Plan features
  const currentPlanFeatures: string[] =
    user.plan === 'agency'
      ? ['Unlimited briefs', 'Unlimited websites', 'Priority support', 'White-label export']
      : user.plan === 'pro'
      ? ['150 briefs per month', '5 websites', '90-day history', 'Priority support']
      : user.plan === 'starter'
      ? ['30 briefs per month', '1 website', '30-day history', 'Email support']
      : ['No active plan'];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary lg:text-4xl">
          Billing
        </h1>
        <p className="mt-2 text-sm text-text-muted lg:text-base">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      {/* ── Current Plan Card ────────────────────────────────────────────── */}
      <div>
        <CardHeader
          title="Current Plan"
          description="Your active subscription plan and usage"
        />

        <div className="mt-4">
          <div
            className={`rounded-xl border ${planInfo.borderColor} ${planInfo.bgColor} p-4 lg:p-6`}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              {/* Plan details */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${planInfo.bgColor} ${planInfo.color}`}
                  >
                    {planInfo.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {planInfo.nameAr}
                      </h3>
                      <Badge
                        variant={
                          user.plan === 'agency'
                            ? 'success'
                            : user.plan === 'pro'
                            ? 'primary'
                            : isInTrial
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {user.plan === 'agency'
                          ? 'Agency'
                          : user.plan === 'pro'
                          ? 'Pro'
                          : isInTrial
                          ? 'Trial'
                          : 'Starter'}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-text-muted">
                      {planInfo.price}
                    </p>
                  </div>
                </div>

                {/* Trial info */}
                {isInTrial && trialDaysRemaining !== null && (
                  <p className="mt-4 text-sm text-warning">
                    {trialDaysRemaining.toLocaleString('en-US')} days remaining
                    in your free trial
                  </p>
                )}

                {/* Cancellation notice */}
                {isCancelled && (
                  <p className="mt-4 text-sm text-error">
                    Your subscription was cancelled on{' '}
                    {formatDateAr(user.subscription_cancelled_at!)}. Access
                    continues until the end of your billing period.
                  </p>
                )}

                {/* Payment failed notice */}
                {paymentFailed && (
                  <p className="mt-4 text-sm text-error">
                    Your last payment failed. Please update your payment method
                    to continue uninterrupted access.
                  </p>
                )}

                {/* Divider */}
                <div className="my-4 border-t border-surface-border" />

                {/* Plan features */}
                <ul className="space-y-2">
                  {currentPlanFeatures.map(
                    (feature: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-text-secondary"
                      >
                        <CheckCircle2
                          size={16}
                          className="shrink-0 text-success"
                        />
                        {feature}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 lg:min-w-[200px]">
                {hasSubscription && (
                  <ManageBillingPortal variant="primary" />
                )}

                {user.plan !== 'agency' && (
                  <Link href="/pricing">
                    <Button variant="primary" size="lg" fullWidth>
                      {user.plan === 'none' ? 'Choose a Plan' : 'Upgrade Plan'}
                    </Button>
                  </Link>
                )}

                {user.plan !== 'none' && user.plan !== 'agency' && (
                  <Link href="/pricing">
                    <Button variant="ghost" size="sm" fullWidth>
                      Compare Plans
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Usage Section ────────────────────────────────────────────────── */}
      <div>
        <CardHeader
          title="Monthly Usage"
          description="Your brief generation usage for the current month"
        />

        <div className="mt-4">
          <Card variant="default" padding="md">
            {!usageState.isUnlimited ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">
                    {usageState.current.toLocaleString('en-US')} /{' '}
                    {usageState.limit.toLocaleString('en-US')} briefs used
                  </span>
                  <span className="font-medium text-text-primary">
                    {usageState.percentUsed}%
                  </span>
                </div>

                <ProgressBar
                  current={usageState.current}
                  max={usageState.limit}
                  showLabel={false}
                  barHeight="h-2"
                />

                {usageState.isNearLimit && (
                  <p className="text-xs text-warning">
                    You're approaching your monthly limit. Consider
                    upgrading your plan.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-success" />
                <p className="text-sm text-success">
                  Unlimited usage — no monthly limit on your Agency plan
                </p>
              </div>
            )}

            {/* Website count */}
            <div className="mt-4 flex items-center justify-between border-t border-surface-border pt-4 text-sm">
              <span className="text-text-muted">Websites</span>
              <span className="text-text-primary">
                {websiteCount?.toLocaleString('en-US') ?? 0}
                {!isWebsiteUnlimited
                  ? ` / ${websiteLimit.toLocaleString('en-US')}`
                  : ' / Unlimited'}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Payment Method Section ───────────────────────────────────────── */}
      <div>
        <CardHeader
          title="Payment Method"
          description="Manage your payment information"
        />

        <div className="mt-4">
          <Card variant="default" padding="md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard size={20} className="text-primary-light" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {hasSubscription
                      ? 'Payment method on file'
                      : 'No payment method'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {hasSubscription
                      ? 'Managed securely via Lemon Squeezy'
                      : 'Add a payment method when you subscribe'}
                  </p>
                </div>
              </div>

              {hasSubscription && (
                <ManageBillingPortal
                  variant="outline"
                  label="Update Payment Method"
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Need Help Section ────────────────────────────────────────────── */}
      <div>
        <Card variant="default" padding="md">
          <div className="flex flex-col items-center py-4 text-center lg:flex-row lg:gap-6 lg:text-left">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 lg:mb-0">
              <ExternalLink size={22} className="text-primary-light" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-text-primary lg:text-lg">
                Need help with billing?
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                Contact our support team at{' '}
                <a
                  href="mailto:support@wasleen.com"
                  className="text-primary-light underline hover:no-underline"
                >
                  support@wasleen.com
                </a>{' '}
                for any billing questions or issues.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
