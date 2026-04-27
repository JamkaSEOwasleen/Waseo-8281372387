'use client';

import { motion } from 'framer-motion';
import { PSEONavbar } from '@/components/pseo/PSEONavbar';
import { PSEOHero } from '@/components/pseo/PSEOHero';
import { PSEOContentSection } from '@/components/pseo/PSEOContentSection';
import { PSEOStatsSection } from '@/components/pseo/PSEOStatsSection';
import { PSEOFAQSection } from '@/components/pseo/PSEOFAQSection';
import { PSEOInternalLinks } from '@/components/pseo/PSEOInternalLinks';
import { PSECTA } from '@/components/pseo/PSECTA';
import { PSEOFooter } from '@/components/pseo/PSEOFooter';
import { PSESchema } from '@/components/pseo/PSESchema';
import type { PSEOPublishedPage } from '@/types/pseo';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PSELandingPageProps {
  page: PSEOPublishedPage;
  pillar: string;
  location: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function PSELandingPage({
  page,
  pillar,
  location,
}: PSELandingPageProps): React.ReactElement {
  return (
    <>
      <PSEONavbar pillar={pillar} />

      <motion.article
        dir="ltr"
        lang="en"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-surface pt-16"
      >
        <PSEOHero page={page} pillar={pillar} location={location} />
        <PSEOContentSection sections={page.sections ?? []} />
        <PSEOStatsSection stats={page.local_stats ?? []} />
        <PSEOFAQSection faqs={page.faqs ?? []} />
        <PSEOInternalLinks links={page.internal_links ?? []} />
        <PSECTA pillar={pillar} location={location} />
        <PSEOFooter />
      </motion.article>

      <PSESchema schema={page.schema_json} />
    </>
  );
}
