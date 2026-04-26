'use client';

import { useState, type ReactElement } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import type { BriefOutput, SchemaOutput } from '@/types';
import { FundamentalsTab } from '@/components/brief/FundamentalsTab';
import { ContentTab } from '@/components/brief/ContentTab';
import { GeoTab } from '@/components/brief/GeoTab';
import { SchemaTab } from '@/components/brief/SchemaTab';
import { ExportTab } from '@/components/brief/ExportTab';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface BriefResultsProps {
  /** The complete content brief output from Deepseek Call 1 */
  brief: BriefOutput;
  /** The JSON-LD schema output from Deepseek Call 2 */
  schema: SchemaOutput;
  /** The brief ID from the database */
  briefId: string;
}

// ─── Tab Definitions ─────────────────────────────────────────────────────────

interface TabDefinition {
  value: string;
  labelMobile: string;
  labelDesktop: string;
}

const TABS: TabDefinition[] = [
  { value: 'fundamentals', labelMobile: 'الأساسيات', labelDesktop: 'Fundamentals' },
  { value: 'content', labelMobile: 'الهيكل', labelDesktop: 'Content Structure' },
  { value: 'geo', labelMobile: 'GEO', labelDesktop: 'GEO Elements' },
  { value: 'schema', labelMobile: 'Schema', labelDesktop: 'JSON-LD Schema' },
  { value: 'export', labelMobile: 'تصدير', labelDesktop: 'Export' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function BriefResults({
  brief,
  schema,
  briefId,
}: BriefResultsProps): ReactElement {
  const [activeTab, setActiveTab] = useState<string>('fundamentals');

  return (
    <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Tab Bar — horizontal scroll on mobile */}
      <div className="overflow-x-auto scrollbar-hide border-b border-surface-border">
        <Tabs.List className="flex min-w-max gap-1 px-1" role="tablist">
          {TABS.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'flex h-11 items-center whitespace-nowrap rounded-t-lg px-4 text-sm font-medium transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card',
                'lg:h-10 lg:px-5',
                activeTab === tab.value
                  ? 'border-b-2 border-primary text-primary-light'
                  : 'text-text-muted hover:text-text-primary'
              )}
              role="tab"
              aria-selected={activeTab === tab.value}
            >
              {/* Mobile label */}
              <span className="lg:hidden">{tab.labelMobile}</span>
              {/* Desktop label */}
              <span className="hidden lg:inline">{tab.labelDesktop}</span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        <Tabs.Content value="fundamentals" className="focus:outline-none">
          <FundamentalsTab fundamentals={brief.fundamentals} />
        </Tabs.Content>

        <Tabs.Content value="content" className="focus:outline-none">
          <ContentTab content={brief.content} />
        </Tabs.Content>

        <Tabs.Content value="geo" className="focus:outline-none">
          <GeoTab
            stats={brief.content.stats}
            expertQuotes={brief.content.expertQuotes}
            comparisonTable={brief.content.comparisonTable}
            howToSteps={brief.content.howToSteps}
            faq={brief.content.faq}
            intent={brief.fundamentals.searchIntent}
          />
        </Tabs.Content>

        <Tabs.Content value="schema" className="focus:outline-none">
          <SchemaTab schema={schema} />
        </Tabs.Content>

        <Tabs.Content value="export" className="focus:outline-none">
          <ExportTab brief={brief} briefId={briefId} />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
