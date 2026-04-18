import Image from 'next/image'
import Link from 'next/link'
import type { ActeImatge } from '@/lib/types/database'

interface ImatgeAmbData extends ActeImatge {
  acta_data: string
  acte_id: string
}

interface Props {
  imatges: ImatgeAmbData[]
  obraId: string
}

export default function ActaGaleria({ imatges, obraId }: Props) {
  if (imatges.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-400">No hi ha fotos per a aquesta obra.</p>
      </div>
    )
  }

  // Agrupar per data d'acta
  const imatgesPerData = imatges.reduce<Record<string, ImatgeAmbData[]>>((acc, img) => {
    const data = img.acta_data
    if (!acc[data]) acc[data] = []
    acc[data].push(img)
    return acc
  }, {})

  const dates = Object.keys(imatgesPerData).sort((a, b) => b.localeCompare(a)) // desc

  return (
    <div className="space-y-8">
      {dates.map((data) => {
        const dataFormated = new Date(data + 'T12:00:00').toLocaleDateString('ca-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
        const grup = imatgesPerData[data]
        const acteId = grup[0].acte_id

        return (
          <div key={data}>
            <div className="mb-3 flex items-center gap-2">
              <h3 className="font-medium capitalize text-gray-900">{dataFormated}</h3>
              <Link
                href={`/obres/${obraId}/actes/${acteId}`}
                className="text-xs text-blue-600 hover:underline"
              >
                Veure acta →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {grup.map((img) => (
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
          </div>
        )
      })}
    </div>
  )
}
