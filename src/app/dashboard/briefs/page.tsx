// ─── Brief History Page ─────────────────────────────────────────────────────
// /dashboard/briefs
// Server component that renders the client-side briefs list with filters,
// search, pagination, and card grid.

import type { ReactElement } from 'react';
import { BriefsListClient } from './BriefsListClient';

export const metadata = {
  title: 'Briefs - WasafSEO',
  description: 'Browse all previous briefs with search and filter capabilities',
};

export default function BriefsPage(): ReactElement {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary lg:text-4xl">
          Briefs
        </h1>
        <p className="mt-2 text-sm text-text-muted lg:text-base">
          Browse and manage all your generated briefs
        </p>
      </div>

      {/* Client-side briefs list with filters and pagination */}
      <BriefsListClient />
    </div>
  );
}
