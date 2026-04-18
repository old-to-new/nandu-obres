import Link from 'next/link'

interface EntradaHistorial {
  hores: number
  comentari: string | null
  planificat: boolean
  acta: {
    data: string
    obra: { id: string; nom: string }
  } | null
}

interface TreballadorHistorialProps {
  entrades: EntradaHistorial[]
}

function formatData(data: string): string {
  const [year, month, day] = data.split('-')
  return `${day}/${month}/${year}`
}

export function TreballadorHistorial({ entrades }: TreballadorHistorialProps) {
  if (entrades.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No hi ha registres en aquest rang de dates.
      </p>
    )
  }

  const totalHores = entrades.reduce((acc, e) => acc + Number(e.hores), 0)

  // Agrupar per obra
  const horesPerObra = entrades.reduce<Record<string, { nom: string; hores: number }>>(
    (acc, e) => {
      if (!e.acta) return acc
      const { id, nom } = e.acta.obra
      if (!acc[id]) acc[id] = { nom, hores: 0 }
      acc[id].hores += Number(e.hores)
      return acc
    },
    {}
  )

  return (
    <div className="space-y-6">
      {/* Resum */}
      <div className="rounded-lg border border-red-100 bg-red-50 p-4">
        <p className="text-sm text-red-700">Total hores en el rang</p>
        <p className="mt-1 text-3xl font-bold text-blue-900">{totalHores}h</p>
      </div>

      {/* Resum per obra */}
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Hores per obra
        </h3>
        <div className="space-y-1">
          {Object.entries(horesPerObra).map(([obraId, { nom, hores }]) => (
            <div key={obraId} className="flex justify-between rounded-md bg-gray-50 px-3 py-2">
              <Link href={`/obres/${obraId}`} className="text-sm text-red-600 hover:underline">
                {nom}
              </Link>
              <span className="text-sm font-semibold text-gray-800">{hores}h</span>
            </div>
          ))}
        </div>
      </div>

      {/* Taula d'actes */}
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Detall d&apos;actes
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Data</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Obra</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Hores</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Comentari</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {entrades.map((entrada, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {entrada.acta ? formatData(entrada.acta.data) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {entrada.acta ? (
                      <Link
                        href={`/obres/${entrada.acta.obra.id}`}
                        className="text-red-600 hover:underline"
                      >
                        {entrada.acta.obra.nom}
                      </Link>
                    ) : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-800">
                    {entrada.hores}h
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {entrada.comentari ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
