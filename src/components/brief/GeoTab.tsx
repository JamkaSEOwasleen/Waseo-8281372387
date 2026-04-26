'use client';

import { type ReactElement } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, AlertTriangle, Quote, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type {
  Stat,
  ExpertQuote,
  ComparisonTable,
  HowToSteps,
  FAQ,
  IntentType,
} from '@/types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface GeoTabProps {
  stats: Stat[];
  expertQuotes: ExpertQuote[];
  comparisonTable: ComparisonTable | null;
  howToSteps: HowToSteps | null;
  faq: FAQ[];
  intent: IntentType;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GeoTab({
  stats,
  expertQuotes,
  comparisonTable,
  howToSteps,
  faq,
  intent,
}: GeoTabProps): ReactElement {
  const isComparison = intent === 'comparison' || intent === 'commercial';
  const isHowTo = intent === 'how-to';

  return (
    <div className="space-y-8">
      {/* ── Stats Cards ────────────────────────────────────────────── */}
      {stats.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-text-primary lg:text-lg">
            Key Statistics
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stats.map((stat: Stat, index: number) => (
              <Card key={index} variant="default" padding="md">
                <div className="flex flex-col gap-2">
                  <BarChart3 size={18} className="text-primary-light" />
                  <p className="text-sm leading-relaxed text-text-primary lg:text-base">
                    {stat.claim}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>Source: {stat.sourceOrg}</span>
                    <span>·</span>
                    <span>{stat.year}</span>
                  </div>
                  <Badge
                    variant="warning"
                    size="sm"
                    className="flex items-center gap-1 self-start"
                  >
                    <AlertTriangle size={10} />
                    {stat.placeholderFlag || 'SOURCE: verify'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Expert Quotes ──────────────────────────────────────────── */}
      {expertQuotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-text-primary lg:text-lg">
            Expert Quotes
          </h3>
          <div className="space-y-4">
            {expertQuotes.map((quote: ExpertQuote, index: number) => (
              <Card key={index} variant="default" padding="md">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <Quote size={18} className="mt-0.5 shrink-0 text-primary-light" />
                    <blockquote className="text-sm italic leading-relaxed text-text-primary lg:text-base">
                      &ldquo;{quote.quoteText}&rdquo;
                    </blockquote>
                  </div>
                  <div className="flex flex-col gap-1 border-t border-surface-border pt-3">
                    <p className="text-sm font-medium text-text-primary">
                      {quote.suggestedName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {quote.suggestedTitle} at {quote.suggestedOrg}
                    </p>
                    <p className="text-xs text-text-muted">
                      Appears in: {quote.appearsInSection}
                    </p>
                  </div>
                  <Badge
                    variant="warning"
                    size="sm"
                    className="flex items-center gap-1 self-start"
                  >
                    <AlertTriangle size={10} />
                    {quote.placeholderFlag || 'REPLACE WITH REAL QUOTE'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Comparison Table ───────────────────────────────────────── */}
      {isComparison && comparisonTable && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-text-primary lg:text-lg">
            Comparison Table
          </h3>
          <Card variant="default" padding="md">
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="min-w-[600px] w-full">
                <caption className="mb-2 text-left text-sm font-medium text-text-muted">
                  {comparisonTable.caption}
                </caption>
                <thead>
                  <tr className="border-b border-surface-border">
                    {comparisonTable.headers.map(
                      (header: string, index: number) => (
                        <th
                          key={index}
                          className={cn(
                            'px-4 py-3 text-left text-xs font-medium text-text-muted',
                            index === 0 ? 'text-text-primary' : ''
                          )}
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {comparisonTable.rows.map(
                    (row: string[], rowIndex: number) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-surface-border last:border-0 hover:bg-white/[0.02]"
                      >
                        {row.map((cell: string, cellIndex: number) => (
                          <td
                            key={cellIndex}
                            className={cn(
                              'px-4 py-3 text-sm',
                              cellIndex === 0
                                ? 'font-medium text-text-primary'
                                : 'text-text-muted'
                            )}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
            {comparisonTable.verdict && (
              <div className="mt-4 rounded-lg bg-primary/5 px-4 py-3">
                <p className="text-sm font-medium text-primary-light">
                  {comparisonTable.verdict}
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── How-To Steps ───────────────────────────────────────────── */}
      {isHowTo && howToSteps && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-text-primary lg:text-lg">
            {howToSteps.heading || 'Step-by-Step Guide'}
          </h3>
          {howToSteps.totalTime && (
            <p className="text-sm text-text-muted">
              Total time: {howToSteps.totalTime}
            </p>
          )}
          <div className="space-y-3">
            {howToSteps.steps.map((step) => (
              <Card key={step.stepNumber} variant="default" padding="md">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary-light">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-semibold text-text-primary">
                      {step.name}
                    </h4>
                    <p className="text-sm text-text-muted">
                      {step.description}
                    </p>
                    {step.tip && (
                      <p className="text-xs text-primary-light">
                        💡 Tip: {step.tip}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── FAQ Accordion ──────────────────────────────────────────── */}
      {faq.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-text-primary lg:text-lg">
            Frequently Asked Questions
          </h3>
          <Card variant="default" padding="sm">
            <Accordion.Root type="single" collapsible className="space-y-1">
              {faq.map((item: FAQ, index: number) => (
                <Accordion.Item
                  key={index}
                  value={`faq-${index}`}
                  className="border-b border-surface-border last:border-0"
                >
                  <Accordion.Header>
                    <Accordion.Trigger
                      className={cn(
                        'flex w-full items-center justify-between px-3 py-3 text-left text-sm font-medium text-text-primary transition-colors',
                        'hover:text-primary-light focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card',
                        'lg:py-4'
                      )}
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        size={16}
                        className="shrink-0 text-text-muted transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="px-3 pb-3 text-sm text-text-muted lg:pb-4">
                      {item.answer}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </Card>
        </div>
      )}
    </div>
  );
}
