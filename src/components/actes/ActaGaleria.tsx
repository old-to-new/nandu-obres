'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { ActeImatge } from '@/lib/types/database'

interface ImatgeAmbData extends ActeImatge {
  acta_data: string
  acte_id: string
}

interface Props {
  imatges: ImatgeAmbData[]
  obraId: string
}

/** Formats a UTC ISO string to a locale time string, e.g. "10:30" */
function formatHora(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('ca-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}

export default function ActaGaleria({ imatges, obraId }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  // Which group's slides are loaded into the lightbox
  const [lightboxSlides, setLightboxSlides] = useState<{ src: string }[]>([])

  if (imatges.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-400">No hi ha fotos per a aquesta obra.</p>
      </div>
    )
  }

  // Group by acta date — preserve descending order from query
  const imatgesPerData = imatges.reduce<Record<string, ImatgeAmbData[]>>(
    (acc, img) => {
      const data = img.acta_data
      if (!acc[data]) acc[data] = []
      acc[data].push(img)
      return acc
    },
    {}
  )

  // Sort groups descending and sort photos within each group by created_at desc
  const dates = Object.keys(imatgesPerData).sort((a, b) => b.localeCompare(a))

  for (const date of dates) {
    imatgesPerData[date].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  function openLightbox(groupDate: string, photoIndex: number) {
    const slides = imatgesPerData[groupDate].map((img) => ({ src: img.url }))
    setLightboxSlides(slides)
    setLightboxIndex(photoIndex)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className="space-y-8">
        {dates.map((data) => {
          const dataFormatedRaw = new Date(data + 'T12:00:00').toLocaleDateString(
            'ca-ES',
            {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }
          )
          const dataFormated = dataFormatedRaw.charAt(0).toUpperCase() + dataFormatedRaw.slice(1)
          const grup = imatgesPerData[data]
          const acteId = grup[0].acte_id

          return (
            <div key={data}>
              <div className="mb-3 flex items-center gap-2">
                <h3 className="font-medium capitalize text-gray-900">
                  {dataFormated}
                </h3>
                <Link
                  href={`/obres/${obraId}/actes/${acteId}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Veure acta →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {grup.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    aria-label={img.caption ?? "Foto d'obra"}
                    title={`Pujada el ${formatHora(img.created_at)}`}
                    onClick={() => openLightbox(data, idx)}
                    className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Image
                      src={img.url}
                      alt={img.caption ?? "Foto d'obra"}
                      fill
                      className="object-cover transition-opacity group-hover:opacity-90"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/50 px-1.5 py-0.5">
                        <p className="truncate text-xs text-white">
                          {img.caption}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Lightbox
        open={lightboxOpen}
        index={lightboxIndex}
        slides={lightboxSlides}
        close={() => setLightboxOpen(false)}
      />
    </>
  )
}
