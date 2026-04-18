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
                      {t.telefon}
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
