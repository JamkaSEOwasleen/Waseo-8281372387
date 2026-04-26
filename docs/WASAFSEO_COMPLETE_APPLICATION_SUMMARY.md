# WasafSEO — Complete Application Summary Document

**Document Version:** 1.0  
**Date:** 2026-04-26  
**Purpose:** Feed this document into an AI system (Claude/GPT-5/Deepseek/Gemini) to generate a Mega Programmatic SEO (PSEO) Architecture Plan that will dominate the Arabic SEO content market.

---

## Section 1: Product Overview

### What Is WasafSEO?
WasafSEO is an **Arabic SEO Content Brief Generator SaaS** built with Next.js 15 (App Router). It takes minimal user input (a keyword, search intent, target country, and optional notes) and generates a **complete Arabic SEO content brief** with **JSON-LD Schema.org markup** using the **Deepseek API** (two-call architecture).

### Core Value Proposition
- **Input:** Any language keyword → **Output:** Arabic content brief (always)
- **5 search intents supported:** how-to, informational, commercial, comparison, navigational
- **Targets 10+ Arab countries** with country-specific SEO data
- **GEO/AIO-optimized** — built for Google SGE, ChatGPT Search, Perplexity, Bing Copilot, Gemini
- **E-E-A-T infrastructure** baked in: author profiles, expert quotes (with replace flags), verified statistics
- **JSON-LD Schema.org** auto-generated from website data — zero placeholders

### Target Users
- Arabic content writers and SEO agencies
- Arab businesses needing content at scale
- International companies targeting Arabic markets (Saudi Arabia, UAE, Egypt, Qatar, Kuwait, etc.)

### URL
- **Website:** https://wasafseo.wasleen.com
- **Brand:** WasafSEO

---

## Section 2: Technical Architecture

### Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16.2.4 (App Router) | Server components by default |
| Language | TypeScript (strict mode) | No `any` types, named exports only |
| Styling | Tailwind CSS v4 | No inline styles, no CSS modules |
| Animation | Framer Motion | Subtle, purposeful |
| Icons | Lucide React | No other icon library |
| Fonts | Geist (UI), JetBrains Mono (code), Syne (headings) | Via next/font/google |
| Database | Supabase (PostgreSQL) | 4 tables: users, websites, briefs, usage |
| Auth | Auth.js v5 (NextAuth) | Google OAuth + Resend magic link, JWT strategy |
| Payments | Lemon Squeezy | Webhook-driven subscription management |
| AI | Deepseek API (`deepseek-chat`) | 128k input context, 8k output limit |
| Email | Resend | Transactional emails (welcome, trial expiring, limit reached, payment failed) |
| Deployment | Vercel | maxDuration: 60s for generate route |
| Analytics | Google Analytics 4 + Vercel Analytics + Vercel Speed Insights | |
| PDF Export | @react-pdf/renderer | Client-side PDF generation |

### Project Structure
```
src/
  app/                    → Next.js App Router pages and API routes
  components/
    ui/                   → Reusable primitives (Button, Input, Card, Badge, Skeleton, ProgressBar)
    layout/               → Navbar, Footer, Providers
    auth/                 → UserMenu
    website/              → WebsiteWizard (multi-step setup form)
    brief/                → BriefResults, ContentTab, FundamentalsTab, GeoTab, SchemaTab, ExportTab
    billing/              → UpgradeGate, PlanBadge, UsageBanner
  lib/
    supabase/             → client.ts (browser), server.ts (server), admin.ts (service role), middleware.ts
    deepseek.ts             → generateContentBrief() + generateSchema()
    prompts.ts              → buildContentSystemPrompt(), buildSchemaSystemPrompt(), buildContentUserMessage(), buildSchemaUserMessage()
    lemonsqueezy.ts         → createCheckoutUrl(), getCustomerPortalUrl()
    session.ts              → getSession(), requireSession(), getUserFromDb(), checkAccountAccess()
    usage.ts                → getMonthlyUsage(), checkUsageLimit(), incrementUsage()
    emails.ts               → sendWelcomeEmail(), sendTrialExpiringEmail(), sendLimitReachedEmail(), sendPaymentFailedEmail()
    constants.ts            → PLANS, COUNTRIES, INTENT_OPTIONS, NICHE_OPTIONS, PLAN_LIMITS, APP_CONFIG
    utils.ts                → cn(), formatDate(), getPlanLimit(), computeUsageState(), slugify(), etc.
    validations.ts          → Zod schemas for all API inputs
    analytics.ts            → GA4 event tracking
    pdf-document.tsx        → React-PDF document component
  types/
    index.ts              → ALL TypeScript interfaces (User, Website, Brief, BriefOutput, SchemaOutput, etc.)
```

---

## Section 3: Core Feature Set

### 3.1 Content Brief Generation
- **Two Deepseek API calls:**
  - **Call 1 (generateContentBrief):** 8000 max_tokens, temp 0.7 → returns `{ fundamentals, content }`
  - **Call 2 (generateSchema):** 4000 max_tokens, temp 0.3 → returns `{ @context, @graph }`
- **Retry logic:** max 2 retries on JSON parse failure, 1000ms wait between retries
- **JSON parsing:** Strips markdown code blocks before JSON.parse

