import Link from 'next/link'
import type { Vehicle } from '@/lib/types/database'

interface VehicleCardProps {
  vehicle: Vehicle
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-gray-900">{vehicle.nom}</p>
        <p className="mt-0.5 text-sm text-gray-500">{vehicle.matricula}</p>
      </div>
      <div className="ml-4 flex items-center gap-3">
        {!vehicle.actiu && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Inactiu
          </span>
        )}
        <Link
          href={`/vehicles/${vehicle.id}/editar`}
          className="text-sm text-blue-600 hover:underline"
        >
          Editar
        </Link>
      </div>
    </div>
  )
}
