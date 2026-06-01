import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { toggleVehicleActiu } from '../actions'

interface VehicleFitxaPageProps {
  params: Promise<{ id: string }>
}

function formatData(data: string): string {
  const [year, month, day] = data.split('-')
  return `${day}/${month}/${year}`
}

export default async function VehicleFitxaPage({ params }: VehicleFitxaPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [vehicleRes, historialRes] = await Promise.all([
    supabase.from('vehicles').select('*').eq('id', id).single(),
    supabase
      .from('planificacio')
      .select('id, data, tasca, obra:obres(id, nom), treballador:treballadors(id, nom)')
      .eq('vehicle_id', id)
      .order('data', { ascending: false })
      .limit(100),
  ])

  if (vehicleRes.error || !vehicleRes.data) notFound()

  const vehicle = vehicleRes.data
  const historial = (historialRes.data ?? []) as unknown as Array<{
    id: string
    data: string
    tasca: string | null
    obra: { id: string; nom: string }
    treballador: { id: string; nom: string }
  }>

  // Agrupar historial per data
  const perData = historial.reduce<
    Record<string, { obra: { id: string; nom: string }; treballadors: string[]; tasques: string[] }>
  >((acc, entry) => {
    const key = `${entry.data}__${entry.obra.id}`
    if (!acc[key]) acc[key] = { obra: entry.obra, treballadors: [], tasques: [] }
    if (!acc[key].treballadors.includes(entry.treballador.nom)) {
      acc[key].treballadors.push(entry.treballador.nom)
    }
    if (entry.tasca && !acc[key].tasques.includes(entry.tasca)) {
      acc[key].tasques.push(entry.tasca)
    }
    return acc
  }, {})

  const entrades = Object.entries(perData).sort(([a], [b]) => b.localeCompare(a))

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Capçalera */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{vehicle.nom}</h1>
            {!vehicle.actiu && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                Inactiu
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">{vehicle.matricula}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <form action={toggleVehicleActiu.bind(null, vehicle.id, !vehicle.actiu)}>
            <button
              type="submit"
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              {vehicle.actiu ? 'Desactivar' : 'Activar'}
            </button>
          </form>
          <Link
            href={`/vehicles/${vehicle.id}/editar`}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Editar
          </Link>
        </div>
      </div>

      {/* Historial */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-700">Historial d&apos;ús</h2>

        {entrades.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
            <p className="text-sm text-gray-500">
              Aquest vehicle encara no ha estat assignat a cap planificació.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entrades.map(([key, { obra, treballadors, tasques }]) => {
              const data = key.split('__')[0]
              return (
                <div
                  key={key}
                  className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3"
                >
                  <span className="mt-0.5 w-24 shrink-0 text-xs font-medium text-gray-400">
                    {formatData(data)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/obres/${obra.id}`}
                      className="text-sm font-semibold text-gray-900 hover:text-red-600 hover:underline"
                    >
                      {obra.nom}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      {treballadors.map((nom) => (
                        <span
                          key={nom}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {nom}
                        </span>
                      ))}
                      {tasques.map((t) => (
                        <span
                          key={t}
                          className="text-xs text-gray-400"
                        >
                          · {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="pt-2">
        <Link href="/vehicles" className="text-sm text-gray-500 hover:text-gray-900">
          ← Tornar a vehicles
        </Link>
      </div>
    </div>
  )
}
