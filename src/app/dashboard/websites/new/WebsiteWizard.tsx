'use client';

import { useState, useCallback, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, X, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { COUNTRIES, NICHE_OPTIONS } from '@/lib/constants';
import { websiteSchema } from '@/lib/validations';
import { cn } from '@/lib/utils';
import type { z } from 'zod';

// ─── Types ───────────────────────────────────────────────────────────────────

type WebsiteFormData = z.infer<typeof websiteSchema>;

interface FieldError {
  field: string;
  message: string;
}

// ─── Steps Configuration ─────────────────────────────────────────────────────

interface StepConfig {
  id: number;
  title: string;
  shortLabel: string;
}

const STEPS: StepConfig[] = [
  { id: 1, title: 'Basic Info', shortLabel: 'Info' },
  { id: 2, title: 'Brand Details', shortLabel: 'Brand' },
  { id: 3, title: 'Social Links', shortLabel: 'Social' },
  { id: 4, title: 'Author Info', shortLabel: 'Author' },
];

const TOTAL_STEPS = STEPS.length;

// ─── Initial Data ────────────────────────────────────────────────────────────

const INITIAL_DATA: WebsiteFormData = {
  name: '',
  domain: '',
  logo_url: '',
  niche: 'blog',
  target_country: 'SA',
  brand_name: '',
  brand_description: '',
  twitter_url: '',
  linkedin_url: '',
  wikipedia_url: '',
  author_name: '',
  author_title: '',
  author_bio: '',
  author_linkedin: '',
  author_portfolio: '',
  author_topics: [],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function WebsiteWizard(): ReactElement {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<WebsiteFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [topicInput, setTopicInput] = useState<string>('');

  // ── Step Validation ──────────────────────────────────────────────────────

  const validateStep = useCallback(
    (currentStep: number): FieldError[] => {
      const fieldErrors: FieldError[] = [];

      // Build partial data based on step
      if (currentStep === 1) {
        if (!formData.name.trim()) {
          fieldErrors.push({ field: 'name', message: 'Website name is required' });
        } else if (formData.name.length > 100) {
          fieldErrors.push({ field: 'name', message: 'Website name must be under 100 characters' });
        }

        if (!formData.domain.trim()) {
          fieldErrors.push({ field: 'domain', message: 'Domain is required' });
        } else if (!formData.domain.startsWith('https://')) {
          fieldErrors.push({ field: 'domain', message: 'Domain must start with https://' });
        } else {
          try {
            new URL(formData.domain);
          } catch {
            fieldErrors.push({ field: 'domain', message: 'Domain must be a valid URL' });
          }
        }
      } else if (currentStep === 2) {
        if (!formData.brand_name.trim()) {
          fieldErrors.push({ field: 'brand_name', message: 'Brand name is required' });
        } else if (formData.brand_name.length > 100) {
          fieldErrors.push({ field: 'brand_name', message: 'Brand name must be under 100 characters' });
        }

        if (!formData.brand_description.trim()) {
          fieldErrors.push({ field: 'brand_description', message: 'Brand description is required' });
        } else if (formData.brand_description.length > 200) {
          fieldErrors.push({ field: 'brand_description', message: 'Brand description must be under 200 characters' });
        }
      } else if (currentStep === 4) {
        if (!formData.author_name.trim()) {
          fieldErrors.push({ field: 'author_name', message: 'Author name is required' });
        } else if (formData.author_name.length > 100) {
          fieldErrors.push({ field: 'author_name', message: 'Author name must be under 100 characters' });
        }

        if (!formData.author_title.trim()) {
          fieldErrors.push({ field: 'author_title', message: 'Author job title is required' });
        } else if (formData.author_title.length > 100) {
          fieldErrors.push({ field: 'author_title', message: 'Author title must be under 100 characters' });
        }

        if (!formData.author_bio.trim()) {
          fieldErrors.push({ field: 'author_bio', message: 'Author bio is required' });
        } else if (formData.author_bio.length > 300) {
          fieldErrors.push({ field: 'author_bio', message: 'Author bio must be under 300 characters' });
        }

        if (formData.author_topics.length === 0) {
          fieldErrors.push({ field: 'author_topics', message: 'At least one expert topic is required' });
        }
      }

      return fieldErrors;
    },
    [formData]
  );

  // ── Navigation ───────────────────────────────────────────────────────────

  const handleNext = useCallback((): void => {
    const stepErrors = validateStep(step);
    setErrors(stepErrors);

    if (stepErrors.length === 0) {
      setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  }, [step, validateStep]);

  const handleBack = useCallback((): void => {
    setErrors([]);
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // ── Field Updates ────────────────────────────────────────────────────────

  const updateField = useCallback(
    (field: keyof WebsiteFormData, value: string | string[]): void => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when user types
      setErrors((prev) => prev.filter((e) => e.field !== field));
    },
    []
  );

  // ── Topic Tag Management ─────────────────────────────────────────────────

  const addTopic = useCallback((): void => {
    const trimmed = topicInput.trim();
    if (!trimmed) return;
    if (formData.author_topics.length >= 10) return;
    if (formData.author_topics.includes(trimmed)) {
      setTopicInput('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      author_topics: [...prev.author_topics, trimmed],
    }));
    setTopicInput('');
    setErrors((prev) => prev.filter((e) => e.field !== 'author_topics'));
  }, [topicInput, formData.author_topics]);

  const removeTopic = useCallback(
    (topic: string): void => {
      setFormData((prev) => ({
        ...prev,
        author_topics: prev.author_topics.filter((t) => t !== topic),
      }));
    },
    []
  );

  const handleTopicKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTopic();
      }
    },
    [addTopic]
  );

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Final validation using zod schema for complete data
      const parsed = websiteSchema.safeParse(formData);
      if (!parsed.success) {
        const zodErrors: FieldError[] = parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        setErrors(zodErrors);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? 'Failed to create website');
      }

      router.push('/dashboard/websites');
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  }, [formData, router]);

  // ── Helper to get field error ────────────────────────────────────────────

  const getError = useCallback(
    (field: string): string | undefined => {
      return errors.find((e) => e.field === field)?.message;
    },
    [errors]
  );

  // ── Progress calculation ─────────────────────────────────────────────────

  const progressPercent = Math.round(((step - 1) / TOTAL_STEPS) * 100);

  // ── Render Steps ─────────────────────────────────────────────────────────

  function renderStepContent(): ReactElement {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <Input
              label="Website Name"
              placeholder="My Awesome Blog"
              value={formData.name}
              onChange={(e): void => updateField('name', e.target.value)}
              error={getError('name')}
              helperText="A recognizable name for your website"
              maxLength={100}
            />

            <Input
              label="Domain URL"
              placeholder="https://example.com"
              value={formData.domain}
              onChange={(e): void => updateField('domain', e.target.value)}
              error={getError('domain')}
              helperText="Full URL starting with https://"
              type="url"
              inputMode="url"
            />

            <Input
              label="Logo URL (optional)"
              placeholder="https://example.com/logo.png"
              value={formData.logo_url}
              onChange={(e): void => updateField('logo_url', e.target.value)}
              helperText="URL to your website's logo image"
              type="url"
              inputMode="url"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <Input
              label="Brand Name"
              placeholder="Your brand or company name"
              value={formData.brand_name}
              onChange={(e): void => updateField('brand_name', e.target.value)}
              error={getError('brand_name')}
              maxLength={100}
            />

            <Input
              label="Brand Description"
              placeholder="What does your brand do?"
              value={formData.brand_description}
              onChange={(e): void => updateField('brand_description', e.target.value)}
              error={getError('brand_description')}
              helperText="Brief description of your brand (max 200 characters)"
              maxLength={200}
            />

            {/* Niche Select */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">
                Niche
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {NICHE_OPTIONS.map((niche) => (
                  <button
                    key={niche.value}
                    type="button"
                    onClick={(): void => updateField('niche', niche.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition-all',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      'h-auto min-h-[56px]',
                      formData.niche === niche.value
                        ? 'border-primary bg-primary/10 text-primary-light'
                        : 'border-surface-border text-text-muted hover:border-primary/30 hover:bg-primary/5'
                    )}
                  >
                    <span className="text-lg">{niche.icon}</span>
                    <span>{niche.value === formData.niche ? niche.labelAr : niche.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Country Select */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">
                Target Country
              </label>
              <select
                value={formData.target_country}
                onChange={(e): void => updateField('target_country', e.target.value)}
                className={cn(
                  'h-11 w-full rounded-xl border border-surface-border bg-surface px-4 text-base text-text-primary',
                  'transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                  'lg:h-10 lg:text-sm'
                )}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.nameEn} — {country.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <p className="text-sm text-text-muted">
              Optional: Add your brand's social media profiles to enrich JSON-LD
              schema with Organization data.
            </p>

            <Input
              label="Twitter / X URL"
              placeholder="https://x.com/yourbrand"
              value={formData.twitter_url}
              onChange={(e): void => updateField('twitter_url', e.target.value)}
              type="url"
              inputMode="url"
            />

            <Input
              label="LinkedIn URL"
              placeholder="https://linkedin.com/company/yourbrand"
              value={formData.linkedin_url}
              onChange={(e): void => updateField('linkedin_url', e.target.value)}
              type="url"
              inputMode="url"
            />

            <Input
              label="Wikipedia URL"
              placeholder="https://en.wikipedia.org/wiki/YourBrand"
              value={formData.wikipedia_url}
              onChange={(e): void => updateField('wikipedia_url', e.target.value)}
              type="url"
              inputMode="url"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <p className="text-sm text-text-muted">
              Author details power the JSON-LD schema with E-E-A-T signals.
            </p>

            <Input
              label="Author Name"
              placeholder="Full name of the content author"
              value={formData.author_name}
              onChange={(e): void => updateField('author_name', e.target.value)}
              error={getError('author_name')}
              maxLength={100}
            />

            <Input
              label="Author Job Title"
              placeholder="e.g. SEO Specialist, Content Writer"
              value={formData.author_title}
              onChange={(e): void => updateField('author_title', e.target.value)}
              error={getError('author_title')}
              maxLength={100}
            />

            <Input
              label="Author Bio"
              placeholder="Brief professional bio"
              value={formData.author_bio}
              onChange={(e): void => updateField('author_bio', e.target.value)}
              error={getError('author_bio')}
              helperText="Max 300 characters"
              maxLength={300}
            />

            {/* Author Topics — Tag Input */}
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
                  onKeyDown={handleTopicKeyDown}
                  placeholder="Type a topic and press Enter"
                  className={cn(
                    'flex-1 h-11 rounded-xl border border-surface-border bg-surface px-4 text-base text-text-primary',
                    'placeholder:text-text-muted/40 transition-colors',
                    'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                    'lg:h-10 lg:text-sm'
                  )}
                  disabled={formData.author_topics.length >= 10}
                />
                <button
                  type="button"
                  onClick={addTopic}
                  disabled={formData.author_topics.length >= 10}
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

              {/* Topic tags */}
              {formData.author_topics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.author_topics.map((topic) => (
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
                {formData.author_topics.length}/10 topics added
              </p>
            </div>

            <Input
              label="Author LinkedIn URL (optional)"
              placeholder="https://linkedin.com/in/author"
              value={formData.author_linkedin}
              onChange={(e): void => updateField('author_linkedin', e.target.value)}
              type="url"
              inputMode="url"
            />

            <Input
              label="Author Portfolio URL (optional)"
              placeholder="https://author-portfolio.com"
              value={formData.author_portfolio}
              onChange={(e): void => updateField('author_portfolio', e.target.value)}
              type="url"
              inputMode="url"
            />
          </div>
        );

      default:
        return <div />;
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-text-primary lg:text-2xl">Add Website</h1>
        <p className="mt-1 text-sm text-text-muted">
          Set up your website to power SEO content briefs with JSON-LD schema.
        </p>
      </div>

      {/* ── Progress Bar ────────────────────────────────────────────────────── */}
      <ProgressBar current={progressPercent} max={100} barHeight="h-1.5" />

      {/* ── Step Indicator ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-2">
            {/* Connector line */}
            {idx > 0 && (
              <div
                className={cn(
                  'hidden h-px w-8 sm:block lg:w-12',
                  step > s.id ? 'bg-primary' : 'bg-surface-border'
                )}
              />
            )}

            {/* Step circle */}
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all',
                'lg:h-10 lg:w-10',
                step > s.id
                  ? 'bg-primary text-white'
                  : step === s.id
                  ? 'border-2 border-primary bg-primary/10 text-primary-light'
                  : 'border border-surface-border bg-surface-card text-text-muted'
              )}
            >
              {step > s.id ? <Check size={16} /> : s.id}
            </div>

            {/* Label — hidden on mobile */}
            <span
              className={cn(
                'hidden text-xs font-medium sm:block',
                step >= s.id ? 'text-text-primary' : 'text-text-muted'
              )}
            >
              {s.shortLabel}
            </span>
          </div>
        ))}
      </div>

      {/* ── Form Card ───────────────────────────────────────────────────────── */}
      <Card padding="lg">
        {/* Step title */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-text-primary">
            {STEPS.find((s) => s.id === step)?.title}
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        {/* Step content */}
        {renderStepContent()}

        {/* Submit error */}
        {submitError && (
          <div className="mt-4 rounded-lg bg-error/10 px-4 py-3">
            <p className="text-sm text-error">{submitError}</p>
          </div>
        )}
      </Card>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={handleBack}
          disabled={step === 1}
          className="w-full md:w-auto"
        >
          <ChevronLeft size={16} />
          Back
        </Button>

        {step < TOTAL_STEPS ? (
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            className="w-full md:w-auto"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="w-full md:w-auto"
          >
            Save Website
          </Button>
        )}
      </div>
    </div>
  );
}

