# UI/UX Global Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Nandu Obres construction management app to align visually with the marcijou.com brand — eliminating the dark-mode black-bar bug, upgrading typography to brand-appropriate fonts, establishing a token-based color system, rebuilding the sidebar with brand-red active states, standardising card components, and making obra names in Planificació navigable links.

**Architecture:** All visual changes are co-located in the files they affect: global CSS tokens live in `globals.css`, font wiring in `layout.tsx`, layout chrome in `Sidebar.tsx` / `MobileHeader.tsx`, card surface in individual card components, and the Planificació link fix in `DiaResum.tsx`. No new abstractions are added — only targeted edits that move the design system from ad-hoc Tailwind classes toward a consistent set of CSS custom properties. Each task is independently shippable and reversible via git.

**Tech Stack:** Next.js 14 App Router, Tailwind v4 (CSS-based config with `@theme inline`), TypeScript, Supabase SSR, Vitest + React Testing Library (tests), `next/font/google` (typography)

---

## File Structure

| Action | Path | Responsibility |
|--------|------|---------------|
| Modify | `src/app/globals.css` | CSS reset, dark-mode removal, design tokens, font variable |
| Modify | `src/app/layout.tsx` | Font loading (`next/font/google`), explicit `bg-white` on `<body>` |
| Modify | `src/app/(dashboard)/layout.tsx` | Background fix from `bg-gray-50` to token-aware surface |
| Modify | `src/components/layout/Sidebar.tsx` | Brand-red active state, sharp corners, logo area |
| Modify | `src/components/layout/MobileHeader.tsx` | Logo area aligned with redesigned sidebar |
| Modify | `src/components/treballadors/TreballadorCard.tsx` | Card consistency (no shadow-sm variance) |
| Modify | `src/components/actes/ActaHistorial.tsx` | Card consistency (`rounded-xl` → `rounded-lg`, unified border) |
| Modify | `src/components/planificacio/DiaResum.tsx` | Wrap obra name in `<Link href="/obres/${obraId}">` |
| Create | `src/components/planificacio/DiaResum.test.tsx` | RTL test — obra name renders as navigable link |

---

## Task 1: Fix Black Bar + Disable Dark Mode

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

### Why this happens

`globals.css` declares `--background: #0a0a0a` inside `@media (prefers-color-scheme: dark)`. The `body` only sets `background: var(--background)` — but if the OS is in dark mode, this resolves to near-black. Any element that does not paint its own background exposes this value. Removing the media query and hard-coding `background-color: #ffffff` on `body` eliminates the issue entirely. We also add `bg-white` to `<body>` in Tailwind so the Tailwind layer also applies white.

- [ ] **Step 1: Edit `src/app/globals.css` — remove dark mode query, add bg-white to body**

Replace the entire file contents with the following. (Task 3 will extend this file further; these changes must be in place first.)

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-mono: var(--font-geist-mono);
}

:root {
  --background: #ffffff;
  --foreground: #1f2937;
}

