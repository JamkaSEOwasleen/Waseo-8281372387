import WasafSEOLogo from '@/components/logo/WasafSEOLogo';
import Link from 'next/link';

// ─── Footer Links ──────────────────────────────────────────────────────────────

interface FooterLink {
  label: string;
  href: string;
}

const LEGAL_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const PRODUCT_LINKS: FooterLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Sign In', href: '/login' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function PSEOFooter(): React.ReactElement {
  const currentYear: number = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-border bg-surface-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        {/* ── Top Section ──────────────────────────────────────────────── */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-1">
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
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              A specialized platform for creating Arabic SEO and JSON-LD compliant
              content briefs.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-text-primary">
              Product
            </h3>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map(({ label, href }) => (
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

          {/* Legal links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-text-primary">
              Legal
            </h3>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ label, href }) => (
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
        </div>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="my-10 h-px bg-surface-border" />

        {/* ── Bottom Bar ───────────────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-text-muted">
            &copy; {currentYear} WasafSEO. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">For Arabic content 🌙</p>
        </div>
      </div>
    </footer>
  );
}
