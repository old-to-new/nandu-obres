import { createClient } from '@/lib/supabase/server'
import type { Categoria } from '@/lib/types/database'

/** Retorna totes les categories agrupades per tipus */
export async function fetchAllCategories(): Promise<{
  linies: Categoria[]
  estats: Categoria[]
  tipusTreballador: Categoria[]
}> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('ordre')
  const all: Categoria[] = data ?? []
  return {
    linies: all.filter((c) => c.tipus === 'linia_obra'),
    estats: all.filter((c) => c.tipus === 'estat_obra'),
    tipusTreballador: all.filter((c) => c.tipus === 'tipus_treballador'),
  }
}

/** Construeix un Record<valor, etiqueta> per a mostrar labels */
export function toLabelsMap(categories: Categoria[]): Record<string, string> {
  return Object.fromEntries(categories.map((c) => [c.valor, c.etiqueta]))
}
