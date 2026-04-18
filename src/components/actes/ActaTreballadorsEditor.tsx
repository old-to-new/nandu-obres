'use client'

import { useState, useEffect } from 'react'
import type { Treballador } from '@/lib/types/database'

export interface TreballadorEditorEntry {
  treballadorId: string
  hores: number
  comentari: string
  planificat: boolean
}

interface Props {
  treballadorsDisponibles: Treballador[]
  initialTreballadors: TreballadorEditorEntry[]
  onChange: (treballadors: TreballadorEditorEntry[]) => void
}

const TIPUS_LABELS: Record<Treballador['tipus'], string> = {
  oficial: 'Oficial 1a',
  oficial_2a: 'Oficial 2a',
  peo: 'Peó',
  altre: 'Altre',
}

export default function ActaTreballadorsEditor({
  treballadorsDisponibles,
  initialTreballadors,
  onChange,
}: Props) {
  const [treballadors, setTreballadors] = useState<TreballadorEditorEntry[]>(initialTreballadors)

  // Notificar el pare cada cop que canvia l'estat local
  useEffect(() => {
    onChange(treballadors)
  }, [treballadors, onChange])

  const treballadorsIds = new Set(treballadors.map((t) => t.treballadorId))
  const disponiblesPerAfegir = treballadorsDisponibles.filter(
    (t) => t.actiu && !treballadorsIds.has(t.id)
  )

  function updateHores(treballadorId: string, hores: number) {
    setTreballadors((prev) =>
      prev.map((t) => (t.treballadorId === treballadorId ? { ...t, hores } : t))
    )
  }

  function updateComentari(treballadorId: string, comentari: string) {
    setTreballadors((prev) =>
      prev.map((t) => (t.treballadorId === treballadorId ? { ...t, comentari } : t))
    )
  }

  function afegirTreballador(treballadorId: string) {
    if (!treballadorId || treballadorsIds.has(treballadorId)) return
    setTreballadors((prev) => [
      ...prev,
      { treballadorId, hores: 9, comentari: '', planificat: false },
    ])
  }

  function eliminarTreballador(treballadorId: string) {
    setTreballadors((prev) => prev.filter((t) => t.treballadorId !== treballadorId))
  }

  return (
    <div className="space-y-3">
      {/* Llista de treballadors */}
      {treballadors.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
          No hi ha treballadors. Afegeix-ne amb el desplegable de baix.
        </p>
      )}

      {treballadors.map((entry) => {
        const treballador = treballadorsDisponibles.find((t) => t.id === entry.treballadorId)
        if (!treballador) return null

        const horesNoPrevistes = entry.hores !== 9

        return (
          <div
            key={entry.treballadorId}
            className="rounded-lg border border-gray-200 bg-white p-3"
          >
            <div className="flex items-start gap-3">
              {/* Info treballador */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">{treballador.nom}</span>
                  <span className="text-xs text-gray-500">{TIPUS_LABELS[treballador.tipus]}</span>
                  {entry.planificat && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                      Planificat
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {/* Hores */}
                  <div className="flex items-center gap-1.5">
                    <label
                      htmlFor={`hores-${entry.treballadorId}`}
                      className="text-xs text-gray-500"
                    >
                      Hores
                    </label>
                    <input
                      id={`hores-${entry.treballadorId}`}
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={entry.hores}
                      onChange={(e) =>
                        updateHores(entry.treballadorId, parseFloat(e.target.value) || 0)
                      }
                      className={`w-20 rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        horesNoPrevistes
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-300'
                      }`}
                    />
                    {horesNoPrevistes && (
                      <span
                        className="text-xs text-yellow-600"
                        title="Diferent de la jornada estàndard de 9h"
                      >
                        hores no estàndard
                      </span>
                    )}
                  </div>

                  {/* Comentari */}
                  <div className="flex flex-1 items-center gap-1.5">
                    <label
                      htmlFor={`comentari-${entry.treballadorId}`}
                      className="text-xs text-gray-500 whitespace-nowrap"
                    >
                      Feina feta
                    </label>
                    <input
                      id={`comentari-${entry.treballadorId}`}
                      type="text"
                      value={entry.comentari}
                      onChange={(e) => updateComentari(entry.treballadorId, e.target.value)}
                      placeholder="ex: Encofrat planta baixa"
                      className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Botó eliminar */}
              <button
                type="button"
                onClick={() => eliminarTreballador(entry.treballadorId)}
                aria-label={`Eliminar ${treballador.nom}`}
                className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                ×
              </button>
            </div>
          </div>
        )
      })}

      {/* Afegir treballador */}
      {disponiblesPerAfegir.length > 0 && (
        <div className="flex items-center gap-2">
          <label htmlFor="afegir-treballador" className="sr-only">
            Afegir treballador
          </label>
          <select
            id="afegir-treballador"
            aria-label="Afegir treballador"
            value=""
            onChange={(e) => {
              afegirTreballador(e.target.value)
              e.target.value = ''
            }}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">+ Afegir treballador...</option>
            {disponiblesPerAfegir.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nom} ({TIPUS_LABELS[t.tipus]})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
