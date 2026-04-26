# Responsive UI Rules — Mobile & Desktop Equal Priority

## Core Philosophy
Mobile and desktop are equally important. Never build desktop-first and 
patch mobile later. Every component must be designed for both simultaneously.
A feature is not complete until it works perfectly on a 375px screen AND 
a 1440px screen.

---

## Breakpoint System (Tailwind)

Use ONLY these breakpoints — never custom breakpoints:

sm:   640px   → large mobile / small tablet
md:   768px   → tablet portrait
lg:   1024px  → tablet landscape / small laptop
xl:   1280px  → desktop
2xl:  1536px  → large desktop

Mobile-first always: write base styles for mobile, 
override with sm:, md:, lg:, xl: for larger screens.

NEVER write desktop styles first then use max-md: to patch mobile.

---

## Layout Rules

### Dashboard Layout
Mobile (< lg):
  - Sidebar hidden by default
  - Hamburger button in top header (top-left)
  - Sidebar slides in as full-height overlay (Sheet component)
  - Overlay backdrop closes sidebar on tap
  - Header: logo + hamburger left, user avatar right
  - Main content: full width, no margin for sidebar

Desktop (>= lg):
  - Sidebar fixed left, 240px wide
  - Main content: margin-left 240px
  - Header: page title left, actions right
  - Sidebar always visible, never collapsible

Implementation:
<aside class="
  fixed inset-y-0 left-0 z-50 w-[240px]
  -translate-x-full lg:translate-x-0
  transition-transform duration-200
  bg-surface-card border-r border-surface-border
">

### Page Content Width
- Mobile: w-full px-4
- Tablet: px-6
- Desktop: max-w-5xl mx-auto px-8
- Wide desktop: max-w-6xl mx-auto px-8

Never allow content to stretch to full width on large screens.

### Grid Layouts
Cards grid:
  Mobile:  grid-cols-1
  Tablet:  grid-cols-2
  Desktop: grid-cols-3 or grid-cols-4

Stats row:
  Mobile:  grid-cols-2 (2x2)
  Desktop: grid-cols-4 (1 row)

WasafSEO cards:
  Mobile:  grid-cols-1
  Desktop: grid-cols-2

Form fields (side by side):
  Mobile:  flex-col (stacked)
  Desktop: flex-row (side by side)

---

## Touch & Interaction Rules

### Tap Targets
- Minimum tap target: 44x44px on all interactive elements
- Never use elements smaller than 44px height on mobile:
  buttons, links, dropdown triggers, icon buttons, tabs
- Add padding to small icons to meet 44px minimum:
  <button class="p-3"><Icon size={18} /></button>

### Hover vs Touch
- Hover states (hover:) are desktop only — they cause stuck states on mobile
- Always pair hover with focus for keyboard users:
  class="hover:bg-primary/10 focus:bg-primary/10"
- Never rely on hover to reveal critical UI — it doesn't exist on touch

### Gestures
- Swipe to close sidebar sheet on mobile (use Radix Sheet with swipe support)
- No horizontal scroll anywhere except explicitly designed carousels
- Pull-to-refresh: do not implement — Next.js handles this via router.refresh()

### Click/Tap Feedback
- All buttons must have active state:
  class="active:scale-95 transition-transform"
- Immediate visual feedback — never feel laggy
- Loading states must appear within 100ms of tap

---

## Typography Scaling

Heading sizes must scale between mobile and desktop:

Page title (H1):
  Mobile:  text-2xl (24px)
  Desktop: text-4xl (36px)
  class="text-2xl lg:text-4xl"

Section heading (H2):
  Mobile:  text-xl (20px)  
  Desktop: text-2xl (24px)
  class="text-xl lg:text-2xl"

Card heading:
  Mobile:  text-base (16px)
  Desktop: text-lg (18px)
  class="text-base lg:text-lg"

Body text:
  Mobile:  text-sm (14px)
  Desktop: text-base (16px)
  class="text-sm lg:text-base"

Helper/label text:
  Always: text-xs (12px) — does not scale

Line height:
  Body: leading-relaxed (1.625)
  Headings: leading-tight (1.25)

---

## Navigation Rules

