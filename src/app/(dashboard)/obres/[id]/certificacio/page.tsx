import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { agregarCertificacio } from '@/lib/calculations'
import CertificacioTaula from '@/components/certificacio/CertificacioTaula'
import { PrintButton } from '@/components/certificacio/PrintButton'
import { RangDatesSelector } from '@/components/treballadors/RangDatesSelector'
import type { ActeTreballadorAmbNom } from '@/lib/types/database'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ inici?: string; fi?: string }>
}

function primerDiaMesActual(): string {
  const ara = new Date()
  return `${ara.getFullYear()}-${String(ara.getMonth() + 1).padStart(2, '0')}-01`
}

function avui(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDataVisible(data: string): string {
  const [y, m, d] = data.split('-')
  return `${d}/${m}/${y}`
}

export default async function CertificacioObraPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params
  const sp = await searchParams
  const dataInici = sp.inici ?? primerDiaMesActual()
  const dataFi = sp.fi ?? avui()

  const supabase = await createClient()

  const { data: obra, error: obraError } = await supabase
    .from('obres')
    .select('id, nom, client_nom, linia, estat')
    .eq('id', id)
    .single()

  if (obraError || !obra) {
    notFound()
  }

  const { data: actesTreballadors, error: actesError } = await supabase
    .from('acte_treballadors')
    .select(
      `id, acte_id, treballador_id, hores, comentari, planificat, created_at,
       treballador:treballadors!inner(id, nom, tipus),
       acta:actes!inner(data, obra_id)`
    )
    .eq('actes.obra_id', id)
    .is('actes.deleted_at', null)
    .gte('actes.data', dataInici)
    .lte('actes.data', dataFi)
    .order('data', { referencedTable: 'actes', ascending: true })

  if (actesError) {
    console.error('Error carregant actes per certificació:', actesError)
  }

  const dadesAgregades = agregarCertificacio(
    (actesTreballadors ?? []) as unknown as ActeTreballadorAmbNom[]
  )

  const totalHoresGlobal = dadesAgregades.reduce(
    (sum, t) => sum + t.totalHores,
    0
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:space-y-4 print:max-w-full">
      {/* Breadcrumb i capçalera pantalla */}
      <div className="print:hidden">
        <nav className="mb-2 flex items-center gap-1 text-sm text-gray-500">
          <Link href="/obres" className="hover:text-gray-900">
            Obres
          </Link>
          <span>/</span>
          <Link href={`/obres/${id}`} className="hover:text-gray-900">
            {obra.nom}
          </Link>
          <span>/</span>
          <span className="text-gray-900">Certificació</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Certificació: {obra.nom}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">{obra.client_nom}</p>
          </div>
          <PrintButton />
        </div>
      </div>

      {/* Selector de dates — ocult en impressió */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 print:hidden">
        <RangDatesSelector
          dataInici={dataInici}
          dataFi={dataFi}
          basePath={`/obres/${id}/certificacio`}
        />
      </div>

      {/* Capçalera impressió */}
      <div className="hidden print:block">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{obra.nom}</h2>
            <p className="text-gray-700">{obra.client_nom}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>
              Període: {formatDataVisible(dataInici)} →{' '}
              {formatDataVisible(dataFi)}
            </p>
            <p>Data impressió: {formatDataVisible(avui())}</p>
          </div>
        </div>
        <hr className="mt-4 border-gray-400" />
      </div>

      {/* Taula de resultats */}
      {dadesAgregades.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-gray-500 print:border-0 print:py-4">
          <p className="text-lg">No hi ha hores registrades</p>
          <p className="mt-1 text-sm">
            en el període {formatDataVisible(dataInici)} —{' '}
            {formatDataVisible(dataFi)}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 bg-white print:rounded-none print:border-0">
            <CertificacioTaula dades={dadesAgregades} />
          </div>

          {/* Totals globals */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 print:border-gray-400 print:bg-white">
            <div className="flex flex-wrap gap-8 text-sm font-medium text-gray-700">
              <span>
                <span className="font-normal text-gray-500">Treballadors: </span>
                {dadesAgregades.length}
              </span>
              <span>
                <span className="font-normal text-gray-500">Total hores: </span>
                {totalHoresGlobal}h
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
