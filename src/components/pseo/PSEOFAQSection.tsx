'use client';

import type { ReactElement } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PSEOFAQ } from '@/types/pseo';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PSEOFAQSectionProps {
  faqs: PSEOFAQ[];
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function PSEOFAQSection({ faqs }: PSEOFAQSectionProps): ReactElement {
  if (!faqs || faqs.length === 0) {
    return <></>;
  }

  return (
    <section className="border-b border-surface-border py-12 lg:py-16">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <h2 className="mb-8 text-xl font-bold text-text-primary lg:text-2xl">
          الأسئلة الشائعة
        </h2>

        <Accordion.Root
          type="single"
          collapsible
          className="space-y-3"
          dir="rtl"
        >
          {faqs.map((faq: PSEOFAQ, index: number) => (
            <Accordion.Item
              key={`faq-${index}`}
              value={`faq-${index}`}
              className={cn(
                'rounded-xl border border-surface-border bg-surface-card',
                'overflow-hidden',
              )}
            >
              <Accordion.Header>
                <Accordion.Trigger
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-4 py-4 text-right',
                    'text-sm font-medium text-text-primary lg:text-base',
                    'hover:bg-white/5 transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                    'group',
                  )}
                >
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      'shrink-0 text-text-muted transition-transform duration-200',
                      'group-data-[state=open]:rotate-180',
                    )}
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content
                className={cn(
                  'overflow-hidden px-4 pb-4',
                  'transition-all duration-200',
                )}
              >
                <div className="text-sm leading-relaxed text-text-muted lg:text-base">
                  {faq.answer}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
