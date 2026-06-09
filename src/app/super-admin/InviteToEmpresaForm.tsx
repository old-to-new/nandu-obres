'use client'

import { useActionState } from 'react'
import { inviteToEmpresa } from './actions'

interface Props {
  empresaId: string
  empresaNom: string
}

export default function InviteToEmpresaForm({ empresaId, empresaNom }: Props) {
  const [state, formAction, isPending] = useActionState(inviteToEmpresa, { error: null, success: null })

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="empresa_id" value={empresaId} />

      {state.error && (
        <p className="w-full text-xs text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="w-full text-xs text-green-600">{state.success}</p>
      )}

      <div>
        <label className="block text-xs text-gray-500">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="correu@exemple.com"
          className="mt-0.5 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500">Rol</label>
        <select
          name="rol"
          className="mt-0.5 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="membre">Membre</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-200 disabled:opacity-50"
      >
        {isPending ? 'Enviant...' : `+ Convidar a ${empresaNom}`}
      </button>
    </form>
  )
}
