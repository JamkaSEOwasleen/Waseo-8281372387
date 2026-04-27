# UI English Localization Plan

## Objective
Replace all Arabic UI text with English. Only Deepseek-generated content (briefs, JSON-LD schema) remains in Arabic.

## Important Rules
- NEVER modify `src/lib/prompts.ts` — sacred prompt architecture
- NEVER modify `src/lib/deepseek.ts` — API call logic
- NEVER modify `src/lib/pseo/pseo-prompt-extensions.ts` — PSEO prompt extensions
- Generated content output (briefs, schema) stays Arabic — that's the product
-never change any logic,workflow,structure. do not change any theme
-only change the arabic ui text with english with same meaning and tone proffessionally 

---

## Phase 1: Constants & Data Layer

### Files to Modify

#### 1. `src/lib/constants.ts`
- [ ] **Remove `nameAr`** from PLANS array — just use English `name` or `labelEn`
- [ ] **Remove `featuresAr`** arrays — UI uses `features` (English) only
- [ ] **Remove `nameAr`** from COUNTRIES — or keep if needed for generated content context
- [ ] **Remove `labelAr`** from INTENT_OPTIONS — UI uses `labelEn`
- [ ] **Remove `labelAr`** from NICHE_OPTIONS — UI uses `labelEn`
- [ ] **Remove `CountryOption.nameAr`** type field if no longer used anywhere
- [ ] **Remove `IntentOption.labelAr`** type field if no longer used
- [ ] **Remove `NicheOption.labelAr`** type field if no longer used

#### 2. `src/lib/usage.ts`
- [ ] Line 53: Change `'لا يوجد اشتراك نشط. يرجى الاشتراك للمتابعة.'` → `'No active subscription. Please subscribe to continue.'`
- [ ] Line 74: Change `'لقد استنفدت حد الموجزات لهذا الشهر. يرجى ترقية خطتك للمتابعة.'` → `'You have reached your monthly brief limit. Please upgrade your plan to continue.'`

### Type Changes
- [ ] Update `PlanConfig` in `src/types/index.ts` — remove `nameAr`, `featuresAr` if present
- [ ] Update `CountryOption` — remove `nameAr` if no longer used
- [ ] Update `IntentOption` — remove `labelAr` if no longer used
- [ ] Update `NicheOption` — remove `labelAr` if no longer used

### Side Effect Checks
- [ ] Check `src/app/pricing/page.tsx` — uses `PLANS[].features` (English), should be fine
- [ ] Check `src/app/dashboard/billing/page.tsx` — uses `nameAr` directly, needs update
- [ ] Check `src/app/dashboard/websites/new/WebsiteWizard.tsx` — line 361: shows both `country.nameEn` and `country.nameAr`. Keep only `nameEn`
- [ ] Check `src/app/dashboard/websites/new/WebsiteWizard.tsx` — line 339: uses `niche.labelAr` as fallback. Remove fallback, use `labelEn` only

---

## Phase 2: Public/Marketing Pages

### Files to Modify

#### 3. `src/app/page.tsx` (Landing Page)
- [ ] Line 133: Replace `'أفضل 10 استراتيجيات تحسين محركات البحث في السعودية 2026'` with an English sample title like `'Top 10 SEO Strategies for Saudi Arabia 2026'`

#### 4. `src/app/login/LoginForm.tsx`
- [ ] Line 33: `'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.'` → `'An error occurred during sign in. Please try again.'`
- [ ] Line 49: `'حدث خطأ أثناء إرسال رابط تسجيل الدخول. يرجى المحاولة مرة أخرى.'` → `'An error occurred sending the login link. Please try again.'`
- [ ] Line 67: `'أداة توليد المحتوى العربي الذكي'` → `'AI-Powered Arabic Content Generator'`
- [ ] Line 76: `'3 أيام تجريبية مجانية مع خطة Starter'` → `'3-day free trial with Starter plan'`
- [ ] Line 135: `'متابعة مع Google'` → `'Continue with Google'`
- [ ] Line 141: `'أو'` → `'or'`
- [ ] Line 148: `'✓ تم الإرسال!'` → `'✓ Sent!'`
- [ ] Line 150: `'تحقق من بريدك الإلكتروني للحصول على رابط تسجيل الدخول'` → `'Check your email for the login link'`
- [ ] Line 160: `'البريد الإلكتروني'` → `'Email'`
- [ ] Line 168: `'أدخل بريدك الإلكتروني'` → `'Enter your email'`
- [ ] Line 202: `'إرسال رابط تسجيل الدخول'` → `'Send Login Link'`
- [ ] Remove `dir="rtl"` from input at line 171

