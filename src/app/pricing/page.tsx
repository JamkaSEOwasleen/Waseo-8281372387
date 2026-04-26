'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Check, X as XIcon } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { PLANS } from '@/lib/constants';
import type { PlanConfig } from '@/types';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

interface ComparisonRow {
  feature: string;
  starter: string | boolean;
  pro: string | boolean;
  agency: string | boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: 'Monthly briefs', starter: '30', pro: '150', agency: 'Unlimited' },
  { feature: 'Websites', starter: '1', pro: '3', agency: 'Unlimited' },
  { feature: 'History', starter: '30 days', pro: '90 days', agency: 'Unlimited' },
  { feature: 'Team seats', starter: '1', pro: '3', agency: '10' },
  { feature: 'Full Arabic SEO brief', starter: true, pro: true, agency: true },
  { feature: 'JSON-LD schema', starter: true, pro: true, agency: true },
  { feature: 'PDF export', starter: true, pro: true, agency: true },
  {
    feature: 'Competitor URL analysis',
    starter: false,
    pro: true,
    agency: true,
  },
  { feature: 'White-label export', starter: false, pro: false, agency: true },
  { feature: 'Priority support', starter: false, pro: true, agency: true },
  { feature: 'Onboarding call', starter: false, pro: false, agency: true },
];

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is WasafSEO?',
    answer:
      'WasafSEO is an AI-powered Arabic SEO content brief generator. It creates complete, production-ready Arabic content briefs with JSON-LD schema, GEO optimization, and E-E-A-T signals built in.',
  },
  {
    question: 'How does the free trial work?',
    answer:
      'The Starter plan includes a 3-day free trial with 3 briefs. No credit card required. After your trial, you can choose to subscribe or your access will be limited.',
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Yes, you can upgrade or downgrade at any time. When upgrading, you get immediate access to new features. When downgrading, changes apply at the next billing cycle.',
  },
  {
    question: 'What languages does the output support?',
    answer:
      'You can input keywords in any language, but the output is always in professional Arabic. This is a core product feature — WasafSEO is built specifically for Arabic content.',
  },
  {
    question: 'Is there a refund policy?',
    answer:
      'We do not offer refunds as you can try the product free for 3 days before committing. If you experience issues, contact support at support@wasleen.com.',
  },
];

// ─── Plan Card ────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: PlanConfig;
  isAnnual: boolean;
  index: number;
}

function PlanCard({ plan, isAnnual, index }: PlanCardProps): React.ReactElement {
  const price = isAnnual ? plan.annualPrice : plan.price;
  const period = isAnnual ? '/year' : '/month';
  const isPro = plan.id === 'pro';
  const isStarter = plan.id === 'starter';

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border bg-surface-card p-6 transition-all hover:border-primary/30 lg:p-8',
        isPro
          ? 'border-primary/50 shadow-lg shadow-primary/10'
          : 'border-surface-border'
      )}
    >
      {/* Badge */}
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-block rounded-full bg-primary px-4 py-1 text-[11px] font-semibold text-white shadow-lg">
            Most Popular
          </span>
        </div>
      )}
      {isStarter && (
        <div className="mb-2">
          <span className="inline-block rounded-full bg-success/10 px-3 py-0.5 text-[11px] font-medium text-success">
            3-day free trial
          </span>
        </div>
      )}

      {/* Plan name & price */}
      <h3 className="mt-2 font-display text-xl font-bold text-text-primary">
        {plan.name}
      </h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-display text-4xl font-bold text-text-primary">
          ${price}
        </span>
        <span className="text-sm text-text-muted">{period}</span>
      </div>
      {isAnnual && (
        <p className="mt-1 text-xs text-success">
          2 months free with annual billing
        </p>
      )}

      {/* Features */}
      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check size={16} className="mt-0.5 shrink-0 text-success" />
            <span className="text-sm text-text-muted">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href="/login"
        className={cn(
          'mt-8 flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all active:scale-95',
          isPro
            ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-dark'
            : 'border border-surface-border text-text-primary hover:bg-primary/10'
        )}
      >
        {isStarter ? 'Start Free Trial' : 'Get Started'}
      </Link>
    </div>
  );
}

