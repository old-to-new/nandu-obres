'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteObra, transferAndDeleteObra } from '@/app/(dashboard)/obres/actions'

interface AltresObra {
  id: string
  nom: string
}

interface Props {
  obraId: string
  obraName: string
  teActes: boolean
  altresObres: AltresObra[]
}

export default function EliminarObraButton({ obraId, obraName, teActes, altresObres }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [obert, setObert] = useState(false)
  const [targetId, setTargetId] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleEliminar() {
    setError(null)
    startTransition(async () => {
      const res = teActes
        ? await transferAndDeleteObra(obraId, targetId)
        : await deleteObra(obraId)

      if (res.error) {
        setError(res.error)
      } else {
        router.push('/obres')
      }
    })
  }

  if (!obert) {
    return (
      <button
        onClick={() => setObert(true)}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Eliminar obra
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
      {teActes ? (
        <>
          <p className="text-sm font-medium text-red-800">
            L&apos;obra <strong>&ldquo;{obraName}&rdquo;</strong> té actes registrades.
            Cal triar a quina obra es traspassen abans d&apos;eliminar-la.
          </p>
          <p className="text-xs text-red-600">
            Les actes, treballadors, fotos i planificació es mouran a l&apos;obra seleccionada.
            Si hi ha dates en conflicte, les entrades es fusionaran.
          </p>
          <div>
            <label htmlFor="target-obra" className="block text-xs font-medium text-red-700 mb-1">
              Traspassar actes a:
            </label>
            <select
              id="target-obra"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="block w-full rounded-md border border-red-300 bg-white px-2 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">— Selecciona obra —</option>
              {altresObres.map((o) => (
                <option key={o.id} value={o.id}>{o.nom}</option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <p className="text-sm font-medium text-red-800">
          Segur que vols eliminar <strong>&ldquo;{obraName}&rdquo;</strong>?
          Aquesta acció no es pot desfer.
        </p>
      )}

      {error && (
        <p className="text-xs font-medium text-red-700">Error: {error}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleEliminar}
          disabled={isPending || (teActes && !targetId)}
          className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
        >
          {isPending ? 'Eliminant...' : teActes ? 'Traspassar i eliminar' : 'Sí, eliminar'}
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