#### 5. `src/app/login/page.tsx`
- [ ] Line 31: Change `dir="rtl"` to `dir="ltr"` on the main element
- [ ] Lines 38-52: Replace Arabic terms/privacy footer with English
  - `'بالمتابعة، أنت توافق على'` → `'By continuing, you agree to'`
  - `'شروط الخدمة'` → `'Terms of Service'`
  - `'و'` → `'and'`
  - `'سياسة الخصوصية'` → `'Privacy Policy'`

---

## Phase 3: Dashboard Account Pages

### Files to Modify

#### 6. `src/app/dashboard/account/page.tsx`
- [ ] Lines 27-28: Metadata title/description
  - `'الحساب - WasafSEO'` → `'Account - WasafSEO'`
  - `'إدارة حسابك الشخصي وخطة الاشتراك'` → `'Manage your personal account and subscription plan'`
- [ ] Lines 112-115: `planLabels` map — translate all values
  - `'المبتدئ'` → `'Starter'`
  - `'احترافي'` → `'Pro'`
  - `'وكالة'` → `'Agency'`
  - `'مجاني'` → `'Free'`
- [ ] Line 123: `'الحساب'` → `'Account'`
- [ ] Line 126: `'إدارة ملفك الشخصي وخطة الاشتراك والإعدادات'` → `'Manage your profile, subscription plan, and settings'`
- [ ] Line 134: `'الملف الشخصي'` → `'Profile'`
- [ ] Line 157: `'مستخدم'` → `'User'`
- [ ] Line 182: `'الخطة والاستخدام'` → `'Plan & Usage'`
- [ ] Line 198: `'تجريبي'` → `'Trial'`
- [ ] Line 203: `'احترافي'` → `'Pro'`
- [ ] Line 208: `'وكالة'` → `'Agency'`
- [ ] Line 213: `'بدون خطة'` → `'No Plan'`
- [ ] Line 221: `'متبقي {X} أيام من الفترة التجريبية'` → `'{X} days remaining in trial'`
- [ ] Line 229: `'تم إلغاء الاشتراك في'` → `'Subscription cancelled on'`
- [ ] Line 237: `'فشلت عملية الدفع. يرجى تحديث وسيلة الدفع.'` → `'Payment failed. Please update your payment method.'`
- [ ] Line 257: `'استخدام الموجزات'` → `'Brief Usage'`
- [ ] Line 265: `'موجز هذا الشهر'` → `'briefs this month'`
- [ ] Line 284: `'استخدام غير محدود — لا يوجد حد شهري'` → `'Unlimited usage — no monthly limit'`
- [ ] Line 291: `'المواقع الإلكترونية'` → `'Websites'`
- [ ] Line 295: `'غير محدود'` → `'Unlimited'`
- [ ] Line 308: `'سجل الاستخدام'` → `'Usage History'`
- [ ] Line 318: `'الشهر'` → `'Month'`
- [ ] Line 321: `'الموجزات المنشأة'` → `'Briefs Generated'`
- [ ] Lines 329-340: Replace Arabic month names with English (يناير→January, etc.)
- [ ] Line 352: `'{count} موجز'` → `'{count} briefs'`
- [ ] Remove `toLocaleString('ar-AE')` calls — use default or `en-US`

#### 7. `src/app/dashboard/account/AccountClient.tsx`
- [ ] Line 44: `'فشل تحديث الاسم'` → `'Failed to update name'`
- [ ] Line 51: `'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'` → `'An unexpected error occurred. Please try again.'`
- [ ] Line 65: `'الاسم'` → `'Name'`
- [ ] Line 72: `'الاسم الكامل'` → `'Full name'`
- [ ] Line 81: `'البريد الإلكتروني'` → `'Email'`
- [ ] Line 87: `'البريد الإلكتروني مرتبط بحسابك ولا يمكن تغييره'` → `'Email is linked to your account and cannot be changed'`
- [ ] Line 100: `'حفظ التغييرات'` → `'Save Changes'`
- [ ] Line 104: `'تم الحفظ بنجاح ✓'` → `'Saved successfully ✓'`

