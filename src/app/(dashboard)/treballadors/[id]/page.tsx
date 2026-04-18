import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TreballadorHistorial } from '@/components/treballadors/TreballadorHistorial'
import { RangDatesSelector } from '@/components/treballadors/RangDatesSelector'
import { toggleActiu } from '../actions'
import { TIPUS_LABELS } from '@/lib/treballadors'
import type { TipusTreballador } from '@/lib/types/database'

interface TreballadorPageProps {
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

export default async function TreballadorPage({
  params,
  searchParams,
}: TreballadorPageProps) {
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
      .order('data', { referencedTable: 'actes', ascending: false }),
  ])

  if (treballadorRes.error || !treballadorRes.data) notFound()

  const treballador = treballadorRes.data
  const entrades = (historialRes.data ?? []) as unknown as Array<{
    hores: number
    comentari: string | null
    planificat: boolean
    acta: { data: string; obra: { id: string; nom: string } } | null
  }>

  const toggleAction = toggleActiu.bind(null, id, !treballador.actiu)

  return (
    <div className="space-y-6">
      {/* Capçalera */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{treballador.nom}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {TIPUS_LABELS[treballador.tipus as TipusTreballador]}
            {!treballador.actiu && (
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                Inactiu
              </span>
            )}
          </p>
          {treballador.telefon && (
            <p className="mt-1 text-sm text-gray-600">{treballador.telefon}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/treballadors/${id}/certificacio?inici=${dataInici}&fi=${dataFi}`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Certificació
          </Link>
          <Link
            href={`/treballadors/${id}/editar`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Editar
          </Link>
          <form action={toggleAction}>
            <button
              type="submit"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {treballador.actiu ? 'Desactivar' : 'Activar'}
            </button>
          </form>
        </div>
      </div>

      {/* Selector rang dates */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">Filtra per rang de dates</p>
        <RangDatesSelector
          dataInici={dataInici}
          dataFi={dataFi}
          basePath={`/treballadors/${id}`}
        />
      </div>

      {/* Historial */}
      <TreballadorHistorial entrades={entrades} />
    </div>
  )
}
