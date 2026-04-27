'use client';

import { useState, useEffect, useCallback, type ReactElement } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Globe,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowLeft,
  Info,
  FileWarning,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import UpgradeGate from '@/components/billing/UpgradeGate';
import BriefResults from '@/components/brief/BriefResults';
import { INTENT_OPTIONS, COUNTRIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { BriefOutput, SchemaOutput, IntentType, PlanType } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WebsiteOption {
  id: string;
  name: string;
  domain: string;
}

interface UsageInfo {
  current: number;
  limit: number;
  isUnlimited: boolean;
  percentUsed: number;
}

interface GenerateFormState {
  websiteId: string;
  keyword: string;
  intent: string;
  location: string;
  additionalInfo: string;
  competitorUrls: string[];
}

type PageState = 'form' | 'loading' | 'results' | 'error';

// ─── Loading Stage Messages ───────────────────────────────────────────────────

const LOADING_STAGES: Array<{ time: number; message: string }> = [
  { time: 0, message: 'Analyzing search intent...' },
  { time: 3, message: 'Building Arabic content structure...' },
  { time: 6, message: 'Generating E-E-A-T signals...' },
  { time: 10, message: 'Creating JSON-LD schema...' },
  { time: 15, message: 'Running final checks...' },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function GeneratePage(): ReactElement {
  const router = useRouter();

  // ── State ────────────────────────────────────────────────────────────────

  const [pageState, setPageState] = useState<PageState>('form');
  const [formState, setFormState] = useState<GenerateFormState>({
    websiteId: '',
    keyword: '',
    intent: '',
    location: 'AE',
    additionalInfo: '',
    competitorUrls: [],
  });
  const [websites, setWebsites] = useState<WebsiteOption[]>([]);
  const [websitesLoading, setWebsitesLoading] = useState<boolean>(true);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [showCompetitorUrls, setShowCompetitorUrls] = useState<boolean>(false);
  const [loadingStageIndex, setLoadingStageIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [briefResult, setBriefResult] = useState<{
    brief: BriefOutput;
    schema: SchemaOutput;
    briefId: string;
  } | null>(null);
  const [userPlan, setUserPlan] = useState<PlanType>('none');

  // ── Fetch websites on mount ──────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    async function loadWebsites(): Promise<void> {
      try {
        setWebsitesLoading(true);
        const response = await fetch('/api/websites');
        const result = await response.json();

        if (!mounted) return;

        if (result.data) {
          setWebsites(
            result.data.map((w: { id: string; name: string; domain: string }) => ({
              id: w.id,
              name: w.name,
              domain: w.domain,
            }))
          );
        }
      } catch {
        // Silently fail — form still works without websites loaded
      } finally {
        if (mounted) setWebsitesLoading(false);
      }
    }

    loadWebsites();

    return (): void => {
      mounted = false;
    };
  }, []);

  // ── Fetch usage info ─────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    async function loadUsage(): Promise<void> {
      try {
        const response = await fetch('/api/user');
        const result = await response.json();

        if (!mounted) return;

        if (result.data) {
          const usage = result.data.usageState;
          setUsageInfo({
            current: usage.current,
            limit: usage.limit,
            isUnlimited: usage.isUnlimited,
            percentUsed: usage.percentUsed,
          });
          setUserPlan(result.data.plan ?? 'none');
        }
      } catch {
        // Silently fail
      }
    }

    loadUsage();

    return (): void => {
      mounted = false;
    };
  }, []);

  // ── Loading stage rotator ────────────────────────────────────────────────

  useEffect(() => {
    if (pageState !== 'loading') {
      setLoadingStageIndex(0);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const stage of LOADING_STAGES) {
      if (stage.time === 0) continue;
      const timer = setTimeout(() => {
        setLoadingStageIndex((prev) => Math.min(prev + 1, LOADING_STAGES.length - 1));
      }, stage.time * 1000);
      timers.push(timer);
    }

    return (): void => {
      timers.forEach(clearTimeout);
    };
  }, [pageState]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const updateField = useCallback(
    <K extends keyof GenerateFormState>(field: K, value: GenerateFormState[K]): void => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const addCompetitorUrl = useCallback(
    (index: number, value: string): void => {
      setFormState((prev) => {
        const urls = [...prev.competitorUrls];
        urls[index] = value;
        return { ...prev, competitorUrls: urls };
      });
    },
    []
  );

  const handleGenerate = useCallback(async (): Promise<void> => {
    // Validate
    if (!formState.websiteId || !formState.keyword || !formState.intent) return;

    setPageState('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: formState.keyword,
          intent: formState.intent,
          location: formState.location,
          additionalInfo: formState.additionalInfo || undefined,
          websiteId: formState.websiteId,
          competitorUrls: formState.competitorUrls.filter(Boolean),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? 'Failed to generate brief');
      }

      if (!result.data) {
        throw new Error('Failed to generate brief');
      }

      setBriefResult({
        brief: result.data.brief,
        schema: result.data.schema,
        briefId: result.data.briefId,
      });

      setPageState('results');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
      setPageState('error');
    }
  }, [formState]);

  const resetForm = useCallback((): void => {
    setPageState('form');
    setBriefResult(null);
    setErrorMessage('');
    setLoadingStageIndex(0);
  }, []);

  // ── Derived state ────────────────────────────────────────────────────────

  const canGenerate =
    formState.websiteId && formState.keyword.trim() && formState.intent;

  const usageVariant =
    usageInfo && !usageInfo.isUnlimited
      ? usageInfo.percentUsed >= 100
        ? 'danger'
        : usageInfo.percentUsed >= 80
        ? 'warning'
        : 'default'
      : 'default';

  const usageColorClass =
    usageInfo && !usageInfo.isUnlimited
      ? usageInfo.percentUsed >= 100
        ? 'text-error'
        : usageInfo.percentUsed >= 80
        ? 'text-warning'
        : 'text-success'
      : 'text-text-muted';

  // ── Form State ───────────────────────────────────────────────────────────

  if (pageState === 'form') {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary lg:text-4xl">
            Generate New Brief
          </h1>
          <p className="mt-1 text-sm text-text-muted lg:text-base">
            Enter your keyword in any language — output is always in Arabic
          </p>
        </div>

        {/* No websites warning */}
        {!websitesLoading && websites.length === 0 && (
          <Card variant="default" className="border-warning/20 bg-warning/5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-warning" />
              <div>
                <p className="font-medium text-warning">
                  No websites found
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  You need to add a website before generating briefs. Your website data powers JSON-LD schema generation.
                </p>
                <Link href="/dashboard/websites/new" className="mt-3 inline-block">
                  <Button variant="primary" size="sm">
                    Add Website
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Form Card */}
        <Card variant="default" padding="lg">
          <div className="space-y-6">
            {/* ── Website Selector ─────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted">
                Website <span className="text-error">*</span>
              </label>
              <select
                value={formState.websiteId}
                onChange={(e): void => updateField('websiteId', e.target.value)}
                className={cn(
                  'h-11 w-full rounded-xl border bg-surface px-4 text-base text-text-primary transition-colors lg:h-10 lg:text-sm',
                  'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                  'border-surface-border',
                  websitesLoading && 'opacity-50'
                )}
                disabled={websitesLoading || websites.length === 0}
                aria-label="Select website"
              >
                <option value="" disabled>
                  {websitesLoading ? 'Loading websites...' : 'Select a website'}
                </option>
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.domain})
                  </option>
                ))}
              </select>
            </div>

            {/* ── Keyword Input ────────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted">
                Keyword or Topic <span className="text-error">*</span>
              </label>
              <input
                value={formState.keyword}
                onChange={(e): void => updateField('keyword', e.target.value)}
                placeholder="Enter in any language — Arabic, English, Malayalam..."
                className="h-11 w-full rounded-xl border border-surface-border bg-surface px-4 text-base text-text-primary transition-colors placeholder:text-text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:h-10 lg:text-sm"
                aria-label="Keyword or topic"
              />
              <p className="text-xs text-primary-light">
                All output will be in Arabic regardless of input language
              </p>
            </div>

            {/* ── Intent Selector (Cards) ──────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted">
                Search Intent <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {INTENT_OPTIONS.map((option) => {
                  const isSelected = formState.intent === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(): void => updateField('intent', option.value)}
                      className={cn(
                        'flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all',
                        'min-h-[88px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        'active:scale-[0.98]',
                        isSelected
                          ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/20'
                          : 'border-surface-border bg-surface-card hover:border-primary/30 hover:bg-primary/[0.02]'
                      )}
                      aria-pressed={isSelected}
                      aria-label={option.labelEn}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium text-text-primary">
                        {option.labelEn}
                      </span>
                      <span className="text-xs text-text-muted">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Location Selector ────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted">
                Target Location
              </label>
              <select
                value={formState.location}
                onChange={(e): void => updateField('location', e.target.value)}
                className="h-11 w-full rounded-xl border border-surface-border bg-surface px-4 text-base text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:h-10 lg:text-sm"
                aria-label="Target location"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Additional Info ──────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted">
                Additional Context (Optional)
              </label>
              <textarea
                value={formState.additionalInfo}
                onChange={(e): void => updateField('additionalInfo', e.target.value)}
                placeholder="Product details, unique angles, target audience..."
                rows={3}
                className="h-auto w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-base text-text-primary transition-colors placeholder:text-text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:text-sm"
                aria-label="Additional context"
              />
            </div>

            {/* ── Competitor URLs (Pro+ only) ──────────────────────────── */}
            <UpgradeGate
              requiredPlan="pro"
              currentPlan={userPlan}
              feature="Competitor URL analysis"
            >
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={(): void => setShowCompetitorUrls(!showCompetitorUrls)}
                  className="flex items-center gap-2 text-sm font-medium text-primary-light transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card"
                >
                  {showCompetitorUrls ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  Add Competitor URLs
                </button>

                {showCompetitorUrls && (
                  <div className="space-y-3 rounded-xl border border-surface-border bg-surface-card p-4">
                    {[0, 1, 2].map((index) => (
                      <input
                        key={index}
                        value={formState.competitorUrls[index] ?? ''}
                        onChange={(e): void => addCompetitorUrl(index, e.target.value)}
                        placeholder={`Competitor URL ${index + 1}`}
                        type="url"
                        className="h-11 w-full rounded-xl border border-surface-border bg-surface px-4 text-base text-text-primary transition-colors placeholder:text-text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:h-10 lg:text-sm"
                        aria-label={`Competitor URL ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </UpgradeGate>

            {/* ── Generate Button ──────────────────────────────────────── */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!canGenerate}
              onClick={handleGenerate}
            >
              <Sparkles size={18} />
              ✦ Generate Arabic Brief
            </Button>

            {/* ── Usage Counter ────────────────────────────────────────── */}
            {usageInfo && (
              <div className="space-y-2">
                <p className={cn('text-xs font-medium', usageColorClass)}>
                  {usageInfo.isUnlimited
                    ? 'Unlimited briefs'
                    : `${usageInfo.current} of ${usageInfo.limit} briefs used this month`}
                </p>
                {!usageInfo.isUnlimited && (
                  <ProgressBar
                    current={usageInfo.current}
                    max={usageInfo.limit}
                    showLabel={false}
                    barHeight="h-1.5"
                    variant={usageVariant}
                  />
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ── Loading State ─────────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div className="mx-auto max-w-3xl">
        <Card variant="default" padding="lg">
          <div className="flex flex-col items-center justify-center py-16">
            {/* Animated spinner */}
            <div className="relative mb-8">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-surface-border border-t-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={24} className="text-primary-light" />
              </div>
            </div>

            {/* Rotating stage messages */}
            <p className="text-center text-lg font-medium text-text-primary">
              {LOADING_STAGES[loadingStageIndex]?.message ?? 'Processing...'}
            </p>

            {/* Progress dots */}
            <div className="mt-6 flex items-center gap-2">
              {LOADING_STAGES.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors duration-300',
                    index <= loadingStageIndex ? 'bg-primary' : 'bg-surface-border'
                  )}
                />
              ))}
            </div>

            <p className="mt-8 text-sm text-text-muted">
              Generating Arabic SEO content brief with JSON-LD schema...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────

  if (pageState === 'error') {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card variant="default" padding="lg">
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
              <FileWarning size={28} className="text-error" />
            </div>

            <h2 className="text-xl font-bold text-text-primary">
              Generation Failed
            </h2>

            <p className="mt-2 text-sm text-text-muted">
              {errorMessage || 'An unexpected error occurred. Please try again.'}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Button variant="secondary" onClick={resetForm}>
                Try Again
              </Button>
              <Link href="/dashboard">
                <Button variant="ghost">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Results State ─────────────────────────────────────────────────────────

  if (pageState === 'results' && briefResult) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back button */}
        <button
          type="button"
          onClick={resetForm}
          className="flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card"
        >
          <ArrowLeft size={16} />
          Generate New Brief
        </button>

        {/* Brief metadata bar */}
        <Card variant="default" padding="sm">
          <div className="flex flex-wrap items-center gap-3 px-2 py-2">
            <span className="truncate text-sm font-medium text-text-primary">
              {formState.keyword}
            </span>
            <Badge variant="primary" size="sm">
              {formState.intent}
            </Badge>
            <Badge variant="default" size="sm">
              {COUNTRIES.find((c) => c.code === formState.location)?.flag}{' '}
              {COUNTRIES.find((c) => c.code === formState.location)?.nameEn}
            </Badge>
            {briefResult.brief.fundamentals?.estimatedWordCount && (
              <Badge variant="info" size="sm">
                ~{briefResult.brief.fundamentals.estimatedWordCount} words
              </Badge>
            )}
            <Badge variant="success" size="sm">
              Saved ✓
            </Badge>
          </div>
        </Card>

        {/* Brief Results Component */}
        <BriefResults
          brief={briefResult.brief}
          schema={briefResult.schema}
          briefId={briefResult.briefId}
        />
      </div>
    );
  }

  // Fallback (should never reach here)
  return (
    <div className="mx-auto max-w-3xl">
      <Card variant="default" padding="lg">
        <div className="flex flex-col items-center py-8 text-center">
          <p className="text-text-muted">Loading...</p>
        </div>
      </Card>
    </div>
  );
}