#### 8. `src/app/dashboard/account/AccountActions.tsx`
- [ ] Line 51: `'البريد الإلكتروني غير مطابق. يرجى التأكيد باستخدام بريدك الإلكتروني المسجل.'` → `'Email does not match. Please confirm using your registered email.'`
- [ ] Line 69: `'فشل في حذف الحساب. يرجى المحاولة مرة أخرى.'` → `'Failed to delete account. Please try again.'`
- [ ] Line 78: `'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'` → `'An unexpected error occurred. Please try again.'`
- [ ] Line 97: `'إدارة الفوترة'` → `'Manage Billing'`
- [ ] Line 106: `'ترقية الخطة'` → `'Upgrade Plan'`
- [ ] Line 119: `'منطقة الخطر'` → `'Danger Zone'`
- [ ] Line 128: `'حذف الحساب'` → `'Delete Account'`
- [ ] Lines 131-132: `'سيؤدي حذف حسابك إلى إزالة جميع الموجزات...'` → English version
- [ ] Line 141: `'حذف الحساب'` → `'Delete Account'`
- [ ] Line 166: `'تأكيد حذف الحساب'` → `'Confirm Account Deletion'`
- [ ] Lines 168-170: `'هذا الإجراء نهائي...'` → English version
- [ ] Line 175: `'يرجى كتابة بريدك الإلكتروني'` → `'Please type your email'`
- [ ] Line 208: `'إلغاء'` → `'Cancel'`
- [ ] Line 215: `'جاري الحذف...'` / `'تأكيد الحذف'` → `'Deleting...'` / `'Confirm Deletion'`

---

## Phase 4: Dashboard Briefs & Generate Pages

### Files to Modify

#### 9. `src/app/dashboard/briefs/page.tsx`
- [ ] Line 10: `'الموجزات - WasafSEO'` → `'Briefs - WasafSEO'`
- [ ] Line 11: `'استعراض جميع الموجزات السابقة مع إمكانية البحث والتصفية'` → `'Browse all previous briefs with search and filtering'`
- [ ] Line 20: `'الموجزات'` → `'Briefs'`
- [ ] Line 23: `'استعراض وإدارة جميع الموجزات التي قمت بإنشائها'` → `'View and manage all briefs you have created'`

#### 10. `src/app/dashboard/briefs/BriefsListClient.tsx`
- [ ] Line 32: `'الأحدث'` → `'Newest'`
- [ ] Line 33: `'الأقدم'` → `'Oldest'`
- [ ] Line 37: `'جميع الأنواع'` → `'All Types'`
- [ ] Line 38: `'معلوماتي'` → `'Informational'`
- [ ] Line 39: `'كيف تفعل'` → `'How-To'`
- [ ] Line 40: `'تجاري'` → `'Commercial'`
- [ ] Line 41: `'مقارنة'` → `'Comparison'`
- [ ] Line 42: `'تنقلي'` → `'Navigational'`
- [ ] Line 96: `'كلمة'` → `'words'`
- [ ] Line 100: `'عرض ←'` → `'View →'`
- [ ] Line 199: `'البحث عن كلمة مفتاحية...'` → `'Search by keyword...'`
- [ ] Line 238: `'إجمالي {count} موجز'` → `'Total {count} briefs'`
- [ ] Line 239: `'لا توجد موجزات'` → `'No briefs'`
- [ ] Line 261: `'لا توجد نتائج للبحث'` → `'No search results'`
- [ ] Line 266: `'لم تقم بإنشاء أي موجز بعد'` → `'No briefs created yet'`
- [ ] Line 265: `'حاول تغيير معايير البحث أو إزالة الفلاتر'` → `'Try changing search criteria or clearing filters'`
- [ ] Line 266: `'ابدأ بإنشاء أول موجز محتوى محسّن لمحركات البحث باللغة العربية'` → `'Start by creating your first Arabic SEO-optimized content brief'`
- [ ] Line 270: `'إنشاء موجز جديد'` → `'Create New Brief'`
- [ ] Line 305: `'السابق'` → `'Previous'`
- [ ] Line 344: `'التالي'` → `'Next'`
- [ ] Line 95-96: Remove `toLocaleString('ar-AE')` — use default
- [ ] Line 238: Remove `toLocaleString('ar-AE')`

#### 11. `src/app/dashboard/briefs/[id]/page.tsx`
- [ ] Line 82: `'العودة إلى الموجزات'` → `'Back to Briefs'`
- [ ] Line 143: `'موجز محتوى لكلمة "{keyword}"'` → `'Content brief for "{keyword}"'`
- [ ] Line 151: `'الموجز - WasafSEO'` → `'Brief - WasafSEO'`
- [ ] Line 152: `'عرض موجز المحتوى'` → `'View content brief'`

