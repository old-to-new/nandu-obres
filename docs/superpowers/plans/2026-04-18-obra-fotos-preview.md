# Obra Fotos Preview & Gallery Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Últimes fotos" 4-photo preview section to the obra detail page, replace raw-URL photo links in the gallery with a proper lightbox, and verify that photos within each acta group are consistently sorted by upload date with a timestamp tooltip.

**Architecture:** Feature 1 is a pure server-component query + new presentational component `ObraFotosPreview`; Feature 2 converts `ActaGaleria` from a pure server component to a client component that wraps `yet-another-react-lightbox`; Feature 3 is a grouping-logic audit and a tooltip addition inside `ActaGaleria`. Each feature is independently testable and deployable.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, Supabase SSR (`@supabase/ssr ^0.10.2`), TypeScript, Vitest 4 + React Testing Library 16, `yet-another-react-lightbox` (to be installed)

---

## File Structure

| Action | Path | Responsibility |
|--------|------|---------------|
| **Modify** | `src/app/(dashboard)/obres/[id]/page.tsx` | Add `fotosPreview` Supabase query, pass results to `ObraFotosPreview` |
| **Create** | `src/components/obres/ObraFotosPreview.tsx` | 2×2 grid preview of latest 4 photos with empty state and gallery link |
| **Create** | `src/components/obres/__tests__/ObraFotosPreview.test.tsx` | Tests for Feature 1 |
| **Modify** | `src/components/actes/ActaGaleria.tsx` | Convert to client component; add lightbox state, `Lightbox` render, and upload-time tooltip |
| **Create** | `src/components/actes/__tests__/ActaGaleria.test.tsx` | Tests for Features 2 & 3 |

---

## Task 1: Install `yet-another-react-lightbox`

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install the package**

```bash
cd /Users/joan/Projectes\ Joan\ Automate/_CLIENTS/06_nandu_construccio/nandu-obres
npm install yet-another-react-lightbox
```

Expected output: `added 1 package` (the library has zero runtime dependencies).

- [ ] **Step 2: Verify the package resolves**

```bash
ls node_modules/yet-another-react-lightbox/index.js
```

Expected: the file exists (no `No such file` error).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install yet-another-react-lightbox"
```

---

## Task 2: `ObraFotosPreview` component (Feature 1)

**Files:**
- Create: `src/components/obres/ObraFotosPreview.tsx`
- Create: `src/components/obres/__tests__/ObraFotosPreview.test.tsx`

### Step 2.1 — Write the failing tests

- [ ] **Step 2.1: Write the failing test file**

Create `src/components/obres/__tests__/ObraFotosPreview.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ObraFotosPreview from '../ObraFotosPreview'
import type { ActeImatge } from '@/lib/types/database'

// Mock next/image — jsdom cannot process optimised images
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  },
}))

// Mock next/link — renders a plain <a>
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const makePhoto = (id: string): ActeImatge & { acte: { data: string } } => ({
  id,
  acte_id: 'acta-uuid-1',
  url: `https://storage.test/foto-${id}.jpg`,
  caption: null,
  created_at: `2026-04-18T10:0${id}:00Z`,
  acte: { data: '2026-04-18' },
})

