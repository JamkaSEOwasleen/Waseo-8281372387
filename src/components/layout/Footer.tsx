'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WasafSEOLogo from '@/components/logo/WasafSEOLogo';

// ─── Footer Link Sections ─────────────────────────────────────────────────────

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'FAQ', href: '/pricing#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: 'mailto:support@wasleen.com' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Footer(): React.ReactElement {
  const pathname = usePathname();

  // Hide public footer on dashboard routes — dashboard has its own layout
  if (pathname.startsWith('/dashboard')) {
    return <></>;
  }

  return (
    <footer className="border-t border-surface-border bg-surface-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        {/* ── Top Section ──────────────────────────────────────────────── */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="mb-4 flex items-center gap-2.5 transition-opacity hover:opacity-80"
              aria-label="WasafSEO Home"
            >
              <WasafSEOLogo size={32} className="shrink-0" />
              <span className="font-display text-xl font-bold text-text-primary">
                WasafSEO
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
              AI-powered Arabic SEO content briefs with JSON-LD schema and GEO
              optimization. Built for the Arab web.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map(({ title, links }) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold text-text-primary">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-text-muted transition-colors hover:text-text-primary focus:text-text-primary focus:outline-none"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="my-10 h-px bg-surface-border" />

        {/* ── Bottom Bar ───────────────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-text-muted">
            &copy; 2026 WasafSEO. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">Built for the Arab web 🌙</p>
        </div>
      </div>
    </footer>
  );
}