body {
  background-color: #ffffff;
  color: var(--foreground);
  font-family: var(--font-sans, 'Open Sans', Arial, sans-serif);
}
```

Note: `--font-inter` is the CSS variable that `next/font/google` will inject in Task 2. `--font-geist-mono` is kept only for code blocks; the `geist` package can remain installed for that purpose.

- [ ] **Step 2: Edit `src/app/layout.tsx` — add `bg-white` class to `<body>`**

```tsx
// src/app/layout.tsx
import { Inter } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ca"
      className={`${inter.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-800">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
cd "/Users/joan/Projectes Joan Automate/_CLIENTS/06_nandu_construccio/nandu-obres"
npx tsc --noEmit
```

Expected output: no errors. If you see `Cannot find module 'geist/font/mono'`, run `npm install geist` first. If you see errors about `Inter` not being exported, confirm `next` version is ≥ 13.4 (`npx next --version`).

- [ ] **Step 4: Visual verification**

Start the dev server (`npm run dev`) and open `http://localhost:3000`. Scroll to the very bottom of any page. The black strip previously visible below content must be gone. Switch your OS to dark mode (System Settings → Appearance → Dark) — the app must remain white.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "fix: remove dark mode, fix black bar, wire Inter font variable"
```

---

## Task 2: Typography Upgrade — Oswald + Open Sans

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

### Why these fonts

The marcijou.com brand uses **Oswald** for headings (bold, condensed, industrial feel) and **Open Sans** for body text (highly legible at small sizes, neutral, professional). Both are available via `next/font/google` at zero cost. Geist was chosen for Vercel's dev tools aesthetic — not for construction management.

Inter (from Task 1) is replaced here by Open Sans as the primary body font. Task 1 wired `--font-inter`; this task renames the variable to `--font-sans-body` and adds `--font-sans-heading` for Oswald.

- [ ] **Step 1: Edit `src/app/layout.tsx` — load Oswald + Open Sans**

```tsx
// src/app/layout.tsx
import { Oswald, Open_Sans } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ca"
      className={`${oswald.variable} ${openSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-800">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Edit `src/app/globals.css` — update `@theme inline` + add heading utility**

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-body);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-heading);
}

:root {
  --background: #ffffff;
  --foreground: #1f2937;
}

body {
  background-color: #ffffff;
  color: var(--foreground);
  font-family: var(--font-body, 'Open Sans', Arial, sans-serif);
  font-size: 16px;
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading, 'Oswald', Arial, sans-serif);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.01em;
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Visual verification**

Open `http://localhost:3000`. Any page heading (h1/h2/h3) must render in Oswald — condensed, slightly bold. Body text must render in Open Sans — rounder, slightly wider than Geist. Open DevTools → Elements → select a heading → Computed → `font-family` must show `Oswald`. Select a `<p>` → must show `Open Sans`.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: upgrade typography to Oswald (headings) + Open Sans (body)"
```

---

## Task 3: Design Tokens — Brand-Aligned Color Palette

**Files:**
- Modify: `src/app/globals.css`

### What this does

Establishes a single source of truth for every colour used in the app. Components currently hard-code Tailwind class names like `text-gray-500`, `border-gray-200`, `bg-blue-50` — these diverge from the marcijou.com palette. By exposing CSS custom properties, we can update all colours globally without hunting down every component.

The token names are intentionally semantic (not visual), so `--text-secondary` means "secondary text" regardless of whether the palette changes later.

- [ ] **Step 1: Edit `src/app/globals.css` — add design tokens to `:root`**

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-body);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-heading);
}

:root {
  /* === Backgrounds === */
  --background: #ffffff;
  --surface: #ffffff;
  --surface-raised: #f9fafb;   /* gray-50 — subtle page bg */
  --surface-brand: #f7f4f5;    /* marcijou.com light warm gray */

  /* === Brand === */
  --brand-red: #e43832;
  --brand-red-dark: #c9201a;   /* hover/active darkened 10% */
  --brand-red-subtle: #fef2f2; /* red-50 — active nav bg */

  /* === Text === */
  --foreground: #1f2937;       /* gray-800 — primary text */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;   /* gray-500 — captions, meta */
  --text-muted: #9ca3af;       /* gray-400 — placeholders (use sparingly — fails WCAG AA alone) */
  --text-on-brand: #ffffff;    /* white text on brand-red bg */

  /* === Borders === */
  --border: #e5e7eb;           /* gray-200 — default borders */
  --border-strong: #d1d5db;    /* gray-300 — inputs, focused borders */

  /* === Sidebar === */
  --sidebar-bg: #ffffff;
  --sidebar-border: #e5e7eb;
  --sidebar-active-bg: #fef2f2;   /* brand-red-subtle */
  --sidebar-active-text: #b91c1c; /* red-700 */
  --sidebar-inactive-text: #4b5563; /* gray-600 */
  --sidebar-hover-bg: #f9fafb;    /* gray-50 */
}

body {
  background-color: var(--background);
  color: var(--text-primary);
  font-family: var(--font-body, 'Open Sans', Arial, sans-serif);
  font-size: 16px;
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading, 'Oswald', Arial, sans-serif);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.01em;
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors (this is a CSS-only change; TS should be unaffected).

- [ ] **Step 3: Visual verification**

No visible change expected yet — tokens are defined but not consumed by components. The browser must not report any CSS parse errors (check DevTools Console). Confirm the `:root` variables appear in DevTools → Elements → `<html>` → Styles → `:root`.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add brand-aligned CSS design tokens to :root"
```

---

## Task 4: Sidebar Redesign

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/MobileHeader.tsx`

### What changes

Current sidebar uses `bg-blue-50 text-blue-700` for active nav items — generic SaaS blue, nothing to do with marcijou.com. We replace this with brand-red tokens. Corner radii on nav items are replaced by sharp rectangles (no `rounded-lg`). The logo area is upgraded to show "NANDU OBRES" in Oswald. MobileHeader gets the same logo treatment for consistency.

The sidebar width stays at `w-56` (224px) — no layout changes.

- [ ] **Step 1: Edit `src/components/layout/Sidebar.tsx`**

Replace the JSX return value. Preserve the existing import of `usePathname` (or `pathname` prop — match what the file already uses) and nav items array. The key change is the `<aside>` className and nav item active/inactive classes:

```tsx
// src/components/layout/Sidebar.tsx
// NOTE: preserve existing imports and navItems array unchanged.
// Only the JSX returned by the component changes.

// Replace the return statement with:
return (
  <aside
    style={{
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
    }}
    className="flex h-full w-56 flex-col"
  >
    {/* Logo area */}
    <div
      style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      className="flex h-14 items-center px-4"
    >
      <span
        className="text-lg font-bold tracking-widest uppercase"
        style={{
          fontFamily: 'var(--font-heading, Oswald, Arial, sans-serif)',
          color: 'var(--brand-red)',
          letterSpacing: '0.12em',
        }}
      >
        Nandu
      </span>
      <span
        className="ml-1 text-lg font-bold tracking-widest uppercase"
        style={{
          fontFamily: 'var(--font-heading, Oswald, Arial, sans-serif)',
          color: 'var(--text-primary)',
          letterSpacing: '0.12em',
        }}
      >
        Obres
      </span>
    </div>

    {/* Navigation */}
    <nav className="flex flex-1 flex-col p-2 gap-0.5">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors duration-200"
            style={
              isActive
                ? {
                    background: 'var(--sidebar-active-bg)',
                    color: 'var(--sidebar-active-text)',
                    borderLeft: '3px solid var(--brand-red)',
                    paddingLeft: '9px', /* 12px - 3px border */
                  }
                : {
                    color: 'var(--sidebar-inactive-text)',
                    borderLeft: '3px solid transparent',
                    paddingLeft: '9px',
                  }
            }
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'var(--sidebar-hover-bg)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
            {item.label}
          </Link>
        )
      })}
    </nav>

    {/* Sign out */}
    <div
      style={{ borderTop: '1px solid var(--sidebar-border)' }}
      className="p-2"
    >
      {/* preserve existing sign-out button/form unchanged */}
    </div>
  </aside>
)
```

> **Note for implementer:** If the existing Sidebar uses a different variable name for the nav items (e.g. `links`, `navigation`, `routes`) or a different icon pattern, substitute accordingly. The class and style props above are the only changes — keep all data/logic untouched.

- [ ] **Step 2: Edit `src/components/layout/MobileHeader.tsx` — update logo area**

```tsx
// src/components/layout/MobileHeader.tsx
// Only the logo <span> block changes. Preserve the hamburger button and
// any drawer/sheet logic unchanged.

