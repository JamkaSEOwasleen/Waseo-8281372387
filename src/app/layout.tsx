import type { Metadata } from 'next';
import Script from 'next/script';
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Providers from '@/components/layout/Providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { APP_CONFIG } from '@/lib/constants';
import './globals.css';

// ─── Fonts ───────────────────────────────────────────────────────────────────

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500'],
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'WasafSEO — Arabic pages. Ranked.',
    template: '%s | WasafSEO',
  },
  description:
    'AI-powered Arabic SEO content briefs with JSON-LD schema and GEO optimization. Generate complete Arabic SEO briefs in seconds.',
  keywords: [
    'Arabic SEO',
    'JSON-LD',
    'Schema',
    'GEO',
    'Arabic content',
    'SEO content brief',
    'Arabic content generator',
  ],
  authors: [{ name: 'Wasleen' }],
  creator: 'Wasleen',
  publisher: 'Wasleen',
  metadataBase: new URL('https://wasafseo.wasleen.com'),
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? '',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'WasafSEO',
    title: 'WasafSEO — Arabic pages. Ranked.',
    description:
      'AI-powered Arabic SEO content briefs with JSON-LD schema and GEO optimization. Generate complete Arabic SEO briefs in seconds.',
    url: 'https://wasafseo.wasleen.com',
    images: [
      {
        url: 'https://wasafseo.wasleen.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WasafSEO — Arabic pages. Ranked.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WasafSEO — Arabic pages. Ranked.',
    description:
      'AI-powered Arabic SEO content briefs with JSON-LD schema and GEO optimization.',
    images: ['https://wasafseo.wasleen.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${syne.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      {/* Google Analytics */}
      {APP_CONFIG.gaId && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${APP_CONFIG.gaId}`}
          strategy="afterInteractive"
        />
      )}
      {APP_CONFIG.gaId && (
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${APP_CONFIG.gaId}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      )}
      <body className="min-h-screen bg-surface font-sans text-text-primary antialiased">
        <Providers>
          <Navbar />
          <main className="flex min-h-[calc(100vh-4rem)] flex-col">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
