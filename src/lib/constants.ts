import type { PlanConfig } from '@/types';

// ─── Plans ──────────────────────────────────────────────────────────────────

export const PLANS: PlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    nameAr: 'المبتدئ',
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
    featuresAr: [
      '30 موجزاً شهرياً',
      'موقع واحد',
      'موجز SEO عربي كامل',
      'توليد JSON-LD Schema',
      'تصدير PDF',
      'سجل 30 يوم',
      'دعم بالبريد الإلكتروني',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    nameAr: 'الاحترافي',
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
    featuresAr: [
      '150 موجزاً شهرياً',
      '3 مواقع',
      'موجز SEO عربي كامل',
      'توليد JSON-LD Schema',
      'تحليل روابط المنافسين',
      'تصدير PDF',
      'سجل 90 يوم',
      'دعم ذو أولوية',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    nameAr: 'الوكالة',
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
    featuresAr: [
      'موجزات غير محدودة',
      'مواقع غير محدودة',
      'موجز SEO عربي كامل',
      'توليد JSON-LD Schema',
      'تحليل روابط المنافسين',
      'تصدير PDF بعلامتك التجارية',
      'سجل غير محدود',
      'دعم ذو أولوية + مكالمة تأهيل',
    ],
  },
];

// ─── Countries ──────────────────────────────────────────────────────────────

export interface CountryOption {
  code: string;
  nameEn: string;
  nameAr: string;
  flag: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'AE', nameEn: 'UAE', nameAr: 'الإمارات', flag: '🇦🇪' },
  { code: 'SA', nameEn: 'Saudi Arabia', nameAr: 'السعودية', flag: '🇸🇦' },
  { code: 'EG', nameEn: 'Egypt', nameAr: 'مصر', flag: '🇪🇬' },
  { code: 'KW', nameEn: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼' },
  { code: 'QA', nameEn: 'Qatar', nameAr: 'قطر', flag: '🇶🇦' },
  { code: 'BH', nameEn: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭' },
  { code: 'OM', nameEn: 'Oman', nameAr: 'عُمان', flag: '🇴🇲' },
  { code: 'MA', nameEn: 'Morocco', nameAr: 'المغرب', flag: '🇲🇦' },
  { code: 'JO', nameEn: 'Jordan', nameAr: 'الأردن', flag: '🇯🇴' },
  { code: 'LB', nameEn: 'Lebanon', nameAr: 'لبنان', flag: '🇱🇧' },
];

// ─── Intent Options ─────────────────────────────────────────────────────────

export interface IntentOption {
  value: string;
  labelEn: string;
  labelAr: string;
  icon: string;
  description: string;
}

export const INTENT_OPTIONS: IntentOption[] = [
  {
    value: 'how-to',
    labelEn: 'How-To',
    labelAr: 'كيف تفعل',
    icon: '📋',
    description: 'Step-by-step guide content',
  },
  {
    value: 'informational',
    labelEn: 'Informational',
    labelAr: 'معلوماتي',
    icon: '📚',
    description: 'Educational and explanatory content',
  },
  {
    value: 'commercial',
    labelEn: 'Commercial',
    labelAr: 'تجاري',
    icon: '🛍️',
    description: 'Product and service pages',
  },
  {
    value: 'comparison',
    labelEn: 'Comparison',
    labelAr: 'مقارنة',
    icon: '⚖️',
    description: 'Compare options and alternatives',
  },
  {
    value: 'navigational',
    labelEn: 'Navigational',
    labelAr: 'تنقلي',
    icon: '🧭',
    description: 'Brand and navigation pages',
  },
];

// ─── Niche Options ──────────────────────────────────────────────────────────

export interface NicheOption {
  value: string;
  labelEn: string;
  labelAr: string;
  icon: string;
}

export const NICHE_OPTIONS: NicheOption[] = [
  { value: 'blog', labelEn: 'Blog', labelAr: 'مدونة', icon: '✍️' },
  { value: 'ecommerce', labelEn: 'E-Commerce', labelAr: 'متجر إلكتروني', icon: '🛒' },
  { value: 'saas', labelEn: 'SaaS', labelAr: 'برمجيات', icon: '💻' },
  { value: 'news', labelEn: 'News', labelAr: 'أخبار', icon: '📰' },
  { value: 'portfolio', labelEn: 'Portfolio', labelAr: 'معرض أعمال', icon: '🎨' },
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