### 3.2 Brief Output Structure
```
{
  fundamentals: {
    targetKeyword, intent, targetCountry, targetLanguage (always "ar"),
    primaryTitle, alternativeTitles (3-5), metaDescription,
    wordCountMin, wordCountMax, readabilityLevel,
    targetEntities (array of { name, type, importance }),
    competitorUrls (up to 3)
  },
  content: {
    directAnswer: { text, wordCount, sources },
    tldr: { paragraphs, keyTakeaways },
    outline: [{ h2, h3Items: [{ h3, subpoints }] }],
    stats: [{ stat, context, source }],
    expertQuotes: [{ quote, expertName, expertTitle, source }],
    comparisonTable: { headers, rows } | null,
    howToSteps: { steps: [{ title, description, tips }] } | null,
    faq: [{ question, answer }],
    authorBioBlock: { suggestedAuthor, expertiseAreas, contentStrategyNotes }
  }
}
```

### 3.3 Schema Generation Output
```
{
  "@context": "https://schema.org",
  "@graph": [
    Article,            // Full article markup with author, publisher, date
    FAQPage | null,     // Only if brief has FAQ items
    HowTo | null,       // Only if intent is "how-to"
    ItemList | null,    // Only if brief has comparison table
    BreadcrumbList,     // Always included
    Organization,       // Publisher organization
    Person,             // Author
    WebPage             // Canonical webpage
  ]
}
```

### 3.4 Intent-Specific Features
| Intent | Special Output |
|---|---|
| how-to | HowTo schema, step-by-step outline, numbered steps in brief |
| informational | FAQ schema, comprehensive direct answer, deep TLDR |
| commercial | Comparison table, review-style outline, product/entity focus |
| comparison | ComparisonTable schema, ItemList schema, side-by-side headers |
| navigational | BreadcrumbList, brand-focused, direct navigation guidance |

### 3.5 GEO/AIO Optimization
- Built-in citation rule enforcement in system prompts (Call 1)
- Stats require `[SOURCE: verify]` flags in output
- Expert quotes require `[REPLACE WITH REAL QUOTE]` flags
- E-E-A-T signals: author bio block, linkedin/portfolio integration, content strategy notes

### 3.6 Website Management
- Multi-step wizard: brand info → author profile → social links → review
- Stores: brandName, domain, brandDescription, authorName, authorTitle, authorBio, authorTopics, authorLinkedin, authorPortfolio, logoUrl, twitter, linkedin, wikipedia
- Plan-based limits: Starter=1, Pro=5, Agency=unlimited

### 3.7 Billing & Plans
| Plan | Price | Briefs/Month | Websites | Trial |
|---|---|---|---|---|
| Starter | $49/mo | 30 | 1 | 3-day trial (3 briefs) |
| Pro | $149/mo | 150 | 5 | None |
| Agency | $399/mo | Unlimited | Unlimited | None |

### 3.8 Subscription State Machine
- `plan = 'none'` → no access to generate
- `plan = 'starter'` + `trial_ends_at > now()` → trial mode (3 brief limit)
- `plan = 'starter'` + `trial_ends_at <= now()` → paying (30 brief limit)
- `plan = 'pro'` → paying (150 brief limit)
- `plan = 'agency'` → paying (unlimited)
- `account_flagged = true` → block all access
- `subscription_paused_at != null` → plan set to 'none'
- `payment_failed_at != null` → show warning, allow access

### 3.9 Access Control Check Order (every API route)
1. Verify session (requireSession)
2. Check account_flagged → 403
3. Check plan !== 'none' → 403
4. Check trial not expired → 403 if starter trial expired
5. Check usage limit → 403 if exceeded
6. Proceed with request

---

## Section 4: Market & Competitive Landscape

### Current Arabic SEO Content Market
- **Massive gap:** Most Arabic content is machine-translated, low-quality, or lacks proper SEO structure
- **GEO/AIO unpreparedness:** Very few Arabic content tools account for Google SGE, ChatGPT, Perplexity
- **E-E-A-T void:** Arabic content rarely includes proper author profiles, verified statistics, expert quotes
- **Schema.org adoption:** Near-zero in Arabic content outside major publishers
- **Programmatic SEO in Arabic:** Virtually unexplored territory

### Competitive Landscape
| Competitor | Arabic Support | GEO/AIO | Schema | E-E-A-T | PSEO-Ready |
|---|---|---|---|---|---|
| **WasafSEO** | ✅ Native | ✅ Built-in | ✅ Auto | ✅ Baked in | ✅ Uses own API |
| Frase.io | ❌ None | Partial | ✅ | Partial | ❌ |
| Surfer SEO | ❌ None | ❌ | ❌ | Partial | ❌ |
| Clearscope | ❌ None | ❌ | ❌ | ❌ | ❌ |
| Ryte | ❌ None | ❌ | ❌ | ❌ | ❌ |
| SE Ranking | Partial | ❌ | ❌ | ❌ | ❌ |
| Yoast | Basic RTL | ❌ | Basic | ❌ | ❌ |
| Rank Math | Basic RTL | ❌ | Basic | ❌ | ❌ |

**WasafSEO Competitive Advantage:** The only Arabic-first AI content brief generator with GEO/AIO optimization, auto JSON-LD schema, E-E-A-T infrastructure, and a generation API that can be leveraged for Programmatic SEO.

---

## Section 5: Target Geography — Complete Country, Region & City Data for PSEO

This section defines the full geographic targeting matrix for the Programmatic SEO system. Each country includes its administrative divisions and main cities — every city represents a potential landing page target for location-specific content.

---

### 1. 🇸🇦 Saudi Arabia — 13 Regions

| Region | Main City(ies) |
|---|---|
| Al Baha | Al Baha |
| Al Jawf | Sakaka |
| Asir | Abha |
| Eastern Province | Dammam, Khobar |
| Hail | Hail |
| Jazan | Jazan |
| Makkah | Mecca, Jeddah |
| Madinah | Medina |
| Najran | Najran |
| Northern Borders | Arar |
| Qassim | Buraidah |
| Riyadh | Riyadh |
| Tabuk | Tabuk |

