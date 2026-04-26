'use client';

import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import type { PSEOPageSection } from '@/types/pseo';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PSEOContentSectionProps {
  sections: PSEOPageSection[];
}

// ─── HTML Sanitizer — strip script/iframe tags ───────────────────────────────

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

// ─── Render Section Content ───────────────────────────────────────────────────

function renderSectionContent(section: PSEOPageSection): ReactElement {
  const cleanContent = sanitizeHtml(section.content);

  switch (section.type) {
    case 'paragraph':
      return (
        <p className="text-sm leading-relaxed text-text-muted lg:text-base">
          <span dangerouslySetInnerHTML={{ __html: cleanContent }} />
        </p>
      );

    case 'list':
      return (
        <ul
          className="list-inside list-disc space-y-2 text-sm leading-relaxed text-text-muted lg:text-base"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />
      );

    case 'table':
      return (
        <div className="-mx-4 overflow-x-auto px-4">
          <table
            className="min-w-[600px] w-full border-collapse text-sm lg:text-base"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        </div>
      );

    case 'blockquote':
      return (
        <blockquote
          className={cn(
            'border-r-4 border-primary pr-4 text-sm italic leading-relaxed',
            'text-text-muted lg:text-base',
          )}
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />
      );

    case 'cta':
      return (
        <Card variant="hover" className="border-primary/20 bg-primary/5">
          <div
            className="text-sm leading-relaxed lg:text-base"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        </Card>
      );

    default:
      return (
        <div
          className="text-sm leading-relaxed text-text-muted lg:text-base"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />
      );
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function PSEOContentSection({
  sections,
}: PSEOContentSectionProps): ReactElement {
  if (!sections || sections.length === 0) {
    return <></>;
  }

  return (
    <section className="border-b border-surface-border py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.id}>
              {/* Heading */}
              <h2 className="mb-4 text-xl font-bold text-text-primary lg:text-2xl">
                {section.heading}
              </h2>

              {/* Content */}
              {renderSectionContent(section)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
