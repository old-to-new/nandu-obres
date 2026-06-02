import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ObraDetailHeader from '@/components/obres/ObraDetailHeader'
import DocumentUpload from '@/components/obres/DocumentUpload'
import ActaHistorial from '@/components/actes/ActaHistorial'
import ObraFotosPreview from '@/components/obres/ObraFotosPreview'
import EliminarObraButton from '@/components/obres/EliminarObraButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ObraDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Carregar obra
  const { data: obra, error } = await supabase
    .from('obres')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !obra) notFound()

  // Carregar altres obres (per al traspàs en cas d'eliminar)
  const { data: altresObresRaw } = await supabase
    .from('obres')
    .select('id, nom')
    .neq('id', id)
    .order('nom')

  const altresObres = (altresObresRaw ?? []) as { id: string; nom: string }[]

  // Carregar les 4 últimes fotos de l'obra per al preview
  const { data: fotosPreviewRaw } = await supabase
    .from('acte_imatges')
    .select(`
      id,
      acte_id,
      url,
      caption,
      created_at,
      acte:actes!inner(data, obra_id)
    `)
    .eq('acte.obra_id', obra.id)
    .order('created_at', { ascending: false })
    .limit(4)

  const fotosPreview = (fotosPreviewRaw ?? []).map((img) => ({
    id: img.id,
    acte_id: img.acte_id,
    url: img.url,
    caption: img.caption,
    created_at: img.created_at,
    acte: {
      data: (img.acte as unknown as { data: string; obra_id: string }).data,
    },
  }))

  // Carregar actes amb resum (num treballadors + hores totals)
  const { data: actesRaw } = await supabase
    .from('actes')
    .select(`
      *,
      acte_treballadors(hores)
    `)
    .eq('obra_id', id)
    .is('deleted_at', null)
    .order('data', { ascending: false })

  const actes = (actesRaw ?? []).map((acta) => ({
    id: acta.id,
    obra_id: acta.obra_id,
    data: acta.data,
    comentari_general: acta.comentari_general,
    deleted_at: null as string | null,
    created_at: acta.created_at,
    num_treballadors: acta.acte_treballadors?.length ?? 0,
    total_hores: (acta.acte_treballadors ?? []).reduce(
      (sum: number, t: { hores: number }) => sum + Number(t.hores),
      0
    ),
  }))

  return (
    <div className="space-y-6">
      <ObraDetailHeader obra={obra} />

      {/* Secció Documents */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Documents</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <DocumentUpload
            obraId={obra.id}
            tipus="pressupost"
            label="Pressupost (PDF)"
            urlActual={obra.pressupost_pdf_url}
          />
          <DocumentUpload
            obraId={obra.id}
            tipus="projecte"
            label="Projecte / Plànols"
            urlActual={obra.projecte_pdf_url}
          />
        </div>
      </section>

      {/* Secció Últimes fotos */}
      <ObraFotosPreview obraId={obra.id} fotos={fotosPreview} />

      {/* Secció Actes */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Actes diàries ({actes.length})
          </h2>
          <Link
            href={`/obres/${id}/actes/nova`}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            + Nova acta
          </Link>
        </div>

        <ActaHistorial actes={actes} obraId={id} />
      </section>

      {/* Zona de perill */}
      <section className="rounded-xl border border-red-100 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-red-700">Zona de perill</h2>
        <EliminarObraButton
          obraId={id}
          obraName={obra.nom}
          teActes={actes.length > 0}
          altresObres={altresObres}
        />
      </section>
    </div>
  )
}