// ─── Pricing Page ─────────────────────────────────────────────────────────────

export default function PricingPage(): React.ReactElement {
  const [isAnnual, setIsAnnual] = useState<boolean>(false);

  const toggleBilling = useCallback((): void => {
    setIsAnnual((prev) => !prev);
  }, []);

  return (
    <div className="flex-1">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section className="px-4 pb-8 pt-12 lg:pb-12 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-3xl font-extrabold text-text-primary lg:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-text-muted lg:text-base">
            Choose the plan that fits your Arabic content needs. All plans include
            a 3-day free trial on Starter.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={toggleBilling}
              className={cn(
                'text-sm font-medium transition-colors',
                !isAnnual ? 'text-text-primary' : 'text-text-muted'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={toggleBilling}
              className={cn(
                'relative h-7 w-12 rounded-full transition-colors',
                isAnnual ? 'bg-primary' : 'bg-surface-border'
              )}
              aria-label="Toggle annual billing"
            >
              <span
                className={cn(
                  'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                  isAnnual ? 'translate-x-[22px]' : 'translate-x-0.5'
                )}
              />
            </button>
            <button
              type="button"
              onClick={toggleBilling}
              className={cn(
                'text-sm font-medium transition-colors',
                isAnnual ? 'text-text-primary' : 'text-text-muted'
              )}
            >
              Annual
            </button>
          </div>
          {isAnnual && (
            <p className="mt-3 text-xs text-success">
              Save up to 17% with annual billing
            </p>
          )}
        </div>
      </section>

      {/* ── Plan Cards ──────────────────────────────────────────────────── */}
      <section className="px-4 pb-12 lg:pb-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {PLANS.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isAnnual={isAnnual}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* ── Comparison Table ────────────────────────────────────────────── */}
      <section className="border-t border-surface-border px-4 py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-text-primary lg:text-3xl">
            Compare Plans
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                    Feature
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">
                    Starter
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-primary-light">
                    Pro
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">
                    Agency
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(({ feature, starter, pro, agency }) => (
                  <tr
                    key={feature}
                    className="border-b border-surface-border/50 transition-colors hover:bg-surface-card/50"
                  >
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {feature}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-text-muted">
                      {typeof starter === 'boolean' ? (
                        starter ? (
                          <Check
                            size={16}
                            className="mx-auto text-success"
                          />
                        ) : (
                          <XIcon
                            size={16}
                            className="mx-auto text-text-muted/40"
                          />
                        )
                      ) : (
                        starter
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-text-muted">
                      {typeof pro === 'boolean' ? (
                        pro ? (
                          <Check
                            size={16}
                            className="mx-auto text-success"
                          />
                        ) : (
                          <XIcon
                            size={16}
                            className="mx-auto text-text-muted/40"
                          />
                        )
                      ) : (
                        pro
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-text-muted">
                      {typeof agency === 'boolean' ? (
                        agency ? (
                          <Check
                            size={16}
                            className="mx-auto text-success"
                          />
                        ) : (
                          <XIcon
                            size={16}
                            className="mx-auto text-text-muted/40"
                          />
                        )
                      ) : (
                        agency
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        className="border-t border-surface-border px-4 py-16 lg:py-20"
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-text-primary lg:text-3xl">
            Frequently Asked Questions
          </h2>

          <Accordion.Root type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map(({ question, answer }) => (
              <Accordion.Item
                key={question}
                value={question}
                className="rounded-xl border border-surface-border bg-surface-card"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-text-primary transition-colors hover:text-primary-light focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary lg:text-base">
                    <span>{question}</span>
                    <ChevronDown
                      size={16}
                      className="shrink-0 text-text-muted transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="border-t border-surface-border px-5 py-4">
                    <p className="text-sm leading-relaxed text-text-muted">
                      {answer}
                    </p>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </section>
    </div>
  );
}
