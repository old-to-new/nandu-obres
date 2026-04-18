import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Treballador, Planificacio } from '@/lib/types/database'
import NovaActaForm from '@/components/actes/NovaActaForm'
import type { TreballadorEditorEntry } from '@/components/actes/ActaTreballadorsEditor'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ data?: string }>
}

export default async function NovaActaPage({ params, searchParams }: PageProps) {
  const { id: obraId } = await params
  const { data: dataParam } = await searchParams

  const supabase = await createClient()

  // Carregar obra
  const { data: obra, error: obraError } = await supabase
    .from('obres')
    .select('id, nom')
    .eq('id', obraId)
    .single()

  if (obraError || !obra) notFound()

  // Carregar tots els treballadors actius
  const { data: treballadors } = await supabase
    .from('treballadors')
    .select('*')
    .eq('actiu', true)
    .order('nom')

  // Data per defecte: avui o la passada per paràmetre
  const dataDefault = dataParam ?? new Date().toISOString().split('T')[0]

  // Pre-càrrega: treballadors planificats per a aquest dia i obra
  const { data: planificacio } = await supabase
    .from('planificacio')
    .select('treballador_id')
    .eq('obra_id', obraId)
    .eq('data', dataDefault)

  const treballadorsIds = new Set(
    (planificacio ?? []).map((p: Pick<Planificacio, 'treballador_id'>) => p.treballador_id)
  )

  const initialTreballadors: TreballadorEditorEntry[] = (treballadors ?? [])
    .filter((t: Treballador) => treballadorsIds.has(t.id))
    .map((t: Treballador): TreballadorEditorEntry => ({
      treballadorId: t.id,
      hores: 9,
      comentari: '',
      planificat: true,
    }))

  return (
    <NovaActaForm
      obraId={obraId}
      obraNom={obra.nom}
      treballadorsDisponibles={treballadors ?? []}
      initialTreballadors={initialTreballadors}
      dataDefault={dataDefault}
    />
  )
}
