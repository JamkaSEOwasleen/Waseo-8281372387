'use client';

import { type ReactElement } from 'react';
import { Info, BarChart3, Quote, Table, List, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { BriefContent } from '@/types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ContentTabProps {
  content: BriefContent;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ContentTab({ content }: ContentTabProps): ReactElement {
  const { h1, directAnswer, tldr, outline } = content;

  return (
    <div className="space-y-6">
      {/* H1 Display */}
      <Card variant="default" padding="md" className="border-primary/20 bg-primary/5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-primary-light">
            H1 Heading
          </label>
          <h2 className="text-xl font-bold text-text-primary lg:text-2xl">
            {h1}
          </h2>
        </div>
      </Card>

      {/* Direct Answer (AI Snippet Target) */}
      <Card variant="default" padding="md">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-text-muted">
              AI Snippet Target
            </label>
            <div className="group relative">
              <Info size={14} className="text-text-muted cursor-help" />
              <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-surface-card px-3 py-2 text-xs text-text-muted shadow-lg group-hover:block">
                This text is optimized for AI answer engines
              </div>
            </div>
          </div>
          <p className="rounded-lg border border-surface-border bg-surface p-4 text-sm leading-relaxed text-text-primary lg:text-base">
            {directAnswer.text}
          </p>
        </div>
      </Card>

      {/* TL;DR Section */}
      <Card variant="default" padding="md">
        <div className="flex flex-col gap-3">
          <label className="text-xs font-medium text-text-muted">
            {tldr.heading || 'TL;DR'}
          </label>
          <ul className="space-y-2">
            {tldr.points.map((point: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm text-text-primary lg:text-base">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-light" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Full Outline Tree */}
      <div>
        <label className="mb-3 block text-xs font-medium text-text-muted">
          Content Outline
        </label>
        <div className="space-y-3">
          {outline.map((section, index: number) => (
            <Card key={index} variant="default" padding="md">
              {/* H2 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-semibold text-text-primary lg:text-lg">
                    {section.h2}
                  </h3>

                  {/* Section badges */}
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {section.includesStats && (
                      <Badge variant="info" size="sm" className="flex items-center gap-1">
                        <BarChart3 size={10} />
                        Stats
                      </Badge>
                    )}
                    {section.includesQuote && (
                      <Badge variant="warning" size="sm" className="flex items-center gap-1">
                        <Quote size={10} />
                        Quote
                      </Badge>
                    )}
                    {section.includesTable && (
                      <Badge variant="primary" size="sm" className="flex items-center gap-1">
                        <Table size={10} />
                        Table
                      </Badge>
                    )}
                    {section.includesList && (
                      <Badge variant="success" size="sm" className="flex items-center gap-1">
                        <List size={10} />
                        List
                      </Badge>
                    )}
                  </div>
                </div>

                {/* H3s */}
                {section.h3s && section.h3s.length > 0 && (
                  <div className="mt-2 space-y-2 border-l-2 border-surface-border pl-4">
                    {section.h3s.map((h3, h3Index: number) => (
                      <div key={h3Index} className="flex flex-col gap-0.5">
                        <h4 className="text-sm font-medium text-text-primary">
                          {h3.heading}
                        </h4>
                        {h3.notes && (
                          <p className="text-xs text-text-muted">{h3.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Content notes */}
                {section.contentNotes && (
                  <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-primary/5 px-3 py-2">
                    <Lightbulb size={12} className="mt-0.5 shrink-0 text-primary-light" />
                    <p className="text-xs text-text-muted">
                      {section.contentNotes}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
