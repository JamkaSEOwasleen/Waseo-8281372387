import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import WebsiteEditForm from './WebsiteEditForm';
import type { Website } from '@/types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface EditWebsitePageProps {
  params: Promise<{ id: string }>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EditWebsitePage({
  params,
}: EditWebsitePageProps): Promise<React.ReactElement> {
  const session = await requireSession();
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: website, error } = await supabase
    .from('websites')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.id)
    .single();

  if (error || !website) {
    redirect('/dashboard/websites');
  }

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/websites"
            className="mb-2 flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
          >
            ← Back to Websites
          </Link>
          <h1 className="text-xl font-bold text-text-primary lg:text-2xl">
            Edit {website.name}
          </h1>
          <p className="mt-1 text-sm text-text-muted">{website.domain}</p>
        </div>
        <Badge variant="primary">{website.niche}</Badge>
      </div>

      {/* ── Edit Form ──────────────────────────────────────────────────────── */}
      <WebsiteEditForm website={website as Website} />

      {/* ── Danger Zone ────────────────────────────────────────────────────── */}
      <Card variant="default" className="border-error/20">
        <CardHeader
          title="Danger Zone"
          description="Irreversible actions — proceed with caution"
        />
        <div className="mt-4 border-t border-surface-border pt-4">
          <p className="text-sm text-text-muted">
            Deleting this website will also remove all associated briefs. This
            action cannot be undone.
          </p>
        </div>
      </Card>
    </div>
  );
}
