'use client';

import { useState, useEffect, useCallback, type ReactElement } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, IntentBadge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatDateAr } from '@/lib/utils';
import type { Brief } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BriefsResponse {
  data: Brief[];
  count: number;
  page: number;
  totalPages: number;
  websiteNames: Record<string, { name: string; domain: string }>;
  error: string | null;
}

interface BriefCardProps {
  brief: Brief;
  websiteName: string | null;
  websiteDomain: string | null;
}

// ─── Sort Options ────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
] as const;

const INTENT_FILTERS = [
  { value: '', label: 'جميع الأنواع' },
  { value: 'informational', label: 'معلوماتي' },
  { value: 'how-to', label: 'كيف تفعل' },
  { value: 'commercial', label: 'تجاري' },
  { value: 'comparison', label: 'مقارنة' },
  { value: 'navigational', label: 'تنقلي' },
] as const;

// ─── Brief Card ──────────────────────────────────────────────────────────────

function BriefCard({
  brief,
  websiteName,
  websiteDomain,
}: BriefCardProps): ReactElement {
  const output = brief.output;
  const directAnswer = output?.content?.directAnswer?.text;

  return (
    <Link href={`/dashboard/briefs/${brief.id}`}>
      <Card
        variant="hover"
        padding="sm"
        className="group h-full cursor-pointer transition-all duration-200 hover:border-primary/30"
      >
        <div className="flex h-full flex-col gap-3 p-2">
          {/* Header: keyword + intent badge */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-semibold text-text-primary lg:text-lg">
              {brief.keyword}
            </h3>
            <IntentBadge intent={brief.intent} />
          </div>

          {/* Website info */}
          {websiteName && (
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              <span className="line-clamp-1">{websiteName}</span>
              {websiteDomain && (
                <span className="hidden lg:inline">— {websiteDomain}</span>
              )}
            </div>
          )}

          {/* Direct answer excerpt */}
          {directAnswer && (
            <p className="line-clamp-2 text-sm text-text-secondary">
              {directAnswer}
            </p>
          )}

          {/* Footer: date + word count */}
          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-text-muted">
            <span>{formatDateAr(brief.created_at)}</span>
            <div className="flex items-center gap-3">
              {output?.fundamentals?.estimatedWordCount && (
                <span>
                  ~{output.fundamentals.estimatedWordCount.toLocaleString('ar-AE')}{' '}
                  كلمة
                </span>
              )}
              <span className="hidden text-primary-light transition-colors group-hover:text-primary lg:inline">
                عرض ←
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ─── Main Client Component ──────────────────────────────────────────────────

export function BriefsListClient(): ReactElement {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [websiteNames, setWebsiteNames] = useState<
    Record<string, { name: string; domain: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [intent, setIntent] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  // Debounce timer
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch briefs
  const fetchBriefs = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (intent) params.set('intent', intent);
      params.set('sort', sort);
      params.set('page', String(page));

      const res = await fetch(`/api/briefs?${params.toString()}`);
      const json: BriefsResponse = await res.json();

      if (json.error) {
        console.error('Failed to fetch briefs:', json.error);
        return;
      }

      setBriefs(json.data);
      setWebsiteNames(json.websiteNames);
      setTotalPages(json.totalPages);
      setTotalCount(json.count);
    } catch (err) {
      console.error('Failed to fetch briefs:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, intent, sort, page]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchBriefs();
  }, [fetchBriefs]);

  // ── Reset to page 1 when filters change ──
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, intent, sort]);

  return (
    <div className="space-y-6">
      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
      <Card padding="sm" className="space-y-4">
        {/* Search + Intent row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          {/* Search input */}
          <div className="relative flex-1">
            <svg
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="البحث عن كلمة مفتاحية..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-lg border border-surface-border bg-surface-card pl-4 pr-10 text-base text-text-primary placeholder-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:h-10 lg:text-sm"
              inputMode="search"
            />
          </div>

          {/* Intent filter */}
          <select
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            className="h-11 w-full rounded-lg border border-surface-border bg-surface-card px-3 text-base text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:h-10 lg:w-44 lg:text-sm"
          >
            {INTENT_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
            className="h-11 w-full rounded-lg border border-surface-border bg-surface-card px-3 text-base text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:h-10 lg:w-40 lg:text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        {!loading && (
          <div className="text-xs text-text-muted">
            {totalCount > 0
              ? `إجمالي ${totalCount.toLocaleString('ar-AE')} موجز`
              : 'لا توجد موجزات'}
          </div>
        )}
      </Card>

      {/* ── Loading State ──────────────────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Empty State ────────────────────────────────────────────────────── */}
      {!loading && briefs.length === 0 && (
        <Card variant="default" padding="lg">
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 text-4xl">📋</div>
            <h3 className="text-lg font-semibold text-text-primary">
              {search || intent
                ? 'لا توجد نتائج للبحث'
                : 'لم تقم بإنشاء أي موجز بعد'}
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              {search || intent
                ? 'حاول تغيير معايير البحث أو إزالة الفلاتر'
                : 'ابدأ بإنشاء أول موجز محتوى محسّن لمحركات البحث باللغة العربية'}
            </p>
            <Link href="/dashboard/generate" className="mt-6">
              <Button variant="primary" size="md">
                إنشاء موجز جديد
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ── Brief Cards Grid ───────────────────────────────────────────────── */}
      {!loading && briefs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {briefs.map((brief) => {
            const siteInfo = brief.website_id
              ? websiteNames[brief.website_id]
              : null;
            return (
              <BriefCard
                key={brief.id}
                brief={brief}
                websiteName={siteInfo?.name ?? null}
                websiteDomain={siteInfo?.domain ?? null}
              />
            );
          })}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            السابق
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              // Show pages around current page
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors lg:h-9 lg:w-9 ${
                    page === pageNum
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                  }`}
                >
                  {pageNum.toLocaleString('ar-AE')}
                </button>
              );
            })}
          </div>

          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
}