#### 12. `src/app/dashboard/briefs/[id]/BriefViewClient.tsx`
- [ ] Line 46: `'فشل في حذف الموجز'` → `'Failed to delete brief'`
- [ ] Line 54: `'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'` → `'An unexpected error occurred. Please try again.'`
- [ ] Line 69: `'هل تريد إنشاء موجز مشابه أو حذف هذا الموجز؟'` → `'Would you like to create a similar brief or delete this one?'`
- [ ] Line 75: `'إنشاء موجز مشابه'` → `'Create Similar Brief'`
- [ ] Line 87: `'حذف الموجز'` → `'Delete Brief'`
- [ ] Line 99: `'إلغاء'` → `'Cancel'`
- [ ] Line 107: `'تأكيد الحذف'` → `'Confirm Delete'`

#### 13. `src/app/dashboard/generate/page.tsx`
- [ ] Line 229: `'فشل إنشاء الموجز'` → `'Failed to create brief'`
- [ ] Line 233: `'فشل إنشاء الموجز'` → `'Failed to create brief'`
- [ ] Line 244: `'حدث خطأ غير متوقع'` → `'An unexpected error occurred'`

#### 14. `src/app/dashboard/billing/page.tsx`
- [ ] Lines 57, 68, 79, 90: Remove `nameAr` usage — use `name` (English) instead

---

## Phase 5: Shared Components

### Files to Modify

#### 15. `src/components/auth/UserMenu.tsx`
- [ ] Line 13: `'بدون خطة'` → `'No Plan'`
- [ ] Line 44: `'قائمة المستخدم'` → `'User menu'`
- [ ] Line 68: `'مستخدم'` → `'User'`
- [ ] Line 89: `'لوحة التحكم'` → `'Dashboard'`
- [ ] Line 100: `'الحساب والفواتير'` → `'Account & Billing'`
- [ ] Line 114: `'تسجيل الخروج'` → `'Sign Out'`

#### 16. `src/components/billing/UpgradeGate.tsx`
- [ ] Line 67: `'فشلت عملية الترقية'` → `'Upgrade failed'`
- [ ] Line 74: `'حدث خطأ غير متوقع'` → `'An unexpected error occurred'`

#### 17. `src/components/brief/BriefResults.tsx`
- [ ] Line 33: `labelMobile: 'الأساسيات'` → `labelMobile: 'Fundamentals'`
- [ ] Line 34: `labelMobile: 'الهيكل'` → `labelMobile: 'Structure'`
- [ ] Line 37: `labelMobile: 'تصدير'` → `labelMobile: 'Export'`

#### 18. `src/components/layout/Footer.tsx`
- [ ] Line 12: `'سياسة الخصوصية'` → `'Privacy Policy'`
- [ ] Line 13: `'شروط الخدمة'` → `'Terms of Service'`
- [ ] Line 17: `'الرئيسية'` → `'Home'`
- [ ] Line 18: `'الباقات'` → `'Pricing'`
- [ ] Line 19: `'تسجيل الدخول'` → `'Sign In'`
- [ ] Lines 45-46: `'منصة متخصصة في إنشاء موجزات المحتوى العربية المتوافقة مع SEO و JSON-LD.'` → `'A specialized platform for creating Arabic SEO content briefs with JSON-LD schema.'`
- [ ] Line 53: `'المنتج'` → `'Product'`
- [ ] Line 72: `'القانوني'` → `'Legal'`
- [ ] Line 95: `'جميع الحقوق محفوظة.'` → `'All rights reserved.'`
- [ ] Line 97: `'للمحتوى العربي 🌙'` → `'For Arabic content 🌙'`

---

## Phase 6: API Error Messages

### All files in `src/app/api/*/route.ts`

**Systematic change**: Replace every Arabic error `message` string with English. Pattern:

