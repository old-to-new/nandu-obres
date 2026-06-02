import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ActaDetailView from '@/components/actes/ActaDetailView'
import ActaFotosUpload from '@/components/actes/ActaFotosUpload'
import EliminarActaButton from '@/components/actes/EliminarActaButton'

interface Props {
  params: Promise<{ id: string; acteId: string }>
}

export default async function ActaDetailPage({ params }: Props) {
  const { id: obraId, acteId } = await params
  const supabase = await createClient()

  // Carregar acta amb treballadors, imatges i nom de l'obra
  const [{ data: acta, error }, { data: obra }] = await Promise.all([
    supabase
      .from('actes')
      .select(`
        *,
        acte_treballadors(
          *,
          treballador:treballadors(id, nom, tipus)
        ),
        acte_imatges(*)
      `)
      .eq('id', acteId)
      .eq('obra_id', obraId)
      .is('deleted_at', null)
      .single(),
    supabase.from('obres').select('nom').eq('id', obraId).single(),
  ])

  if (error || !acta) notFound()

  const treballadors = acta.acte_treballadors ?? []
  const imatges = acta.acte_imatges ?? []

  const dataFormated = new Date(acta.data + 'T12:00:00').toLocaleDateString('ca-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Botons d'acció */}
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/obres/${obraId}/actes/${acteId}/editar`}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Editar acta
        </Link>
        <EliminarActaButton
          acteId={acteId}
          obraId={obraId}
          data={dataFormated}
        />
      </div>

      <ActaDetailView
        acta={{
          id: acta.id,
          obra_id: acta.obra_id,
          data: acta.data,
          comentari_general: acta.comentari_general,
          deleted_at: acta.deleted_at ?? null,
          created_at: acta.created_at,
        }}
        treballadors={treballadors}
        imatges={imatges}
        obraId={obraId}
        obraNom={obra?.nom ?? 'Obra'}
      />

      {/* Secció upload de fotos (client component) */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Afegir fotos</h2>
        <ActaFotosUpload
          obraId={obraId}
          acteId={acteId}
          fotosInicials={imatges}
        />
      </section>
    </div>
  )
}
