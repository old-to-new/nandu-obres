import type { MatterportEstat } from '@/lib/types/database'
import MatterportEmbed from './MatterportEmbed'

interface Props {
  obraId: string
  modelId: string | null
  estat: MatterportEstat | null
}

export default function MatterportSection({ modelId, estat }: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Plànol 3D</h2>
        <EstatBadge estat={estat} />
      </div>

      {/* Cas 1: model actiu → mostrar l'embed */}
      {estat === 'actiu' && modelId ? (
        <MatterportEmbed modelId={modelId} />
      ) : estat === 'en_estudi' ? (
        /* Cas 2: estudi en curs */
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-blue-200 bg-blue-50 py-10 text-center">
          <span className="mb-2 text-2xl">🔭</span>
          <p className="font-medium text-blue-800">Estudi en curs</p>
          <p className="mt-1 text-sm text-blue-600">
            S&apos;està preparant el plànol 3D. T&apos;avisarem quan estigui llest.
          </p>
        </div>
      ) : estat === 'pendent' ? (
        /* Cas 3: sol·licitud pendent d'aprovació de pressupost */
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-amber-200 bg-amber-50 py-10 text-center">
          <span className="mb-2 text-2xl">⏳</span>
          <p className="font-medium text-amber-800">Sol·licitud pendent</p>
          <p className="mt-1 text-sm text-amber-600">
            Esperant aprovació del pressupost per iniciar l&apos;estudi.
          </p>
        </div>
      ) : (
        /* Cas 4: no sol·licitat → CTA */
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
          <span className="mb-2 text-3xl">🏗️</span>
          <p className="font-medium text-gray-700">Plànol 3D no disponible</p>
          <p className="mt-1 max-w-xs text-sm text-gray-500">
            Obtén un plànol interactiu de l&apos;obra amb tecnologia Matterport.
            Consulta disponibilitat i pressupost.
          </p>
          <a
            href="mailto:info@marcijou.cat?subject=Sol·licitud plànol 3D"
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Sol·licitar plànol 3D
          </a>
        </div>
      )}
    </section>
  )
}

function EstatBadge({ estat }: { estat: MatterportEstat | null }) {
  if (!estat) return null

  const config: Record<MatterportEstat, { label: string; className: string }> = {
    pendent:    { label: 'Pendent',    className: 'bg-amber-50 text-amber-700' },
    en_estudi:  { label: 'En estudi',  className: 'bg-blue-50 text-blue-700' },
    actiu:      { label: 'Actiu',      className: 'bg-green-50 text-green-700' },
  }

  const { label, className } = config[estat]

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
