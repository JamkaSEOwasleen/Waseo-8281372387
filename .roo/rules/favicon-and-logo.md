# Favicon & Logo System Rules
# Location: .roo/rules/favicon-and-logo.md
# Applies to: ALL files in this project, ALL sessions, ALL AI agents

---

## 1. File Registry — These files are LOCKED

The following files exist in `/public` and must NEVER be renamed, moved, or deleted:

| File | Purpose | Size |
|---|---|---|
| `favicon.svg` | Primary icon — Chrome, Firefox, Edge | Scalable |
| `favicon.ico` | Fallback — Safari, legacy browsers | 48×48 |
| `favicon-96x96.png` | Fallback — Android, older Chrome | 96×96 |
| `apple-icon.png` | iOS home screen shortcut | 180×180 |
| `web-app-manifest-192x192.png` | PWA / Android install icon | 192×192 |
| `web-app-manifest-512x512.png` | PWA splash screen icon | 512×512 |
| `manifest.json` | PWA web manifest | — |

**AI MUST NEVER:**
- Rename any of these files
- Delete any of these files
- Move them out of `/public`
- Suggest replacing them with a single file

---

## 2. Logo Component — Single Source of Truth

The official logo component is:
- **File:** `components/logo/WasafSEOLogo.tsx`
- **Component name:** `WasafSEOLogo`
- **Import:** `import WasafSEOLogo from '@/components/logo/WasafSEOLogo'`

**AI MUST NEVER:**
- Inline raw SVG markup instead of using this component
- Duplicate the SVG geometry in any other file
- Modify viewBox, polygon points, gradient colors, or gradient IDs inside the component
- Use `<img src="favicon.svg">` as a logo — always use the React component

**AI MUST ALWAYS:**
- Use `<WasafSEOLogo size={N} />` wherever the logo appears
- Use the `size` prop exclusively for resizing — never CSS width/height on internals

### Approved size tokens

```tsx
<WasafSEOLogo size={20} />   // minimum — very small contexts only
<WasafSEOLogo size={32} />   // navbar (default)
<WasafSEOLogo size={40} />   // footer
<WasafSEOLogo size={48} />   // card headers
<WasafSEOLogo size={80} />   // auth pages, modals
<WasafSEOLogo size={120} />  // hero sections
<WasafSEOLogo size={200} />  // marketing / OG images
```

---

## 3. Metadata — app/layout.tsx is the ONLY favicon config location

All favicon `<link>` tags are managed by the `metadata` export in `app/layout.tsx`.

**AI MUST NEVER:**
- Add `<link rel="icon">` tags in any page, component, or other layout file
- Add `<head>` blocks manually anywhere
- Remove any entry from the `icons` object in metadata
- Change the order of entries in `icons.icon` array (SVG must always be first)

**AI MUST ALWAYS:**
- Keep `favicon.svg` as the first entry in `icons.icon`
- Keep `favicon.ico` as the `shortcut` entry
- Keep `apple-icon.png` in the `apple` array
- Keep `manifest: '/manifest.json'` in the metadata object

---

## 4. Browser Compatibility Matrix — Why all formats are required

| Format | Chrome | Firefox | Edge | Safari | iOS | Android |
|---|---|---|---|---|---|---|
| favicon.svg | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| favicon.ico | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| favicon-96x96.png | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| apple-icon.png | — | — | — | ✅ | ✅ | — |
| manifest icons | ✅ | — | ✅ | — | — | ✅ |

**Conclusion: removing ANY format breaks at least one major browser.**
**AI must treat all 4 formats as mandatory, not optional.**

---

## 5. manifest.json Rules

**AI MUST NEVER:**
- Change `"name"` from `"WasafSEO"`
- Change `"short_name"` from `"WasafSEO"`
- Remove either PNG icon entry (192 or 512)
- Change `"purpose": "maskable"` — maskable icons are required for Android adaptive icons
- Change `"display": "standalone"` — this enables full-screen PWA mode

**AI MAY:**
- Update `"description"`
- Update `"start_url"` if routing changes
- Add new icon entries alongside existing ones (never replace)

---

## 6. Quality Rules — What "correct" looks like

When the favicon system is correctly implemented:

✅ Chrome tab shows the SVG logo icon  
✅ Firefox tab shows the SVG logo icon  
✅ Safari tab shows the ICO/PNG logo icon  
✅ iPhone "Add to Home Screen" shows apple-icon.png  
✅ Android "Install App" prompt shows 192×192 maskable icon  
✅ Android splash screen shows 512×512 icon  
✅ No console warnings about missing icons  
✅ Lighthouse PWA audit passes icon checks  

---

## 7. What AI should do if asked to "update the favicon"

1. Ask what specifically needs to change (color? shape? new brand?)
2. If geometry/color changes: update `WasafSEOLogo.tsx` ONLY — do not touch public files
3. If new image files are provided: replace files in `/public` with the same filenames
4. NEVER regenerate or modify the metadata structure in `layout.tsx`
5. NEVER remove any existing format in favor of a "simpler" approach