| Arabic | English |
|--------|---------|
| `'يجب تسجيل الدخول للوصول إلى هذه الخدمة.'` | `'You must sign in to access this service.'` |
| `'تم تعليق حسابك. يرجى التواصل مع الدعم.'` | `'Your account has been suspended. Please contact support.'` |
| `'لا يوجد اشتراك نشط. يرجى الاشتراك للمتابعة.'` | `'No active subscription. Please subscribe to continue.'` |
| `'انتهت الفترة التجريبية. يرجى ترقية خطتك للمتابعة.'` | `'Your trial has ended. Please upgrade your plan to continue.'` |
| `'الموقع غير موجود أو لا تملك صلاحية الوصول إليه.'` | `'Website not found or you do not have access.'` |
| `'فشل حفظ الموجز. يرجى المحاولة مرة أخرى.'` | `'Failed to save brief. Please try again.'` |
| `'بيانات غير صالحة'` | `'Invalid data'` |
| `'فشل إنشاء الموجز. يرجى المحاولة مرة أخرى.'` | `'Failed to create brief. Please try again.'` |
| `'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'` | `'An unexpected error occurred. Please try again.'` |
| `'فشل في جلب الموجزات'` | `'Failed to fetch briefs'` |
| `'الموجز غير موجود أو لا تملك صلاحية الوصول إليه.'` | `'Brief not found or you do not have access.'` |
| `'فشل في جلب الموجز'` | `'Failed to fetch brief'` |
| `'فشل في حذف الموجز'` | `'Failed to delete brief'` |
| `'فشل في إنشاء رابط الدفع'` | `'Failed to create checkout link'` |
| `'المستخدم غير موجود.'` | `'User not found.'` |
| `'لم يتم العثور على حساب فوترة. يرجى الاشتراك أولاً.'` | `'No billing account found. Please subscribe first.'` |
| `'فشل في الحصول على رابط لوحة الفوترة.'` | `'Failed to get billing portal link.'` |
| `'فشل في جلب المواقع'` | `'Failed to fetch websites'` |
| `'فشل في إنشاء الموقع'` | `'Failed to create website'` |
| `'فشل في جلب عدد المواقع'` | `'Failed to fetch website count'` |
| `'الموجز لا يحتوي على بيانات مكتملة.'` | `'Brief does not contain complete data.'` |
| `'فشل في إنشاء PDF. يرجى المحاولة مرة أخرى.'` | `'Failed to generate PDF. Please try again.'` |
| `'الاسم مطلوب'` | `'Name is required'` |
| `'الاسم طويل جداً'` | `'Name is too long'` |
| `'البريد الإلكتروني غير صالح'` | `'Invalid email'` |
| `'فشل تحديث الملف الشخصي.'` | `'Failed to update profile.'` |
| `'البريد الإلكتروني غير مطابق. يرجى التأكيد باستخدام بريدك الإلكتروني المسجل.'` | `'Email does not match. Please confirm using your registered email.'` |
| `'فشل في حذف الحساب. يرجى المحاولة مرة أخرى.'` | `'Failed to delete account. Please try again.'` |

### Files to Modify
- [ ] `src/app/api/generate/route.ts`
- [ ] `src/app/api/briefs/route.ts`
- [ ] `src/app/api/briefs/[id]/route.ts`
- [ ] `src/app/api/billing/checkout/route.ts`
- [ ] `src/app/api/billing/portal/route.ts`
- [ ] `src/app/api/websites/route.ts`
- [ ] `src/app/api/websites/[id]/route.ts`
- [ ] `src/app/api/websites/count/route.ts`
- [ ] `src/app/api/user/route.ts`
- [ ] `src/app/api/export/pdf/route.ts`
- [ ] `src/lib/validations.ts` — Zod error messages in Arabic

---

## Phase 7: PSEO Pages

### Files to Modify

**Note**: PSEO pages generate Arabic content pages for organic traffic. Some Arabic text here may be intentional (the content IS in Arabic). But UI chrome (navigation, buttons, section headers) should be English.

#### 19. `src/components/pseo/PSEONavbar.tsx`
- [ ] Line 24: `'الرئيسية'` → `'Home'`
- [ ] Line 25: `'الباقات'` → `'Pricing'`
- [ ] Line 26: `'تسجيل الدخول'` → `'Sign In'`
- [ ] Line 75: `'ابدأ مجاناً'` → `'Start Free'`
- [ ] Line 140: `'ابدأ مجاناً'` → `'Start Free'`

#### 20. `src/components/pseo/PSEOHero.tsx`
- [ ] Line 47: `'الكلمات'` → `'Words'`
- [ ] Line 48: `'الأقسام'` → `'Sections'`
- [ ] Line 49: `'الأسئلة'` → `'FAQs'`
- [ ] Line 50: `'إحصائيات محلية'` → `'Local Stats'`
- [ ] Line 70: `'احصل على موجزك المجاني'` → `'Get Your Free Brief'`

#### 21. `src/components/pseo/PSEOStatsSection.tsx`
- [ ] Line 47: `'إحصائيات وأرقام'` → `'Statistics & Figures'`

