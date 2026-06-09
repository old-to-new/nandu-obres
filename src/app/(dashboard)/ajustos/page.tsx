import { fetchAllCategories } from '@/lib/categories'
import { getEmpresaActual } from '@/lib/empresa'
import { createClient } from '@/lib/supabase/server'
import CategoriesEditor from '@/components/ajustos/CategoriesEditor'
import EmpresaEditor from '@/components/ajustos/EmpresaEditor'
import MembresGestio from '@/components/ajustos/MembresGestio'
import type { EmpresaMembre } from '@/lib/types/database'

export default async function AjustosPage() {
  const [categoriesData, empresaCtx] = await Promise.all([
    fetchAllCategories(),
    getEmpresaActual(),
  ])

  const { linies, estats, tipusTreballador } = categoriesData

  // Carregar membres de l'empresa
  const supabase = await createClient()
  const { data: membresRaw } = await supabase
    .from('empresa_membres')
    .select('*')
    .order('created_at')

  const membres = (membresRaw ?? []) as EmpresaMembre[]

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="brand-display text-2xl">Ajustos</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Configuració de l&apos;empresa i categories
        </p>
      </div>

      {/* Empresa */}
      {empresaCtx && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Empresa</h2>
          <EmpresaEditor empresa={empresaCtx.empresa} />
        </div>
      )}

      {/* Membres */}
      {empresaCtx && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Membres</h2>
          <MembresGestio membres={membres} rolActual={empresaCtx.rol} />
        </div>
      )}

      {/* Categories */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-8">
        <CategoriesEditor
          tipus="linia_obra"
          titol="Línies d'obra"
          categoriesInicials={linies}
        />

        <hr className="border-gray-100" />

        <CategoriesEditor
          tipus="estat_obra"
          titol="Estats d'obra"
          categoriesInicials={estats}
        />

        <hr className="border-gray-100" />

        <CategoriesEditor
          tipus="tipus_treballador"
          titol="Tipus de treballador"
          categoriesInicials={tipusTreballador}
        />
      </div>
    </div>
  )
}
