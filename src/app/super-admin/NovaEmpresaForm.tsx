'use client'

import { useActionState } from 'react'
import { createEmpresa } from './actions'

export default function NovaEmpresaForm() {
  const [state, formAction, isPending] = useActionState(createEmpresa, { error: null, success: null })

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.success}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-600">
            Nom de l&apos;empresa <span className="text-red-500">*</span>
          </label>
          <input
            name="nom"
            required
            placeholder="Ex: Pol Vinyoles Construccions"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600">
            Subtítol <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            name="subtitol"
            placeholder="Ex: Construccions"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600">
            URL del logo <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            name="logo_url"
            type="url"
            placeholder="https://..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600">
            Email del primer admin <span className="text-red-500">*</span>
          </label>
          <input
            name="email_admin"
            type="email"
            required
            placeholder="pol@exemple.com"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Rebrà un email de Supabase per crear la contrasenya.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Creant...' : 'Crear empresa i convidar admin'}
        </button>
      </div>
    </form>
  )
}
