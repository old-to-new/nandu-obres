import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ObraDetailHeader from '@/components/obres/ObraDetailHeader'
import DocumentUpload from '@/components/obres/DocumentUpload'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ObraDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: obra, error } = await supabase
    .from('obres')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !obra) notFound()

  return (
    <div className="space-y-6">
      <ObraDetailHeader obra={obra} />

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

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Actes diàries</h2>
          <span className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-400">
            Fase 3 — Pròximament
          </span>
        </div>

        <div className="mt-3 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm text-gray-400">
            Les actes diàries d&apos;aquesta obra es mostraran aquí.
          </p>
        </div>
      </section>
    </div>
  )
}
