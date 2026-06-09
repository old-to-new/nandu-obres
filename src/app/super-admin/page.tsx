import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { isSuperAdmin, removeMemberFromEmpresa } from './actions'
import type { Empresa, EmpresaMembre } from '@/lib/types/database'
import NovaEmpresaForm from './NovaEmpresaForm'
import InviteToEmpresaForm from './InviteToEmpresaForm'

interface EmpresaAmbMembres extends Empresa {
  membres: EmpresaMembre[]
}

const ROL_BADGE: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  membre: 'bg-gray-100 text-gray-600',
}

export default async function SuperAdminPage() {
  // Protecció: només super-admins
  const ok = await isSuperAdmin()
  if (!ok) redirect('/')

  // Carreguem totes les empreses + membres via service client (bypass RLS)
  const service = createServiceClient()

  const { data: empresesRaw } = await service
    .from('empreses')
    .select('*')
    .order('created_at')

  const { data: membresRaw } = await service
    .from('empresa_membres')
    .select('*')
    .order('created_at')

  const empreses = (empresesRaw ?? []) as Empresa[]
  const membres = (membresRaw ?? []) as EmpresaMembre[]

  const empresesAmbMembres: EmpresaAmbMembres[] = empreses.map((emp) => ({
    ...emp,
    membres: membres.filter((m) => m.empresa_id === emp.id),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-10">

        {/* Capçalera */}
        <div className="flex items-center gap-3">
          <span className="inline-block h-8 w-1.5 bg-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
            <p className="text-sm text-gray-500">Gestió d&apos;empreses i accesos</p>
          </div>
        </div>

        {/* Llista d'empreses */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Empreses ({empresesAmbMembres.length})
          </h2>

          {empresesAmbMembres.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Cap empresa creada encara.</p>
          ) : (
            <div className="space-y-4">
              {empresesAmbMembres.map((emp) => (
                <div key={emp.id} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{emp.nom}</p>
                      {emp.subtitol && (
                        <p className="text-xs text-gray-500">{emp.subtitol}</p>
                      )}
                      <p className="mt-0.5 font-mono text-xs text-gray-400">{emp.id}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      {emp.membres.length} membre{emp.membres.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Membres */}
                  {emp.membres.length > 0 && (
                    <div className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-100">
                      {emp.membres.map((m) => (
                        <div key={m.id} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span className="text-gray-700">{m.email ?? m.user_id}</span>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROL_BADGE[m.rol] ?? 'bg-gray-100 text-gray-600'}`}>
                              {m.rol}
                            </span>
                            <form action={async () => { 'use server'; await removeMemberFromEmpresa(m.id) }}>
                              <button
                                type="submit"
                                className="text-xs text-red-400 hover:text-red-600"
                              >
                                Eliminar
                              </button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulari d'invitació addicional */}
                  <InviteToEmpresaForm empresaId={emp.id} empresaNom={emp.nom} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Crear nova empresa */}
        <section className="rounded-xl border border-indigo-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Nova empresa</h2>
          <NovaEmpresaForm />
        </section>

      </div>
    </div>
  )
}
