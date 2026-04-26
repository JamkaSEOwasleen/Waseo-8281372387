import { z } from 'zod';

// ─── Website Validation ──────────────────────────────────────────────────────

/**
 * Shared Zod schema for website creation/update.
 * Used in both API routes and client-side form validation.
 */
export const websiteSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Website name is required' })
    .max(100, { message: 'Website name must be under 100 characters' }),
  domain: z
    .string()
    .min(1, { message: 'Domain is required' })
    .url({ message: 'Domain must be a valid URL starting with https://' })
    .refine((val) => val.startsWith('https://'), {
      message: 'Domain must start with https://',
    }),
  logo_url: z.string().url({ message: 'Logo must be a valid URL' }).optional().or(z.literal('')),
  niche: z.enum(['blog', 'ecommerce', 'saas', 'news', 'portfolio'] as const, {
    message: 'Please select a niche',
  }),
  target_country: z.string().min(1, { message: 'Target country is required' }),
  brand_name: z
    .string()
    .min(1, { message: 'Brand name is required' })
    .max(100, { message: 'Brand name must be under 100 characters' }),
  brand_description: z
    .string()
    .min(1, { message: 'Brand description is required' })
    .max(200, { message: 'Brand description must be under 200 characters' }),
  twitter_url: z.string().url({ message: 'Twitter URL is invalid' }).optional().or(z.literal('')),
  linkedin_url: z.string().url({ message: 'LinkedIn URL is invalid' }).optional().or(z.literal('')),
  wikipedia_url: z.string().url({ message: 'Wikipedia URL is invalid' }).optional().or(z.literal('')),
  author_name: z
    .string()
    .min(1, { message: 'Author name is required' })
    .max(100, { message: 'Author name must be under 100 characters' }),
  author_title: z
    .string()
    .min(1, { message: 'Author job title is required' })
    .max(100, { message: 'Author title must be under 100 characters' }),
  author_bio: z
    .string()
    .min(1, { message: 'Author bio is required' })
    .max(300, { message: 'Author bio must be under 300 characters' }),
  author_linkedin: z
    .string()
    .url({ message: 'Author LinkedIn URL is invalid' })
    .optional()
    .or(z.literal('')),
  author_portfolio: z
    .string()
    .url({ message: 'Author portfolio URL is invalid' })
    .optional()
    .or(z.literal('')),
  author_topics: z
    .array(z.string().max(50))
    .min(1, { message: 'At least one expert topic is required' })
    .max(10, { message: 'Maximum 10 expert topics allowed' }),
});

export type WebsiteFormData = z.infer<typeof websiteSchema>;

/**
 * Partial schema for updates (all fields optional).
 */
export const websiteUpdateSchema = websiteSchema.partial();

// ─── Generate Brief Validation ─────────────────────────────────────────────────

/**
 * Zod schema for the generate brief API request body.
 */
export const generateSchema = z.object({
  keyword: z.string().min(1, { message: 'Keyword is required' }).max(200),
  intent: z.enum(['how-to', 'informational', 'commercial', 'comparison', 'navigational'] as const),
  location: z.string().min(1, { message: 'Location is required' }),
  additionalInfo: z.string().max(2000).optional().default(''),
  websiteId: z.string().uuid({ message: 'Invalid website ID' }),
  competitorUrls: z.array(z.string().url()).max(3).optional().default([]),
});

export type GenerateFormData = z.infer<typeof generateSchema>;
