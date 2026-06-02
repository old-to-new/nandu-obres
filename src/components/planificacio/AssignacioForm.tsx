'use client'

import { useActionState } from 'react'
import type { Obra, Treballador, Vehicle } from '@/lib/types/database'

interface AssignacioFormProps {
  action: (prevState: { error: string | null }, formData: FormData) => Promise<{ error: string | null }>
  data: string
  obres: Obra[]
  treballadors: Treballador[]
  vehicles: Vehicle[]
  treballadorsJaAssignats: string[]
}

export function AssignacioForm({
  action,
  data,
  obres,
  treballadors,
  vehicles,
  treballadorsJaAssignats,
}: AssignacioFormProps) {
  const [state, formAction, isPending] = useActionState(action, { error: null })

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-700">Afegir assignació</h3>

      <input type="hidden" name="data" value={data} />

      {state.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Error: {state.error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="obra_id" className="block text-xs font-medium text-gray-600">
            Obra
          </label>
          <select
            id="obra_id"
            name="obra_id"
            required
            defaultValue=""
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="" disabled>— Selecciona obra —</option>
            {obres.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="treballador_id" className="block text-xs font-medium text-gray-600">
            Treballador
          </label>
          <select
            id="treballador_id"
            name="treballador_id"
            required
            defaultValue=""
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="" disabled>— Selecciona treballador —</option>
            {treballadors.map((t) => {
              const jaAssignat = treballadorsJaAssignats.includes(t.id)
              return (
                <option key={t.id} value={t.id}>
                  {t.nom}{jaAssignat ? ' (ja assignat)' : ''}
                </option>
              )
            })}
          </select>
          {treballadorsJaAssignats.length > 0 && (
            <p className="mt-1 text-xs text-amber-600">
              Els treballadors marcats ja tenen assignació aquest dia.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="vehicle_id" className="block text-xs font-medium text-gray-600">
            Vehicle <span className="font-normal text-gray-400">(opcional)</span>
          </label>
          <select
            id="vehicle_id"
            name="vehicle_id"
            defaultValue=""
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="">Sense vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nom} ({v.matricula})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tasca" className="block text-xs font-medium text-gray-600">
            Tasca <span className="font-normal text-gray-400">(opcional)</span>
          </label>
          <input
            id="tasca"
            name="tasca"
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Paleta, formigó, excavació..."
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            id="crear_acta_auto"
            name="crear_acta_auto"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-xs font-medium text-gray-600">
            Generar acta automàtica al final del dia
          </span>
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? 'Afegint...' : 'Afegir'}
        </button>
      </div>
    </form>
  )
}
