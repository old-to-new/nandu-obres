import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { toggleVehicleActiu } from './actions'

interface VehiclesPageProps {
  searchParams: Promise<{ inactius?: string }>
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const { inactius } = await searchParams
  const mostraInactius = inactius === '1'

  const supabase = await createClient()
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('nom')

  if (error) throw new Error(error.message)

  const vehiclesVisibles = mostraInactius
    ? (vehicles ?? [])
    : (vehicles ?? []).filter((v) => v.actiu)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="brand-display text-2xl">Vehicles</h1>
        <Link
          href="/vehicles/nou"
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Nou vehicle
        </Link>
      </div>

      <Link
        href={mostraInactius ? '/vehicles' : '/vehicles?inactius=1'}
        className="text-sm text-red-600 hover:underline"
      >
        {mostraInactius ? 'Amagar inactius' : 'Veure inactius'}
      </Link>

      <div className="space-y-3">
        {vehiclesVisibles.length === 0 ? (
          <p className="py-12 text-center text-gray-500">No hi ha vehicles.</p>
        ) : (
          vehiclesVisibles.map((vehicle) => (
            <div key={vehicle.id} className="flex items-center gap-3">
              <div className="flex-1">
                <VehicleCard vehicle={vehicle} />
              </div>
              <form
                action={toggleVehicleActiu.bind(null, vehicle.id, !vehicle.actiu)}
              >
                <button
                  type="submit"
                  className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                >
                  {vehicle.actiu ? 'Desactivar' : 'Activar'}
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
