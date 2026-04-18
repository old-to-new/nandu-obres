import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ObraDetailHeader from '@/components/obres/ObraDetailHeader'
import DocumentUpload from '@/components/obres/DocumentUpload'
import ActaHistorial from '@/components/actes/ActaHistorial'

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

  // Carregar actes amb resum (num treballadors + hores totals)
  const { data: actesRaw } = await supabase
    .from('actes')
    .select(`
      *,
      acte_treballadors(hores)
    `)
    .eq('obra_id', id)
    .order('data', { ascending: false })

  const actes = (actesRaw ?? []).map((acta) => ({
    id: acta.id,
    obra_id: acta.obra_id,
    data: acta.data,
    comentari_general: acta.comentari_general,
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

      {/* Secció Actes */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Actes diàries ({actes.length})
          </h2>
          <Link
            href={`/obres/${id}/actes/nova`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Nova acta
          </Link>
        </div>

        <ActaHistorial actes={actes} obraId={id} />
      </section>
    </div>
  )
}
