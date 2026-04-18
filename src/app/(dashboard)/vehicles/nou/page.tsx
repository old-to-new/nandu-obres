import { createVehicle } from '../actions'
import { VehicleForm } from '@/components/vehicles/VehicleForm'

export default function NouVehiclePage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nou vehicle</h1>
      <VehicleForm action={createVehicle} />
    </div>
  )
}
