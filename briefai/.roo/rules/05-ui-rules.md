# UI and Component Rules

## Arabic/RTL Rules
- Root html tag: lang="ar" dir="rtl"
- Individual English/LTR sections: use dir="ltr" on the specific element
- Arabic text must be high quality — not machine-translated
- All user-facing error messages in Arabic
- Dates formatted in Arabic locale: new Intl.DateTimeFormat('ar-AE').format(date)

## Dashboard UI Rules
- Sidebar width: 240px fixed on desktop, slide-out sheet on mobile
- All dashboard pages must show usage counter in sidebar
- Trial banner shown in header when user.plan === 'trial'
- UpgradeGate component wraps all Pro/Agency-only features
- UsageBanner shown when usage >= 80% of limit

## Form Rules
- All forms use react-hook-form + zod — no exceptions
- Show field-level validation errors inline below each field
- Submit button disabled while loading — show spinner
- On success: show toast notification in Arabic, then redirect or update state
- On error: show Arabic error message, keep form data intact

## Loading States
- Every data-fetching operation must have a loading skeleton
- Skeletons must match the shape of the loaded content
- Generate page loading: show animated progress messages that rotate
- Never show blank white flash between loading states

## Copy to Clipboard Pattern
navigator.clipboard.writeText(text)
  .then(() => setCopied(true))
  .finally(() => setTimeout(() => setCopied(false), 2000))
Button shows "تم النسخ ✓" for 2 seconds after copy

## WasafSEO Results Display Rules
- Always show 5 tabs: الأساسيات | هيكل المحتوى | عناصر GEO | Schema JSON-LD | التصدير
- JSON-LD tab uses react-syntax-highlighter with dark theme
- Schema always has: copy button, download as .json button, Google Rich Results Test link
- Expert quotes always show [REPLACE WITH REAL QUOTE] flag visually
- Stats always show [SOURCE: verify] flag visually

## Prohibited Patterns
- No inline styles (style={{...}}) — use Tailwind classes only
- No hardcoded colors — use design token classes only
- No alert() or confirm() — use Radix UI Dialog for confirmations
- No console.log in production code — use structured logging only
- No TODO comments in committed code — either implement or create a GitHub issue

#Logo Policy 
-Never use <img> tags, .jpg, or .png for the WasafSEO logo. 
-Always import and use the <WasafLogo /> component . This is critical for SEO and performance.