'use client'

import type { Treballador } from '@/lib/types/database'
import { TIPUS_LABELS } from '@/lib/treballadors'

interface EntradaCertificacio {
  hores: number
  comentari: string | null
  acta: {
    data: string
    obra: { id: string; nom: string }
  } | null
}

interface CertificacioTaulaProps {
  treballador: Treballador
  entrades: EntradaCertificacio[]
  dataInici: string
  dataFi: string
}

function formatData(data: string): string {
  const [year, month, day] = data.split('-')
  return `${day}/${month}/${year}`
}

export function CertificacioTaula({
  treballador,
  entrades,
  dataInici,
  dataFi,
}: CertificacioTaulaProps) {
  const totalHores = entrades.reduce((acc, e) => acc + Number(e.hores), 0)

  return (
    <div className="space-y-6">
      {/* Controls — no s'imprimeixen */}
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Certificació</h1>
        <button
          onClick={() => window.print()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Imprimir
        </button>
      </div>

      {/* Contingut imprimible */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 print:border-none print:p-0">
        {/* Capçalera */}
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-900">{treballador.nom}</h2>
          <p className="text-sm text-gray-600">{TIPUS_LABELS[treballador.tipus]}</p>
          <p className="mt-2 text-sm text-gray-500">
            Període:{' '}
            <span className="font-medium">
              {formatData(dataInici)} — {formatData(dataFi)}
            </span>
          </p>
        </div>

        {/* Taula */}
        {entrades.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No hi ha registres en aquest rang de dates.
          </p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="py-2 pr-4 text-left font-semibold text-gray-900">Data</th>
                <th className="py-2 pr-4 text-left font-semibold text-gray-900">Obra</th>
                <th className="py-2 pr-4 text-right font-semibold text-gray-900">Hores</th>
                <th className="py-2 text-left font-semibold text-gray-900">Comentari</th>
              </tr>
            </thead>
            <tbody>
              {entrades.map((entrada, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-700">
                    {entrada.acta ? formatData(entrada.acta.data) : '—'}
                  </td>
                  <td className="py-2 pr-4 text-gray-700">
                    {entrada.acta?.obra.nom ?? '—'}
                  </td>
                  <td className="py-2 pr-4 text-right text-gray-800">{entrada.hores}</td>
                  <td className="py-2 text-gray-500">{entrada.comentari ?? '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-900">
                <td colSpan={2} className="py-2 pr-4 font-semibold text-gray-900">
                  Total
                </td>
                <td className="py-2 pr-4 text-right font-bold text-gray-900">
                  {totalHores}h
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
