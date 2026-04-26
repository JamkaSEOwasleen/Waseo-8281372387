'use client';

import { useState, useCallback, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { COUNTRIES, NICHE_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Website } from '@/types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface WebsiteEditFormProps {
  website: Website;
}

// ─── Field Error ──────────────────────────────────────────────────────────────

interface FieldError {
  field: string;
  message: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WebsiteEditForm({
  website,
}: WebsiteEditFormProps): ReactElement {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [topicInput, setTopicInput] = useState<string>('');

  // Form state
  const [name, setName] = useState<string>(website.name);
  const [domain, setDomain] = useState<string>(website.domain);
  const [logoUrl, setLogoUrl] = useState<string>(website.logo_url ?? '');
  const [niche, setNiche] = useState<string>(website.niche);
  const [targetCountry, setTargetCountry] = useState<string>(website.target_country);
  const [brandName, setBrandName] = useState<string>(website.brand_name ?? '');
  const [brandDescription, setBrandDescription] = useState<string>(website.brand_description ?? '');
  const [twitterUrl, setTwitterUrl] = useState<string>(website.twitter_url ?? '');
  const [linkedinUrl, setLinkedinUrl] = useState<string>(website.linkedin_url ?? '');
  const [wikipediaUrl, setWikipediaUrl] = useState<string>(website.wikipedia_url ?? '');
  const [authorName, setAuthorName] = useState<string>(website.author_name ?? '');
  const [authorTitle, setAuthorTitle] = useState<string>(website.author_title ?? '');
  const [authorBio, setAuthorBio] = useState<string>(website.author_bio ?? '');
  const [authorLinkedin, setAuthorLinkedin] = useState<string>(website.author_linkedin ?? '');
  const [authorPortfolio, setAuthorPortfolio] = useState<string>(website.author_portfolio ?? '');
  const [authorTopics, setAuthorTopics] = useState<string[]>(website.author_topics ?? []);

  const [errors, setErrors] = useState<FieldError[]>([]);

  // ── Validation ──────────────────────────────────────────────────────────

  const validate = useCallback((): FieldError[] => {
    const fieldErrors: FieldError[] = [];

    if (!name.trim()) fieldErrors.push({ field: 'name', message: 'Website name is required' });
    else if (name.length > 100) fieldErrors.push({ field: 'name', message: 'Max 100 characters' });

    if (!domain.trim()) fieldErrors.push({ field: 'domain', message: 'Domain is required' });
    else if (!domain.startsWith('https://')) fieldErrors.push({ field: 'domain', message: 'Must start with https://' });

    if (!brandName.trim()) fieldErrors.push({ field: 'brand_name', message: 'Brand name is required' });
    if (!brandDescription.trim()) fieldErrors.push({ field: 'brand_description', message: 'Brand description is required' });
    if (!authorName.trim()) fieldErrors.push({ field: 'author_name', message: 'Author name is required' });
    if (!authorTitle.trim()) fieldErrors.push({ field: 'author_title', message: 'Author title is required' });
    if (!authorBio.trim()) fieldErrors.push({ field: 'author_bio', message: 'Author bio is required' });
    if (authorTopics.length === 0) fieldErrors.push({ field: 'author_topics', message: 'At least one topic required' });

    return fieldErrors;
  }, [name, domain, brandName, brandDescription, authorName, authorTitle, authorBio, authorTopics]);

  const getError = useCallback(
    (field: string): string | undefined => {
      return errors.find((e) => e.field === field)?.message;
    },
    [errors]
  );

  const clearError = useCallback(
    (field: string): void => {
      setErrors((prev) => prev.filter((e) => e.field !== field));
    },
    []
  );

  // ── Topic Management ────────────────────────────────────────────────────

  const addTopic = useCallback((): void => {
    const trimmed = topicInput.trim();
    if (!trimmed) return;
    if (authorTopics.length >= 10) return;
    if (authorTopics.includes(trimmed)) {
      setTopicInput('');
      return;
    }
    setAuthorTopics((prev) => [...prev, trimmed]);
    setTopicInput('');
    clearError('author_topics');
  }, [topicInput, authorTopics, clearError]);

  const removeTopic = useCallback(
    (topic: string): void => {
      setAuthorTopics((prev) => prev.filter((t) => t !== topic));
    },
    []
  );

  // ── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();

      const fieldErrors = validate();
      setErrors(fieldErrors);
      if (fieldErrors.length > 0) return;

      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      try {
        const body = {
          name,
          domain,
          logo_url: logoUrl || null,
          niche,
          target_country: targetCountry,
          brand_name: brandName,
          brand_description: brandDescription,
          twitter_url: twitterUrl || null,
          linkedin_url: linkedinUrl || null,
          wikipedia_url: wikipediaUrl || null,
          author_name: authorName,
          author_title: authorTitle,
          author_bio: authorBio,
          author_linkedin: authorLinkedin || null,
          author_portfolio: authorPortfolio || null,
          author_topics: authorTopics,
        };

        const response = await fetch(`/api/websites/${website.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message ?? 'Failed to update website');
        }

        setSaveSuccess(true);
        router.refresh();

        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        );
      } finally {
        setIsSaving(false);
      }
    },
    [
      name, domain, logoUrl, niche, targetCountry,
      brandName, brandDescription, twitterUrl, linkedinUrl, wikipediaUrl,
      authorName, authorTitle, authorBio, authorLinkedin, authorPortfolio,
      authorTopics, website.id, router, validate,
    ]
  );

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Basic Info Section ──────────────────────────────────────────────── */}
      <Card padding="lg">
        <h2 className="mb-5 text-base font-semibold text-text-primary lg:text-lg">
          Basic Info
        </h2>
        <div className="space-y-5">
          <Input
            label="Website Name"
            value={name}
            onChange={(e): void => { setName(e.target.value); clearError('name'); }}
            error={getError('name')}
            maxLength={100}
          />
          <Input
            label="Domain URL"
            value={domain}
            onChange={(e): void => { setDomain(e.target.value); clearError('domain'); }}
            error={getError('domain')}
            type="url"
            inputMode="url"
          />
          <Input
            label="Logo URL (optional)"
            value={logoUrl}
            onChange={(e): void => setLogoUrl(e.target.value)}
            type="url"
            inputMode="url"
          />
        </div>
      </Card>

      {/* ── Brand Section ──────────────────────────────────────────────────── */}
      <Card padding="lg">
        <h2 className="mb-5 text-base font-semibold text-text-primary lg:text-lg">
          Brand Details
        </h2>
        <div className="space-y-5">
          <Input
            label="Brand Name"
            value={brandName}
            onChange={(e): void => { setBrandName(e.target.value); clearError('brand_name'); }}
            error={getError('brand_name')}
            maxLength={100}
          />
          <Input
            label="Brand Description"
            value={brandDescription}
            onChange={(e): void => { setBrandDescription(e.target.value); clearError('brand_description'); }}
            error={getError('brand_description')}
            maxLength={200}
          />

          {/* Niche */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Niche</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {NICHE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(): void => setNiche(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition-all',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    'h-auto min-h-[56px]',
                    niche === opt.value
                      ? 'border-primary bg-primary/10 text-primary-light'
                      : 'border-surface-border text-text-muted hover:border-primary/30 hover:bg-primary/5'
                  )}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span>{opt.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Target Country</label>
            <select
              value={targetCountry}
              onChange={(e): void => setTargetCountry(e.target.value)}
              className={cn(
                'h-11 w-full rounded-xl border border-surface-border bg-surface px-4 text-base text-text-primary',
                'transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                'lg:h-10 lg:text-sm'
              )}
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* ── Social Links ──────────────────────────────────────────────────── */}
      <Card padding="lg">
        <h2 className="mb-5 text-base font-semibold text-text-primary lg:text-lg">
          Social Links
        </h2>
        <div className="space-y-5">
          <Input label="Twitter / X URL" value={twitterUrl} onChange={(e): void => setTwitterUrl(e.target.value)} type="url" inputMode="url" />
          <Input label="LinkedIn URL" value={linkedinUrl} onChange={(e): void => setLinkedinUrl(e.target.value)} type="url" inputMode="url" />
          <Input label="Wikipedia URL" value={wikipediaUrl} onChange={(e): void => setWikipediaUrl(e.target.value)} type="url" inputMode="url" />
        </div>
      </Card>

      {/* ── Author Section ──────────────────────────────────────────────────── */}
      <Card padding="lg">
        <h2 className="mb-5 text-base font-semibold text-text-primary lg:text-lg">
          Author Info
        </h2>
        <div className="space-y-5">
          <Input
            label="Author Name"
            value={authorName}
            onChange={(e): void => { setAuthorName(e.target.value); clearError('author_name'); }}
            error={getError('author_name')}
            maxLength={100}
          />
          <Input
            label="Author Title"
            value={authorTitle}
            onChange={(e): void => { setAuthorTitle(e.target.value); clearError('author_title'); }}
            error={getError('author_title')}
            maxLength={100}
          />
          <Input
            label="Author Bio"
            value={authorBio}
            onChange={(e): void => { setAuthorBio(e.target.value); clearError('author_bio'); }}
            error={getError('author_bio')}
            maxLength={300}
          />

          {/* Topics */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              Expert Topics
              {getError('author_topics') && (
                <span className="mr-2 text-error">— {getError('author_topics')}</span>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topicInput}
                onChange={(e): void => setTopicInput(e.target.value)}
                onKeyDown={(e): void => {
                  if (e.key === 'Enter') { e.preventDefault(); addTopic(); }
                }}
                placeholder="Type a topic and press Enter"
                disabled={authorTopics.length >= 10}
                className={cn(
                  'flex-1 h-11 rounded-xl border border-surface-border bg-surface px-4 text-base text-text-primary',
                  'placeholder:text-text-muted/40 transition-colors',
                  'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                  'lg:h-10 lg:text-sm',
                  'disabled:cursor-not-allowed disabled:opacity-40'
                )}
              />
              <button
                type="button"
                onClick={addTopic}
                disabled={authorTopics.length >= 10}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl border border-surface-border',
                  'text-text-muted transition-all hover:border-primary/30 hover:text-primary-light',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                  'lg:h-10 lg:w-10'
                )}
                aria-label="Add topic"
              >
                <Plus size={18} />
              </button>
            </div>

            {authorTopics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {authorTopics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary-light"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={(): void => removeTopic(topic)}
                      className="flex h-4 w-4 items-center justify-center rounded-full text-primary-light/60 hover:bg-primary/20 hover:text-primary-light focus:outline-none"
                      aria-label={`Remove ${topic}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <p className="mt-1.5 text-xs text-text-muted">
              {authorTopics.length}/10 topics
            </p>
          </div>

          <Input label="Author LinkedIn (optional)" value={authorLinkedin} onChange={(e): void => setAuthorLinkedin(e.target.value)} type="url" inputMode="url" />
          <Input label="Author Portfolio (optional)" value={authorPortfolio} onChange={(e): void => setAuthorPortfolio(e.target.value)} type="url" inputMode="url" />
        </div>
      </Card>

      {/* ── Status Messages ──────────────────────────────────────────────────── */}
      {saveSuccess && (
        <div className="rounded-lg bg-success/10 px-4 py-3">
          <p className="text-sm font-medium text-success">Website updated successfully ✓</p>
        </div>
      )}

      {saveError && (
        <div className="rounded-lg bg-error/10 px-4 py-3">
          <p className="text-sm text-error">{saveError}</p>
        </div>
      )}

      {/* ── Submit ───────────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button variant="primary" size="lg" type="submit" isLoading={isSaving}>
          <Save size={16} />
          Save Changes
        </Button>
      </div>
    </form>
  );
}
