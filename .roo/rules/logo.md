# Logo Rules

## WasafSEO Logo

The official logo component is located at:
`components/logo/WasafSEOLogo.tsx`

### Identity
- Component name: `WasafSEOLogo`
- File name: `WasafSEOLogo.tsx`
- Import path: `@/components/logo/WasafSEOLogo`

### Strict Rules — AI must follow these at all times

1. NEVER rename this file or the component.
2. NEVER change the viewBox value `0 0 420 420`.
3. NEVER modify triangle coordinates (polygon `points` attributes).
4. NEVER change gradient stop colors — they are locked brand colors.
5. NEVER inline the raw SVG in other files. Always import the component.
6. NEVER add drop shadows, filters, blur, or transforms inside the component.
7. NEVER remove `role="img"`, `<title>`, or `<desc>` — accessibility is mandatory.
8. The ONLY allowed change is adding optional props to the Props interface.
9. Sizing is controlled exclusively via the `size` prop — never via CSS width/height on internals.
10. Gradient IDs are prefixed `ws-` to prevent DOM collisions — never rename them.

### Correct Usage

\`\`\`tsx
// Navbar
<WasafSEOLogo size={32} />

// Footer
<WasafSEOLogo size={40} className="shrink-0" />

// Hero
<WasafSEOLogo size={120} />
\`\`\`

### Wrong Usage — AI must reject these patterns

\`\`\`tsx
// ❌ Never do this
<svg viewBox="0 0 420 420">...</svg>   // raw inline SVG
<WasafSEOLogo style={{ filter: 'drop-shadow(...)' }} />  // filter on component
<WasafSEOLogo width={32} height={32} />  // wrong props
\`\`\`