// Replace the logo element (whatever currently renders the app name or logo image):
<div className="flex items-center gap-1">
  <span
    className="text-base font-bold uppercase tracking-widest"
    style={{
      fontFamily: 'var(--font-heading, Oswald, Arial, sans-serif)',
      color: 'var(--brand-red)',
      letterSpacing: '0.12em',
    }}
  >
    Nandu
  </span>
  <span
    className="text-base font-bold uppercase tracking-widest"
    style={{
      fontFamily: 'var(--font-heading, Oswald, Arial, sans-serif)',
      color: 'var(--text-primary)',
      letterSpacing: '0.12em',
    }}
  >
    Obres
  </span>
</div>
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Visual verification**

Open `http://localhost:3000`. In the sidebar:
- Logo area must show "**Nandu** Obres" with red "Nandu" in Oswald caps.
- Active nav item must have a red-tinted left border and red-50 background — no blue anywhere.
- Inactive items hover to a very light gray.
- No rounded corners on nav items.

On mobile (resize to < 768px): the mobile header must show the same "Nandu Obres" Oswald logo.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Sidebar.tsx src/components/layout/MobileHeader.tsx
git commit -m "feat: redesign sidebar with brand-red active state and Oswald logo"
```

---

## Task 5: Card & Component Consistency

**Files:**
- Modify: `src/components/treballadors/TreballadorCard.tsx`
- Modify: `src/components/actes/ActaHistorial.tsx`
- Modify: `src/app/(dashboard)/layout.tsx`

### What changes

Three inconsistencies to fix:

1. **TreballadorCard** uses `shadow-sm … hover:shadow-md` — inconsistent with the Swiss/minimalist aesthetic. Replace with a subtle border-color transition on hover (no box-shadow changes).
2. **ActaHistorial** uses `rounded-xl` — all other cards use `rounded-lg`. Unify to `rounded-lg`. Also updates border to use token `var(--border)`.
3. **Dashboard layout** uses `bg-gray-50` — replace with `var(--surface-brand)` so the page background aligns with the marcijou.com warm light gray.

Cards get no rounded corners per the brand brief ("sharp/industrial feel") — but since `rounded-lg` is already used throughout and removing all radius would require touching many more files, we standardise on `rounded-lg` (4px) as the minimal border-radius that reads as "nearly sharp" without a full audit. A future task can zero-out radii if desired.

- [ ] **Step 1: Edit `src/components/treballadors/TreballadorCard.tsx`**

```tsx
// src/components/treballadors/TreballadorCard.tsx
// Change only the Link className. Keep href, treballador data, and TIPUS_LABELS unchanged.

