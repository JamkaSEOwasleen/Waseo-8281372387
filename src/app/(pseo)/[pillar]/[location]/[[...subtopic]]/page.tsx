import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { buildUrlPath, getPillarFromSlug } from '@/lib/pseo/utils';
import { getPublishedPage } from '@/lib/pseo/queries';
import { PSELandingPage } from '@/components/pseo/PSELandingPage';
import type { PSEOPublishedPage } from '@/types/pseo';

// ─── ISR Configuration ────────────────────────────────────────────────────────

export const revalidate = 604800; // 7 days
export const dynamicParams = true;

// ─── Reserved Paths ───────────────────────────────────────────────────────────
// These first-path segments belong to Next.js app routes, NOT PSEO content pages.
// The PSEO catch-all must reject them early to prevent:
//   a) unnecessary Supabase calls for app-internal paths
//   b) PSEO swallowing valid dashboard/api/auth URLs when route matching is ambiguous

const RESERVED_PSEO_PILLARS: ReadonlySet<string> = new Set([
  'dashboard',
  'api',
  '_next',
  'login',
  'pricing',
  'auth',
  'favicon.ico',
]);

function isReservedPillar(pillar: string): boolean {
  return RESERVED_PSEO_PILLARS.has(pillar.toLowerCase());
}

// ─── Params Type ──────────────────────────────────────────────────────────────

interface PSEOPageParams {
  pillar: string;
  location: string;
  subtopic?: string[];
}

interface PSEOPageProps {
  params: Promise<PSEOPageParams>;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PSEOPageProps): Promise<Metadata> {
  const { pillar, location, subtopic } = await params;

  // Reject reserved paths early — don't call Supabase for internal routes
  if (isReservedPillar(pillar)) {
    return {
      title: 'الصفحة غير موجودة | WasafSEO',
      description: 'لم يتم العثور على الصفحة المطلوبة.',
    };
  }

  const urlPath = buildUrlPath(pillar, location, subtopic);
  const page: PSEOPublishedPage | null = await getPublishedPage(urlPath);

  if (!page) {
    return {
      title: 'الصفحة غير موجودة | WasafSEO',
      description: 'لم يتم العثور على الصفحة المطلوبة.',
    };
  }

  const canonicalUrl = `https://wasafseo.wasleen.com${urlPath}`;

  return {
    title: page.title_ar,
    description: page.meta_description_ar,
    alternates: {
      canonical: canonicalUrl,
    },
    other: page.schema_json
      ? {
          'application/ld+json': JSON.stringify(page.schema_json),
        }
      : undefined,
  };
}

// ─── Page Component ────────────────────────────────────────────────────────────

export default async function PSEOPage({
  params,
}: PSEOPageProps): Promise<React.ReactElement> {
  const { pillar, location, subtopic } = await params;

  // Reject reserved paths early — prevents PSEO from intercepting dashboard/api/auth
  if (isReservedPillar(pillar)) {
    notFound();
  }

  const urlPath = buildUrlPath(pillar, location, subtopic);
  const page: PSEOPublishedPage | null = await getPublishedPage(urlPath);

  if (!page) {
    notFound();
  }

  return (
    <PSELandingPage page={page} pillar={pillar} location={location} />
  );
}