**PSEO Page Count Estimate:** 15+ major cities → 15 pages/category × 10 categories = 150+ pages

---

### 2. 🇦🇪 United Arab Emirates — 7 Emirates

| Emirate | Main City(ies) |
|---|---|
| Abu Dhabi | Abu Dhabi, Al Ain |
| Ajman | Ajman |
| Dubai | Dubai |
| Fujairah | Fujairah |
| Ras Al Khaimah | Ras Al Khaimah |
| Sharjah | Sharjah |
| Umm Al Quwain | Umm Al Quwain |

**PSEO Page Count Estimate:** 8 major cities → 80+ pages

---

### 3. 🇪🇬 Egypt — 27 Governorates

| Governorate | Main City |
|---|---|
| Alexandria | Alexandria |
| Aswan | Aswan |
| Asyut | Asyut |
| Beheira | Damanhur |
| Beni Suef | Beni Suef |
| Cairo | Cairo |
| Dakahlia | Mansoura |
| Damietta | Damietta |
| Faiyum | Faiyum |
| Gharbia | Tanta |
| Giza | Giza |
| Ismailia | Ismailia |
| Kafr El Sheikh | Kafr El Sheikh |
| Luxor | Luxor |
| Matrouh | Marsa Matrouh |
| Minya | Minya |
| Monufia | Shibin El Kom |
| New Valley | Kharga |
| North Sinai | Arish |
| Port Said | Port Said |
| Qalyubia | Banha |
| Qena | Qena |
| Red Sea | Hurghada |
| Sharqia | Zagazig |
| Sohag | Sohag |
| South Sinai | El Tor, Sharm El Sheikh |
| Suez | Suez |

**PSEO Page Count Estimate:** 28 major cities → 280+ pages

---

### 4. 🇶🇦 Qatar — 8 Municipalities

| Municipality | Main City |
|---|---|
| Al Daayen | Lusail |
| Al Khor | Al Khor |
| Al Rayyan | Al Rayyan |
| Al Shahaniya | Al Shahaniya |
| Al Shamal | Madinat ash Shamal |
| Al Wakrah | Al Wakrah |
| Doha | Doha |
| Umm Salal | Umm Salal Mohammed |

**PSEO Page Count Estimate:** 8 cities → 80+ pages

---

### 5. 🇰🇼 Kuwait — 6 Governorates

| Governorate | Main City |
|---|---|
| Ahmadi | Al Ahmadi |
| Al Asimah | Kuwait City |
| Farwaniya | Al Farwaniyah |
| Hawalli | Hawalli |
| Jahra | Al Jahra |
| Mubarak Al-Kabeer | Mubarak Al-Kabeer |

**PSEO Page Count Estimate:** 6 cities → 60+ pages

---

### 6. 🇲🇦 Morocco — 12 Regions

| Region | Main City |
|---|---|
| Béni Mellal-Khénifra | Béni Mellal |
| Casablanca-Settat | Casablanca |
| Dakhla-Oued Ed-Dahab | Dakhla |
| Drâa-Tafilalet | Errachidia |
| Fès-Meknès | Fez |
| Guelmim-Oued Noun | Guelmim |
| Laâyoune-Sakia El Hamra | Laayoune |
| Marrakech-Safi | Marrakesh |
| Oriental | Oujda |
| Rabat-Salé-Kénitra | Rabat |
| Souss-Massa | Agadir |
| Tanger-Tetouan-Al Hoceima | Tangier |

**PSEO Page Count Estimate:** 12 cities → 120+ pages

---

### 7. 🇩🇿 Algeria — 58 Provinces (Wilayas)

| Province | Main City | Province | Main City |
|---|---|---|---|
| Adrar | Adrar | Aïn Defla | Aïn Defla |
| Aïn Témouchent | Aïn Témouchent | Algiers | Algiers |
| Annaba | Annaba | Batna | Batna |
| Béchar | Béchar | Béjaïa | Béjaïa |
| Béni Abbès | Béni Abbès | Biskra | Biskra |
| Blida | Blida | Bordj Baji Mokhtar | Bordj Baji Mokhtar |
| Bordj Bou Arréridj | Bordj Bou Arréridj | Bouira | Bouira |
| Boumerdès | Boumerdès | Chlef | Chlef |
| Constantine | Constantine | Djanet | Djanet |
| Djelfa | Djelfa | El Bayadh | El Bayadh |
| El M'Ghair | El M'Ghair | El Menia | El Menia |
| El Oued | El Oued | El Taref | El Taref |
| Ghardaïa | Ghardaïa | Guelma | Guelma |
| Illizi | Illizi | In Guezzam | In Guezzam |
| In Salah | In Salah | Jijel | Jijel |
| Khenchela | Khenchela | Laghouat | Laghouat |
| Mascara | Mascara | Médéa | Médéa |
| Mila | Mila | Mostaganem | Mostaganem |
| M'Sila | M'Sila | Naâma | Naâma |
| Oran | Oran | Ouargla | Ouargla |
| Ouled Djellal | Ouled Djellal | Oum El Bouaghi | Oum El Bouaghi |
| Relizane | Relizane | Saïda | Saïda |
| Sétif | Sétif | Sidi Bel Abbès | Sidi Bel Abbès |
| Skikda | Skikda | Souk Ahras | Souk Ahras |
| Tamanrasset | Tamanrasset | Tébessa | Tébessa |
| Tiaret | Tiaret | Timimoun | Timimoun |
| Tindouf | Tindouf | Tipaza | Tipaza |
| Tissemsilt | Tissemsilt | Tizi Ouzou | Tizi Ouzou |
| Tlemcen | Tlemcen | Touggourt | Touggourt |

