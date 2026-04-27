import type { PlanConfig } from '@/types';

// ─── Plans ──────────────────────────────────────────────────────────────────

export const PLANS: PlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    annualPrice: 490,
    briefLimit: 30,
    websiteLimit: 1,
    historyDays: 30,
    teamSeats: 1,
    hasTrial: true,
    trialDays: 3,
    features: [
      '30 briefs per month',
      '1 website',
      'Full Arabic SEO brief',
      'JSON-LD schema generation',
      'PDF export',
      '30-day history',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 149,
    annualPrice: 1490,
    briefLimit: 150,
    websiteLimit: 3,
    historyDays: 90,
    teamSeats: 3,
    hasTrial: false,
    trialDays: 0,
    features: [
      '150 briefs per month',
      '3 websites',
      'Full Arabic SEO brief',
      'JSON-LD schema generation',
      'Competitor URL analysis',
      'PDF export',
      '90-day history',
      'Priority support',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 299,
    annualPrice: 2990,
    briefLimit: Infinity,
    websiteLimit: Infinity,
    historyDays: Infinity,
    teamSeats: 10,
    hasTrial: false,
    trialDays: 0,
    features: [
      'Unlimited briefs',
      'Unlimited websites',
      'Full Arabic SEO brief',
      'JSON-LD schema generation',
      'Competitor URL analysis',
      'White-label PDF export',
      'Unlimited history',
      'Priority support + onboarding call',
    ],
  },
];

// ─── Countries ──────────────────────────────────────────────────────────────

export interface CountryOption {
  code: string;
  nameEn: string;
  flag: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'AE', nameEn: 'UAE', flag: '🇦🇪' },
  { code: 'SA', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'EG', nameEn: 'Egypt', flag: '🇪🇬' },
  { code: 'KW', nameEn: 'Kuwait', flag: '🇰🇼' },
  { code: 'QA', nameEn: 'Qatar', flag: '🇶🇦' },
  { code: 'BH', nameEn: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', nameEn: 'Oman', flag: '🇴🇲' },
  { code: 'MA', nameEn: 'Morocco', flag: '🇲🇦' },
  { code: 'JO', nameEn: 'Jordan', flag: '🇯🇴' },
  { code: 'LB', nameEn: 'Lebanon', flag: '🇱🇧' },
];

// ─── Intent Options ─────────────────────────────────────────────────────────

export interface IntentOption {
  value: string;
  labelEn: string;
  icon: string;
  description: string;
}

export const INTENT_OPTIONS: IntentOption[] = [
  {
    value: 'how-to',
    labelEn: 'How-To',
    icon: '📋',
    description: 'Step-by-step guide content',
  },
  {
    value: 'informational',
    labelEn: 'Informational',
    icon: '📚',
    description: 'Educational and explanatory content',
  },
  {
    value: 'commercial',
    labelEn: 'Commercial',
    icon: '🛍️',
    description: 'Product and service pages',
  },
  {
    value: 'comparison',
    labelEn: 'Comparison',
    icon: '⚖️',
    description: 'Compare options and alternatives',
  },
  {
    value: 'navigational',
    labelEn: 'Navigational',
    icon: '🧭',
    description: 'Brand and navigation pages',
  },
];

// ─── Niche Options ──────────────────────────────────────────────────────────

export interface NicheOption {
  value: string;
  labelEn: string;
  icon: string;
}

export const NICHE_OPTIONS: NicheOption[] = [
  { value: 'blog', labelEn: 'Blog', icon: '✍️' },
  { value: 'ecommerce', labelEn: 'E-Commerce', icon: '🛒' },
  { value: 'saas', labelEn: 'SaaS', icon: '💻' },
  { value: 'news', labelEn: 'News', icon: '📰' },
  { value: 'portfolio', labelEn: 'Portfolio', icon: '🎨' },
];

// ─── Plan Limits ────────────────────────────────────────────────────────────

export const PLAN_LIMITS: Record<string, number> = {
  none: 0,
  starter_trial: 3,
  starter: 30,
  pro: 150,
  agency: Infinity,
};

export const WEBSITE_LIMITS: Record<string, number> = {
  none: 0,
  starter: 1,
  pro: 3,
  agency: Infinity,
};

// ─── App Configuration ──────────────────────────────────────────────────────

export const APP_CONFIG = {
  name: 'WasafSEO',
  fullName: 'WasafSEO Arabic Ranking Content Generator',
  tagline: 'Arabic pages. Ranked.',
  domain: 'wasafseo.wasleen.com',
  url: 'https://wasafseo.wasleen.com',
  supportEmail: 'support@wasleen.com',
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
};
