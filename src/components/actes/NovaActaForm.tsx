'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import type { Treballador } from '@/lib/types/database'
import { guardarActa, type TreballadorActaInput } from '@/app/(dashboard)/obres/[id]/actions'
import ActaTreballadorsEditor, { type TreballadorEditorEntry } from '@/components/actes/ActaTreballadorsEditor'
import ActaFotosUpload from '@/components/actes/ActaFotosUpload'

interface Props {
  obraId: string
  obraNom: string
  treballadorsDisponibles: Treballador[]
  initialTreballadors: TreballadorEditorEntry[]
  dataDefault: string
}

export default function NovaActaForm({
  obraId,
  obraNom,
  treballadorsDisponibles,
  initialTreballadors,
  dataDefault,
}: Props) {
  const [data, setData] = useState(dataDefault)
  const [comentariGeneral, setComentariGeneral] = useState('')
  const [treballadors, setTreballadors] = useState<TreballadorEditorEntry[]>(initialTreballadors)
  const [hasChanges, setHasChanges] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedActeId, setSavedActeId] = useState<string | null>(null)
  const router = useRouter()

  const handleTreballadorsChange = useCallback((nousTreballadors: TreballadorEditorEntry[]) => {
    setTreballadors(nousTreballadors)
    setHasChanges(true)
  }, [])

  function handleGuardar() {
    setError(null)
    startTransition(async () => {
      try {
        const result = await guardarActa({
          obraId,
          acteId: null,
          data,
          comentariGeneral,
          treballadors: treballadors.map((t): TreballadorActaInput => ({
            treballadorId: t.treballadorId,
            hores: t.hores,
            comentari: t.comentari,
            planificat: t.planificat,
          })),
        })
        setSavedActeId(result.acteId)
      } catch (err) {
        if (!isRedirectError(err)) {
          setError(err instanceof Error ? err.message : 'Error desconegut')
        }
      }
    })
  }

  // Fase 2: upload de fotos
  if (savedActeId) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Capçalera */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Nova acta — Afegir fotos</h1>
            <p className="mt-0.5 text-sm text-gray-500">{obraNom}</p>
          </div>
        </div>

        {/* Upload de fotos */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-900">Fotos del dia (opcional)</h2>
          <ActaFotosUpload
            obraId={obraId}
            acteId={savedActeId}
            fotosInicials={[]}
          />
        </div>

        {/* Botó finalitzar */}
        <div className="sticky bottom-4 flex justify-end">
          <button
            type="button"
            onClick={() => router.push(`/obres/${obraId}/actes/${savedActeId}`)}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-700"
          >
            Finalitzar acta →
          </button>
        </div>
      </div>
    )
  }

  // Fase 1: formulari de creació
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Capçalera */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Tornar
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Nova acta</h1>
          <p className="mt-0.5 text-sm text-gray-500">{obraNom}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Data */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="data-acta" className="text-sm font-medium text-gray-700">
            Data <span className="text-red-500">*</span>
          </label>
          <input
            id="data-acta"
            type="date"
            value={data}
            onChange={(e) => {
              setData(e.target.value)
              setHasChanges(true)
            }}
            className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Treballadors */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Treballadors</h2>
        <ActaTreballadorsEditor
          treballadorsDisponibles={treballadorsDisponibles}
          initialTreballadors={initialTreballadors}
          onChange={handleTreballadorsChange}
        />
      </div>

      {/* Comentari general */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="comentari-general" className="text-sm font-medium text-gray-700">
            Comentari general del dia
          </label>
          <textarea
            id="comentari-general"
            rows={3}
            value={comentariGeneral}
            onChange={(e) => {
              setComentariGeneral(e.target.value)
              setHasChanges(true)
            }}
            placeholder="Observacions generals sobre el dia de treball..."
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Botó guardar */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          type="button"
          onClick={handleGuardar}
          disabled={isPending || !hasChanges || treballadors.length === 0}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Guardant...' : 'Guardar acta'}
        </button>
      </div>
    </div>
  )
}