**PSEO Page Count Estimate:** 58 cities → 580+ pages

---

### 8. 🇮🇶 Iraq — 19 Governorates

| Governorate | Main City |
|---|---|
| Al Anbar | Ramadi |
| Al-Qādisiyyah | Diwaniyah |
| Babil | Hillah |
| Baghdad | Baghdad |
| Basra | Basra |
| Dhi Qar | Nasiriyah |
| Diyala | Baqubah |
| Duhok | Duhok |
| Erbil | Erbil |
| Halabja | Halabja |
| Karbala | Karbala |
| Kirkuk | Kirkuk |
| Maysan | Amarah |
| Muthanna | Samawah |
| Najaf | Najaf |
| Nineveh | Mosul |
| Saladin | Tikrit |
| Sulaymaniyah | Sulaymaniyah |
| Wasit | Kut |

**PSEO Page Count Estimate:** 19 cities → 190+ pages

---

### 9. 🇯🇴 Jordan — 12 Governorates

| Governorate | Main City |
|---|---|
| Ajloun | Ajloun |
| Amman | Amman |
| Aqaba | Aqaba |
| Balqa | Salt |
| Irbid | Irbid |
| Jerash | Jerash |
| Karak | Al Karak |
| Ma'an | Ma'an |
| Madaba | Madaba |
| Mafraq | Mafraq |
| Tafilah | Tafilah |
| Zarqa | Zarqa |

**PSEO Page Count Estimate:** 12 cities → 120+ pages

---

### 10. 🇴🇲 Oman — 11 Governorates

| Governorate | Main City |
|---|---|
| Ad Dakhiliyah | Nizwa |
| Ad Dhahirah | Ibri |
| Al Batinah North | Sohar |
| Al Batinah South | Rustaq |
| Al Buraimi | Al Buraimi |
| Al Wusta | Haima |
| Ash Sharqiyah North | Ibra |
| Ash Sharqiyah South | Sur |
| Dhofar | Salalah |
| Musandam | Khasab |
| Muscat | Muscat |

**PSEO Page Count Estimate:** 11 cities → 110+ pages

---

### 11. 🇧🇭 Bahrain — 4 Governorates

| Governorate | Main City(ies) |
|---|---|
| Capital Governorate | Manama |
| Muharraq Governorate | Muharraq |
| Northern Governorate | Hamad Town |
| Southern Governorate | Riffa, Awali |

**PSEO Page Count Estimate:** 5 cities → 50+ pages

---

### 12. 🇹🇳 Tunisia — 24 Governorates

| Governorate | Main City |
|---|---|
| Ariana | Ariana |
| Béja | Béja |
| Ben Arous | Ben Arous |
| Bizerte | Bizerte |
| Gabès | Gabès |
| Gafsa | Gafsa |
| Jendouba | Jendouba |
| Kairouan | Kairouan |
| Kasserine | Kasserine |
| Kebili | Kebili |
| Kef | El Kef |
| Mahdia | Mahdia |
| Manouba | Manouba |
| Medenine | Medenine |
| Monastir | Monastir |
| Nabeul | Nabeul |
| Sfax | Sfax |
| Sidi Bouzid | Sidi Bouzid |
| Siliana | Siliana |
| Sousse | Sousse |
| Tataouine | Tataouine |
| Tozeur | Tozeur |
| Tunis | Tunis |
| Zaghouan | Zaghouan |

**PSEO Page Count Estimate:** 24 cities → 240+ pages

---

### 13. 🇱🇧 Lebanon — 9 Governorates

| Governorate | Main City |
|---|---|
| Akkar | Halba |
| Baalbek-Hermel | Baalbek |
| Beirut | Beirut |
| Beqaa | Zahlé |
| Keserwan-Jbeil | Jounieh |
| Mount Lebanon | Baabda |
| Nabatieh | Nabatieh |
| North | Tripoli |
| South | Sidon |

**PSEO Page Count Estimate:** 9 cities → 90+ pages

---

### 14. 🇱🇾 Libya — 22 Districts (Shabiyat)

| District | Main City |
|---|---|
| Al Wahat | Ajdabiya |
| Benghazi | Benghazi |
| Butnan | Tobruk |
| Derna | Derna |
| Ghat | Ghat |
| Jabal al Akhdar | Bayda |
| Jabal al Gharbi | Gharyan |
| Jafara | Al 'Aziziya |
| Jufra | Hun |
| Kufra | Al Jawf |
| Marj | Marj |
| Misrata | Misrata |
| Murqub | Al Khums |
| Murzuq | Murzuk |
| Nalut | Nalut |
| Nuqat al Khams | Zuwara |
| Sabha | Sabha |
| Sirte | Sirte |
| Tripoli | Tripoli |
| Wadi al Hayaa | Ubari |
| Wadi al Shatii | Brak |
| Zawiya | Zawiya |

**PSEO Page Count Estimate:** 22 cities → 220+ pages

---

### 15. 🇾🇪 Yemen — 21 Governorates + 1 Municipality

