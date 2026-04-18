import type { Acta, ActeTreballadorAmbNom, ActeImatge } from '@/lib/types/database'
import Image from 'next/image'
import Link from 'next/link'
import { TIPUS_LABELS } from '@/lib/treballadors'

interface Props {
  acta: Acta
  treballadors: ActeTreballadorAmbNom[]
  imatges: ActeImatge[]
  obraId: string
  obraNom: string
}

export default function ActaDetailView({ acta, treballadors, imatges, obraId, obraNom }: Props) {
  const dataFormatedRaw = new Date(acta.data + 'T12:00:00').toLocaleDateString('ca-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  // capitalize only the first letter — not every word (breaks Catalan: "D'Abril")
  const dataFormated = dataFormatedRaw.charAt(0).toUpperCase() + dataFormatedRaw.slice(1)

  const totalHores = treballadors.reduce((sum, t) => sum + Number(t.hores), 0)

  return (
    <div className="space-y-6">
      {/* Capçalera */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="mb-1 flex items-center gap-1 text-sm text-gray-500">
            <Link href="/obres" className="hover:text-gray-900">Obres</Link>
            <span>/</span>
            <Link href={`/obres/${obraId}`} className="hover:text-gray-900">{obraNom}</Link>
            <span>/</span>
            <span className="text-gray-900">{dataFormated}</span>
          </nav>
          <h1 className="text-xl font-semibold text-gray-900">{dataFormated}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {treballadors.length} treballadors · {totalHores}h total
          </p>
        </div>
      </div>

      {/* Treballadors */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Treballadors ({treballadors.length})</h2>

        {treballadors.length === 0 ? (
          <p className="text-sm text-gray-400">No hi ha treballadors registrats en aquesta acta.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {treballadors.map((t) => (
              <div key={t.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-900">{t.treballador.nom}</span>
                    <span className="text-xs text-gray-500">{TIPUS_LABELS[t.treballador.tipus]}</span>
                    {t.planificat && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                        Planificat
                      </span>
                    )}
                    {Number(t.hores) !== 9 && (
                      <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-xs text-yellow-600">
                        {t.hores}h
                      </span>
                    )}
                  </div>
                  {t.comentari && (
                    <p className="mt-0.5 text-sm text-gray-600">{t.comentari}</p>
                  )}
                </div>
                <span className="flex-shrink-0 font-medium text-gray-900">{t.hores}h</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Comentari general */}
      {acta.comentari_general && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-2 font-semibold text-gray-900">Comentari general</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{acta.comentari_general}</p>
        </section>
      )}

      {/* Fotos */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Fotos ({imatges.length})</h2>
        {imatges.length === 0 ? (
          <p className="text-sm text-gray-400">No hi ha fotos en aquesta acta.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {imatges.map((img) => (
              <a
                key={img.id}
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square"
              >
                <Image
                  src={img.url}
                  alt={img.caption ?? "Foto d'obra"}
                  fill
                  className="rounded-lg object-cover transition-opacity group-hover:opacity-90"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/50 px-1.5 py-0.5">
                    <p className="truncate text-xs text-white">{img.caption}</p>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