describe('ObraFotosPreview', () => {
  it('mostra estat buit quan no hi ha fotos', () => {
    render(<ObraFotosPreview obraId="obra-1" fotos={[]} />)
    expect(
      screen.getByText(/encara no hi ha fotos/i)
    ).toBeInTheDocument()
  })

  it('no mostra el grid quan no hi ha fotos', () => {
    render(<ObraFotosPreview obraId="obra-1" fotos={[]} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renderitza fins a 4 fotos en el grid', () => {
    const fotos = [makePhoto('1'), makePhoto('2'), makePhoto('3'), makePhoto('4')]
    render(<ObraFotosPreview obraId="obra-1" fotos={fotos} />)
    expect(screen.getAllByRole('img')).toHaveLength(4)
  })

  it('renderitza correctament amb menys de 4 fotos', () => {
    const fotos = [makePhoto('1'), makePhoto('2')]
    render(<ObraFotosPreview obraId="obra-1" fotos={fotos} />)
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })

  it('mostra el link "Veure totes →" apuntant a la galeria', () => {
    const fotos = [makePhoto('1')]
    render(<ObraFotosPreview obraId="obra-uuid-1" fotos={fotos} />)
    const link = screen.getByRole('link', { name: /veure totes/i })
    expect(link).toHaveAttribute('href', '/obres/obra-uuid-1/galeria')
  })

  it('mostra el link "Veure totes →" fins i tot sense fotos', () => {
    render(<ObraFotosPreview obraId="obra-uuid-1" fotos={[]} />)
    const link = screen.getByRole('link', { name: /veure totes/i })
    expect(link).toHaveAttribute('href', '/obres/obra-uuid-1/galeria')
  })

  it('cada foto linka a la galeria', () => {
    const fotos = [makePhoto('1'), makePhoto('2')]
    render(<ObraFotosPreview obraId="obra-uuid-1" fotos={fotos} />)
    const links = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href') === '/obres/obra-uuid-1/galeria')
    // Header link + 2 photo links
    expect(links.length).toBeGreaterThanOrEqual(2)
  })
})
```

- [ ] **Step 2.2: Run tests to confirm they fail**

```bash
cd /Users/joan/Projectes\ Joan\ Automate/_CLIENTS/06_nandu_construccio/nandu-obres
npx vitest run src/components/obres/__tests__/ObraFotosPreview.test.tsx
```

Expected: `FAIL` — `Cannot find module '../ObraFotosPreview'`.

- [ ] **Step 2.3: Create `ObraFotosPreview.tsx`**

Create `src/components/obres/ObraFotosPreview.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { ActeImatge } from '@/lib/types/database'

interface Props {
  obraId: string
  fotos: (ActeImatge & { acte: { data: string } })[]
}

export default function ObraFotosPreview({ obraId, fotos }: Props) {
  const galeriaHref = `/obres/${obraId}/galeria`

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">
          Últimes fotos
          {fotos.length > 0 && (
            <span className="ml-1.5 text-sm font-normal text-gray-500">
              ({fotos.length})
            </span>
          )}
        </h2>
        <Link
          href={galeriaHref}
          className="text-sm text-blue-600 hover:underline"
        >
          Veure totes →
        </Link>
      </div>

      {/* Empty state */}
      {fotos.length === 0 ? (
        <p className="text-sm text-gray-400">
          Encara no hi ha fotos. Afegeix-les des de les actes.
        </p>
      ) : (
        /* 2×2 grid */
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {fotos.map((foto) => (
            <Link
              key={foto.id}
              href={galeriaHref}
              className="relative aspect-square block overflow-hidden rounded-lg"
            >
              <Image
                src={foto.url}
                alt={foto.caption ?? "Foto d'obra"}
                fill
                className="object-cover transition-opacity hover:opacity-90"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2.4: Run tests to confirm they pass**

```bash
npx vitest run src/components/obres/__tests__/ObraFotosPreview.test.tsx
```

Expected: all 7 tests `PASS`.

- [ ] **Step 2.5: Commit**

```bash
git add src/components/obres/ObraFotosPreview.tsx src/components/obres/__tests__/ObraFotosPreview.test.tsx
git commit -m "feat: add ObraFotosPreview component with tests"
```

---

## Task 3: Wire `ObraFotosPreview` into the obra detail page (Feature 1)

**Files:**
- Modify: `src/app/(dashboard)/obres/[id]/page.tsx`

- [ ] **Step 3.1: Add the photo query and import**

Edit `src/app/(dashboard)/obres/[id]/page.tsx`. The full updated file:

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ObraDetailHeader from '@/components/obres/ObraDetailHeader'
import DocumentUpload from '@/components/obres/DocumentUpload'
import ActaHistorial from '@/components/actes/ActaHistorial'
import ObraFotosPreview from '@/components/obres/ObraFotosPreview'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ObraDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Carregar obra
  const { data: obra, error } = await supabase
    .from('obres')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !obra) notFound()

  // Carregar actes amb resum (num treballadors + hores totals)
  const { data: actesRaw } = await supabase
    .from('actes')
    .select(`
      *,
      acte_treballadors(hores)
    `)
    .eq('obra_id', id)
    .order('data', { ascending: false })

  const actes = (actesRaw ?? []).map((acta) => ({
    id: acta.id,
    obra_id: acta.obra_id,
    data: acta.data,
    comentari_general: acta.comentari_general,
    created_at: acta.created_at,
    num_treballadors: acta.acte_treballadors?.length ?? 0,
    total_hores: (acta.acte_treballadors ?? []).reduce(
      (sum: number, t: { hores: number }) => sum + Number(t.hores),
      0
    ),
  }))

  // Carregar les 4 últimes fotos de l'obra per al preview
  const { data: fotosPreviewRaw } = await supabase
    .from('acte_imatges')
    .select(`
      id,
      acte_id,
      url,
      caption,
      created_at,
      acte:actes!inner(data, obra_id)
    `)
    .eq('acte.obra_id', obra.id)
    .order('created_at', { ascending: false })
    .limit(4)

  const fotosPreview = (fotosPreviewRaw ?? []).map((img) => ({
    id: img.id,
    acte_id: img.acte_id,
    url: img.url,
    caption: img.caption,
    created_at: img.created_at,
    acte: {
      data: (img.acte as { data: string; obra_id: string }).data,
    },
  }))

  return (
    <div className="space-y-6">
      <ObraDetailHeader obra={obra} />

      {/* Secció Documents */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Documents</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <DocumentUpload
            obraId={obra.id}
            tipus="pressupost"
            label="Pressupost (PDF)"
            urlActual={obra.pressupost_pdf_url}
          />
          <DocumentUpload
            obraId={obra.id}
            tipus="projecte"
            label="Projecte / Plànols"
            urlActual={obra.projecte_pdf_url}
          />
        </div>
      </section>

      {/* Secció Últimes fotos */}
      <ObraFotosPreview obraId={obra.id} fotos={fotosPreview} />

      {/* Secció Actes */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Actes diàries ({actes.length})
          </h2>
          <Link
            href={`/obres/${id}/actes/nova`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Nova acta
          </Link>
        </div>

        <ActaHistorial actes={actes} obraId={id} />
      </section>
    </div>
  )
}
```

- [ ] **Step 3.2: Run the full test suite to verify no regressions**

```bash
npx vitest run
```

Expected: all previously passing tests still `PASS`; the new `ObraFotosPreview` tests also `PASS`.

- [ ] **Step 3.3: Commit**

```bash
git add src/app/\(dashboard\)/obres/\[id\]/page.tsx
git commit -m "feat: show últimes fotos preview on obra detail page"
```

---

## Task 4: Tests for `ActaGaleria` lightbox and sort order (Features 2 & 3)

**Files:**
- Create: `src/components/actes/__tests__/ActaGaleria.test.tsx`

Write the tests first so they drive the implementation.

- [ ] **Step 4.1: Write the failing tests**

Create `src/components/actes/__tests__/ActaGaleria.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActaGaleria from '../ActaGaleria'
import type { ActeImatge } from '@/lib/types/database'

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  },
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

// Mock yet-another-react-lightbox — we test state, not the real lightbox UI
vi.mock('yet-another-react-lightbox', () => ({
  default: ({
    open,
    slides,
    close,
  }: {
    open: boolean
    slides: { src: string }[]
    close: () => void
  }) =>
    open ? (
      <div data-testid="lightbox" aria-label="lightbox">
        <span data-testid="lightbox-slide-count">{slides.length}</span>
        <button onClick={close} aria-label="tancar lightbox">
          ×
        </button>
      </div>
    ) : null,
}))

type ImatgeAmbData = ActeImatge & { acta_data: string; acte_id: string }

const makeImatge = (
  id: string,
  acta_data: string,
  acte_id: string,
  created_at: string,
  caption: string | null = null
): ImatgeAmbData => ({
  id,
  acte_id,
  acta_data,
  url: `https://storage.test/foto-${id}.jpg`,
  caption,
  created_at,
})

describe('ActaGaleria — estat buit', () => {
  it('mostra missatge quan no hi ha fotos', () => {
    render(<ActaGaleria imatges={[]} obraId="obra-1" />)
    expect(
      screen.getByText(/no hi ha fotos per a aquesta obra/i)
    ).toBeInTheDocument()
  })
})

describe('ActaGaleria — agrupació i ordenació', () => {
  const imatges: ImatgeAmbData[] = [
    // Acta del 18 d'abril — 2 fotos (uploaded later → listed first within group)
    makeImatge('img-3', '2026-04-18', 'acta-2', '2026-04-18T11:00:00Z'),
    makeImatge('img-4', '2026-04-18', 'acta-2', '2026-04-18T09:00:00Z'),
    // Acta del 17 d'abril — 1 foto
    makeImatge('img-1', '2026-04-17', 'acta-1', '2026-04-17T10:00:00Z'),
  ]

  it('agrupa les fotos per data d\'acta i mostra els grups en ordre decreixent', () => {
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    const headings = screen.getAllByRole('heading', { level: 3 })
    // First heading should contain "abril" for the later date (18)
    expect(headings[0].textContent?.toLowerCase()).toContain('18')
    expect(headings[1].textContent?.toLowerCase()).toContain('17')
  })

  it('dins d\'un grup, les fotos apareixen en ordre de created_at descendent', () => {
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    const imgs = screen.getAllByRole('img')
    // img-3 (11:00) should come before img-4 (09:00) — both in the 18-Apr group
    const src3 = imgs.findIndex((img) => img.getAttribute('src')?.includes('img-3'))
    const src4 = imgs.findIndex((img) => img.getAttribute('src')?.includes('img-4'))
    expect(src3).toBeLessThan(src4)
  })
})

describe('ActaGaleria — tooltip hora de pujada', () => {
  it('cada foto té un title amb l\'hora de pujada', () => {
    const imatges: ImatgeAmbData[] = [
      makeImatge('img-1', '2026-04-18', 'acta-1', '2026-04-18T10:30:00Z'),
    ]
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    // The clickable wrapper should have a title attribute with the upload time
    const button = screen.getByRole('button', { name: /foto d'obra/i })
    expect(button).toHaveAttribute('title')
    expect(button.getAttribute('title')).toMatch(/10:30/)
  })
})

describe('ActaGaleria — lightbox', () => {
  const imatges: ImatgeAmbData[] = [
    makeImatge('img-1', '2026-04-18', 'acta-1', '2026-04-18T10:00:00Z', 'Teulada'),
    makeImatge('img-2', '2026-04-18', 'acta-1', '2026-04-18T09:00:00Z'),
  ]

  it('el lightbox NO és visible inicialment', () => {
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument()
  })

  it('clicar una foto obre el lightbox', async () => {
    const user = userEvent.setup()
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    expect(screen.getByTestId('lightbox')).toBeInTheDocument()
  })

  it('el lightbox rep totes les diapositives del grup', async () => {
    const user = userEvent.setup()
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    // 2 imatges en el grup
    expect(screen.getByTestId('lightbox-slide-count').textContent).toBe('2')
  })

  it('tancar el lightbox l\'amaga', async () => {
    const user = userEvent.setup()
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    await user.click(screen.getAllByRole('button')[0])
    expect(screen.getByTestId('lightbox')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /tancar lightbox/i }))
    expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 4.2: Run tests to confirm they fail**

```bash
npx vitest run src/components/actes/__tests__/ActaGaleria.test.tsx
```

Expected: `FAIL` — `Cannot find module 'yet-another-react-lightbox'` and/or assertion failures (no buttons, no lightbox).

---

## Task 5: Implement lightbox + sort + tooltip in `ActaGaleria` (Features 2 & 3)

**Files:**
- Modify: `src/components/actes/ActaGaleria.tsx`

- [ ] **Step 5.1: Rewrite `ActaGaleria.tsx`**

Replace the entire file content with:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { ActeImatge } from '@/lib/types/database'

interface ImatgeAmbData extends ActeImatge {
  acta_data: string
  acte_id: string
}

interface Props {
  imatges: ImatgeAmbData[]
  obraId: string
}

/** Formats a UTC ISO string to a locale time string, e.g. "10:30" */
function formatHora(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('ca-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  })
}

export default function ActaGaleria({ imatges, obraId }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  // Which group's slides are loaded into the lightbox
  const [lightboxSlides, setLightboxSlides] = useState<{ src: string }[]>([])

  if (imatges.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-400">No hi ha fotos per a aquesta obra.</p>
      </div>
    )
  }

  // Group by acta date — preserve descending order from query
  const imatgesPerData = imatges.reduce<Record<string, ImatgeAmbData[]>>(
    (acc, img) => {
      const data = img.acta_data
      if (!acc[data]) acc[data] = []
      acc[data].push(img)
      return acc
    },
    {}
  )

  // Sort groups descending and sort photos within each group by created_at desc
  const dates = Object.keys(imatgesPerData).sort((a, b) => b.localeCompare(a))

  for (const date of dates) {
    imatgesPerData[date].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  function openLightbox(groupDate: string, photoIndex: number) {
    const slides = imatgesPerData[groupDate].map((img) => ({ src: img.url }))
    setLightboxSlides(slides)
    setLightboxIndex(photoIndex)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className="space-y-8">
        {dates.map((data) => {
          const dataFormated = new Date(data + 'T12:00:00').toLocaleDateString(
            'ca-ES',
            {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }
          )
          const grup = imatgesPerData[data]
          const acteId = grup[0].acte_id

          return (
            <div key={data}>
              <div className="mb-3 flex items-center gap-2">
                <h3 className="font-medium capitalize text-gray-900">
                  {dataFormated}
                </h3>
                <Link
                  href={`/obres/${obraId}/actes/${acteId}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Veure acta →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {grup.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    aria-label={img.caption ?? "Foto d'obra"}
                    title={`Pujada el ${formatHora(img.created_at)}`}
                    onClick={() => openLightbox(data, idx)}
                    className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Image
                      src={img.url}
                      alt={img.caption ?? "Foto d'obra"}
                      fill
                      className="object-cover transition-opacity group-hover:opacity-90"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/50 px-1.5 py-0.5">
                        <p className="truncate text-xs text-white">
                          {img.caption}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Lightbox
        open={lightboxOpen}
        index={lightboxIndex}
        slides={lightboxSlides}
        close={() => setLightboxOpen(false)}
      />
    </>
  )
}
```

- [ ] **Step 5.2: Run the new ActaGaleria tests**

```bash
npx vitest run src/components/actes/__tests__/ActaGaleria.test.tsx
```

Expected: all tests `PASS`.

- [ ] **Step 5.3: Run the full test suite to confirm no regressions**

```bash
npx vitest run
```

Expected: all tests `PASS`.

- [ ] **Step 5.4: Commit**

```bash
git add src/components/actes/ActaGaleria.tsx src/components/actes/__tests__/ActaGaleria.test.tsx
git commit -m "feat: add lightbox and upload-time tooltip to ActaGaleria"
```

---

## Task 6: Final smoke test and clean-up

**Files:**
- No code changes; verification only.

- [ ] **Step 6.1: Run all tests one final time**

```bash
cd /Users/joan/Projectes\ Joan\ Automate/_CLIENTS/06_nandu_construccio/nandu-obres
npx vitest run
```

Expected output (all suites pass):
```
 ✓ src/components/obres/__tests__/ObraFotosPreview.test.tsx
 ✓ src/components/actes/__tests__/ActaGaleria.test.tsx
 ✓ src/components/actes/__tests__/ActaFotosUpload.test.tsx
 ✓ src/components/actes/__tests__/ActaTreballadorsEditor.test.tsx
 ✓ src/components/obres/__tests__/DocumentUpload.test.tsx
 ✓ src/components/obres/__tests__/ObraFiltres.test.tsx
 ✓ src/components/obres/__tests__/ObraForm.test.tsx
```

- [ ] **Step 6.2: Build check (TypeScript + Next.js)**

```bash
npx next build 2>&1 | tail -20
```

Expected: `Route (app)` table printed, no TypeScript errors, exit code 0.

- [ ] **Step 6.3: Final commit (if any lint/type fixes were needed)**

```bash
git add -p  # stage only what changed
git commit -m "fix: address build-time type warnings post-gallery refactor"
```

If no changes were needed, skip this step.

---

## Self-Review

### Spec coverage check

| Requirement | Covered by |
|-------------|-----------|
| Feature 1: 4-photo preview on `/obres/[id]` | Tasks 2, 3 |
| Feature 1: empty state | Task 2 (ObraFotosPreview — empty state test + impl) |
| Feature 1: "Veure totes →" link | Task 2 (test + impl) |
| Feature 1: photos link to gallery | Task 2 (test + impl) |
| Feature 1: query limited to 4, order by `created_at desc` | Task 3 (page.tsx query) |
| Feature 2: lightbox on photo click | Tasks 4, 5 |
| Feature 2: prev/next nav via lightbox library | Task 5 (`index` prop passed to `Lightbox`) |
| Feature 2: `yet-another-react-lightbox` | Task 1 |
| Feature 3: sort within acta by `created_at desc` | Task 5 (`imatgesPerData[date].sort(...)`) |
| Feature 3: timestamp tooltip | Task 5 (`title` attribute), Task 4 (test) |
| Tests: Vitest + RTL | All tasks |
| Tests: ObraFotosPreview — 4 photos, empty, link | Task 2 |
| Tests: lightbox click opens | Task 4 |
| Tests: grouping sort | Task 4 |

### Placeholder scan

No TBD, TODO, "implement later", "similar to Task N", or missing code blocks found.

### Type consistency

- `ImatgeAmbData` is defined inline in `ActaGaleria.tsx` (consistent with how `ActaGaleria` is used in `galeria/page.tsx`).
- The `ObraFotosPreview` props type uses `ActeImatge & { acte: { data: string } }` — matches what the query in `page.tsx` returns after the `.map()` flattening.
- `formatHora` is a module-local helper, only referenced within `ActaGaleria.tsx`. No cross-task naming inconsistency.
- `ActeImatge` imported from `@/lib/types/database` — has `id`, `acte_id`, `url`, `caption: string | null`, `created_at`. The spec's database schema mentions `storage_path` but the TypeScript type (the authoritative source) does not include it — the plan correctly omits it.