| Governorate | Main City |
|---|---|
| Abyan | Zinjibar |
| Aden | Aden |
| Al Bayda | Al Bayda |
| Al Dhale | Al Dhale |
| Al Hudaydah | Al Hudaydah |
| Al Jawf | Al Hazm |
| Al Mahrah | Al Ghaydah |
| Al Mahwit | Al Mahwit |
| Amanat al-Asimah (Municipality) | Sanaa |
| Amran | Amran |
| Dhamar | Dhamar |
| Hadhramaut | Mukalla |
| Hajjah | Hajjah |
| Ibb | Ibb |
| Lahij | Lahij |
| Marib | Marib |
| Raymah | Al Jabin |
| Saada | Saada |
| Sanaa | Sanaa |
| Shabwah | Ataq |
| Socotra | Hadibu |
| Taiz | Taiz |

**PSEO Page Count Estimate:** 22 cities → 220+ pages

---

### 16. 🇸🇾 Syria — 14 Governorates

| Governorate | Main City |
|---|---|
| Aleppo | Aleppo |
| Al-Hasakah | Al-Hasakah |
| As-Suwayda | As-Suwayda |
| Damascus | Damascus |
| Daraa | Daraa |
| Deir ez-Zor | Deir ez-Zor |
| Hama | Hama |
| Homs | Homs |
| Idlib | Idlib |
| Latakia | Latakia |
| Quneitra | Quneitra |
| Raqqa | Raqqa |
| Rif Dimashq | Douma |
| Tartus | Tartus |

**PSEO Page Count Estimate:** 14 cities → 140+ pages

---

### 17. 🇩🇯 Djibouti — 6 Regions

| Region | Main City |
|---|---|
| Ali Sabieh | Ali Sabieh |
| Arta | Arta |
| Dikhil | Dikhil |
| Djibouti Region | Djibouti City |
| Obock | Obock |
| Tadjourah | Tadjourah |

**PSEO Page Count Estimate:** 6 cities → 60+ pages

---

### Geographic PSEO Summary

| # | Country | Divisions | Major Cities | Est. PSEO Pages |
|---|---|---|---|---|
| 1 | 🇸🇦 Saudi Arabia | 13 Regions | 15+ | 150+ |
| 2 | 🇦🇪 UAE | 7 Emirates | 8 | 80+ |
| 3 | 🇪🇬 Egypt | 27 Governorates | 28 | 280+ |
| 4 | 🇶🇦 Qatar | 8 Municipalities | 8 | 80+ |
| 5 | 🇰🇼 Kuwait | 6 Governorates | 6 | 60+ |
| 6 | 🇲🇦 Morocco | 12 Regions | 12 | 120+ |
| 7 | 🇩🇿 Algeria | 58 Provinces | 58 | 580+ |
| 8 | 🇮🇶 Iraq | 19 Governorates | 19 | 190+ |
| 9 | 🇯🇴 Jordan | 12 Governorates | 12 | 120+ |
| 10 | 🇴🇲 Oman | 11 Governorates | 11 | 110+ |
| 11 | 🇧🇭 Bahrain | 4 Governorates | 5 | 50+ |
| 12 | 🇹🇳 Tunisia | 24 Governorates | 24 | 240+ |
| 13 | 🇱🇧 Lebanon | 9 Governorates | 9 | 90+ |
| 14 | 🇱🇾 Libya | 22 Districts | 22 | 220+ |
| 15 | 🇾🇪 Yemen | 22 Governorates | 22 | 220+ |
| 16 | 🇸🇾 Syria | 14 Governorates | 14 | 140+ |
| 17 | 🇩🇯 Djibouti | 6 Regions | 6 | 60+ |
| **Total** | **17 Countries** | **274 Divisions** | **~279 Cities** | **~2,790+ Pages** |

**PSEO Implication:** 279 cities × 10 content categories per city = **2,790+ location-specific landing pages**. Combined with non-location pages (comparisons, how-tos, glossaries, tools), total PSEO page count exceeds **31,000+ pages**.

---

## Section 6: Current SEO State & Gaps

### Current Public Pages (7 pages total)
| Page | URL | Status |
|---|---|---|
| Landing | `/` | ✅ Built, good hero section |
| Pricing | `/pricing` | ✅ Built, comparison table |
| Login | `/login` | ✅ Built |
| Dashboard | `/dashboard/*` | 🔒 Auth required |
| Generate | `/dashboard/generate` | 🔒 Auth required |
| Briefs | `/dashboard/briefs` | 🔒 Auth required |
| Websites | `/dashboard/websites` | 🔒 Auth required |

### Critical SEO Gaps Identified

1. **❌ Only 2 public pages indexed** (sitemap.ts only includes `/` and `/pricing`)
2. **❌ No blog/subdirectory** — no `/blog/` or `/learn/` section
3. **❌ No tool pages** — no `/tools/keyword-generator/`, `/tools/schema-builder/` etc.
4. **❌ No category/location pages** — e.g., `/saudi-arabia/content-writing/`, `/uae/seo-services/`
5. **❌ No glossary or dictionary** — e.g., `/glossary/what-is-seo/`
6. **❌ No comparison pages** — e.g., `/compare/alternatives-to-frase/`
7. **❌ No Arabic landing pages per intent** — e.g., `/how-to-write-seo-content/`
8. **❌ No multilingual pages** — site is fully Arabic RTL, no English version
9. **❌ No case studies or portfolio** — no `/case-studies/` section
10. **❌ No free tools/generators** — no `/free-tools/` section
11. **❌ Thin sitemap** — only 2 URLs, no dynamic generation
12. **❌ No blog posts** — zero content marketing articles
13. **❌ No author pages** — no `/authors/` landing pages
14. **❌ No /tools/ section** — no utility pages to attract backlinks
15. **❌ No "best of" lists** — no `/best-arabic-seo-tools/` type content

