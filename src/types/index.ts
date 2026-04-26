// ─── Plan & Intent Types ─────────────────────────────────────────────────────

export type PlanType = 'none' | 'starter' | 'pro' | 'agency';

export type IntentType = 'how-to' | 'informational' | 'commercial' | 'comparison' | 'navigational';

export type NicheType = 'blog' | 'ecommerce' | 'saas' | 'news' | 'portfolio';

// ─── Database Row Types (match Supabase schema exactly) ─────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: PlanType;
  trial_ends_at: string | null;
  lemon_customer_id: string | null;
  lemon_subscription_id: string | null;
  subscription_cancelled_at: string | null;
  subscription_paused_at: string | null;
  payment_failed_at: string | null;
  account_flagged: boolean;
  created_at: string;
}

export interface Website {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  logo_url: string | null;
  niche: NicheType;
  target_country: string;
  brand_name: string | null;
  brand_description: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  wikipedia_url: string | null;
  author_name: string | null;
  author_title: string | null;
  author_bio: string | null;
  author_linkedin: string | null;
  author_portfolio: string | null;
  author_topics: string[];
  created_at: string;
}

export interface Brief {
  id: string;
  user_id: string;
  website_id: string | null;
  keyword: string;
  intent: IntentType;
  target_country: string | null;
  additional_info: string | null;
  competitor_urls: string[];
  output: BriefOutput | null;
  schema_output: SchemaOutput | null;
  word_count_actual: number | null;
  created_at: string;
}

export interface Usage {
  id: string;
  user_id: string;
  month: string;
  briefs_generated: number;
}

// ─── Brief Output Types (matches Deepseek JSON response structure) ─────────

export interface BriefOutput {
  fundamentals: BriefFundamentals;
  content: BriefContent;
}

export interface BriefFundamentals {
  pageTitle: string;
  metaDescription: string;
  slug: string;
  searchIntent: IntentType;
  estimatedWordCount: number;
  targetLocation: string;
  primaryKeyword: string;
}

export interface BriefContent {
  h1: string;
  directAnswer: DirectAnswer;
  tldr: TLDRSection;
  outline: OutlineSection[];
  stats: Stat[];
  expertQuotes: ExpertQuote[];
  comparisonTable: ComparisonTable | null;
  howToSteps: HowToSteps | null;
  faq: FAQ[];
  authorBioBlock: AuthorBio;
}

export interface DirectAnswer {
  text: string;
  cssClass: string;
}

export interface TLDRSection {
  heading: string;
  points: string[];
}

export interface OutlineSection {
  h2: string;
  h3s: H3Item[];
  contentNotes: string;
  includesStats: boolean;
  includesQuote: boolean;
  includesTable: boolean;
  includesList: boolean;
}

export interface H3Item {
  heading: string;
  notes: string;
}

export interface Stat {
  claim: string;
  sourceOrg: string;
  sourceType: string;
  year: string;
  placeholderFlag: string;
}

export interface ExpertQuote {
  suggestedName: string;
  suggestedTitle: string;
  suggestedOrg: string;
  quoteText: string;
  placeholderFlag: string;
  appearsInSection: string;
}

export interface ComparisonTable {
  caption: string;
  headers: string[];
  rows: string[][];
  verdict: string;
}

export interface HowToSteps {
  heading: string;
  totalTime: string;
  steps: HowToStep[];
}

export interface HowToStep {
  stepNumber: number;
  name: string;
  description: string;
  tip?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface AuthorBio {
  name: string;
  title: string;
  bio: string;
  linkedin: string;
  portfolio: string;
}

export interface SchemaOutput {
  '@context': string;
  '@graph': Record<string, unknown>[];
}

// ─── Plan Configuration Type ────────────────────────────────────────────────

export interface PlanConfig {
  id: PlanType;
  name: string;
  nameAr: string;
  price: number;
  annualPrice: number;
  briefLimit: number;
  websiteLimit: number;
  historyDays: number;
  teamSeats: number;
  hasTrial: boolean;
  trialDays: number;
  features: string[];
  featuresAr: string[];
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
  message: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Session User Type ──────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: PlanType;
  trialEndsAt: string | null;
  accountFlagged: boolean;
  paymentFailedAt: string | null;
  subscriptionCancelledAt: string | null;
}

// ─── Usage State Type ───────────────────────────────────────────────────────

export interface UsageState {
  current: number;
  limit: number;
  isUnlimited: boolean;
  percentUsed: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
  isInTrial: boolean;
  trialDaysRemaining: number | null;
}
