import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ActaGaleria from '@/components/actes/ActaGaleria'

interface Props {
  params: Promise<{ id: string }>
}

export default async function GaleriaPage({ params }: Props) {
  const { id: obraId } = await params
  const supabase = await createClient()

  // Carregar nom de l'obra
  const { data: obra, error: obraError } = await supabase
    .from('obres')
    .select('id, nom')
    .eq('id', obraId)
    .single()

  if (obraError || !obra) notFound()

  // Carregar totes les imatges de totes les actes d'aquesta obra
  // amb la data de l'acta per agrupar
  const { data: actesAmbImatges } = await supabase
    .from('actes')
    .select(`
      id,
      data,
      acte_imatges(id, acte_id, url, caption, created_at)
    `)
    .eq('obra_id', obraId)
    .order('data', { ascending: false })

  // Aplanar les imatges i afegir la data de l'acta
  const imatges = (actesAmbImatges ?? []).flatMap(
    (acta: {
      id: string
      data: string
      acte_imatges: Array<{
        id: string
        acte_id: string
        url: string
        caption: string | null
        created_at: string
      }>
    }) =>
      (acta.acte_imatges ?? []).map((img) => ({
        ...img,
        acta_data: acta.data,
        acte_id: acta.id,
      }))
  )

  return (
    <div>
      <div className="mb-6">
        <nav className="mb-2 flex items-center gap-1 text-sm text-gray-500">
          <Link href="/obres" className="hover:text-gray-900">Obres</Link>
          <span>/</span>
          <Link href={`/obres/${obraId}`} className="hover:text-gray-900">{obra.nom}</Link>
          <span>/</span>
          <span className="text-gray-900">Galeria</span>
        </nav>
        <h1 className="text-xl font-semibold text-gray-900">Galeria de fotos</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {imatges.length} {imatges.length === 1 ? 'foto' : 'fotos'} — {obra.nom}
        </p>
      </div>

      <ActaGaleria imatges={imatges} obraId={obraId} />
    </div>
  )
}