### Current SEO Metrics (Estimated)
- **Domain Authority / DR:** New domain, likely 0-5
- **Backlinks:** Minimal (new site)
- **Organic Traffic:** Near zero (only 2 indexed pages)
- **Sitemap:** Static, 2 entries only
- **robots.txt:** Allows all, only blocks /dashboard, /api

---

## Section 7: PSEO Opportunity Analysis

### Why WasafSEO Is Perfect for Programmatic SEO

1. **Own AI Generation API** — WasafSEO has its own content generation API (`/api/generate`) that uses Deepseek. This means **zero external content cost** — the PSEO system can generate landing pages using WasafSEO's own infrastructure.

2. **Arabic Niche Dominance** — No competitor has Arabic-first content generation at scale. PSEO creates a moat.

3. **Intent-Based Content** — The 5-intent system maps perfectly to PSEO page types:
   - **Informational** → Blog posts, guides, tutorials
   - **Commercial** → Product comparisons, best-of lists
   - **How-To** → Step-by-step guides, tutorials
   - **Comparison** → Tool comparisons, alternatives
   - **Navigational** → Location pages, brand queries

4. **Country-Specific Targeting** — 17 countries, 274 administrative divisions, ~279 major cities create massive keyword surface area.

### PSEO Page Types & Estimated Volume

| Page Type | Est. Volume | Example URL Pattern |
|---|---|---|
| Location + Intent Pages | 5,000+ | `/saudi-arabia/seo-services/`, `/dubai/content-writing/` |
| Tool Comparisons | 2,000+ | `/compare/wasafseo-vs-frase/`, `/ar/content-tools-comparison/` |
| "Best [X] in [Country/City]" | 3,000+ | `/best-seo-tools-in-dubai/`, `/افضل-ادوات-الس退و-في-جدة/` |
| How-To Guides | 5,000+ | `/how-to-write-seo-content/`, `/كيف-تكتب-محتوى-س退و/` |
| Glossary Terms | 2,000+ | `/glossary/seo/`, `/مصطلحات-الس退و/` |
| Keyword + Intent + Location | 10,000+ | `/seo-services/riyadh/informational/` |
| Niche + Location | 3,000+ | `/healthcare-seo/dubai/`, `/real-estate-seo/riyadh/` |
| GEO/AIO Optimized Pages | 1,000+ | `/chatgpt-seo-guide/`, `/sge-optimized-content/` |
| City-Specific Service Pages | 2,790+ | 279 cities × 10 categories |
| **Total Estimated Pages** | **~31,000+** | |

### Traffic Projection (Conservative, 12-month)

| Phase | Pages | Est. Monthly Traffic | Est. Monthly Value ($0.25-0.50 RPM) |
|---|---|---|---|
| Months 1-3 | 500 | 2,000-5,000 visits | $500-2,500 |
| Months 4-6 | 5,000 | 15,000-40,000 visits | $3,750-20,000 |
| Months 7-9 | 15,000 | 50,000-120,000 visits | $12,500-60,000 |
| Months 10-12 | 31,000+ | 150,000-400,000 visits | $37,500-200,000 |

---

## Section 8: Database & Data Model

### Tables (4 total)

#### users
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default uuid_generate_v4() |
| email | text | Unique, not null |
| name | text | Nullable |
| avatar_url | text | Nullable |
| plan | text | 'none', 'starter', 'pro', 'agency' — default 'none' |
| trial_ends_at | timestamptz | Nullable |
| lemon_customer_id | text | Nullable, indexed |
| lemon_order_id | text | Nullable |
| lemon_product_id | text | Nullable |
| lemon_variant_id | text | Nullable |
| subscription_id | text | Nullable |
| subscription_status | text | Nullable |
| subscription_paused_at | timestamptz | Nullable |
| payment_failed_at | timestamptz | Nullable |
| account_flagged | boolean | Default false |
| flagged_reason | text | Nullable |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Auto-updated |

#### websites
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id, indexed |
| name | text | |
| domain | text | |
| brand_name | text | |
| brand_description | text | |
| author_name | text | |
| author_title | text | |
| author_bio | text | |
| author_topics | text[] | |
| author_linkedin | text | Nullable |
| author_portfolio | text | Nullable |
| logo_url | text | Nullable |
| twitter | text | Nullable |
| linkedin | text | Nullable |
| wikipedia | text | Nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### briefs
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id, indexed |
| website_id | uuid | FK → websites.id |
| keyword | text | |
| intent | text | |
| location | text | Country code |
| additional_info | text | Nullable |
| brief_output | jsonb | Full BriefOutput |
| schema_output | jsonb | Full SchemaOutput |
| competitor_urls | text[] | Up to 3, nullable |
| created_at | timestamptz | |

#### usage
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | Unique, FK → users.id |
| month | text | Format: YYYY-MM |
| count | integer | Default 0 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Indexes (14 total)
- users: email (unique), lemon_customer_id, subscription_id
- websites: user_id, domain
- briefs: user_id, website_id, keyword, intent, created_at, location
- usage: user_id (unique), month

### RLS Policies
- users: user can read own row
- websites: user can CRUD own websites
- briefs: user can CRUD own briefs
- usage: user can read own usage, service role can upsert

---

## Section 9: Content Generation Pipeline

### Complete API Flow (src/app/api/generate/route.ts)

```
Request → requireSession() → getUserFromDb() → checkAccountAccess()
  → Zod validation → checkUsageLimit() → fetch website from Supabase
  → generateContentBrief() [Call 1 - Deepseek, 8000 tokens, temp 0.7]
  → generateSchema(brief) [Call 2 - Deepseek, 4000 tokens, temp 0.3]
  → Insert brief + schema to Supabase (briefs table)
  → incrementUsage()
  → Return { brief, schema, briefId }
```