### Mobile Navigation
- Bottom tab bar for primary navigation on mobile (alternative to sidebar):
  OR sidebar sheet triggered by hamburger — pick ONE, not both
  Recommendation: hamburger sheet (consistent with dashboard pattern)

- Bottom of screen is thumb-friendly zone:
  Primary actions (Generate Brief button) must be reachable by thumb
  Place primary CTA at bottom of screen on mobile where possible

- Back navigation: always show back button on mobile detail pages
  <button class="flex items-center gap-2 lg:hidden">
    <ChevronLeft size={18} /> Back
  </button>

### Desktop Navigation
- Sidebar with icon + label for all nav items
- Active state: violet left border + violet bg tint
- Hover state: subtle bg tint
- Collapsed state: not needed (sidebar always visible)

---

## Form Rules

### Input Fields
- Height: h-11 (44px) on mobile, h-10 (40px) on desktop
  class="h-11 lg:h-10"
- Font size: minimum 16px on mobile (prevents iOS auto-zoom on focus)
  class="text-base lg:text-sm"
  CRITICAL: font-size below 16px on iOS input triggers unwanted zoom
- Full width on mobile always: w-full
- Keyboard type hints:
  Email fields: type="email" inputMode="email"
  URL fields: type="url" inputMode="url"
  Number fields: inputMode="numeric"

### Form Layout
Mobile: All fields stacked full width, single column
Desktop: Related fields can be side-by-side (50/50 split)

class="grid grid-cols-1 md:grid-cols-2 gap-4"

### Labels
Always visible above field — never placeholder-only labels
Placeholder is hint text only, not the label

### Submit Button
Mobile: Full width, bottom of form, h-12 (48px)
Desktop: Auto width or full width depending on context, h-10 (40px)

class="w-full md:w-auto"

### Wizard Steps (Website Setup)
Mobile:
  - Step indicator: numbered circles only (no labels — too long)
  - One field per visual group
  - Next button full width, fixed to bottom of screen if possible
  
Desktop:
  - Step indicator: circles + labels
  - Multiple fields per row where logical
  - Next button right-aligned

---

## Card & List Components

### Cards
Mobile padding: p-4
Desktop padding: p-6

Border radius: rounded-xl (consistent both)
Never reduce border radius on mobile

### Tables
Tables are a mobile problem. Rules:

Option A (preferred for brief history): 
  Convert table to card list on mobile
  Desktop shows table, mobile shows stacked cards
  class="hidden md:table" for the table
  class="md:hidden" for the mobile card list

Option B (for comparison tables in brief output):
  Horizontal scroll container:
  <div class="overflow-x-auto -mx-4 px-4">
    <table class="min-w-[600px]">...</table>
  </div>
  Show "← scroll to see more →" hint on mobile

Never let a table break the layout on mobile.

### WasafSEO Output Tabs
Mobile:
  - Tabs scroll horizontally if they don't fit
  - Tab labels shortened: "الأساسيات" not full labels
  - Tab content: single column, full width
  - JSON code block: horizontal scroll, font-size 12px

Desktop:
  - All tabs visible in one row
  - Full tab labels
  - Two-column layout where content allows
  - JSON code block: full width, font-size 14px

Tab implementation:
<div class="flex overflow-x-auto scrollbar-hide gap-1 pb-1">
  {tabs.map(tab => <button class="whitespace-nowrap ...">)}
</div>

---

## Modal & Dialog Rules

Mobile:
  - Dialogs slide up from bottom (sheet pattern) not center popup
  - Full width, rounded top corners only: rounded-t-2xl
  - Height: max 90vh with internal scroll
  - Close handle bar at top center (8px wide, 4px tall, rounded)
  - Backdrop tap closes dialog

Desktop:
  - Centered modal with backdrop
  - Max width: max-w-lg or max-w-2xl depending on content
  - Rounded all corners: rounded-2xl
  - Escape key closes dialog

Use Radix UI Dialog with these responsive variants:
Mobile: position fixed, bottom-0, left-0, right-0
Desktop: position fixed, top-50%, left-50%, transform translate(-50%,-50%)

class="
  fixed z-50
  bottom-0 left-0 right-0 rounded-t-2xl
  md:bottom-auto md:left-1/2 md:top-1/2 
  md:-translate-x-1/2 md:-translate-y-1/2
  md:rounded-2xl md:max-w-lg md:w-full
