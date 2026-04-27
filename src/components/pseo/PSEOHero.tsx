import { getPillarFromSlug } from '@/lib/pseo/utils';
import { cn } from '@/lib/utils';
import type { PSEOPublishedPage } from '@/types/pseo';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PSEOHeroProps {
  page: PSEOPublishedPage;
  pillar: string;
  location: string;
}

// ─── Pillar → Gradient Mapping ────────────────────────────────────────────────

const PILLAR_GRADIENTS: Record<string, string> = {
  'content-writing': 'from-violet-900/40 via-surface to-surface',
  'seo-services': 'from-blue-900/40 via-surface to-surface',
  'geo-aio': 'from-purple-900/40 via-surface to-surface',
  'jsonld-schema': 'from-indigo-900/40 via-surface to-surface',
  'content-marketing': 'from-pink-900/40 via-surface to-surface',
  'keyword-research': 'from-emerald-900/40 via-surface to-surface',
  'ecommerce-seo': 'from-amber-900/40 via-surface to-surface',
  'content-strategy': 'from-cyan-900/40 via-surface to-surface',
  'seo-tools': 'from-orange-900/40 via-surface to-surface',
  'article-writing': 'from-rose-900/40 via-surface to-surface',
};

function getGradient(slug: string): string {
  return PILLAR_GRADIENTS[slug] ?? 'from-primary/20 via-surface to-surface';
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function PSEOHero({
  page,
  pillar,
  location,
}: PSEOHeroProps): React.ReactElement {
  const { nameEn: pillarName } = getPillarFromSlug(pillar);

  const sectionCount: number = page.sections?.length ?? 0;
  const faqCount: number = page.faqs?.length ?? 0;
  const statsCount: number = page.local_stats?.length ?? 0;
  const wordEstimate: number = page.word_count ?? 0;

  const stats = [
    { label: 'Words', value: `${wordEstimate.toLocaleString('en-US')}+` },
    { label: 'Sections', value: `${sectionCount}` },
    { label: 'FAQs', value: `${faqCount}` },
    { label: 'Local Stats', value: `${statsCount}` },
  ];

  return (
    <section
      className={cn(
        'relative overflow-hidden bg-gradient-to-b',
        getGradient(pillar),
      )}
    >
      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-50 h-12 bg-surface-card/95 backdrop-blur-md border-t border-surface-border md:hidden">
        <a
          href={`/login?ref=pseo-${pillar}-${location}`}
          className={cn(
            'flex h-full w-full items-center justify-center',
            'bg-primary text-white text-sm font-medium',
            'active:scale-[0.98]',
          )}
        >
          Get Your Free Brief
        </a>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 lg:px-8 lg:pb-24 lg:pt-16">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-xs text-text-muted">
          <span>{pillarName}</span>
          <span aria-hidden="true">/</span>
          <span className="text-text-primary font-medium">{page.h1_ar}</span>
        </div>

        {/* H1 */}
        <h1 className="font-display text-2xl font-bold leading-tight text-text-primary lg:text-4xl">
          {page.h1_ar}
        </h1>

        {/* Intro text */}
        {page.intro_text && (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-muted lg:text-base">
            {page.intro_text}
          </p>
        )}

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl bg-white/5 p-4 text-center backdrop-blur-sm"
            >
              <div className="text-xl font-bold text-primary-light lg:text-2xl">
                {value}
              </div>
              <div className="mt-1 text-xs text-text-muted">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
