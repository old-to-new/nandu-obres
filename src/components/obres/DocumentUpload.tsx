'use client'

import { useRef, useTransition, useState } from 'react'
import { uploadDocument } from '@/app/(dashboard)/obres/actions'

interface Props {
  obraId: string
  tipus: 'pressupost' | 'projecte'
  label: string
  urlActual: string | null
}

export default function DocumentUpload({ obraId, tipus, label, urlActual }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [localUrl, setLocalUrl] = useState(urlActual)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    const formData = new FormData()
    formData.set('file', file)

    startTransition(async () => {
      try {
        await uploadDocument(obraId, tipus, formData)
        setLocalUrl(URL.createObjectURL(file))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error en pujar el fitxer')
      }
    })
  }

  const acceptTypes = 'application/pdf,image/*'

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>

      <div className="flex items-center gap-3">
        {localUrl ? (
          <a
            href={localUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            <span>📄</span>
            Obrir PDF
          </a>
        ) : (
          <span className="text-sm text-gray-400">No carregat</span>
        )}

        <label
          htmlFor={`upload-${tipus}`}
          className={`cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 ${
            isPending ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {isPending ? 'Pujant...' : localUrl ? 'Substituir' : 'Seleccionar fitxer'}
          <input
            id={`upload-${tipus}`}
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleFileChange}
            disabled={isPending}
            aria-label="Seleccionar fitxer"
            className="sr-only"
          />
        </label>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
