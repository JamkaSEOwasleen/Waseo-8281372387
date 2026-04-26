// ─── Brief History Page ─────────────────────────────────────────────────────
// /dashboard/briefs
// Server component that renders the client-side briefs list with filters,
// search, pagination, and card grid.

import type { ReactElement } from 'react';
import { BriefsListClient } from './BriefsListClient';

export const metadata = {
  title: 'الموجزات - WasafSEO',
  description: 'استعراض جميع الموجزات السابقة مع إمكانية البحث والتصفية',
};

export default function BriefsPage(): ReactElement {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary lg:text-4xl">
          الموجزات
        </h1>
        <p className="mt-2 text-sm text-text-muted lg:text-base">
          استعراض وإدارة جميع الموجزات التي قمت بإنشائها
        </p>
      </div>

      {/* Client-side briefs list with filters and pagination */}
      <BriefsListClient />
    </div>
  );
}
