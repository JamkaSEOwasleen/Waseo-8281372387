/**
 * @file WasafSEOLogo.tsx
 * @description Official WasafSEO brand logo component — SVG, scalable, production-grade.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️  AI INSTRUCTION RULES — READ BEFORE MODIFYING ANYTHING IN THIS FILE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This file contains the single source of truth for the WasafSEO logo.
 * It is used across the ENTIRE website: navbar, footer, OG images, favicons,
 * loading screens, emails, and any future surfaces.
 *
 * RULE 1 — NEVER change shape geometry.
 *   The path defining the W mark is locked. Do not move, resize, reshape,
 *   or reorder it under any circumstance. Resize is handled exclusively
 *   via the `size` prop.
 *
 * RULE 2 — NEVER change brand colors.
 *   All fill values and gradient stop colors below are the official brand
 *   palette. Do not replace, approximate, or "improve" them.
 *
 * RULE 3 — NEVER add, remove, or rename gradient IDs without namespacing.
 *   Gradient IDs are prefixed `ws-` to avoid collisions when multiple
 *   instances of this component render on the same page. Do not rename them.
 *   Do not remove the prefix.
 *
 * RULE 4 — NEVER alter the viewBox.
 *   viewBox="0 0 420 420" is calibrated to the exact logo proportions.
 *   Changing it will distort the logo at all render sizes.
 *
 * RULE 5 — The ONLY safe changes are to the Props interface.
 *   You may add new optional props (e.g. `onClick`, `style`, `data-testid`)
 *   as long as they are passed through to the root <svg> element and do not
 *   affect geometry or color.
 *
 * RULE 6 — NEVER inline this logo as raw SVG markup in other files.
 *   Always import and use the <WasafSEOLogo /> component.
 *
 * RULE 7 — NEVER apply CSS transforms, filters, or effects to the internals.
 *   Drop shadows, blur, opacity shifts, rotate, skew, and scale transforms
 *   must be applied to the WRAPPER element in the consuming component.
 *
 * RULE 8 — Accessibility is mandatory.
 *   The <title> and <desc> elements must always be present. The `aria-label`
 *   on the root <svg> must always read "WasafSEO".
 *
 * RULE 9 — Dark mode is handled by the consumer, not this component.
 *   The logo is designed to render correctly on both light and dark
 *   backgrounds. Do not add `prefers-color-scheme` media queries or
 *   conditional fills inside this file.
 *
 * RULE 10 — This file is the ONLY place logo geometry lives.
 *   Do not duplicate the SVG paths anywhere else in the codebase.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE EXAMPLES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   // Navbar (default 32px height equivalent)
 *   <WasafSEOLogo size={32} />
 *
 *   // Footer (slightly larger)
 *   <WasafSEOLogo size={40} />
 *
 *   // Hero / splash screen
 *   <WasafSEOLogo size={120} />
 *
 *   // With custom class for positioning
 *   <WasafSEOLogo size={36} className="shrink-0" />
 *
 *   // With accessible label override
 *   <WasafSEOLogo size={32} titleText="Go to WasafSEO home" />
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SIZE REFERENCE — height in px (component renders as square by default)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   size={24}  → favicon / tab icon context
 *   size={32}  → navbar (recommended default)
 *   size={40}  → footer
 *   size={48}  → card headers
 *   size={80}  → auth pages / modals
 *   size={120} → hero / marketing pages
 *   size={200} → OG image / print
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';

// ─── Props ────────────────────────────────────────────────────────────────────

/**
 * Props for the WasafSEOLogo component.
 *
 * Only `size`, `className`, and `titleText` affect rendering behaviour.
 * All other standard SVG props are forwarded transparently to the root element.
 */
export interface WasafSEOLogoProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height' | 'viewBox'> {
  /**
   * Uniform size in pixels applied to both width and height.
   * The logo maintains its aspect ratio internally via viewBox.
   *
   * @default 32
   */
  size?: number;

  /**
   * Additional CSS class names applied to the root <svg> element.
   * Use for layout utilities (e.g. Tailwind `shrink-0`, `block`, `mx-auto`).
   * Do NOT use to apply color filters or transforms to logo internals.
   *
   * @default undefined
   */
  className?: string;

  /**
   * Override the accessible <title> text rendered inside the SVG.
   * Useful when the logo appears inside a landmark with a specific label
   * (e.g. "Go to WasafSEO home" inside a <nav>).
   *
   * @default "WasafSEO"
   */
  titleText?: string;
}

