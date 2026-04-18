import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VehicleForm } from '@/components/vehicles/VehicleForm'
import { updateVehicle } from '../../actions'

interface EditarVehiclePageProps {
  params: Promise<{ id: string }>
}

export default async function EditarVehiclePage({ params }: EditarVehiclePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !vehicle) notFound()

  const action = updateVehicle.bind(null, id)

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Editar vehicle</h1>
      <VehicleForm action={action} vehicle={vehicle} />
    </div>
  )
}
