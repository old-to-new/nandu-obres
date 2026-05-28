'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { uploadFoto, eliminarFoto } from '@/app/(dashboard)/obres/[id]/actions'
import type { ActeImatge } from '@/lib/types/database'

const MAX_DIM = 1920
const WEBP_QUALITY = 0.82

function compressImatge(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width >= height) {
          height = Math.round((height * MAX_DIM) / width)
          width = MAX_DIM
        } else {
          width = Math.round((width * MAX_DIM) / height)
          height = MAX_DIM
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return }
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          const baseName = file.name.replace(/\.[^.]+$/, '')
          resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp' }))
        },
        'image/webp',
        WEBP_QUALITY
      )
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Error carregant imatge')) }
    img.src = objectUrl
  })
}

interface Props {
  obraId: string
  acteId: string
  fotosInicials: ActeImatge[]
}

export default function ActaFotosUpload({ obraId, acteId, fotosInicials }: Props) {
  const [fotos, setFotos] = useState<ActeImatge[]>(fotosInicials)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setError(null)
    const input = e.target
    startTransition(async () => {
      for (const file of files) {
        let compressed: File
        try {
          compressed = await compressImatge(file)
        } catch {
          compressed = file
        }
        const formData = new FormData()
        formData.set('file', compressed)
        try {
          await uploadFoto(obraId, acteId, formData)
          // Afegir thumbnail local optimista (URL.createObjectURL)
          const localUrl = URL.createObjectURL(compressed)
          setFotos((prev) => [
            ...prev,
            {
              id: `local-${Date.now()}-${file.name}`,
              acte_id: acteId,
              url: localUrl,
              caption: null,
              created_at: new Date().toISOString(),
            },
          ])
        } catch (err) {
          setError(
            `Error pujant "${file.name}": ${err instanceof Error ? err.message : 'Error desconegut'}`
          )
          break
        }
      }
      // Reset input per permetre tornar a seleccionar els mateixos fitxers
      input.value = ''
    })
  }

  function handleEliminar(foto: ActeImatge) {
    // Optimisme: treure de la llista local immediatament
    setFotos((prev) => prev.filter((f) => f.id !== foto.id))

    startTransition(async () => {
      try {
        await eliminarFoto(obraId, acteId, foto.id)
      } catch (err) {
        // Revertir si falla
        setFotos((prev) => [...prev, foto])
        setError(`Error eliminant foto: ${err instanceof Error ? err.message : 'Error desconegut'}`)
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          Fotos ({fotos.length})
        </p>
        <label
          htmlFor="upload-fotos"
          className={`cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 ${
            isPending ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {isPending ? 'Pujant...' : '+ Afegir fotos'}
          <input
            id="upload-fotos"
            type="file"
            accept="image/*"
            multiple
            disabled={isPending}
            onChange={handleFilesChange}
            aria-label="Afegir fotos"
            className="sr-only"
          />
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-2 text-xs text-red-600">{error}</p>
      )}

      {fotos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {fotos.map((foto) => (
            <div key={foto.id} className="group relative aspect-square">
              <Image
                src={foto.url}
                alt={foto.caption ?? "Foto d'obra"}
                fill
                className="rounded-lg object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <button
                type="button"
                onClick={() => handleEliminar(foto)}
                aria-label="Eliminar foto"
                className="absolute right-1 top-1 hidden items-center justify-center rounded-full bg-red-500 p-1 text-xs text-white group-hover:flex"
              >
                ×
              </button>
              {foto.caption && (
                <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/50 px-1.5 py-0.5">
                  <p className="truncate text-xs text-white">{foto.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {fotos.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-400">No hi ha fotos. Afegeix-ne amb el botó de dalt.</p>
        </div>
      )}
    </div>
  )
}
