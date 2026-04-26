import Link from 'next/link';
import { requireSession, getUserFromDb } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { getMonthlyUsage } from '@/lib/usage';
import { computeUsageState, getWebsiteLimit, formatDateEn } from '@/lib/utils';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, IntentBadge, PlanBadge } from '@/components/ui/Badge';
import { SkeletonCard, SkeletonTableRow } from '@/components/ui/Skeleton';
import { FileText, Globe, Sparkles, Plus, LayoutDashboard } from 'lucide-react';
import { redirect } from 'next/navigation';
import type { PlanType } from '@/types';

// ─── Recent Brief Row Type ────────────────────────────────────────────────────

interface RecentBriefRow {
  id: string;
  keyword: string;
  intent: string;
  target_country: string | null;
  created_at: string;
  website_id: string | null;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface DashboardHomeProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function DashboardHome({
  searchParams,
}: DashboardHomeProps): Promise<React.ReactElement> {
  const session = await requireSession();
  const supabase = createAdminClient();

  // Fetch user data
  const user = await getUserFromDb(session.id);
  if (!user) redirect('/login');

  // Fetch usage
  const briefsGenerated = await getMonthlyUsage(session.id);
  const usageState = computeUsageState(briefsGenerated, user.plan as PlanType, user.trial_ends_at);

  // Fetch websites count
  const { count: websiteCount } = await supabase
    .from('websites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.id);

  const websiteLimit = getWebsiteLimit(user.plan as PlanType);

  // Fetch recent briefs (last 5)
  const { data: recentBriefs } = await supabase
    .from('briefs')
    .select('id, keyword, intent, target_country, created_at, website_id')
    .eq('user_id', session.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch website names for briefs
  let websiteNames: Record<string, string> = {};
  if (recentBriefs && recentBriefs.length > 0) {
    const websiteIds = [...new Set(recentBriefs.map((b) => b.website_id).filter(Boolean))];
    if (websiteIds.length > 0) {
      const { data: websites } = await supabase
        .from('websites')
        .select('id, name')
        .in('id', websiteIds);
      if (websites) {
        websiteNames = Object.fromEntries(websites.map((w) => [w.id, w.name]));
      }
    }
  }

  // Count total briefs (lifetime)
  const { count: totalBriefs } = await supabase
    .from('briefs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.id);

  const hasWebsites = (websiteCount ?? 0) > 0;

  return (
    <div className="space-y-8">
      {/* ── Welcome Section ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary lg:text-4xl">
          Welcome back, {user.name ?? 'there'} 👋
        </h1>
        <p className="mt-1 text-sm text-text-muted lg:text-base">
          Ready to generate content that ranks?
        </p>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Briefs This Month */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted">Briefs This Month</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {usageState.isUnlimited ? '∞' : `${usageState.current}`}
                <span className="text-sm font-normal text-text-muted">
                  {' '}/{usageState.isUnlimited ? '∞' : usageState.limit}
                </span>
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText size={18} className="text-primary-light" />
            </div>
          </div>
        </Card>

        {/* Websites */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted">Websites</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {websiteCount ?? 0}
                <span className="text-sm font-normal text-text-muted">
                  {' '}/{websiteLimit === Infinity ? '∞' : websiteLimit}
                </span>
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Globe size={18} className="text-info" />
            </div>
          </div>
        </Card>

        {/* Total Briefs */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted">Total Briefs</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {totalBriefs ?? 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <LayoutDashboard size={18} className="text-success" />
            </div>
          </div>
        </Card>

        {/* Current Plan */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted">Current Plan</p>
              <div className="mt-1">
                <PlanBadge
                  plan={user.plan}
                  isTrial={usageState.isInTrial}
                />
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Sparkles size={18} className="text-warning" />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Link href="/dashboard/generate">
          <Card variant="hover" className="group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Sparkles size={22} className="text-primary-light" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  Generate New Brief
                </h3>
                <p className="mt-0.5 text-sm text-text-muted">
                  Create a new Arabic SEO content brief
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/websites/new">
          <Card variant="hover" className="group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors">
                <Plus size={22} className="text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  Add Website
                </h3>
                <p className="mt-0.5 text-sm text-text-muted">
                  Add a website to power JSON-LD schema generation
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* ── Onboarding Banner (no websites) ─────────────────────────────── */}
      {!hasWebsites && (
        <Card variant="default" className="border-primary/20 bg-primary/5">
          <div className="flex flex-col items-center py-6 text-center lg:flex-row lg:gap-6 lg:text-left">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 lg:mb-0">
              <Globe size={28} className="text-primary-light" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary">
                Add your first website to get started
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                Your website data powers the JSON-LD schema generation and
                personalizes every content brief.
              </p>
            </div>
            <Link href="/dashboard/websites/new" className="mt-4 lg:mt-0">
              <Button variant="primary" size="lg">
                Add Website
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ── Recent Briefs ──────────────────────────────────────────────── */}
      <div>
        <CardHeader
          title="Recent Briefs"
          description="Your most recently generated content briefs"
          action={
            recentBriefs && recentBriefs.length > 0 ? (
              <Link href="/dashboard/briefs">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            ) : undefined
          }
        />

        <div className="mt-4">
          {!recentBriefs || recentBriefs.length === 0 ? (
            <Card variant="default">
              <div className="flex flex-col items-center py-8 text-center">
                <FileText size={36} className="mb-3 text-text-muted/40" />
                <p className="text-sm font-medium text-text-muted">
                  No briefs yet
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Generate your first brief to see it here
                </p>
                <Link href="/dashboard/generate" className="mt-4">
                  <Button variant="primary" size="sm">
                    Generate First Brief
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-xl border border-surface-border md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-border bg-white/[0.02]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                        Keyword
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                        Website
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                        Intent
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                        Date
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-text-muted">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBriefs.map((brief: RecentBriefRow) => (
                      <tr
                        key={brief.id}
                        className="border-b border-surface-border last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-text-primary">
                          {brief.keyword}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-muted">
                          {brief.website_id
                            ? websiteNames[brief.website_id] ?? '—'
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <IntentBadge intent={brief.intent} />
                        </td>
                        <td className="px-4 py-3 text-sm text-text-muted">
                          {formatDateEn(brief.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/dashboard/briefs/${brief.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="space-y-3 md:hidden">
                {recentBriefs.map((brief: RecentBriefRow) => (
                  <Link key={brief.id} href={`/dashboard/briefs/${brief.id}`}>
                    <Card variant="hover" padding="sm">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-text-primary">
                            {brief.keyword}
                          </p>
                          <p className="mt-0.5 text-xs text-text-muted">
                            {brief.website_id
                              ? websiteNames[brief.website_id] ?? '—'
                              : '—'}{' '}
                            · {formatDateEn(brief.created_at)}
                          </p>
                        </div>
                        <div className="mr-3 shrink-0">
                          <IntentBadge intent={brief.intent} />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
