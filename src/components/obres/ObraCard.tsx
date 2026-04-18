import Link from 'next/link'
import type { Obra } from '@/lib/types/database'

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

export default function ObraCard({ obra }: Props) {
  return (
    <Link
      href={`/obres/${obra.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">{obra.nom}</h3>
          <p className="mt-0.5 truncate text-sm text-gray-500">{obra.client_nom}</p>
        </div>
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${ESTAT_STYLES[obra.estat]}`}
        >
          {ESTAT_LABELS[obra.estat]}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
          {LINIA_LABELS[obra.linia]}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(obra.created_at).toLocaleDateString('ca-ES')}
        </span>
      </div>
    </Link>
  )
}
