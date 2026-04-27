'use client';

import { motion, type Variants } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import type { PSEOStat } from '@/types/pseo';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PSEOStatsSectionProps {
  stats: PSEOStat[];
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function PSEOStatsSection({
  stats,
}: PSEOStatsSectionProps): React.ReactElement {
  if (!stats || stats.length === 0) {
    return <></>;
  }

  return (
    <section className="border-b border-surface-border py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="mb-8 text-xl font-bold text-text-primary lg:text-2xl">
          Statistics & Figures
        </h2>

        <motion.div
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {stats.map((stat: PSEOStat, index: number) => (
            <motion.div
              key={`stat-${index}`}
              variants={cardVariants}
              className="rounded-xl bg-surface-card border border-surface-border p-4 lg:p-6"
            >
              <div className="text-2xl font-bold text-primary-light lg:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-text-muted">{stat.label}</div>
              <div className="mt-2 text-xs text-text-muted">
                {stat.source}
                {stat.sourceNeedsVerification && (
                  <Badge variant="warning" size="sm" className="mr-2">
                    SOURCE: verify
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
