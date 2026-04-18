import Link from 'next/link'
import type { Acta } from '@/lib/types/database'

interface ActaAmbResum extends Acta {
  num_treballadors: number
  total_hores: number
}

interface Props {
  actes: ActaAmbResum[]
  obraId: string
}

export default function ActaHistorial({ actes, obraId }: Props) {
  if (actes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-400">No hi ha actes registrades per a aquesta obra.</p>
        <Link
          href={`/obres/${obraId}/actes/nova`}
          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
        >
          Crea la primera acta
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
      {actes.map((acta) => {
        const dataFormated = new Date(acta.data + 'T12:00:00').toLocaleDateString('ca-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })

        return (
          <Link
            key={acta.id}
            href={`/obres/${obraId}/actes/${acta.id}`}
            className="flex items-center justify-between gap-3 px-4 py-3 first:rounded-t-xl last:rounded-b-xl hover:bg-gray-50"
          >
            <div>
              <p className="font-medium capitalize text-gray-900">{dataFormated}</p>
              {acta.comentari_general && (
                <p className="mt-0.5 max-w-xs truncate text-sm text-gray-500">
                  {acta.comentari_general}
                </p>
              )}
            </div>

            <div className="flex flex-shrink-0 items-center gap-3 text-sm text-gray-500">
              <span>{acta.num_treballadors} treballadors</span>
              <span>{acta.total_hores}h</span>
              <span className="text-gray-300">›</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
