'use client'

import { useTransition, useState } from 'react'
import {
  updateActaComentari,
  updateActeTreballador,
  addActeTreballador,
  removeActeTreballador,
} from '@/app/(dashboard)/obres/[id]/actes/actions'
import type { ActeTreballadorAmbNom, Treballador } from '@/lib/types/database'

interface Props {
  acteId: string
  obraId: string
  comentariInicial: string | null
  treballadors: ActeTreballadorAmbNom[]
  treballadorsDisponibles: Pick<Treballador, 'id' | 'nom'>[]
}

function RowTreballador({
  t,
  acteId,
  obraId,
}: {
  t: ActeTreballadorAmbNom
  acteId: string
  obraId: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function handleSave(formData: FormData) {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await updateActeTreballador(t.id, acteId, obraId, formData)
      if (res.error) setError(res.error)
      else setSaved(true)
    })
  }

  function handleRemove() {
    setError(null)
    startTransition(async () => {
      const res = await removeActeTreballador(t.id, acteId, obraId)
      if (res.error) setError(res.error)
    })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{t.treballador.nom}</span>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
        >
          Treure
        </button>
      </div>
      <form action={handleSave} className="flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Hores</label>
          <input
            name="hores"
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            defaultValue={Number(t.hores)}
            className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <div className="flex-1 min-w-32">
          <label className="block text-xs text-gray-500 mb-0.5">
            Comentari <span className="font-normal text-gray-400">(opcional)</span>
          </label>
          <input
            name="comentari"
            type="text"
            defaultValue={t.comentari ?? ''}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-40"
        >
          {isPending ? '...' : 'Desar'}
        </button>
        {saved && <span className="text-xs text-green-600">✓ Desat</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </form>
    </div>
  )
}

export default function ActaEditForm({
  acteId,
  obraId,
  comentariInicial,
  treballadors,
  treballadorsDisponibles,
}: Props) {
  const [isPendingComentari, startComentari] = useTransition()
  const [isPendingAfegir, startAfegir] = useTransition()
  const [comentariSaved, setComentariSaved] = useState(false)
  const [comentariError, setComentariError] = useState<string | null>(null)
  const [afegirError, setAfegirError] = useState<string | null>(null)

  function handleComentari(formData: FormData) {
    setComentariError(null)
    setComentariSaved(false)
    startComentari(async () => {
      const res = await updateActaComentari(acteId, obraId, formData)
      if (res.error) setComentariError(res.error)
      else setComentariSaved(true)
    })
  }

  function handleAfegir(formData: FormData) {
    setAfegirError(null)
    startAfegir(async () => {
      const res = await addActeTreballador(acteId, obraId, formData)
      if (res.error) setAfegirError(res.error)
    })
  }

  const idsActuals = new Set(treballadors.map((t) => t.treballador_id))
  const disponibles = treballadorsDisponibles.filter((t) => !idsActuals.has(t.id))

  return (
    <div className="space-y-6">
      {/* Comentari general */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-gray-900">Comentari general</h2>
        <form action={handleComentari} className="space-y-2">
          <textarea
            name="comentari_general"
            rows={3}
            defaultValue={comentariInicial ?? ''}
            placeholder="Notes sobre el dia de treball..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPendingComentari}
              className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
            >
              {isPendingComentari ? 'Desant...' : 'Desar comentari'}
            </button>
            {comentariSaved && <span className="text-sm text-green-600">✓ Desat</span>}
            {comentariError && <span className="text-sm text-red-600">{comentariError}</span>}
          </div>
        </form>
      </section>

      {/* Treballadors */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-gray-900">
          Treballadors ({treballadors.length})
        </h2>

        {treballadors.length === 0 ? (
          <p className="text-sm text-gray-400 mb-3">Cap treballador en aquesta acta.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {treballadors.map((t) => (
              <RowTreballador key={t.id} t={t} acteId={acteId} obraId={obraId} />
            ))}
          </div>
        )}

        {/* Afegir treballador */}
        {disponibles.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Afegir treballador
            </p>
            <form action={handleAfegir} className="flex flex-wrap items-end gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Treballador</label>
                <select
                  name="treballador_id"
                  required
                  defaultValue=""
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="" disabled>— Selecciona —</option>
                  {disponibles.map((t) => (
                    <option key={t.id} value={t.id}>{t.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Hores</label>
                <input
                  name="hores"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  defaultValue="9"
                  className="w-20 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={isPendingAfegir}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
              >
                {isPendingAfegir ? 'Afegint...' : '+ Afegir'}
              </button>
              {afegirError && <span className="text-xs text-red-600">{afegirError}</span>}
            </form>
          </div>
        )}
      </section>
    </div>
  )
}
