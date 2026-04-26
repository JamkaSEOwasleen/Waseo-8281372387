import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { buildUrlPath, getPillarFromSlug } from '@/lib/pseo/utils';
import { getPublishedPage } from '@/lib/pseo/queries';
import { PSELandingPage } from '@/components/pseo/PSELandingPage';
import type { PSEOPublishedPage } from '@/types/pseo';

// ─── ISR Configuration ────────────────────────────────────────────────────────

export const revalidate = 604800; // 7 days
export const dynamicParams = true;

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
  const urlPath = buildUrlPath(pillar, location, subtopic);
  const page: PSEOPublishedPage | null = await getPublishedPage(urlPath);

  if (!page) {
    notFound();
  }

  return (
    <PSELandingPage page={page} pillar={pillar} location={location} />
  );
}
