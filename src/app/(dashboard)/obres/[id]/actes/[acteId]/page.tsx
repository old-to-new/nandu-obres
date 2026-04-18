import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ActaDetailView from '@/components/actes/ActaDetailView'
import ActaFotosUpload from '@/components/actes/ActaFotosUpload'

interface Props {
  params: Promise<{ id: string; acteId: string }>
}

export default async function ActaDetailPage({ params }: Props) {
  const { id: obraId, acteId } = await params
  const supabase = await createClient()

  // Carregar acta amb treballadors i imatges en una sola query
  const { data: acta, error } = await supabase
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
    .single()

  if (error || !acta) notFound()

  const treballadors = acta.acte_treballadors ?? []
  const imatges = acta.acte_imatges ?? []

  return (
    <div className="space-y-6">
      <ActaDetailView
        acta={{
          id: acta.id,
          obra_id: acta.obra_id,
          data: acta.data,
          comentari_general: acta.comentari_general,
          created_at: acta.created_at,
        }}
        treballadors={treballadors}
        imatges={imatges}
        obraId={obraId}
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
