import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TreballadorForm } from '@/components/treballadors/TreballadorForm'
import { updateTreballador } from '../../actions'

interface EditarTreballadorPageProps {
  params: Promise<{ id: string }>
}

export default async function EditarTreballadorPage({ params }: EditarTreballadorPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: treballador, error } = await supabase
    .from('treballadors')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !treballador) notFound()

  const action = updateTreballador.bind(null, id)

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar treballador</h1>
        <p className="mt-1 text-sm text-gray-500">{treballador.nom}</p>
      </div>
      <TreballadorForm action={action} treballador={treballador} />
    </div>
  )
}
