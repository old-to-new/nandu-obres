# Treballadors — Gestió d'Equips i Filtres Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afegir el camp `encarregat` a la taula `treballadors` (Nandu / Pare / sense assignar), substituir la grid de cards per una llista filtrable per equip i per actiu/inactiu, i actualitzar el formulari d'edició i les server actions per llegir i persistir l'assignació d'equip.

**Architecture:**
- T1: Migració SQL pura — crea un nou enum `encarregat_treballador` i afegeix la columna `encarregat null` a la taula existent. Sense downtime, retrocompatible (valors null per defecte).
- T2: Actualització de tipus TypeScript (`database.ts`) — canvi de tipus pur, verificat per `tsc --noEmit`.
- T3: Afegir constants `ENCARREGAT_LABELS` i `ENCARREGAT_COLORS` a `src/lib/treballadors.ts`.
- T4: Nou component client `TreballadorsLlista` — substitueix la grid de `TreballadorsPageContent`. Gestiona filtre per equip i mostra/amaga inactius amb estat local React.
- T5: Actualitzar `TreballadorForm` (afegir select d'equip) i `actions.ts` (llegir `encarregat` del FormData).
- T6: Wiring a la pàgina servidor — `TreballadorsPage` passa `treballadors` a `TreballadorsLlista`; `TreballadorsPageContent` queda obsolet però no s'elimina fins que tots els tests siguin verds.

**Tech Stack:** Next.js 14 App Router, Tailwind v4, Supabase SSR, TypeScript, Vitest + RTL

---

## Mapa de fitxers

| Fitxer | Acció | Task |
|--------|-------|------|
| `supabase/migrations/003_treballadors_encarregat.sql` | Crear — nova migració | T1 |
| `src/lib/types/database.ts` | Modificar — afegir `EncarregatTreballador` i camp `encarregat` a `Treballador` | T2 |
| `src/lib/treballadors.ts` | Modificar — afegir `ENCARREGAT_LABELS` i `ENCARREGAT_COLORS` | T3 |
| `src/components/treballadors/TreballadorsLlista.tsx` | Crear — llista filtrable (client component) | T4 |
| `src/components/treballadors/__tests__/TreballadorsLlista.test.tsx` | Crear — tests de TreballadorsLlista | T4 |
| `src/components/treballadors/TreballadorForm.tsx` | Modificar — afegir select d'encarregat | T5 |
| `src/app/(dashboard)/treballadors/actions.ts` | Modificar — llegir `encarregat` del FormData | T5 |
| `src/components/treballadors/__tests__/TreballadorForm.test.tsx` | Modificar — afegir tests del select encarregat | T5 |
| `src/components/treballadors/__tests__/actions.test.ts` | Modificar — afegir tests del camp encarregat | T5 |
| `src/app/(dashboard)/treballadors/page.tsx` | Modificar — usar `TreballadorsLlista` en lloc de `TreballadorsPageContent` | T6 |
| `src/components/treballadors/__tests__/TreballadorsPage.test.tsx` | Modificar — adaptar tests al nou component | T6 |

> **Nota sobre numeració:** La migració anterior finalitza en `002_rls_audit.sql`, per tant la nova és `003_treballadors_encarregat.sql`.

---

## Task 1: Migració SQL — Afegir enum `encarregat_treballador` i columna `encarregat`

**Files:**
- Create: `supabase/migrations/003_treballadors_encarregat.sql`

- [ ] **Step 1.1: Crear la migració**

Crear `supabase/migrations/003_treballadors_encarregat.sql`:

```sql
-- Migration: 003_treballadors_encarregat
-- Afegeix l'assignació d'equip (Nandu / Pare) als treballadors.
-- La columna és nullable: NULL significa "sense assignar".

create type encarregat_treballador as enum ('nandu', 'pare');

alter table treballadors
  add column encarregat encarregat_treballador null;

comment on column treballadors.encarregat
  is 'Encarregat de l''equip al qual pertany el treballador. NULL = sense assignar.';
```

- [ ] **Step 1.2: Aplicar la migració localment**

```bash
cd /Users/joan/Projectes\ Joan\ Automate/_CLIENTS/06_nandu_construccio/nandu-obres
npx supabase db push
```

Expected output: `Applying migration 003_treballadors_encarregat.sql...` sense errors.

> ⚠️ **Producció:** Si el projecte Supabase no té auto-apply configurat, aplicar la migració manualment des del dashboard: SQL Editor → copiar i executar el contingut del fitxer.

- [ ] **Step 1.3: Verificar que la columna existeix**

```bash
npx supabase db diff
```

Expected: sense diferències pendents (la migració s'ha aplicat).

- [ ] **Step 1.4: Commit**

```bash
git add supabase/migrations/003_treballadors_encarregat.sql
git commit -m "feat(db): afegir enum encarregat_treballador i columna treballadors.encarregat

Nova columna nullable: null = sense assignar, 'nandu' o 'pare' per equip.
Retrocompatible: tots els treballadors existents queden amb encarregat = null."
```

---

## Task 2: Actualitzar tipus TypeScript

**Files:**
- Modify: `src/lib/types/database.ts`

No cal test unitari per a canvis de tipus — el compilador és la verificació. S'executa `tsc --noEmit` al final.

- [ ] **Step 2.1: Afegir `EncarregatTreballador` i actualitzar la interfície `Treballador`**

A `src/lib/types/database.ts`, substituir:

```ts
// ABANS — les primeres 3 línies del fitxer:
export type TipusTreballador = 'oficial' | 'oficial_2a' | 'peo' | 'altre'
export type LiniaObra = 'obra_nova' | 'rehabilitacio' | 'ascensors' | 'altres'
export type EstatObra = 'activa' | 'pausada' | 'finalitzada'
```

Per:

```ts
export type TipusTreballador = 'oficial' | 'oficial_2a' | 'peo' | 'altre'
export type EncarregatTreballador = 'nandu' | 'pare'
export type LiniaObra = 'obra_nova' | 'rehabilitacio' | 'ascensors' | 'altres'
export type EstatObra = 'activa' | 'pausada' | 'finalitzada'
```

A continuació, a la interfície `Treballador`, afegir el camp `encarregat` just després de `notes`:

```ts
// ABANS:
export interface Treballador {
  id: string
  nom: string
  tipus: TipusTreballador
  actiu: boolean
  telefon: string | null
  notes: string | null
  created_at: string
}
```

Per:

```ts
export interface Treballador {
  id: string
  nom: string
  tipus: TipusTreballador
  actiu: boolean
  telefon: string | null
  notes: string | null
  encarregat: EncarregatTreballador | null
  created_at: string
}
```

- [ ] **Step 2.2: Verificar que TypeScript compila sense errors**

```bash
cd /Users/joan/Projectes\ Joan\ Automate/_CLIENTS/06_nandu_construccio/nandu-obres
npx tsc --noEmit
```

Expected: cap error. Si hi ha errors al tests que usen fixtures de `Treballador`, s'han d'actualitzar les fixtures (afegir `encarregat: null`) — això es farà a T4 i T5.

- [ ] **Step 2.3: Commit**

```bash
git add src/lib/types/database.ts
git commit -m "feat(types): afegir EncarregatTreballador i camp encarregat a Treballador

Type union: 'nandu' | 'pare'. Camp nullable a la interfície consistent
amb la columna SQL nullable."
```

---

## Task 3: Afegir constants d'equip a `src/lib/treballadors.ts`

**Files:**
- Modify: `src/lib/treballadors.ts`

- [ ] **Step 3.1: Executar tests existents de la lib per confirmar base estable**

```bash
cd /Users/joan/Projectes\ Joan\ Automate/_CLIENTS/06_nandu_construccio/nandu-obres
npx vitest run src/components/treballadors/__tests__/TreballadorCard.test.tsx
```

Expected: PASS.

- [ ] **Step 3.2: Escriure el test per a les noves constants**

Crear `src/lib/__tests__/treballadors.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  TIPUS_LABELS,
  ENCARREGAT_LABELS,
  ENCARREGAT_COLORS,
} from '../treballadors'

describe('TIPUS_LABELS', () => {
  it('retorna etiqueta correcta per cada tipus', () => {
    expect(TIPUS_LABELS['oficial']).toBe('Oficial 1a')
    expect(TIPUS_LABELS['oficial_2a']).toBe('Oficial 2a')
    expect(TIPUS_LABELS['peo']).toBe('Peó')
    expect(TIPUS_LABELS['altre']).toBe('Altre')
  })
})

describe('ENCARREGAT_LABELS', () => {
  it('retorna les etiquetes correctes per nandu i pare', () => {
    expect(ENCARREGAT_LABELS['nandu']).toBe('Equip Nandu')
    expect(ENCARREGAT_LABELS['pare']).toBe('Equip Pare')
  })
})

describe('ENCARREGAT_COLORS', () => {
  it('retorna classes de color per nandu', () => {
    expect(ENCARREGAT_COLORS['nandu']).toContain('blue')
  })

  it('retorna classes de color per pare', () => {
    expect(ENCARREGAT_COLORS['pare']).toContain('orange')
  })

  it('els dos valors son strings no buits', () => {
    expect(ENCARREGAT_COLORS['nandu']).toBeTruthy()
    expect(ENCARREGAT_COLORS['pare']).toBeTruthy()
  })
})
```

- [ ] **Step 3.3: Executar el test per confirmar que falla**

```bash
npx vitest run src/lib/__tests__/treballadors.test.ts
```

Expected: FAIL — `ENCARREGAT_LABELS` i `ENCARREGAT_COLORS` no existeixen.

- [ ] **Step 3.4: Actualitzar `src/lib/treballadors.ts` amb les noves constants**

Substituir tot el contingut del fitxer:

```ts
import type { TipusTreballador, EncarregatTreballador } from '@/lib/types/database'

export const TIPUS_LABELS: Record<TipusTreballador, string> = {
  oficial: 'Oficial 1a',
  oficial_2a: 'Oficial 2a',
  peo: 'Peó',
  altre: 'Altre',
}

export const ENCARREGAT_LABELS: Record<EncarregatTreballador, string> = {
  nandu: 'Equip Nandu',
  pare: 'Equip Pare',
}

export const ENCARREGAT_COLORS: Record<EncarregatTreballador, string> = {
  nandu: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  pare: 'bg-orange-50 text-orange-700 ring-orange-600/20',
}
```

- [ ] **Step 3.5: Executar els tests**

```bash
npx vitest run src/lib/__tests__/treballadors.test.ts
```

Expected: tots PASS.

- [ ] **Step 3.6: Verificar que els tests existents de TreballadorCard segueixen passant**

```bash
npx vitest run src/components/treballadors/__tests__/TreballadorCard.test.tsx
```

Expected: PASS.

- [ ] **Step 3.7: Commit**

```bash
git add src/lib/treballadors.ts src/lib/__tests__/treballadors.test.ts
git commit -m "feat(lib): afegir ENCARREGAT_LABELS i ENCARREGAT_COLORS a treballadors.ts

Constants tipades per als dos equips (Nandu blau, Pare taronja).
Reutilitzables per TreballadorsLlista, TreballadorCard i fitxa."
```

---

## Task 4: Crear `TreballadorsLlista` — llista filtrable per equip

**Files:**
- Create: `src/components/treballadors/TreballadorsLlista.tsx`
- Create: `src/components/treballadors/__tests__/TreballadorsLlista.test.tsx`

- [ ] **Step 4.1: Escriure els tests del nou component**

Crear `src/components/treballadors/__tests__/TreballadorsLlista.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TreballadorsLlista from '../TreballadorsLlista'
import type { Treballador } from '@/lib/types/database'

const treballadors: Treballador[] = [
  {
    id: 'uuid-1',
    nom: 'Albert Font',
    tipus: 'oficial',
    actiu: true,
    telefon: '600111222',
    notes: null,
    encarregat: 'nandu',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'uuid-2',
    nom: 'Joan Martí',
    tipus: 'peo',
    actiu: true,
    telefon: null,
    notes: null,
    encarregat: 'pare',
    created_at: '2026-01-02T00:00:00Z',
  },
  {
    id: 'uuid-3',
    nom: 'Miquel Serra',
    tipus: 'oficial_2a',
    actiu: false,
    telefon: '611000111',
    notes: null,
    encarregat: 'nandu',
    created_at: '2026-01-03T00:00:00Z',
  },
  {
    id: 'uuid-4',
    nom: 'Pere Gómez',
    tipus: 'altre',
    actiu: true,
    telefon: null,
    notes: null,
    encarregat: null,
    created_at: '2026-01-04T00:00:00Z',
  },
]

describe('TreballadorsLlista — render inicial', () => {
  it('mostra el títol "Treballadors"', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByRole('heading', { name: /treballadors/i })).toBeInTheDocument()
  })

  it('mostra el botó "Nou treballador"', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByRole('link', { name: /nou treballador/i })).toHaveAttribute('href', '/treballadors/nou')
  })

  it('per defecte mostra els 3 treballadors actius (oculta inactius)', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByText('Albert Font')).toBeInTheDocument()
    expect(screen.getByText('Joan Martí')).toBeInTheDocument()
    expect(screen.getByText('Pere Gómez')).toBeInTheDocument()
    expect(screen.queryByText('Miquel Serra')).not.toBeInTheDocument()
  })

  it('mostra el comptador de treballadors visibles', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByText(/3 treballadors/i)).toBeInTheDocument()
  })

  it('cada fila és un link a la fitxa del treballador', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const link = screen.getByRole('link', { name: /albert font/i })
    expect(link).toHaveAttribute('href', '/treballadors/uuid-1')
  })
})

describe('TreballadorsLlista — badge d'equip', () => {
  it('mostra el badge "Equip Nandu" per treballadors de Nandu', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const badges = screen.getAllByText('Equip Nandu')
    expect(badges.length).toBeGreaterThanOrEqual(1)
  })

  it('mostra el badge "Equip Pare" per treballadors del Pare', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByText('Equip Pare')).toBeInTheDocument()
  })

  it('no mostra badge d'equip per treballadors sense assignar', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    // Pere Gómez (uuid-4) no té encarregat
    const row = screen.getByRole('link', { name: /pere gómez/i })
    expect(row).not.toHaveTextContent('Equip Nandu')
    expect(row).not.toHaveTextContent('Equip Pare')
  })
})

describe('TreballadorsLlista — filtre per equip', () => {
  it('filtrar per "Equip Nandu" mostra només treballadors de Nandu actius', async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /equip nandu/i }))

    expect(screen.getByText('Albert Font')).toBeInTheDocument()
    expect(screen.queryByText('Joan Martí')).not.toBeInTheDocument()
    expect(screen.queryByText('Pere Gómez')).not.toBeInTheDocument()
  })

  it('filtrar per "Equip Pare" mostra només treballadors del Pare actius', async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /equip pare/i }))

    expect(screen.getByText('Joan Martí')).toBeInTheDocument()
    expect(screen.queryByText('Albert Font')).not.toBeInTheDocument()
  })

  it('filtrar per "Tots" restaura la vista amb tots els actius', async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /equip nandu/i }))
    await user.click(screen.getByRole('button', { name: /tots/i }))

    expect(screen.getByText('Albert Font')).toBeInTheDocument()
    expect(screen.getByText('Joan Martí')).toBeInTheDocument()
  })
})

describe('TreballadorsLlista — filtre inactius', () => {
  it('activar "Veure inactius" mostra el treballador inactiu', async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /veure inactius/i }))

    expect(screen.getByText('Miquel Serra')).toBeInTheDocument()
  })

  it('el treballador inactiu té el badge "Inactiu"', async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /veure inactius/i }))

    expect(screen.getByText('Inactiu')).toBeInTheDocument()
  })

  it('tornar a clicar oculta els inactius', async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /veure inactius/i }))
    await user.click(screen.getByRole('button', { name: /amagar inactius/i }))

    expect(screen.queryByText('Miquel Serra')).not.toBeInTheDocument()
  })

  it('filtre d'equip + inactius: Nandu amb inactius mostra Albert i Miquel', async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /equip nandu/i }))
    await user.click(screen.getByRole('button', { name: /veure inactius/i }))

    expect(screen.getByText('Albert Font')).toBeInTheDocument()
    expect(screen.getByText('Miquel Serra')).toBeInTheDocument()
    expect(screen.queryByText('Joan Martí')).not.toBeInTheDocument()
  })
})

describe('TreballadorsLlista — estat buit', () => {
  it('mostra missatge quan no hi ha treballadors visibles', async () => {
    render(<TreballadorsLlista treballadors={[]} />)
    expect(screen.getByText(/no hi ha treballadors/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 4.2: Executar els tests per confirmar que fallen**

```bash
cd /Users/joan/Projectes\ Joan\ Automate/_CLIENTS/06_nandu_construccio/nandu-obres
npx vitest run src/components/treballadors/__tests__/TreballadorsLlista.test.tsx
```

Expected: FAIL — `TreballadorsLlista` no existeix.

- [ ] **Step 4.3: Implementar `TreballadorsLlista.tsx`**

Crear `src/components/treballadors/TreballadorsLlista.tsx`:

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Treballador, EncarregatTreballador } from '@/lib/types/database'
import {
  TIPUS_LABELS,
  ENCARREGAT_LABELS,
  ENCARREGAT_COLORS,
} from '@/lib/treballadors'

type FiltreEquip = 'tots' | EncarregatTreballador

interface TreballadorsLlistaProps {
  treballadors: Treballador[]
}

export default function TreballadorsLlista({ treballadors }: TreballadorsLlistaProps) {
  const [filtreEquip, setFiltreEquip] = useState<FiltreEquip>('tots')
  const [mostraInactius, setMostraInactius] = useState(false)

  const treballadorsVisibles = treballadors.filter((t) => {
    if (!mostraInactius && !t.actiu) return false
    if (filtreEquip !== 'tots' && t.encarregat !== filtreEquip) return false
    return true
  })

  const inactiusCount = treballadors.filter((t) => !t.actiu).length

  return (
    <div className="space-y-5">
      {/* Capçalera */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treballadors</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {treballadorsVisibles.length}{' '}
            {treballadorsVisibles.length === 1 ? 'treballador' : 'treballadors'}
          </p>
        </div>
        <Link
          href="/treballadors/nou"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nou treballador
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtre per equip */}
        <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm">
          {(['tots', 'nandu', 'pare'] as const).map((valor) => {
            const label =
              valor === 'tots'
                ? 'Tots'
                : ENCARREGAT_LABELS[valor as EncarregatTreballador]
            const isActive = filtreEquip === valor
            return (
              <button
                key={valor}
                type="button"
                onClick={() => setFiltreEquip(valor)}
                className={[
                  'px-3 py-1.5 text-sm font-medium transition first:rounded-l-lg last:rounded-r-lg',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Toggle inactius */}
        <button
          type="button"
          onClick={() => setMostraInactius((prev) => !prev)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
        >
          {mostraInactius
            ? `Amagar inactius`
            : `Veure inactius${inactiusCount > 0 ? ` (${inactiusCount})` : ''}`}
        </button>
      </div>

      {/* Llista */}
      {treballadorsVisibles.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          No hi ha treballadors{filtreEquip !== 'tots' ? ' en aquest equip' : ''}.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {treballadorsVisibles.map((t) => (
            <li key={t.id}>
              <Link
                href={`/treballadors/${t.id}`}
                className="flex items-center gap-4 px-4 py-3 transition hover:bg-gray-50"
                aria-label={t.nom}
              >
                {/* Nom + tipus */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{t.nom}</p>
                  <p className="text-sm text-gray-500">{TIPUS_LABELS[t.tipus]}</p>
                </div>

                {/* Badges */}
                <div className="flex shrink-0 items-center gap-2">
                  {t.encarregat && (
                    <span
                      className={[
                        'rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                        ENCARREGAT_COLORS[t.encarregat],
                      ].join(' ')}
                    >
                      {ENCARREGAT_LABELS[t.encarregat]}
                    </span>
                  )}
                  {!t.actiu && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-400/20">
                      Inactiu
                    </span>
                  )}
                  {t.telefon && (
                    <span className="hidden text-sm text-gray-500 sm:block">
                      📞 {t.telefon}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 4.4: Executar els tests**

```bash
npx vitest run src/components/treballadors/__tests__/TreballadorsLlista.test.tsx
```

Expected: tots els tests PASS.

- [ ] **Step 4.5: Actualitzar les fixtures dels tests existents de TreballadorCard**

El test de `TreballadorCard` usa fixtures de `Treballador`. Ara que el tipus inclou `encarregat`, cal afegir el camp a les fixtures (o TypeScript fallarà en mode strict).

Modificar `src/components/treballadors/__tests__/TreballadorCard.test.tsx` — afegir `encarregat: null` a les dues fixtures:

```tsx
// ABANS:
const treballadorActiu: Treballador = {
  id: 'uuid-1',
  nom: 'Pere Garriga',
  tipus: 'oficial',
  actiu: true,
  telefon: '600111222',
  notes: null,
  created_at: '2026-01-01T00:00:00Z',
}

// DESPRÉS:
const treballadorActiu: Treballador = {
  id: 'uuid-1',
  nom: 'Pere Garriga',
  tipus: 'oficial',
  actiu: true,
  telefon: '600111222',
  notes: null,
  encarregat: null,
  created_at: '2026-01-01T00:00:00Z',
}
```

Fer el mateix per `treballadorInactiu`:

```tsx
// ABANS:
const treballadorInactiu: Treballador = {
  ...treballadorActiu,
  id: 'uuid-2',
  nom: 'Joan Mas',
  actiu: false,
  tipus: 'peo',
}

// DESPRÉS:
const treballadorInactiu: Treballador = {
  ...treballadorActiu,
  id: 'uuid-2',
  nom: 'Joan Mas',
  actiu: false,
  tipus: 'peo',
  encarregat: 'pare',
}
```

- [ ] **Step 4.6: Executar tots els tests de treballadors per confirmar cap regressió**

```bash
npx vitest run src/components/treballadors/__tests__/
```

Expected: PASS.

- [ ] **Step 4.7: Commit**

```bash
git add \
  src/components/treballadors/TreballadorsLlista.tsx \
  src/components/treballadors/__tests__/TreballadorsLlista.test.tsx \
  src/components/treballadors/__tests__/TreballadorCard.test.tsx
git commit -m "feat(ui): nou component TreballadorsLlista — llista filtrable per equip

Substitueix la grid de cards per una llista amb filtres de segment (Tots /
Equip Nandu / Equip Pare) i toggle inactius. Badges d'equip blau/taronja.
Fixtures TreballadorCard.test actualitzades amb el nou camp encarregat."
```

---

## Task 5: Actualitzar `TreballadorForm` i server actions

**Files:**
- Modify: `src/components/treballadors/TreballadorForm.tsx`
- Modify: `src/app/(dashboard)/treballadors/actions.ts`
- Modify: `src/components/treballadors/__tests__/TreballadorForm.test.tsx`
- Modify: `src/components/treballadors/__tests__/actions.test.ts`

### Subtask 5A: TreballadorForm

- [ ] **Step 5.1: Afegir test per al nou select d'equip al formulari**

A `src/components/treballadors/__tests__/TreballadorForm.test.tsx`:

Primer, actualitzar la fixture `treballadorExistent` per incloure `encarregat`:

```tsx
// ABANS:
const treballadorExistent: Treballador = {
  id: 'uuid-1',
  nom: 'Pere Garriga',
  tipus: 'oficial',
  actiu: true,
  telefon: '600111222',
  notes: 'Bon conductor',
  created_at: '2026-01-01T00:00:00Z',
}

// DESPRÉS:
const treballadorExistent: Treballador = {
  id: 'uuid-1',
  nom: 'Pere Garriga',
  tipus: 'oficial',
  actiu: true,
  telefon: '600111222',
  notes: 'Bon conductor',
  encarregat: 'nandu',
  created_at: '2026-01-01T00:00:00Z',
}
```

Afegir els tests nous al describe `'TreballadorForm — mode creacio'`:

```tsx
it('renderitza el select d'equip', () => {
  render(<TreballadorForm action={mockAction} />)
  expect(screen.getByLabelText(/equip/i)).toBeInTheDocument()
})

it('el select d'equip conte les tres opcions (sense assignar, Nandu, Pare)', () => {
  render(<TreballadorForm action={mockAction} />)
  const select = screen.getByLabelText(/equip/i)
  expect(select).toContainElement(screen.getByRole('option', { name: /sense assignar/i }))
  expect(select).toContainElement(screen.getByRole('option', { name: /equip nandu/i }))
  expect(select).toContainElement(screen.getByRole('option', { name: /equip pare/i }))
})

