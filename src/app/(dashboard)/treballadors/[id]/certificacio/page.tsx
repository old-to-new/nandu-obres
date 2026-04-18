import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CertificacioTaula } from '@/components/treballadors/CertificacioTaula'

interface CertificacioPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ inici?: string; fi?: string }>
}

function getDefaultRang(): { inici: string; fi: string } {
  const ara = new Date()
  const fi = ara.toISOString().split('T')[0]
  const inicialDate = new Date(ara)
  inicialDate.setDate(ara.getDate() - 30)
  const inici = inicialDate.toISOString().split('T')[0]
  return { inici, fi }
}

export default async function CertificacioPage({
  params,
  searchParams,
}: CertificacioPageProps) {
  const { id } = await params
  const sp = await searchParams
  const defaults = getDefaultRang()
  const dataInici = sp.inici ?? defaults.inici
  const dataFi = sp.fi ?? defaults.fi

  const supabase = await createClient()

  const [treballadorRes, historialRes] = await Promise.all([
    supabase.from('treballadors').select('*').eq('id', id).single(),
    supabase
      .from('acte_treballadors')
      .select(`hores, comentari, planificat, acta:actes!inner(data, obra:obres(id, nom))`)
      .eq('treballador_id', id)
      .gte('actes.data', dataInici)
      .lte('actes.data', dataFi)
      .order('data', { referencedTable: 'actes', ascending: true }),
  ])

  if (treballadorRes.error || !treballadorRes.data) notFound()

  const entrades = (historialRes.data ?? []) as unknown as Array<{
    hores: number
    comentari: string | null
    acta: { data: string; obra: { id: string; nom: string } } | null
  }>

  return (
    <CertificacioTaula
      treballador={treballadorRes.data}
      entrades={entrades}
      dataInici={dataInici}
      dataFi={dataFi}
    />
  )
}
