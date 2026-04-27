import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { PSEOInternalLink } from '@/types/pseo';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PSEOInternalLinksProps {
  links: PSEOInternalLink[];
}

// ─── Type → Badge Variant Map ─────────────────────────────────────────────────

const TYPE_BADGE: Record<string, { label: string; variant: 'primary' | 'success' | 'info' | 'warning' }> = {
  hub: { label: 'Hub', variant: 'primary' },
  spoke: { label: 'Spoke', variant: 'success' },
  related: { label: 'Related', variant: 'info' },
  nearby: { label: 'Nearby', variant: 'warning' },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function PSEOInternalLinks({
  links,
}: PSEOInternalLinksProps): React.ReactElement {
  if (!links || links.length === 0) {
    return <></>;
  }

  return (
    <section className="border-b border-surface-border py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="mb-8 text-xl font-bold text-text-primary lg:text-2xl">
          Read Also
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {links.map((link: PSEOInternalLink, index: number) => {
            const badgeConfig = TYPE_BADGE[link.type] ?? {
              label: link.type,
              variant: 'default' as const,
            };

            return (
              <Link key={`link-${index}`} href={link.href}>
                <Card
                  variant="hover"
                  padding="md"
                  className="h-full cursor-pointer"
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-text-primary lg:text-base">
                      {link.text}
                    </span>
                    <div>
                      <Badge variant={badgeConfig.variant} size="sm">
                        {badgeConfig.label}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
