'use client'

import { useRef, useState, useTransition } from 'react'
import { setDocumentUrl } from '@/app/(dashboard)/obres/actions'
import { createBrowserClient } from '@/lib/supabase/client'

interface Props {
  obraId: string
  tipus: 'pressupost' | 'projecte'
  label: string
  urlActual: string | null
}

const BUCKET = 'obres-documents'

export default function DocumentUpload({ obraId, tipus, label, urlActual }: Props) {
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localUrl, setLocalUrl] = useState(urlActual)
  const inputRef = useRef<HTMLInputElement>(null)

  const busy = isPending || uploading

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      const supabase = createBrowserClient()
      const extension = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
      const path = `${obraId}/${tipus}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type || undefined })

      if (uploadError) throw new Error(uploadError.message)

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path)

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

      startTransition(async () => {
        try {
          await setDocumentUrl(obraId, tipus, urlWithCacheBust)
          setLocalUrl(urlWithCacheBust)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error en desar la URL')
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en pujar el fitxer')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
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
            busy ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {busy ? 'Pujant...' : localUrl ? 'Substituir' : 'Seleccionar fitxer'}
          <input
            id={`upload-${tipus}`}
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleFileChange}
            disabled={busy}
            aria-label="Seleccionar fitxer"
            className="sr-only"
          />
        </label>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
