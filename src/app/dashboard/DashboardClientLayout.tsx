'use client';

import { useState, useCallback, type ReactElement, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Menu,
  X,
  LayoutDashboard,
  Sparkles,
  FileText,
  Globe,
  CreditCard,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { WasleenLogo as WasafSEOLogo } from '@/components/logo/WasafSEOLogo';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { cn, getInitials } from '@/lib/utils';
import type { UsageState } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  plan: string;
  trial_ends_at: string | null;
  payment_failed_at: string | null;
  subscription_cancelled_at: string | null;
}

interface DashboardClientLayoutProps {
  user: DashboardUser;
  usageState: UsageState;
  websiteCount: number;
  websiteLimit: number;
  trialDaysRemaining: number;
  paymentFailed: boolean;
  cancelledAt: string | null;
  children: ReactNode;
}

// ─── Navigation Items ────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: ReactElement;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Generate Brief', href: '/dashboard/generate', icon: <Sparkles size={20} /> },
  { label: 'My Briefs', href: '/dashboard/briefs', icon: <FileText size={20} /> },
  { label: 'Websites', href: '/dashboard/websites', icon: <Globe size={20} /> },
  { label: 'Account', href: '/dashboard/account', icon: <CreditCard size={20} /> },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardClientLayout({
  user,
  usageState,
  websiteCount,
  websiteLimit,
  trialDaysRemaining,
  paymentFailed,
  cancelledAt,
  children,
}: DashboardClientLayoutProps): ReactElement {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [trialBannerDismissed, setTrialBannerDismissed] = useState<boolean>(false);

  const closeSidebar = useCallback((): void => {
    setSidebarOpen(false);
  }, []);

  // Determine page title from pathname
  const pageTitle = getPageTitle(pathname);

  // Is trial banner visible?
  const showTrialBanner =
    usageState.isInTrial && trialDaysRemaining > 0 && !trialBannerDismissed;

  const showPaymentFailedBanner = paymentFailed;
  const showCancellationBanner = !!cancelledAt;

  const hasBanner = showTrialBanner || showPaymentFailedBanner || showCancellationBanner;

  return (
    <div className="flex min-h-screen bg-surface">
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-surface-border bg-surface-card',
          'transition-transform duration-200',
          '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-surface-border px-5 lg:h-[68px]">
          <WasafSEOLogo size={28} className="shrink-0" />
          <span className="font-display text-lg font-bold text-text-primary">
            WasafSEO
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ label, href, icon }) => {
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={closeSidebar}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card',
                  isActive
                    ? 'border-l-2 border-primary bg-primary/10 text-primary-light'
                    : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                )}
              >
                {icon}
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Usage Section */}
        <div className="border-t border-surface-border px-4 py-4">
          <div className="space-y-3">
            {/* Usage label */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">
                {usageState.isInTrial
                  ? `Trial — ${usageState.current}/${usageState.limit} briefs`
                  : usageState.isUnlimited
                  ? 'Agency — Unlimited'
                  : `${user.plan === 'starter' ? 'Starter' : user.plan === 'pro' ? 'Pro' : user.plan} — ${usageState.current}/${usageState.limit} briefs`}
              </span>
            </div>

            {/* Progress bar */}
            {!usageState.isUnlimited && (
              <ProgressBar
                current={usageState.current}
                max={usageState.limit}
                showLabel={false}
                barHeight="h-1.5"
              />
            )}

            {/* Website count */}
            <p className="text-[11px] text-text-muted">
              Websites: {websiteCount}
              {websiteLimit !== Infinity ? ` / ${websiteLimit}` : ''}
            </p>

            {/* Upgrade link */}
            {usageState.isNearLimit && !usageState.isUnlimited && (
              <Link
                href="/pricing"
                className="flex items-center gap-1 text-xs font-medium text-primary-light transition-colors hover:text-primary"
              >
                Upgrade Plan
                <ExternalLink size={12} />
              </Link>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 border-t border-surface-border px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary-light">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-text-primary">
              {user.name}
            </p>
            <p className="truncate text-[11px] text-text-muted">{user.email}</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile Sidebar (Sheet) ──────────────────────────────────────── */}
      <Dialog.Root open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

          <Dialog.Content
            className={cn(
              'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-surface-card shadow-2xl outline-none',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
            )}
          >
            {/* Close handle */}
            <div className="flex h-16 items-center justify-between border-b border-surface-border px-5">
              <div className="flex items-center gap-3">
                <WasafSEOLogo size={28} className="shrink-0" />
                <span className="font-display text-lg font-bold text-text-primary">
                  WasafSEO
                </span>
              </div>
              <button
                type="button"
                onClick={closeSidebar}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-primary/10 hover:text-text-primary focus:bg-primary/10 focus:outline-none"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {NAV_ITEMS.map(({ label, href, icon }) => {
                const isActive =
                  href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeSidebar}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary-light'
                        : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                    )}
                  >
                    {icon}
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Usage */}
            <div className="border-t border-surface-border px-4 py-4">
              <div className="space-y-3">
                <span className="text-xs font-medium text-text-muted">
                  {usageState.isInTrial
                    ? `Trial — ${usageState.current}/${usageState.limit} briefs`
                    : usageState.isUnlimited
                    ? 'Agency — Unlimited'
                    : `${usageState.current}/${usageState.limit} briefs`}
                </span>

                {!usageState.isUnlimited && (
                  <ProgressBar
                    current={usageState.current}
                    max={usageState.limit}
                    showLabel={false}
                    barHeight="h-1.5"
                  />
                )}

                {usageState.isNearLimit && !usageState.isUnlimited && (
                  <Link
                    href="/pricing"
                    onClick={closeSidebar}
                    className="flex items-center gap-1 text-xs font-medium text-primary-light"
                  >
                    Upgrade Plan
                    <ChevronRight size={12} />
                  </Link>
                )}
              </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-3 border-t border-surface-border px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary-light">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-text-primary">
                  {user.name}
                </p>
                <p className="truncate text-[11px] text-text-muted">
                  {user.email}
                </p>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Main Content Area ───────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-1 flex-col lg:ml-[240px]">
        {/* Header */}
        <header
          className={cn(
            'sticky top-0 z-30 border-b border-surface-border bg-surface-card/95 backdrop-blur-md',
            'transition-all duration-200'
          )}
        >
          {/* Mobile header */}
          <div className="flex h-16 items-center justify-between px-4 lg:hidden">
            <button
              type="button"
              onClick={(): void => setSidebarOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-primary/10 focus:bg-primary/10 focus:outline-none"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <WasafSEOLogo size={28} className="shrink-0" />

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary-light">
              {getInitials(user.name)}
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden h-[68px] items-center justify-between px-8 lg:flex">
            <h1 className="font-display text-xl font-bold text-text-primary">
              {pageTitle}
            </h1>

            <div className="flex items-center gap-3">
              {/* Plan badge */}
              <Badge
                variant={
                  usageState.isInTrial
                    ? 'warning'
                    : user.plan === 'pro'
                    ? 'success'
                    : user.plan === 'agency'
                    ? 'info'
                    : 'primary'
                }
              >
                {usageState.isInTrial
                  ? 'Trial'
                  : user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
              </Badge>
            </div>
          </div>
        </header>

        {/* Banners */}
        {hasBanner && (
          <div className="space-y-0">
            {/* Trial banner */}
            {showTrialBanner && (
              <div className="flex items-center justify-between bg-warning/10 px-4 py-2.5 lg:px-8">
                <p className="text-sm font-medium text-warning">
                  🎯 {trialDaysRemaining} days left in your free trial —{' '}
                  <Link href="/pricing" className="underline hover:no-underline">
                    Upgrade Now
                  </Link>
                </p>
                <button
                  type="button"
                  onClick={(): void => setTrialBannerDismissed(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-warning/60 transition-colors hover:bg-warning/10 hover:text-warning focus:outline-none"
                  aria-label="Dismiss trial banner"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Payment failed banner */}
            {showPaymentFailedBanner && (
              <div className="flex items-center justify-between bg-error/10 px-4 py-2.5 lg:px-8">
                <p className="text-sm font-medium text-error">
                  ⚠️ Payment failed. Please update your billing information.{' '}
                  <Link
                    href="/dashboard/account"
                    className="underline hover:no-underline"
                  >
                    Update billing
                  </Link>
                </p>
              </div>
            )}

            {/* Cancellation banner */}
            {showCancellationBanner && (
              <div className="flex items-center bg-warning/10 px-4 py-2.5 lg:px-8">
                <p className="text-sm font-medium text-warning">
                  Your subscription is cancelled. Access continues until{' '}
                  {cancelledAt
                    ? new Date(cancelledAt).toLocaleDateString()
                    : 'the end of your billing period'}
                  .
                </p>
              </div>
            )}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname.startsWith('/dashboard/generate')) return 'Generate Brief';
  if (pathname.startsWith('/dashboard/briefs')) return 'My Briefs';
  if (pathname.startsWith('/dashboard/websites/new')) return 'Add Website';
  if (pathname.startsWith('/dashboard/websites')) return 'Websites';
  if (pathname.startsWith('/dashboard/account')) return 'Account';
  return 'Dashboard';
}
