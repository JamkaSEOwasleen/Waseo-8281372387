import { requireSession } from '@/lib/session';
import WebsiteWizard from './WebsiteWizard';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NewWebsitePage(): Promise<React.ReactElement> {
  await requireSession();

  return (
    <div className="mx-auto max-w-2xl">
      <WebsiteWizard />
    </div>
  );
}