#### 22. `src/components/pseo/PSEOFAQSection.tsx`
- [ ] Line 26: `'الأسئلة الشائعة'` → `'Frequently Asked Questions'`

#### 23. `src/components/pseo/PSEOInternalLinks.tsx`
- [ ] Lines 15-18: Badge labels — `'مركز رئيسي'`→`'Hub'`, `'فرعي'`→`'Spoke'`, `'ذات صلة'`→`'Related'`, `'قريب'`→`'Nearby'`
- [ ] Line 34: `'اقرأ أيضاً'` → `'Read Also'`

#### 24. `src/components/pseo/PSEOFooter.tsx`
- [ ] Same as Phase 5 Footer — replace all Arabic text
- [ ] Line 17: `'الرئيسية'` → `'Home'`
- [ ] Line 18: `'الباقات'` → `'Pricing'`
- [ ] Line 19: `'تسجيل الدخول'` → `'Sign In'`

#### 25. `src/components/pseo/PSECTA.tsx`
- [ ] Line 53: `'ابدأ مع WasafSEO'` → `'Start with WasafSEO'`
- [ ] Lines 56-57: `'احصل على موجز محتوى متكامل...'` → `'Get a complete content brief with SEO optimization, JSON-LD schema, ready to publish.'`
- [ ] Line 71: `'احصل على موجزك المجاني'` → `'Get Your Free Brief'`
- [ ] Line 84: `'تعرف أكثر'` → `'Learn More'`

#### 26. `src/app/(pseo)/[pillar]/[location]/[[...subtopic]]/page.tsx`
- [ ] Line 55: `'الصفحة غير موجودة | WasafSEO'` → `'Page Not Found | WasafSEO'`
- [ ] Line 56: `'لم يتم العثور على الصفحة المطلوبة.'` → `'The requested page could not be found.'`
- [ ] Same for lines 65-66

#### 27. `src/lib/pseo/utils.ts`
- [ ] Lines 271-282: `pillarMap` — change `nameAr` to `nameEn` only (remove `nameAr`), or just use English names
- [ ] Line 86: Update regex — remove `(WasafSEO|ابدأ|جرب|سجل|اشترك|انضم)` → keep only `(WasafSEO|Start|Try|Subscribe|Join)` if needed

---

## Phase 8: Auth Emails

### Files to Modify

#### 28. `src/lib/auth.config.ts`
- [ ] Line 25: Subject `'رابط تسجيل الدخول إلى WasafSEO'` → `'Your WasafSEO Login Link'`
- [ ] Line 41: `'أداة توليد المحتوى العربي الذكي'` → `'AI-Powered Arabic Content Generator'`
- [ ] Line 44: `'مرحباً بك في WasafSEO'` → `'Welcome to WasafSEO'`
- [ ] Line 47: `'انقر على الرابط أدناه لتسجيل الدخول إلى حسابك'` → `'Click the link below to sign in to your account'`
- [ ] Line 54: `'تسجيل الدخول'` → `'Sign In'`
- [ ] Line 60: `'إذا لم تطلب هذا الرابط، يمكنك تجاهل هذه الرسالة بأمان.'` → `'If you did not request this link, you can safely ignore this email.'`

---

## Phase 9: Layout / RTL Configuration

### Files to Modify

#### 29. `src/app/layout.tsx`
- [ ] Change `lang="ar"` to `lang="en"`
- [ ] Change `dir="rtl"` to `dir="ltr"`
- [ ] Update metadata description from Arabic to English

#### 30. `src/app/globals.css`
- [ ] Review any RTL-specific CSS rules that need adjustment

#### 31. `src/lib/utils.ts`
- [ ] Line 17: Update `formatDate` function — change from Arabic locale to English
- [ ] Remove or update `formatDateAr` function — use `formatDateEn` as default

---

## Execution Order

Each phase is independent and can be worked on in any order. However, recommended order:

```
Phase 1 (Constants) → Phase 2 (Public Pages) → Phase 5 (Components) → 
Phase 3 (Account) → Phase 4 (Briefs) → Phase 6 (API Errors) → 
Phase 7 (PSEO) → Phase 8 (Emails) → Phase 9 (Layout)
```

This order prioritizes:
1. Data layer first (unblocks downstream consumers)
2. Most visible pages next (login, landing)
3. Shared components (used by many pages)
4. Deeper dashboard pages
5. API errors (backend — less visible)
6. PSEO (separate concern)
7. Emails and layout (final polish)
