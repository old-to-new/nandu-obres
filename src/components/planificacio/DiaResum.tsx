'use client'

import Link from 'next/link'
import type { PlanificacioAmbDetalls } from '@/lib/types/database'

interface DiaResumProps {
  data: string
  assignacions: PlanificacioAmbDetalls[]
  deleteAction: (id: string, data: string) => Promise<void>
}

function formatData(data: string): string {
  const [year, month, day] = data.split('-')
  return `${day}/${month}/${year}`
}

export function DiaResum({ data, assignacions, deleteAction }: DiaResumProps) {
  if (assignacions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
        <p className="text-sm text-gray-500">No hi ha assignacions per aquest dia.</p>
      </div>
    )
  }

  // Agrupar per obra
  const perObra = assignacions.reduce<
    Record<string, { nom: string; assignacions: PlanificacioAmbDetalls[] }>
  >((acc, a) => {
    if (!acc[a.obra_id]) acc[a.obra_id] = { nom: a.obra.nom, assignacions: [] }
    acc[a.obra_id].assignacions.push(a)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{formatData(data)}</p>
        <span className="rounded-full bg-blue-50 px-3 py-0.5 text-sm font-medium text-blue-700">
          {assignacions.length} treballadors
        </span>
      </div>

      {Object.entries(perObra).map(([obraId, { nom, assignacions: assigns }]) => (
        <div key={obraId} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              <Link
                href={`/obres/${obraId}`}
                className="transition-colors duration-200"
                style={{
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
                {nom}
              </Link>
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {assigns.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {a.treballador.nom}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {a.vehicle ? a.vehicle.nom : 'Sense vehicle'}
                    </span>
                    {a.tasca && (
                      <>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-500">{a.tasca}</span>
                      </>
                    )}
                  </div>
                </div>
                <form action={deleteAction.bind(null, a.id, a.data)}>
                  <button
                    type="submit"
                    className="ml-3 rounded text-xs text-red-500 hover:text-red-700 focus:outline-none"
                    aria-label="Eliminar"
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