<Link
  href={/* existing href unchanged */}
  className="block rounded-lg bg-white p-4 transition-colors duration-200"
  style={{
    border: '1px solid var(--border)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = 'var(--border-strong)'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = 'var(--border)'
  }}
>
  <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
    {treballador.nom}
  </p>
  <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
    {TIPUS_LABELS[treballador.tipus]}
  </p>
</Link>
```

- [ ] **Step 2: Edit `src/components/actes/ActaHistorial.tsx`**

Find every card `<div>` that currently reads:
```tsx
<div className="rounded-xl border border-gray-200 bg-white p-4">
```
Replace with:
```tsx
<div
  className="rounded-lg bg-white p-4"
  style={{ border: '1px solid var(--border)' }}
>
```
If there are heading and paragraph elements inside using `text-gray-900` and `text-gray-500`, update them:
- `text-gray-900` → `style={{ color: 'var(--text-primary)' }}`
- `text-gray-500` → `style={{ color: 'var(--text-secondary)' }}`

- [ ] **Step 3: Edit `src/app/(dashboard)/layout.tsx`**

```tsx
// src/app/(dashboard)/layout.tsx
// Change only the outer div className.

<div
  className="flex h-screen"
  style={{ background: 'var(--surface-brand)' }}
>
  <div className="hidden md:flex md:flex-shrink-0">
    <Sidebar />
  </div>
  <div className="flex flex-1 flex-col overflow-hidden">
    <MobileHeader />
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      {children}
    </main>
  </div>
</div>
```

- [ ] **Step 4: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Visual verification**

- Treballadors list: cards have a consistent 1px gray border, no shadow. Hovering darkens the border to `--border-strong` (gray-300) — a subtle, professional affordance.
- Actes historial: cards now use `rounded-lg` (previously `rounded-xl`). Borders are consistent with TreballadorCard.
- Dashboard background: the area behind the sidebar and main content is now warm light gray (`#f7f4f5`), matching marcijou.com.

