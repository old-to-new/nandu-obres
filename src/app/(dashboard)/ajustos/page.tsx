import { fetchAllCategories } from '@/lib/categories'
import CategoriesEditor from '@/components/ajustos/CategoriesEditor'

export default async function AjustosPage() {
  const { linies, estats, tipusTreballador } = await fetchAllCategories()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="brand-display text-2xl">Ajustos</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Gestió de categories i valors dels desplegables
        </p>
      </div>

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