"

---

## Loading States

### Skeleton Screens
Must match exact layout of loaded content on BOTH mobile and desktop.
Skeleton must use correct mobile vs desktop dimensions.

Mobile skeleton card:
<div class="h-[180px] rounded-xl bg-white/5 animate-pulse" />

Desktop skeleton card:
<div class="h-[220px] rounded-xl bg-white/5 animate-pulse" />

### Generate Page Loading (Mobile Critical)
Mobile loading experience:
  - Full screen overlay (not just the button area)
  - Large spinner centered
  - Stage message large and readable (text-lg)
  - Progress bar optional but helpful
  - User must feel something is happening

Desktop loading:
  - Same overlay but contained to result area
  - Side-by-side: form dims, result area shows loading

---

## Spacing System

Use only Tailwind spacing scale. Common patterns:

Section gap (between major sections):
  Mobile: gap-6 (24px) or space-y-6
  Desktop: gap-8 (32px) or space-y-8

Component internal padding:
  Mobile: p-4 (16px)
  Desktop: p-6 (24px)

Inline element gap (icons, badges):
  Always: gap-2 (8px) or gap-3 (12px)

Page horizontal padding:
  Mobile: px-4
  Tablet: px-6  
  Desktop: px-8

Never use arbitrary spacing values like p-[18px].
Always use the Tailwind scale.

---

## Performance Rules (Critical for Mobile)

### Images
- Always use Next.js <Image> component — never raw <img>
- Always specify width and height to prevent layout shift
- Use sizes attribute for responsive images:
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
- Logos and icons: use SVG inline or as next/image with priority

### Bundle Size
- Never import entire libraries — always use tree-shaking imports:
  import { X } from 'lucide-react'        ✓
  import * as Icons from 'lucide-react'   ✗
- Heavy components (syntax highlighter, PDF viewer): dynamic import
  const SyntaxHighlighter = dynamic(() => import('react-syntax-highlighter'))
- Framer Motion: import only used components
  import { motion, AnimatePresence } from 'framer-motion'  ✓

### Font Loading
- Use next/font/google with display: 'swap'
- Subset fonts to Latin + Arabic characters only
- Preload primary font in layout

### Animations
- Mobile: reduce or disable non-essential animations
  Use prefers-reduced-motion media query:
  class="motion-safe:animate-fadeIn"
- Never animate large layout shifts on mobile
- Keep animation duration under 300ms for UI feedback

---

## Testing Checklist (Every Component)

Before marking any component complete, verify:

MOBILE (375px — iPhone SE, smallest common phone):
  □ No horizontal overflow or scroll
  □ All text readable without zoom
  □ All tap targets >= 44px
  □ No overlapping elements
  □ Forms: no iOS zoom on input focus (font-size >= 16px)
  □ Modals: slide up from bottom, closeable
  □ Navigation accessible via hamburger
  □ Loading states visible and clear

MOBILE (390px — iPhone 14, most common):
  □ Layout looks intentional, not stretched
  □ Cards fill width appropriately
  □ Images not distorted

TABLET (768px — iPad portrait):
  □ 2-column layouts activate correctly
  □ Sidebar or bottom nav is appropriate
  □ Touch targets still 44px+

DESKTOP (1280px — standard laptop):
  □ Max-width container prevents over-stretching
  □ Sidebar visible and functional
  □ Hover states work correctly
  □ Tables display properly

DESKTOP (1536px — large monitor):
  □ Content not stretching too wide
  □ Whitespace feels intentional
  □ Nothing looks tiny on large screen

---

## Prohibited Patterns

NEVER do these:
- fixed pixel widths on containers: width: 800px
- overflow-hidden on body/html (breaks mobile scroll)
- position: fixed elements that overlap content on mobile
- Hover-only interactive states
- Tables without overflow-x-auto wrapper on mobile
- Input font-size below 16px on mobile (causes iOS zoom)
- Tap targets below 44x44px
- Desktop-only features with no mobile equivalent
- Animations that cause layout shift on mobile
- Loading states that only cover part of the screen on mobile
- Sidebar visible by default on mobile (blocks content)
- Bottom-fixed CTAs that cover content without padding compensation