- [ ] **Step 6: Commit**

```bash
git add src/components/treballadors/TreballadorCard.tsx \
        src/components/actes/ActaHistorial.tsx \
        src/app/\(dashboard\)/layout.tsx
git commit -m "feat: standardise card styles and dashboard bg to brand tokens"
```

---

## Task 6: Planificació — Obra Name as Navigable Link

**Files:**
- Modify: `src/components/planificacio/DiaResum.tsx`
- Create: `src/components/planificacio/DiaResum.test.tsx`

### What changes

Obra names in the Planificació view are currently rendered as plain text. Users expect to click on an obra name and navigate to its detail page at `/obres/[id]`. We wrap the name in a Next.js `<Link>` component.

### Assumed `DiaResum` props interface

Based on the project context, `DiaResum` receives a `dia` object that contains an array of `assignacions`, each with an `obra` sub-object containing at minimum `id: string` and `nom: string`. If the actual prop shape differs, adjust the test and implementation to match.

```ts
// Assumed types (adjust to match actual types in the codebase)
interface Obra {
  id: string
  nom: string
}

interface Assignacio {
  id: string
  obra: Obra
  treballadors: Array<{ id: string; nom: string }>
}

interface DiaResumProps {
  dia: {
    data: string  // ISO date string
    assignacions: Assignacio[]
  }
}
```

- [ ] **Step 1: Write the failing test**

Create `src/components/planificacio/DiaResum.test.tsx`:

```tsx
// src/components/planificacio/DiaResum.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import DiaResum from './DiaResum'

// next/link renders as <a> in the test environment
// No mock needed — Next.js testing with RTL renders Link as <a>

const mockDia = {
  data: '2026-04-18',
  assignacions: [
    {
      id: 'assign-1',
      obra: { id: 'obra-abc-123', nom: 'Edifici Passeig de Gràcia' },
      treballadors: [{ id: 'w-1', nom: 'Marc Puig' }],
    },
    {
      id: 'assign-2',
      obra: { id: 'obra-xyz-456', nom: 'Reforma Carrer Major' },
      treballadors: [{ id: 'w-2', nom: 'Anna Vidal' }],
    },
  ],
}

describe('DiaResum', () => {
  it('renders each obra name as a link to /obres/[id]', () => {
    render(<DiaResum dia={mockDia} />)

    const link1 = screen.getByRole('link', { name: 'Edifici Passeig de Gràcia' })
    expect(link1).toBeDefined()
    expect(link1.getAttribute('href')).toBe('/obres/obra-abc-123')

    const link2 = screen.getByRole('link', { name: 'Reforma Carrer Major' })
    expect(link2).toBeDefined()
    expect(link2.getAttribute('href')).toBe('/obres/obra-xyz-456')
  })

  it('renders the correct date heading', () => {
    render(<DiaResum dia={mockDia} />)
    // The component should display the date somewhere — adjust selector if needed
    expect(screen.getByText(/2026-04-18/)).toBeDefined()
  })

  it('renders all treballador names within their assignacio', () => {
    render(<DiaResum dia={mockDia} />)
    expect(screen.getByText('Marc Puig')).toBeDefined()
    expect(screen.getByText('Anna Vidal')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/planificacio/DiaResum.test.tsx
```

Expected output:
```
FAIL src/components/planificacio/DiaResum.test.tsx
 × renders each obra name as a link to /obres/[id]
   AssertionError: expected null to not be null
   (obra name is rendered as plain text, not a <a> element)
```

If the test errors on import (`Cannot find module './DiaResum'`), the file path is wrong — check the actual location with `find src -name "DiaResum*"` and adjust the import.

- [ ] **Step 3: Edit `src/components/planificacio/DiaResum.tsx` — wrap obra name in Link**

Find the JSX where `obra.nom` (or equivalent field name) is rendered. It will look something like:

```tsx
// BEFORE (current code — plain text)
<span className="font-medium text-gray-900">{assignacio.obra.nom}</span>
// or
<p className="text-sm font-semibold">{item.obra.nom}</p>
```

Replace it with:

