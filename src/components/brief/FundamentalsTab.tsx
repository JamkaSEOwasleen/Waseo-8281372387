'use client';

import { useState, useCallback, type ReactElement } from 'react';
import { Copy, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, IntentBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { BriefFundamentals } from '@/types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface FundamentalsTabProps {
  fundamentals: BriefFundamentals;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TITLE_MAX_CHARS = 60;
const META_MAX_CHARS = 155;

// ─── Component ───────────────────────────────────────────────────────────────

export function FundamentalsTab({
  fundamentals,
}: FundamentalsTabProps): ReactElement {
  const [copied, setCopied] = useState<boolean>(false);

  const {
    pageTitle,
    metaDescription,
    slug,
    searchIntent,
    estimatedWordCount,
    targetLocation,
    primaryKeyword,
  } = fundamentals;

  const titleCharCount = pageTitle.length;
  const metaCharCount = metaDescription.length;
  const isTitleOverLimit = titleCharCount > TITLE_MAX_CHARS;
  const isMetaOverLimit = metaCharCount > META_MAX_CHARS;

  const handleCopySlug = useCallback((): void => {
    navigator.clipboard.writeText(slug).then((): void => {
      setCopied(true);
      setTimeout((): void => setCopied(false), 2000);
    });
  }, [slug]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <Card variant="default" padding="md">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-muted">
              Page Title
            </label>
            <Badge
              variant={isTitleOverLimit ? 'error' : 'default'}
              size="sm"
            >
              {titleCharCount}/{TITLE_MAX_CHARS}
            </Badge>
          </div>
          <p
            className={cn(
              'text-base font-semibold lg:text-lg',
              isTitleOverLimit ? 'text-error' : 'text-text-primary'
            )}
          >
            {pageTitle}
          </p>
        </div>
      </Card>

      {/* Meta Description */}
      <Card variant="default" padding="md">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-muted">
              Meta Description
            </label>
            <Badge
              variant={isMetaOverLimit ? 'error' : 'default'}
              size="sm"
            >
              {metaCharCount}/{META_MAX_CHARS}
            </Badge>
          </div>
          <p
            className={cn(
              'text-sm lg:text-base',
              isMetaOverLimit ? 'text-error' : 'text-text-primary'
            )}
          >
            {metaDescription}
          </p>
        </div>
      </Card>

      {/* URL Slug with Copy */}
      <Card variant="default" padding="md">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-text-muted">
            URL Slug
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-surface px-3 py-2 text-sm font-mono text-primary-light">
              /{slug}
            </code>
            <button
              type="button"
              onClick={handleCopySlug}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-lg transition-colors lg:h-10 lg:w-10',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card',
                copied
                  ? 'bg-success/10 text-success'
                  : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-primary'
              )}
              aria-label={copied ? 'Copied' : 'Copy slug'}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </Card>

      {/* Details Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search Intent */}
        <Card variant="default" padding="sm">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">
              Search Intent
            </label>
            <IntentBadge intent={searchIntent} />
          </div>
        </Card>

        {/* Primary Keyword */}
        <Card variant="default" padding="sm">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">
              Primary Keyword
            </label>
            <span className="text-sm font-medium text-text-primary">
              {primaryKeyword}
            </span>
          </div>
        </Card>

        {/* Target Location */}
        <Card variant="default" padding="sm">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">
              Target Location
            </label>
            <span className="text-sm font-medium text-text-primary">
              {targetLocation}
            </span>
          </div>
        </Card>

        {/* Estimated Word Count */}
        <Card variant="default" padding="sm">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">
              Estimated Word Count
            </label>
            <span className="text-sm font-medium text-text-primary">
              ~{estimatedWordCount.toLocaleString()} words
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
