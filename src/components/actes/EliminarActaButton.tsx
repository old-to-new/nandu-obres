'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteActa } from '@/app/(dashboard)/obres/[id]/actes/actions'

interface Props {
  acteId: string
  obraId: string
  data: string
}

export default function EliminarActaButton({ acteId, obraId, data }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [obert, setObert] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleEliminar() {
    setError(null)
    startTransition(async () => {
      const res = await deleteActa(acteId, obraId)
      if (res.error) {
        setError(res.error)
      } else {
        router.push(`/obres/${obraId}`)
      }
    })
  }

  if (!obert) {
    return (
      <button
        onClick={() => setObert(true)}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Eliminar
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
      <p className="text-sm font-medium text-red-800">
        Segur que vols eliminar l&apos;acta del <strong>{data}</strong>?
      </p>
      <p className="text-xs text-red-600">
        L&apos;acta quedarà desactivada però es conserva a la base de dades per traçabilitat.
        Si s&apos;han generat certificacions basades en aquesta acta, es veuran afectades.
      </p>
      {error && <p className="text-xs font-medium text-red-700">Error: {error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleEliminar}
          disabled={isPending}
          className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
        >
          {isPending ? 'Eliminant...' : 'Sí, eliminar'}
        </button>
        <button
          onClick={() => { setObert(false); setError(null) }}
          disabled={isPending}
          className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel·lar
        </button>
      </div>
    </div>
  )
}