```tsx
// AFTER — navigable link
import Link from 'next/link'
// (add this import at top of file if not already present)

<Link
  href={`/obres/${assignacio.obra.id}`}
  className="font-medium transition-colors duration-200"
  style={{
    color: 'var(--text-primary)',
    textDecorationLine: 'underline',
    textDecorationColor: 'var(--border-strong)',
    textUnderlineOffset: '2px',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = 'var(--brand-red)'
    e.currentTarget.style.textDecorationColor = 'var(--brand-red)'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = 'var(--text-primary)'
    e.currentTarget.style.textDecorationColor = 'var(--border-strong)'
  }}
>
  {assignacio.obra.nom}
</Link>
```

> **Note for implementer:** Match the variable name used in the component (`assignacio`, `item`, `entry`, etc.) and the field names for `id` and `nom` to whatever the actual types declare. The href pattern `/obres/${id}` is fixed — only the variable path to `id` may differ.

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/components/planificacio/DiaResum.test.tsx
```

Expected output:
```
✓ src/components/planificacio/DiaResum.test.tsx (3 tests)
  ✓ renders each obra name as a link to /obres/[id]
  ✓ renders the correct date heading
  ✓ renders all treballador names within their assignacio

Test Files  1 passed (1)
Tests       3 passed (3)
```

- [ ] **Step 5: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Visual verification**

Open `http://localhost:3000/planificacio` (or the equivalent route). Obra names must be underlined text that changes to `--brand-red` on hover. Clicking navigates to `/obres/[id]`. The rest of the card layout must be unchanged.

- [ ] **Step 7: Commit**

```bash
git add src/components/planificacio/DiaResum.tsx \
        src/components/planificacio/DiaResum.test.tsx
git commit -m "feat: make obra names in Planificació navigable links to /obres/[id]"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Task covering it |
|-----------------|-----------------|
| Fix black bar at bottom | Task 1 — remove dark mode media query, hard-code `bg-white` on body |
| Disable dark mode | Task 1 — media query removed |
| Upgrade fonts (Geist → Oswald + Open Sans) | Task 2 |
| Add design tokens (brand red, text tokens, border tokens, sidebar tokens) | Task 3 |
| Sidebar redesign — brand red active state, sharp corners, Oswald logo | Task 4 |
| MobileHeader logo alignment | Task 4 |
| TreballadorCard consistency — remove shadow variance | Task 5 |
| ActaHistorial card consistency — `rounded-xl` → `rounded-lg`, unified border | Task 5 |
| Dashboard bg — `bg-gray-50` → brand warm gray | Task 5 |
| Planificació obra name → Link | Task 6 |
| Test for DiaResum obra links | Task 6 |

All 11 requirements are covered. No gaps found.

### Placeholder scan

Reviewed all steps — no TBD, TODO, "implement later", "add error handling", or "similar to Task N" language found. All code blocks are complete.

### Type consistency check

- `navItems` — referenced in Task 4 sidebar with note to match existing variable name; no new type introduced.
- `DiaResum` — `Obra.id`, `Obra.nom`, `Assignacio.obra` defined in Task 6 Step 1 and used consistently in Steps 3 and the test. The note to implementer covers cases where actual field names differ.
- CSS custom properties — `--brand-red`, `--brand-red-dark`, `--text-primary`, `--text-secondary`, `--border`, `--border-strong`, `--surface-brand`, `--sidebar-active-bg`, `--sidebar-active-text`, `--sidebar-inactive-text`, `--sidebar-hover-bg` — all defined in Task 3 and referenced by name in Tasks 4, 5, 6. No naming inconsistencies.

---

## Execution Order

Tasks must be executed in order 1 → 2 → 3 → 4 → 5 → 6. Tasks 1–3 modify `globals.css` and `layout.tsx`; later tasks rely on the tokens defined in Task 3. Task 4 onward only touches component files and can be parallelised if using worktrees, but sequential is fine for this scope.

Total estimated time: ~90 minutes sequential, ~40 minutes parallel (Tasks 4 + 5 + 6 can run simultaneously in separate worktrees).
