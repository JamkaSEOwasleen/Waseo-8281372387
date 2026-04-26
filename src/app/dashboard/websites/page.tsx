import Link from 'next/link';
import { requireSession, getUserFromDb } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDateEn, getWebsiteLimit, getInitials } from '@/lib/utils';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NicheBadge } from '@/components/ui/Badge';
import type { Website, PlanType } from '@/types';

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function WebsitesPage(): Promise<React.ReactElement> {
  const session = await requireSession();
  const supabase = createAdminClient();

  // Fetch user for plan info
  const user = await getUserFromDb(session.id);

  // Fetch all websites
  const { data: websites } = await supabase
    .from('websites')
    .select('*')
    .eq('user_id', session.id)
    .order('created_at', { ascending: false });

  const websiteLimit = getWebsiteLimit((user?.plan as PlanType) ?? 'none');
  const websiteCount = websites?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <CardHeader
        title="Your Websites"
        description={`${websiteCount} of ${websiteLimit === Infinity ? 'unlimited' : websiteLimit} websites`}
        action={
          <Link href="/dashboard/websites/new">
            <Button variant="primary" size="md">
              Add Website
            </Button>
          </Link>
        }
      />

      {/* ── Limit Indicator ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 rounded-lg bg-surface-card px-4 py-2 text-xs text-text-muted">
        <span>
          {websiteCount} of {websiteLimit === Infinity ? '∞' : websiteLimit} website
          {websiteLimit === 1 ? '' : 's'}
          {user?.plan === 'starter' ? ' (Starter plan)' : ''}
        </span>
      </div>

      {/* ── Website Grid ────────────────────────────────────────────────── */}
      {!websites || websites.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <span className="text-2xl">🌐</span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary">No websites yet</h3>
            <p className="mt-1 text-sm text-text-muted">
              Add your first website to start generating SEO content briefs.
            </p>
            <Link href="/dashboard/websites/new" className="mt-6">
              <Button variant="primary" size="lg">
                Add Your First Website
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {websites.map((site: Website) => {
            const initials = getInitials(site.name);

            return (
              <Card key={site.id} variant="hover" className="group">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary-light">
                    {initials}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-text-primary group-hover:text-primary-light transition-colors">
                          {site.name}
                        </h3>
                        <p className="mt-0.5 text-sm text-text-muted break-all">
                          {site.domain}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <NicheBadge niche={site.niche} />
                      <span className="text-xs text-text-muted">
                        {site.target_country}
                      </span>
                      <span className="text-xs text-text-muted">
                        · Created {formatDateEn(site.created_at)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2">
                      <Link href={`/dashboard/websites/${site.id}`}>
                        <Button variant="secondary" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