it('en mode creació, el valor per defecte és "sense assignar"', () => {
  render(<TreballadorForm action={mockAction} />)
  expect(screen.getByLabelText(/equip/i)).toHaveValue('')
})
```

Afegir test nou al describe `'TreballadorForm — mode edicio'`:

```tsx
it('pre-omple el select d'equip amb l'encarregat del treballador', () => {
  render(<TreballadorForm action={mockAction} treballador={treballadorExistent} />)
  expect(screen.getByLabelText(/equip/i)).toHaveValue('nandu')
})

it('pre-omple com a buit si encarregat és null', () => {
  const treballadorSenseEquip: Treballador = {
    ...treballadorExistent,
    encarregat: null,
  }
  render(<TreballadorForm action={mockAction} treballador={treballadorSenseEquip} />)
  expect(screen.getByLabelText(/equip/i)).toHaveValue('')
})
```

- [ ] **Step 5.2: Executar els tests per confirmar que fallen**

```bash
npx vitest run src/components/treballadors/__tests__/TreballadorForm.test.tsx
```

Expected: FAIL — el select d'equip no existeix al formulari.

- [ ] **Step 5.3: Afegir el select d'equip a `TreballadorForm.tsx`**

A `src/components/treballadors/TreballadorForm.tsx`, actualitzar els imports:

```tsx
// ABANS:
'use client'

