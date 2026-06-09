'use client'

import { useActionState } from 'react'
import { useTransition } from 'react'
import type { EmpresaMembre, RolEmpresa } from '@/lib/types/database'
import { inviteMembre, removeMembre } from '@/app/(dashboard)/ajustos/actions'

interface Props {
  membres: EmpresaMembre[]
  rolActual: RolEmpresa
}

const ROL_LABELS: Record<RolEmpresa, string> = {
  admin: 'Admin',
  membre: 'Membre',
}

export default function MembresGestio({ membres, rolActual }: Props) {
  const [state, formAction, isPending] = useActionState(inviteMembre, { error: null, success: null })
  const [removePending, startRemove] = useTransition()

  const isAdmin = rolActual === 'admin'

  return (
    <div className="space-y-5">
      {/* Llista de membres */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Membres actuals ({membres.length})
        </h3>
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
          {membres.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {m.email ?? m.user_id}
                </p>
                <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  m.rol === 'admin'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {ROL_LABELS[m.rol]}
                </span>
              </div>
              {isAdmin && membres.length > 1 && (
                <button
                  disabled={removePending}
                  onClick={() => startRemove(async () => { await removeMembre(m.id) })}
                  className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Formulari d'invitació (només admins) */}
      {isAdmin && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Convidar nou membre
          </h3>

          {state.error && (
            <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {state.success}
            </p>
          )}

          <form action={formAction} className="flex gap-2">
            <input
              name="email"
              type="email"
              required
              placeholder="correu@empresa.com"
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? 'Enviant...' : 'Convidar'}
            </button>
          </form>
          <p className="mt-1.5 text-xs text-gray-400">
            L&apos;usuari rebrà un email per crear la seva contrasenya.
          </p>
        </div>
      )}
    </div>
  )
}
