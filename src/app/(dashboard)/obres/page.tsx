import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ObraCard from '@/components/obres/ObraCard'
import ObraFiltres from '@/components/obres/ObraFiltres'
import EmptyState from '@/components/ui/EmptyState'
import type { Obra, LiniaObra, EstatObra } from '@/lib/types/database'

interface Props {
  searchParams: Promise<{
    linia?: LiniaObra
    estat?: EstatObra
    cerca?: string
  }>
}

async function LlistatObres({ linia, estat, cerca }: { linia?: LiniaObra; estat?: EstatObra; cerca?: string }) {
  const supabase = await createClient()

  let query = supabase.from('obres').select('*').order('created_at', { ascending: false })

  if (linia) query = query.eq('linia', linia)
  if (estat) query = query.eq('estat', estat)
  if (cerca) query = query.or(`nom.ilike.%${cerca}%,client_nom.ilike.%${cerca}%`)

  const { data: obres, error } = await query

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
        Error en carregar les obres: {error.message}
      </div>
    )
  }

  if (!obres || obres.length === 0) {
    const hasFilters = Boolean(linia || estat || cerca)
    return hasFilters ? (
      <EmptyState
        title="No hi ha obres amb aquests filtres"
        description="Prova a eliminar els filtres o crear una obra nova."
        actionLabel="Eliminar filtres"
        actionHref="/obres"
      />
    ) : (
      <EmptyState
        title="No hi ha obres"
        description="Crea la primera obra per començar a registrar actes."
        actionLabel="Nova obra"
        actionHref="/obres/nova"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {obres.map((obra: Obra) => (
        <ObraCard key={obra.id} obra={obra} />
      ))}
    </div>
  )
}

export default async function ObresPage({ searchParams }: Props) {
  const { linia, estat, cerca } = await searchParams

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="brand-display text-2xl">Obres</h1>
          <p className="mt-0.5 text-sm text-gray-500">Gestió d&apos;obres i actes diàries</p>
        </div>
        <Link
          href="/obres/nova"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          + Nova obra
        </Link>
      </div>

      <div className="mt-4">
        <Suspense>
          <ObraFiltres />
        </Suspense>
      </div>

      <div className="mt-4">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
              ))}
            </div>
          }
        >
          <LlistatObres linia={linia} estat={estat} cerca={cerca} />
        </Suspense>
      </div>
    </div>
  )
}