### Deepseek API Configuration
- **Model:** `deepseek-chat` (never change)
- **Endpoint:** `https://api.deepseek.com/v1/chat/completions`
- **Auth:** `Authorization: Bearer ${DEEPSEEK_API_KEY}`
- **Call 1:** `max_tokens: 8000`, `temperature: 0.7`
- **Call 2:** `max_tokens: 4000`, `temperature: 0.3`
- **Retries:** max 2 retries on parse failure, 1000ms wait
- **JSON Parsing:** Strip ```json/``` then JSON.parse

### Prompt Architecture (src/lib/prompts.ts)
**Call 1 System Prompt:** Arabic SEO content strategist & GEO specialist
- Language rule: output always Arabic regardless of input
- 5 intent types with different title patterns
- GEO citation rules (stats, quotes, E-E-A-T)
- Strict JSON output format
- Conditional blocks for comparisonTable and howToSteps

**Call 2 System Prompt:** Schema.org JSON-LD engineer
- Rules for: Article, FAQPage, HowTo, ItemList, BreadcrumbList, Organization, Person, WebPage
- Conditional entity inclusion based on brief content
- All fields from Call 1 output must map to schema fields
- Never use placeholder values

---

## Section 10: Business Model & Pricing

### Revenue Model
- **SaaS subscription** (monthly recurring revenue)
- **3 tiers:** Starter ($49), Pro ($149), Agency ($399)
- **Payment processor:** Lemon Squeezy (handles VAT, global taxes)
- **Customer portal:** Self-serve subscription management via Lemon Squeezy

### Conversion Funnel
1. **Landing page** → Free trial (3 days, 3 briefs)
2. **Trial usage** → 80%+ usage triggers upgrade prompt
3. **Trial expiry** → Limits enforced, upgrade gate shown
4. **Converted** → Full plan access
5. **Downsell path** → Payment failure → grace period → downgrade to 'none'
6. **Reactivation** → Email + portal access

### Key Metrics to Track
- Trial → Paid conversion rate
- Monthly recurring revenue (MRR)
- Briefs generated per user per month
- Average session duration on brief results
- Export rate (PDF, schema copy)
- Churn rate by plan

---

## Section 11: Marketing & Conversion Funnel

### Current Marketing Assets
- Landing page with problem/solution framing
- Social proof section (500+ briefs, 10 countries, 95% satisfaction)
- 3 testimonials (placeholder names)
- Pricing page with feature comparison table
- FAQ section on pricing page

### Missing Marketing Elements
1. ❌ Blog/content marketing section
2. ❌ Email capture before trial
3. ❌ Case studies / success stories
4. ❌ Free tools to attract organic traffic
5. ❌ Comparison pages vs competitors
6. ❌ Video demos or interactive walkthrough
7. ❌ Customer testimonials (real names/faces)
8. ❌ Social media proof (Twitter/ LinkedIn mentions)
9. ❌ Partner/affiliate program

---

## Section 12: PSEO Content Categories & Keyword Universe

### Category 1: Location-Based Service Pages
Pattern: `/{country}/seo/` or `/{country}/{service}/`
Keywords: "خدمات السيو في السعودية", "كتابة محتوى في دبي", "استشارات سيو في قطر"
**Scale:** 279 cities × 5 service types = 1,395 pages

### Category 2: How-To Guides (Intent: how-to)
Pattern: `/how-to/{topic}/` or `/كيف-{topic}/`
Keywords: "كيف تكتب محتوى سيو", "كيف تحسن ترتيب موقعك", "كيف تبدأ في السيو"
**Scale:** 500+ topics

### Category 3: Tool Comparisons (Intent: comparison)
Pattern: `/compare/{tool-a}-vs-{tool-b}/`
Keywords: "واساف سيو ضد فراز", "أفضل أدوات السيو", "بدائل جوجل ترندز"
**Scale:** 200+ comparisons

### Category 4: Best-of Lists by Location
Pattern: `/best/{category}/in/{country}/` or `/best/{category}/in/{city}/`
Keywords: "أفضل أدوات السيو في الرياض", "أفضل شركات السيو في دبي"
**Scale:** 279 cities × 5 categories = 1,395 pages

### Category 5: Glossary/Dictionary (Intent: informational)
Pattern: `/glossary/{term}/`
Keywords: "ما هو السيو", "مصطلحات السيو", "تعريف الكلمة المفتاحية"
**Scale:** 500+ terms

### Category 6: GEO/AIO Optimized Content
Pattern: `/chatgpt-seo/{topic}/`
Keywords: "تحسين المحتوى لجوجل SGE", "كتابة لشات جي بي تي", "سيو لمحركات الذكاء الاصطناعي"
**Scale:** 200+ topics

### Category 7: Niche + Intent Clusters
Pattern: `/{niche}/{intent}/` or `/{niche}/in/{city}/`
Keywords: "سيو الرعاية الصحية في جدة", "كتابة محتوى عقاري في دبي", "تحسين متاجر التجزئة في الرياض"
**Scale:** 279 cities × 10 niches = 2,790 pages

### Category 8: Tool Pages (Own Product)
Pattern: `/tools/{tool-name}/`
Keywords: "أداة كتابة المحتوى بالعربي", "مولد موجز السيو", "منشئ شيفرة schema"
**Scale:** 20+ tool pages

### Keyword Research Sources
- Google Keyword Planner (Arabic markets)
- Ahrefs / Semrush (Arabic keyword databases)
- AnswerThePublic (Arabic question data)
- Google Trends (country-specific)
- Google Search Console (own site data)
- ChatGPT-generated keyword clusters (validated against real data)

