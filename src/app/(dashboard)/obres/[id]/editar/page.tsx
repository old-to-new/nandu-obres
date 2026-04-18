import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ObraForm from '@/components/obres/ObraForm'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarObraPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: obra, error } = await supabase
    .from('obres')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !obra) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/obres/${id}`} className="text-sm text-gray-500 hover:text-gray-900">
          ← Tornar
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Editar obra</h1>
          <p className="mt-0.5 text-sm text-gray-500">{obra.nom}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ObraForm obra={obra} />
      </div>
    </div>
  )
}
