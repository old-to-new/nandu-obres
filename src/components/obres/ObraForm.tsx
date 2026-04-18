'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { createObra, updateObra } from '@/app/(dashboard)/obres/actions'
import type { Obra, LiniaObra, EstatObra } from '@/lib/types/database'

interface Props {
  obra?: Obra
  onCancel?: () => void
}

const LINIES: { value: LiniaObra; label: string }[] = [
  { value: 'obra_nova', label: 'Obra nova' },
  { value: 'rehabilitacio', label: 'Rehabilitació' },
  { value: 'ascensors', label: 'Ascensors' },
  { value: 'altres', label: 'Altres' },
]

const ESTATS: { value: EstatObra; label: string }[] = [
  { value: 'activa', label: 'Activa' },
  { value: 'pausada', label: 'Pausada' },
  { value: 'finalitzada', label: 'Finalitzada' },
]

export default function ObraForm({ obra, onCancel }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const isEditing = !!obra

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateObra(obra.id, formData)
          router.push(`/obres/${obra.id}`)
        } else {
          await createObra(formData)
        }
      } catch (err) {
        if (!isRedirectError(err)) {
          setError(err instanceof Error ? err.message : 'Error desconegut')
        }
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="nom" className="text-sm font-medium text-gray-700">
            Nom de l&apos;obra <span className="text-red-500">*</span>
          </label>
          <input
            id="nom"
            name="nom"
            type="text"
            required
            defaultValue={obra?.nom ?? ''}
            placeholder="ex: Casa Puigdomenech"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="client_nom" className="text-sm font-medium text-gray-700">
            Client <span className="text-red-500">*</span>
          </label>
          <input
            id="client_nom"
            name="client_nom"
            type="text"
            required
            defaultValue={obra?.client_nom ?? ''}
            placeholder="ex: Família Puigdomenech"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="linia" className="text-sm font-medium text-gray-700">
            Línia <span className="text-red-500">*</span>
          </label>
          <select
            id="linia"
            name="linia"
            required
            defaultValue={obra?.linia ?? 'obra_nova'}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            {LINIES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="estat" className="text-sm font-medium text-gray-700">
            Estat <span className="text-red-500">*</span>
          </label>
          <select
            id="estat"
            name="estat"
            required
            defaultValue={obra?.estat ?? 'activa'}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            {ESTATS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={obra?.notes ?? ''}
            placeholder="Informació addicional sobre l'obra..."
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel·lar
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? 'Guardant...' : isEditing ? 'Guardar canvis' : 'Crear obra'}
        </button>
      </div>
    </form>
  )
}