---

## Section 13: Technology Stack Reference

### Dependencies (package.json)
| Package | Version | Purpose |
|---|---|---|
| next | 16.2.4 | Framework |
| react / react-dom | 19.2.4 | UI library |
| next-auth (beta) | 5.0.0-beta.31 | Authentication |
| @supabase/supabase-js | 2.49.1 | Supabase client |
| @supabase/ssr | 0.6.1 | Supabase SSR |
| zod | 4.0.0-beta.20250416 | Validation |
| react-hook-form | 7.54.2 | Form management |
| @hookform/resolvers | 5.0.1 | Zod resolver for RHF |
| framer-motion | 12.6.3 | Animation |
| lucide-react | 0.485.0 | Icons |
| @lemonsqueezy/lemonsqueezy.js | 4.0.3 | Lemon Squeezy SDK |
| resend | 4.2.0 | Email service |
| @react-pdf/renderer | 4.3.0 | PDF generation |
| react-syntax-highlighter | 15.6.1 | Code block display |
| @radix-ui/react-accordion | 1.2.10 | Accordion component |
| @radix-ui/react-dialog | 1.1.11 | Dialog/modal |
| @radix-ui/react-tabs | 1.1.9 | Tabs component |
| @radix-ui/react-tooltip | 1.2.4 | Tooltips |
| clsx | 2.1.1 | Class merging |
| tailwind-merge | 3.2.0 | Tailwind class dedup |

### Environment Variables Required
```
NEXTAUTH_URL
NEXTAUTH_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
DEEPSEEK_API_KEY
RESEND_API_KEY
LEMON_SQUEEZY_API_KEY
LEMON_SQUEEZY_WEBHOOK_SECRET
LEMON_SQUEEZY_STORE_ID
LEMON_SQUEEZY_STARTER_VARIANT_ID
LEMON_SQUEEZY_PRO_VARIANT_ID
LEMON_SQUEEZY_AGENCY_VARIANT_ID
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_GA_MEASUREMENT_ID
```

---

## Section 14: Appendices

### A. Webhook Events Handled (Lemon Squeezy)
**Critical (update database):** subscription_created, subscription_updated, subscription_cancelled, subscription_resumed, subscription_expired, subscription_paused, subscription_unpaused, subscription_payment_failed, subscription_payment_success, subscription_payment_recovered, subscription_plan_changed, order_refunded, dispute_created, dispute_resolved

**Useful (email/log only):** order_created, subscription_payment_refunded

**Ignore (return 200, no action):** affiliate_activated, customer_updated

### B. All API Routes
| Method | Route | Purpose |
|---|---|---|
| POST | /api/auth/[...nextauth] | Auth.js handlers |
| POST | /api/generate | Generate content brief |
| POST | /api/billing/checkout | Create checkout URL |
| POST | /api/billing/portal | Get customer portal URL |
| GET | /api/briefs | List user's briefs |
| GET | /api/briefs/[id] | Get single brief |
| GET | /api/websites | List user's websites |
| POST | /api/websites | Create website |
| GET | /api/websites/[id] | Get single website |
| PATCH | /api/websites/[id] | Update website |
| DELETE | /api/websites/[id] | Delete website |
| GET | /api/websites/count | Get website count |
| GET | /api/user | Get user profile |
| POST | /api/export/pdf | Export brief as PDF |
| POST | /api/webhooks/lemonsqueezy | Lemon Squeezy webhooks |

### C. Error Response Format (All API Routes)
```typescript
Success: { data: T }
Error: { error: string, message: string }
// Status codes: 200, 201, 401, 403, 404, 500
```

### D. Session User Type
```typescript
interface SessionUser {
  userId: string;
  email: string;
  name: string | null;
  plan: string;
  trialEndsAt: string | null;
  isFlagged: boolean;
  subscriptionPausedAt: string | null;
  paymentFailedAt: string | null;
  lemonCustomerId: string | null;
}
```

### E. PSEO Geographic Matrix — Complete City Count
| Country | Admin Divisions | Major Cities |
|---|---|---|
| 🇸🇦 Saudi Arabia | 13 Regions | 15 |
| 🇦🇪 UAE | 7 Emirates | 8 |
| 🇪🇬 Egypt | 27 Governorates | 28 |
| 🇶🇦 Qatar | 8 Municipalities | 8 |
| 🇰🇼 Kuwait | 6 Governorates | 6 |
| 🇲🇦 Morocco | 12 Regions | 12 |
| 🇩🇿 Algeria | 58 Provinces | 58 |
| 🇮🇶 Iraq | 19 Governorates | 19 |
| 🇯🇴 Jordan | 12 Governorates | 12 |
| 🇴🇲 Oman | 11 Governorates | 11 |
| 🇧🇭 Bahrain | 4 Governorates | 5 |
| 🇹🇳 Tunisia | 24 Governorates | 24 |
| 🇱🇧 Lebanon | 9 Governorates | 9 |
| 🇱🇾 Libya | 22 Districts | 22 |
| 🇾🇪 Yemen | 22 Governorates | 22 |
| 🇸🇾 Syria | 14 Governorates | 14 |
| 🇩🇯 Djibouti | 6 Regions | 6 |
| **Total** | **274 Divisions** | **~279 Cities** |

---

**End of Document.** This summary covers the complete WasafSEO application — product, architecture, codebase, market positioning, SEO gaps, PSEO opportunity, and the full geographic matrix of 17 countries, 274 administrative divisions, and ~279 major cities for location-based Programmatic SEO content generation.
