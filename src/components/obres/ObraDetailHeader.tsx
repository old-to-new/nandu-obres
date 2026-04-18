import type { Obra } from '@/lib/types/database'
import Link from 'next/link'

interface Props {
  obra: Obra
}

const LINIA_LABELS: Record<Obra['linia'], string> = {
  obra_nova: 'Obra nova',
  rehabilitacio: 'Rehabilitació',
  ascensors: 'Ascensors',
  altres: 'Altres',
}

const ESTAT_STYLES: Record<Obra['estat'], string> = {
  activa: 'bg-green-100 text-green-700',
  pausada: 'bg-yellow-100 text-yellow-700',
  finalitzada: 'bg-gray-100 text-gray-600',
}

const ESTAT_LABELS: Record<Obra['estat'], string> = {
  activa: 'Activa',
  pausada: 'Pausada',
  finalitzada: 'Finalitzada',
}

export default function ObraDetailHeader({ obra }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <nav className="mb-2 flex items-center gap-1 text-sm text-gray-500">
          <Link href="/obres" className="hover:text-gray-900">
            Obres
          </Link>
          <span>/</span>
          <span className="text-gray-900">{obra.nom}</span>
        </nav>

        <h1 className="text-xl font-semibold text-gray-900">{obra.nom}</h1>
        <p className="mt-0.5 text-sm text-gray-500">{obra.client_nom}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTAT_STYLES[obra.estat]}`}
          >
            {ESTAT_LABELS[obra.estat]}
          </span>
          <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
            {LINIA_LABELS[obra.linia]}
          </span>
        </div>

        {obra.notes && (
          <p className="mt-2 text-sm text-gray-600">{obra.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/obres/${obra.id}/galeria`}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Galeria
        </Link>
        <Link
          href={`/obres/${obra.id}/editar`}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Editar obra
        </Link>
      </div>
    </div>
  )
}
