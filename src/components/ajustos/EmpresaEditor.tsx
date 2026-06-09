'use client'

import { useActionState } from 'react'
import type { Empresa } from '@/lib/types/database'
import { updateEmpresa } from '@/app/(dashboard)/ajustos/actions'

interface Props {
  empresa: Empresa
}

export default function EmpresaEditor({ empresa }: Props) {
  const [state, formAction, isPending] = useActionState(updateEmpresa, { error: null })

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-600">
            Nom de l&apos;empresa <span className="text-red-500">*</span>
          </label>
          <input
            name="nom"
            defaultValue={empresa.nom}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600">
            Subtítol <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            name="subtitol"
            defaultValue={empresa.subtitol ?? ''}
            placeholder="Ex: Construccions"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600">
            URL del logo <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            name="logo_url"
            type="url"
            defaultValue={empresa.logo_url ?? ''}
            placeholder="https://..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Ha de ser una URL pública accessible. El logo apareixerà a la barra lateral i capçalera mòbil.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? 'Desant...' : 'Desar canvis'}
        </button>
      </div>
    </form>
  )
}
