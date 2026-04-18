'use client'

import { Fragment, useState } from 'react'
import type { CertificacioTreballador } from '@/lib/calculations'
import { TIPUS_LABELS } from '@/lib/treballadors'

interface Props {
  dades: CertificacioTreballador[]
}

export default function CertificacioTaula({ dades }: Props) {
  const [expandits, setExpandits] = useState<Set<string>>(new Set())

  function toggleExpand(treballadorId: string) {
    setExpandits((prev) => {
      const nou = new Set(prev)
      if (nou.has(treballadorId)) {
        nou.delete(treballadorId)
      } else {
        nou.add(treballadorId)
      }
      return nou
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300 print:border-gray-600">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Treballador
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Tipus
            </th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">
              Dies treballats
            </th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">
              Hores totals
            </th>
            <th className="w-8 print:hidden" aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {dades.map(({ treballador, totalHores, diesTreballats, actes }) => {
            const isExpandit = expandits.has(treballador.id)
            return (
              <Fragment key={treballador.id}>
                <tr
                  onClick={() => toggleExpand(treballador.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleExpand(treballador.id)
                    }
                  }}
                  tabIndex={0}
                  role="row"
                  aria-expanded={isExpandit}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors print:cursor-auto print:hover:bg-transparent focus:outline-none focus:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {treballador.nom}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {TIPUS_LABELS[treballador.tipus]}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {diesTreballats}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {totalHores}h
                  </td>
                  <td className="py-3 px-2 text-right text-gray-400 print:hidden">
                    <span
                      className="inline-block transition-transform duration-150"
                      style={{
                        transform: isExpandit
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                      }}
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </td>
                </tr>

                {isExpandit && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 pb-4 bg-gray-50 print:bg-white print:px-0"
                    >
                      <table className="w-full text-xs border-collapse mt-2">
                        <thead>
                          <tr className="border-b border-gray-300 text-gray-500">
                            <th className="text-left py-2 px-3 font-medium">
                              Data
                            </th>
                            <th className="text-right py-2 px-3 font-medium">
                              Hores
                            </th>
                            <th className="text-left py-2 px-3 font-medium">
                              Comentari
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {actes.map((acte, idx) => (
                            <tr
                              key={`${treballador.id}-acte-${idx}`}
                              className="border-b border-gray-100 last:border-0"
                            >
                              <td className="py-2 px-3 text-gray-700">
                                {acte.data}
                              </td>
                              <td className="py-2 px-3 text-right text-gray-700">
                                {acte.hores}h
                              </td>
                              <td className="py-2 px-3 text-gray-500">
                                {acte.comentari ?? '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