import type { Treballador, TipusTreballador } from '@/lib/types/database'

// DESPRÉS:
'use client'

import type { Treballador, TipusTreballador, EncarregatTreballador } from '@/lib/types/database'
```

Afegir les opcions d'encarregat just sota `TIPUS_OPTIONS`:

```tsx
// Afegir després de TIPUS_OPTIONS:
const ENCARREGAT_OPTIONS: { value: EncarregatTreballador | ''; label: string }[] = [
  { value: '', label: 'Sense assignar' },
  { value: 'nandu', label: 'Equip Nandu' },
  { value: 'pare', label: 'Equip Pare' },
]
```

Afegir el camp d'equip al formulari, entre el select de `tipus` i el camp de `telefon` (substituir el bloc `<div>` de tipus per aquests dos blocs):

```tsx
      <div>
        <label
          htmlFor="tipus"
          className="block text-sm font-medium text-gray-700"
        >
          Tipus
        </label>
        <select
          id="tipus"
          name="tipus"
          defaultValue={treballador?.tipus ?? 'oficial'}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {TIPUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="encarregat"
          className="block text-sm font-medium text-gray-700"
        >
          Equip
        </label>
        <select
          id="encarregat"
          name="encarregat"
          defaultValue={treballador?.encarregat ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {ENCARREGAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
```

El fitxer `TreballadorForm.tsx` complet queda:

```tsx
'use client'

import type { Treballador, TipusTreballador, EncarregatTreballador } from '@/lib/types/database'

const TIPUS_OPTIONS: { value: TipusTreballador; label: string }[] = [
  { value: 'oficial', label: 'Oficial' },
  { value: 'oficial_2a', label: 'Oficial 2a' },
  { value: 'peo', label: 'Peó' },
  { value: 'altre', label: 'Altre' },
]

const ENCARREGAT_OPTIONS: { value: EncarregatTreballador | ''; label: string }[] = [
  { value: '', label: 'Sense assignar' },
  { value: 'nandu', label: 'Equip Nandu' },
  { value: 'pare', label: 'Equip Pare' },
]

interface TreballadorFormProps {
  action: (formData: FormData) => Promise<void>
  treballador?: Treballador
}

export function TreballadorForm({ action, treballador }: TreballadorFormProps) {
  const isEdit = !!treballador

  return (
    <form action={action} className="space-y-5">
      <div>
        <label
          htmlFor="nom"
          className="block text-sm font-medium text-gray-700"
        >
          Nom
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          defaultValue={treballador?.nom ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Nom complet"
        />
      </div>

      <div>
        <label
          htmlFor="tipus"
          className="block text-sm font-medium text-gray-700"
        >
          Tipus
        </label>
        <select
          id="tipus"
          name="tipus"
          defaultValue={treballador?.tipus ?? 'oficial'}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {TIPUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="encarregat"
          className="block text-sm font-medium text-gray-700"
        >
          Equip
        </label>
        <select
          id="encarregat"
          name="encarregat"
          defaultValue={treballador?.encarregat ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {ENCARREGAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="telefon"
          className="block text-sm font-medium text-gray-700"
        >
          Telèfon
        </label>
        <input
          id="telefon"
          name="telefon"
          type="tel"
          defaultValue={treballador?.telefon ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="600 000 000"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={treballador?.notes ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Notes addicionals..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isEdit ? 'Actualitzar' : 'Desar'}
        </button>
        <a
          href="/treballadors"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel·lar
        </a>
      </div>
    </form>
  )
}
```

- [ ] **Step 5.4: Executar tests del formulari**

```bash
npx vitest run src/components/treballadors/__tests__/TreballadorForm.test.tsx
```

Expected: PASS.

### Subtask 5B: Server actions

- [ ] **Step 5.5: Afegir tests per al camp `encarregat` a les actions**

A `src/components/treballadors/__tests__/actions.test.ts`, afegir tests nous al describe `createTreballador` i `updateTreballador`.

Al describe `createTreballador`, afegir:

```ts
it('passa encarregat "nandu" quan s'especifica', async () => {
  const formData = new FormData()
  formData.set('nom', 'Albert Font')
  formData.set('tipus', 'oficial')
  formData.set('encarregat', 'nandu')

  await createTreballador(formData)

  expect(mockInsert).toHaveBeenCalledWith(
    expect.objectContaining({ encarregat: 'nandu' })
  )
})

it('passa encarregat null quan el camp és buit (sense assignar)', async () => {
  const formData = new FormData()
  formData.set('nom', 'Joan Mas')
  formData.set('tipus', 'peo')
  formData.set('encarregat', '')

  await createTreballador(formData)

  expect(mockInsert).toHaveBeenCalledWith(
    expect.objectContaining({ encarregat: null })
  )
})
```

Al describe `updateTreballador`, afegir:

```ts
it('actualitza el camp encarregat a "pare"', async () => {
  const formData = new FormData()
  formData.set('nom', 'Pere Garriga')
  formData.set('tipus', 'oficial_2a')
  formData.set('encarregat', 'pare')

  await updateTreballador('uuid-123', formData)

  expect(mockUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ encarregat: 'pare' })
  )
})

it('actualitza encarregat a null quan el camp és buit', async () => {
  const formData = new FormData()
  formData.set('nom', 'Pere Garriga')
  formData.set('tipus', 'oficial')
  formData.set('encarregat', '')

  await updateTreballador('uuid-123', formData)

  expect(mockUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ encarregat: null })
  )
})
```

- [ ] **Step 5.6: Executar els tests per confirmar que fallen**

```bash
npx vitest run src/components/treballadors/__tests__/actions.test.ts
```

Expected: FAIL — les actions no llegeixen `encarregat`.

- [ ] **Step 5.7: Actualitzar `actions.ts` per llegir i persistir `encarregat`**

Substituir tot el contingut de `src/app/(dashboard)/treballadors/actions.ts`:

```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { TipusTreballador, EncarregatTreballador } from '@/lib/types/database'

export async function createTreballador(formData: FormData) {
  const supabase = await createClient()

  const nom = formData.get('nom') as string
  const tipus = formData.get('tipus') as TipusTreballador
  const telefon = (formData.get('telefon') as string) || null
  const notes = (formData.get('notes') as string) || null
  const encarregatRaw = (formData.get('encarregat') as string) || null
  const encarregat = (encarregatRaw as EncarregatTreballador | null) || null

  const { error } = await supabase.from('treballadors').insert({
    nom,
    tipus,
    telefon,
    notes,
    encarregat,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/treballadors')
  redirect('/treballadors')
}

export async function updateTreballador(id: string, formData: FormData) {
  const supabase = await createClient()

  const nom = formData.get('nom') as string
  const tipus = formData.get('tipus') as TipusTreballador
  const telefon = (formData.get('telefon') as string) || null
  const notes = (formData.get('notes') as string) || null
  const encarregatRaw = (formData.get('encarregat') as string) || null
  const encarregat = (encarregatRaw as EncarregatTreballador | null) || null

  const { error } = await supabase
    .from('treballadors')
    .update({ nom, tipus, telefon, notes, encarregat })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/treballadors')
  redirect(`/treballadors/${id}`)
}

export async function toggleActiu(id: string, actiu: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('treballadors')
    .update({ actiu })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/treballadors')
}
```

- [ ] **Step 5.8: Executar tots els tests de les actions**

```bash
npx vitest run src/components/treballadors/__tests__/actions.test.ts
```

Expected: PASS.

- [ ] **Step 5.9: Executar tots els tests de treballadors per confirmar cap regressió**

```bash
npx vitest run src/components/treballadors/__tests__/
npx vitest run src/lib/__tests__/treballadors.test.ts
```

Expected: tots PASS.

- [ ] **Step 5.10: Commit**

```bash
git add \
  src/components/treballadors/TreballadorForm.tsx \
  src/app/(dashboard)/treballadors/actions.ts \
  src/components/treballadors/__tests__/TreballadorForm.test.tsx \
  src/components/treballadors/__tests__/actions.test.ts
git commit -m "feat: TreballadorForm + actions - afegir camp encarregat (assignació d'equip)

Nou select 'Equip' al formulari amb Sense assignar / Equip Nandu / Equip Pare.
createTreballador i updateTreballador llegeixen i persisteixen encarregat.
Valor buit del select → null a la DB."
```

---

## Task 6: Wiring a la pàgina servidor — usar `TreballadorsLlista`

**Files:**
- Modify: `src/app/(dashboard)/treballadors/page.tsx`
- Modify: `src/components/treballadors/__tests__/TreballadorsPage.test.tsx`

- [ ] **Step 6.1: Actualitzar els tests de la pàgina**

`TreballadorsPage.test.tsx` prova `TreballadorsPageContent` que passarà a ser el component antic. El test s'ha d'adaptar perquè ara la pàgina usa `TreballadorsLlista`.

Substituir tot el contingut de `src/components/treballadors/__tests__/TreballadorsPage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TreballadorsLlista from '../TreballadorsLlista'
import type { Treballador } from '@/lib/types/database'

// Nota: TreballadorsPage és un Server Component — es testa indirectament
// a través de TreballadorsLlista, que és el component que rep les dades.

const treballadors: Treballador[] = [
  {
    id: 'uuid-1',
    nom: 'Pere Garriga',
    tipus: 'oficial',
    actiu: true,
    telefon: '600111222',
    notes: null,
    encarregat: 'nandu',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'uuid-2',
    nom: 'Joan Mas',
    tipus: 'peo',
    actiu: false,
    telefon: null,
    notes: null,
    encarregat: null,
    created_at: '2026-01-01T00:00:00Z',
  },
]

describe('TreballadorsLlista — integració pàgina', () => {
  it('mostra el títol de la pàgina', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByRole('heading', { name: /treballadors/i })).toBeInTheDocument()
  })

  it('mostra els treballadors actius per defecte', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByText('Pere Garriga')).toBeInTheDocument()
  })

  it('oculta els treballadors inactius per defecte', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.queryByText('Joan Mas')).not.toBeInTheDocument()
  })

  it('mostra el botó per crear un nou treballador', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByRole('link', { name: /nou treballador/i })).toBeInTheDocument()
  })

  it('mostra el comptador de treballadors visibles', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByText(/1 treballador/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 6.2: Executar el test per confirmar base estable**

```bash
npx vitest run src/components/treballadors/__tests__/TreballadorsPage.test.tsx
```

Expected: PASS (el test ara usa `TreballadorsLlista` que ja funciona).

- [ ] **Step 6.3: Actualitzar `TreballadorsPage` per usar `TreballadorsLlista`**

Substituir tot el contingut de `src/app/(dashboard)/treballadors/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import TreballadorsLlista from '@/components/treballadors/TreballadorsLlista'

export default async function TreballadorsPage() {
  const supabase = await createClient()
  const { data: treballadors, error } = await supabase
    .from('treballadors')
    .select('*')
    .order('nom')

  if (error) throw new Error(error.message)

  return <TreballadorsLlista treballadors={treballadors ?? []} />
}
```

> **Nota:** S'elimina el paràmetre `searchParams` perquè el filtre d'inactius ara és estat client. Retrocompatible: si algú accedia a `/treballadors?inactius=1` des d'un bookmark, simplement verà la llista sense filtre actiu, que és un comportament acceptable.

- [ ] **Step 6.4: Verificació de TypeScript**

```bash
cd /Users/joan/Projectes\ Joan\ Automate/_CLIENTS/06_nandu_construccio/nandu-obres
npx tsc --noEmit
```

Expected: cap error.

- [ ] **Step 6.5: Executar la suite de tests completa de treballadors**

```bash
npx vitest run src/components/treballadors/__tests__/ src/lib/__tests__/treballadors.test.ts
```

Expected: tots PASS.

- [ ] **Step 6.6: Executar tots els tests del projecte (smoke test)**

```bash
npx vitest run
```

Expected: tots PASS (cap regressió a obres, actes, vehicles ni certificació).

- [ ] **Step 6.7: Commit**

```bash
git add \
  src/app/(dashboard)/treballadors/page.tsx \
  src/components/treballadors/__tests__/TreballadorsPage.test.tsx
git commit -m "feat: TreballadorsPage usa TreballadorsLlista — filtre d'equips live

Substituïda la grid de cards per la llista filtrable. El filtre d'inactius
passa de query param (SSR) a estat client (instant, sense reload).
TreballadorsPageContent queda com a legacy no usat — es pot eliminar en
una PR de cleanup."
```

---

## Ordre d'execució recomanat

```
T1 (DB migració)
  → T2 (TypeScript types)
    → T3 (constants lib)
      → T4 (TreballadorsLlista)
        → T5 (TreballadorForm + actions)
          → T6 (Page wiring)
```

Totes les tasques son seqüencials (cada una depèn de l'anterior). No es pot paral·lelitzar amb worktrees perquè hi ha un únic fitxer de migracions i un únic `database.ts`.

**Estimació de temps:** T1 (5 min) + T2 (5 min) + T3 (15 min) + T4 (30 min) + T5 (30 min) + T6 (15 min) = **~100 minuts**.

---

## Self-Review

### Spec coverage
- ✅ T1: Migració SQL crea `encarregat_treballador` enum i columna nullable — retrocompatible
- ✅ T2: `EncarregatTreballador` type + camp `encarregat: EncarregatTreballador | null` a `Treballador`
- ✅ T3: `ENCARREGAT_LABELS` i `ENCARREGAT_COLORS` exportats i testats
- ✅ T4: `TreballadorsLlista` — filtre equip (Tots/Nandu/Pare), toggle inactius, badges, links, comptador, estat buit
- ✅ T5: `TreballadorForm` — select equip, opcions correctes, valor per defecte, pre-omplert en edició; actions — `encarregat` llegit i persistit, buit → null
- ✅ T6: `TreballadorsPage` simplificat — passa array a `TreballadorsLlista`, TypeScript net

### Placeholders scan
- Cap "TODO", "TBD" ni "similar a Task N" al pla
- Tot el codi és complet i listo per copiar-enganxar

### Decisions de disseny documentades
1. **Filtre inactius com a estat client** (no query param): elimina el reload de pàgina, consistent amb el nou component client. L'URL `/treballadors?inactius=1` deixa de funcionar com a filtre, però no era una URL pública documentada.
2. **`TreballadorsPageContent` no s'elimina** en aquest PR per evitar trencar possibles usos no detectats. Es pot eliminar en un cleanup posterior.
3. **Migració `003_`** (no `002_`): `002_rls_audit.sql` ja existeix, cal continuar la seqüència.
4. **Filtre d'equip oculta treballadors sense encarregat** quan es filtra per Nandu o Pare (és el comportament esperat: filtrar per equip ha de mostrar només l'equip).

### Type consistency
- `encarregatRaw || null` a les actions: `''` (string buit del select) → `null` a la DB ✅
- `treballador?.encarregat ?? ''` al `defaultValue` del select: `null` → `''` (opció "Sense assignar") ✅
- `FiltreEquip = 'tots' | EncarregatTreballador`: unió tipada, no `string` ✅
