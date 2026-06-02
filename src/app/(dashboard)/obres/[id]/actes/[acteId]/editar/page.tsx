import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ActaEditForm from '@/components/actes/ActaEditForm'
import type { ActeTreballadorAmbNom } from '@/lib/types/database'

interface Props {
  params: Promise<{ id: string; acteId: string }>
}

export default async function ActaEditarPage({ params }: Props) {
  const { id: obraId, acteId } = await params
  const supabase = await createClient()

  const [{ data: acta, error }, { data: obra }, { data: treballadorsActius }] =
    await Promise.all([
      supabase
        .from('actes')
        .select(`*, acte_treballadors(*, treballador:treballadors(id, nom, tipus))`)
        .eq('id', acteId)
        .eq('obra_id', obraId)
        .is('deleted_at', null)
        .single(),
      supabase.from('obres').select('nom').eq('id', obraId).single(),
      supabase.from('treballadors').select('id, nom').eq('actiu', true).order('nom'),
    ])

  if (error || !acta) notFound()

  const dataFormated = new Date(acta.data + 'T12:00:00').toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const treballadors = (acta.acte_treballadors ?? []) as unknown as ActeTreballadorAmbNom[]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <nav className="mb-1 flex items-center gap-1 text-sm text-gray-500">
          <Link href="/obres" className="hover:text-gray-900">Obres</Link>
          <span>/</span>
          <Link href={`/obres/${obraId}`} className="hover:text-gray-900">{obra?.nom ?? 'Obra'}</Link>
          <span>/</span>
          <Link href={`/obres/${obraId}/actes/${acteId}`} className="hover:text-gray-900">{dataFormated}</Link>
          <span>/</span>
          <span className="text-gray-900">Editar</span>
        </nav>
        <h1 className="text-xl font-semibold text-gray-900">Editar acta — {dataFormated}</h1>
      </div>

      <ActaEditForm
        acteId={acteId}
        obraId={obraId}
        comentariInicial={acta.comentari_general}
        treballadors={treballadors}
        treballadorsDisponibles={treballadorsActius ?? []}
      />

      <div>
        <Link
          href={`/obres/${obraId}/actes/${acteId}`}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Tornar a l&apos;acta
        </Link>
      </div>
    </div>
  )
}
