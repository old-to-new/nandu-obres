import Image from 'next/image'
import Link from 'next/link'
import type { ActeImatge } from '@/lib/types/database'

interface Props {
  obraId: string
  fotos: (ActeImatge & { acte: { data: string } })[]
}

export default function ObraFotosPreview({ obraId, fotos }: Props) {
  const galeriaHref = `/obres/${obraId}/galeria`

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">
          Últimes fotos
          {fotos.length > 0 && (
            <span className="ml-1.5 text-sm font-normal text-gray-500">
              ({fotos.length})
            </span>
          )}
        </h2>
        <Link
          href={galeriaHref}
          className="text-sm text-red-600 hover:underline"
        >
          Veure totes →
        </Link>
      </div>

      {/* Empty state */}
      {fotos.length === 0 ? (
        <p className="text-sm text-gray-400">
          Encara no hi ha fotos. Afegeix-les des de les actes.
        </p>
      ) : (
        /* 2×2 grid */
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {fotos.map((foto) => (
            <Link
              key={foto.id}
              href={galeriaHref}
              className="relative aspect-square block overflow-hidden rounded-lg"
            >
              <Image
                src={foto.url}
                alt={foto.caption ?? "Foto d'obra"}
                fill
                className="object-cover transition-opacity hover:opacity-90"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