// ─── Brand token constants (DO NOT MODIFY) ────────────────────────────────────

/**
 * WasafSEO brand color tokens — locked by design.
 * Changing these values constitutes an unauthorized brand change.
 */
const BRAND = {
  /** Primary violet — main W stroke colour */
  primary: '#7c3aed',

  /** Light violet — accent/highlight stroke colour */
  primaryLight: '#a78bfa',

  /** Dark violet — gradient bottom stop */
  primaryDark: '#5b21b6',
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * WasafSEOLogo
 *
 * The official, single-source-of-truth SVG logo for the WasafSEO brand.
 * Renders as a scalable inline SVG — no image requests, no flicker,
 * works on any background, supports all screen densities.
 *
 * The logo is a geometric "W" mark (representing "Wasaf") with a violet
 * gradient that transitions from light to dark, symbolising growth and
 * upward movement (SEO performance). Two overlapping strokes create
 * depth — a thick outer stroke in deep violet and a thinner inner stroke
 * in light violet.
 *
 * @see File-level JSDoc for AI instruction rules and usage examples.
 */
const WasafSEOLogo: React.FC<WasafSEOLogoProps> = ({
  size = 32,
  className,
  titleText = 'WasafSEO',
  ...rest
}) => {
  return (
    <svg
      // ── Geometry — LOCKED, do not modify ──────────────────────────────────
      viewBox="0 0 420 420"
      // ── Sizing — controlled only via `size` prop ──────────────────────────
      width={size}
      height={size}
      // ── Accessibility — mandatory, do not remove ──────────────────────────
      role="img"
      aria-label="WasafSEO"
      // ── Namespace ─────────────────────────────────────────────────────────
      xmlns="http://www.w3.org/2000/svg"
      // ── Consumer passthrough ──────────────────────────────────────────────
      className={className}
      {...rest}
    >
      {/* Accessibility — screen reader text. RULE 8: do not remove. */}
      <title>{titleText}</title>
      <desc>
        WasafSEO logo: a geometric violet W mark representing the Wasaf brand,
        with overlapping strokes that create depth and symbolise growth in SEO
        performance.
      </desc>

      {/* ── Gradient definitions ── */}
      <defs>
        {/* Main gradient: light violet top → dark violet bottom (growth theme) */}
        <linearGradient id="ws-main" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BRAND.primaryLight} />
          <stop offset="1" stopColor={BRAND.primary} />
        </linearGradient>

        {/* Accent gradient: inverted — dark violet top → light violet bottom */}
        <linearGradient id="ws-accent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BRAND.primary} />
          <stop offset="1" stopColor={BRAND.primaryDark} />
        </linearGradient>
      </defs>

      {/*
       * ── Logo shape — RULE 1: geometry is LOCKED ──────────────────────────
       *
       * The W mark path:
       *   M 60 340      → start at bottom-left
       *   L 140 100     → rise to first peak (top-left arm)
       *   L 210 220     → descend to centre valley
       *   L 280 100     → rise to second peak (top-right arm)
       *   L 360 340     → descend to bottom-right
       *
       * Stroke width 52 with round caps and round joins creates a thick,
       * friendly W that reads clearly at any size.
       *
       * Layer 1 (outer/thick):  52px, ws-main gradient (violet)
       * Layer 2 (inner/thin):   20px, ws-accent gradient (dark violet)
       *   Offset by 2px inward for a subtle 3D bevel effect.
       *
       * RULE 2: fill/stroke colors must not be changed.
       * RULE 4: viewBox must remain "0 0 420 420".
       */}
      <g>
        {/* Outer W — thick violet stroke */}
        <path
          d="M 60 340 L 140 100 L 210 220 L 280 100 L 360 340"
          fill="none"
          stroke="url(#ws-main)"
          strokeWidth={52}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner W — thinner dark-violet highlight stroke for depth */}
        <path
          d="M 60 340 L 140 100 L 210 220 L 280 100 L 360 340"
          fill="none"
          stroke="url(#ws-accent)"
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.6}
        />
      </g>
    </svg>
  );
};

// Named export for tree-shaking and explicit imports
// Also serves as backward-compatible alias for DashboardClientLayout.tsx
// which imports: { WasleenLogo as WasafSEOLogo }
export { WasafSEOLogo, WasafSEOLogo as WasleenLogo };

// Default export for convenience (used by most components)
export default WasafSEOLogo;
