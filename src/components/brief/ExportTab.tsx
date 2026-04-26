'use client';

import { useState, useCallback, type ReactElement } from 'react';
import { FileText, Copy, Check, Download, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { BriefOutput } from '@/types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ExportTabProps {
  brief: BriefOutput;
  briefId: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ExportTab({ brief, briefId }: ExportTabProps): ReactElement {
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [markdownCopied, setMarkdownCopied] = useState<boolean>(false);

  // ── Build Markdown from brief ────────────────────────────────────────────

  const buildMarkdown = useCallback((): string => {
    const { fundamentals, content } = brief;
    const lines: string[] = [];

    lines.push(`# ${fundamentals.pageTitle}`);
    lines.push('');
    lines.push(`> ${fundamentals.metaDescription}`);
    lines.push('');
    lines.push(`**Slug:** /${fundamentals.slug}`);
    lines.push(`**Intent:** ${fundamentals.searchIntent}`);
    lines.push(`**Target Location:** ${fundamentals.targetLocation}`);
    lines.push(`**Estimated Words:** ~${fundamentals.estimatedWordCount}`);
    lines.push(`**Primary Keyword:** ${fundamentals.primaryKeyword}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // H1
    lines.push(`## ${content.h1}`);
    lines.push('');

    // Direct Answer
    if (content.directAnswer?.text) {
      lines.push('### AI Snippet Target');
      lines.push('');
      lines.push(content.directAnswer.text);
      lines.push('');
    }

    // TL;DR
    if (content.tldr?.points?.length > 0) {
      lines.push(`### ${content.tldr.heading || 'TL;DR'}`);
      lines.push('');
      for (const point of content.tldr.points) {
        lines.push(`- ${point}`);
      }
      lines.push('');
    }

    // Outline
    for (const section of content.outline) {
      lines.push(`### ${section.h2}`);
      lines.push('');
      if (section.contentNotes) {
        lines.push(`*${section.contentNotes}*`);
        lines.push('');
      }
      for (const h3 of section.h3s) {
        lines.push(`#### ${h3.heading}`);
        lines.push('');
        if (h3.notes) {
          lines.push(h3.notes);
          lines.push('');
        }
      }
    }

    // Stats
    if (content.stats?.length > 0) {
      lines.push('### Key Statistics');
      lines.push('');
      for (const stat of content.stats) {
        lines.push(`- ${stat.claim} _(Source: ${stat.sourceOrg}, ${stat.year})_`);
      }
      lines.push('');
    }

    // Expert Quotes
    if (content.expertQuotes?.length > 0) {
      lines.push('### Expert Quotes');
      lines.push('');
      for (const quote of content.expertQuotes) {
        lines.push(`> ${quote.quoteText}`);
        lines.push(`> — ${quote.suggestedName}, ${quote.suggestedTitle} at ${quote.suggestedOrg}`);
        lines.push('');
      }
    }

    // FAQ
    if (content.faq?.length > 0) {
      lines.push('### Frequently Asked Questions');
      lines.push('');
      for (const item of content.faq) {
        lines.push(`**Q: ${item.question}**`);
        lines.push('');
        lines.push(item.answer);
        lines.push('');
      }
    }

    return lines.join('\n');
  }, [brief]);

  // ── Handle PDF Export ────────────────────────────────────────────────────

  const handlePdfExport = useCallback(async (): Promise<void> => {
    try {
      setPdfLoading(true);
      setPdfError(null);

      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Failed to generate PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brief-${briefId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Failed to export PDF');
    } finally {
      setPdfLoading(false);
    }
  }, [briefId]);

  // ── Handle Markdown Copy ─────────────────────────────────────────────────

  const handleCopyMarkdown = useCallback((): void => {
    const markdown = buildMarkdown();
    navigator.clipboard.writeText(markdown).then((): void => {
      setMarkdownCopied(true);
      setTimeout((): void => setMarkdownCopied(false), 2000);
    });
  }, [buildMarkdown]);

  return (
    <div className="space-y-6">
      {/* Download PDF */}
      <Card variant="default" padding="md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText size={18} className="text-primary-light" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Download PDF
              </h3>
              <p className="mt-0.5 text-xs text-text-muted">
                Export this brief as a formatted PDF document
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            isLoading={pdfLoading}
            onClick={handlePdfExport}
            fullWidth
          >
            <Download size={16} />
            Download PDF
          </Button>
        </div>
        {pdfError && (
          <p className="mt-3 text-sm text-error">{pdfError}</p>
        )}
      </Card>

      {/* Copy as Markdown */}
      <Card variant="default" padding="md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10">
              <Copy size={18} className="text-info" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Copy as Markdown
              </h3>
              <p className="mt-0.5 text-xs text-text-muted">
                Copy the entire brief as structured Markdown text
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={handleCopyMarkdown}
            fullWidth
          >
            {markdownCopied ? (
              <>
                <Check size={16} />
                Copied ✓
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy Markdown
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Saved confirmation */}
      <Card variant="default" padding="md" className="border-success/20 bg-success/5">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-success shrink-0" />
          <div>
            <p className="text-sm font-medium text-success">Brief saved successfully</p>
            <p className="text-xs text-text-muted">
              Brief ID: {briefId}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
