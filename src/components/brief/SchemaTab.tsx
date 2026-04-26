'use client';

import { useState, useCallback, type ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { Copy, Check, Download, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { SchemaOutput } from '@/types';

// ─── Dynamic Import (heavy component) ────────────────────────────────────────

const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  { ssr: false }
);

// ─── Props ───────────────────────────────────────────────────────────────────

interface SchemaTabProps {
  schema: SchemaOutput;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SchemaTab({ schema }: SchemaTabProps): ReactElement {
  const [copied, setCopied] = useState<boolean>(false);
  const [copyError, setCopyError] = useState<boolean>(false);

  const schemaJson = JSON.stringify(schema, null, 2);
  const nodeCount = schema['@graph']?.length ?? 0;

  const handleCopy = useCallback((): void => {
    navigator.clipboard
      .writeText(schemaJson)
      .then((): void => {
        setCopied(true);
        setCopyError(false);
        setTimeout((): void => setCopied(false), 2000);
      })
      .catch((): void => {
        setCopyError(true);
        setTimeout((): void => setCopyError(false), 2000);
      });
  }, [schemaJson]);

  const handleDownload = useCallback((): void => {
    const blob = new Blob([schemaJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [schemaJson]);

  const handleTestGoogle = useCallback((): void => {
    const encoded = encodeURIComponent(schemaJson);
    window.open(
      `https://search.google.com/test/rich-results?url=&schema=${encoded}`,
      '_blank',
      'noopener,noreferrer'
    );
  }, [schemaJson]);

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="info" size="md">
            {nodeCount} schema {nodeCount === 1 ? 'node' : 'nodes'}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors lg:h-10',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card',
              copied
                ? 'bg-success/10 text-success'
                : copyError
                ? 'bg-error/10 text-error'
                : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-primary'
            )}
            aria-label={copied ? 'Copied' : 'Copy schema'}
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied ✓
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy
              </>
            )}
          </button>

          {/* Download button */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex h-11 items-center gap-2 rounded-xl bg-white/5 px-4 text-sm font-medium text-text-muted transition-colors hover:bg-white/10 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card lg:h-10"
            aria-label="Download schema JSON"
          >
            <Download size={16} />
            .json
          </button>

          {/* Google Rich Results Test */}
          <button
            type="button"
            onClick={handleTestGoogle}
            className="flex h-11 items-center gap-2 rounded-xl bg-primary/10 px-4 text-sm font-medium text-primary-light transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card lg:h-10"
            aria-label="Test in Google Rich Results"
          >
            <ExternalLink size={16} />
            Test in Google
          </button>
        </div>
      </div>

      {/* Schema Code Block */}
      <Card variant="default" padding="sm">
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language="json"
            customStyle={{
              background: 'transparent',
              padding: '1rem',
              fontSize: '12px',
              margin: 0,
              borderRadius: '0.75rem',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              },
            }}
          >
            {schemaJson}
          </SyntaxHighlighter>
        </div>
      </Card>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
