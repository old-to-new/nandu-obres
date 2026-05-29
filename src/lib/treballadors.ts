import type { EncarregatTreballador } from '@/lib/types/database'

/** Fallback per a valors coneguts. Nous valors dinàmics mostren el valor directament. */
export const TIPUS_LABELS: Record<string, string> = {
  oficial: 'Oficial 1a',
  oficial_2a: 'Oficial 2a',
  peo: 'Peó',
  altre: 'Altre',
}

export const ENCARREGAT_LABELS: Record<EncarregatTreballador, string> = {
  nandu: 'Equip Nandu',
  pare: 'Equip Pare',
}

export const ENCARREGAT_COLORS: Record<EncarregatTreballador, string> = {
  nandu: 'bg-stone-100 text-stone-700 ring-stone-600/20',
  pare: 'bg-amber-50 text-amber-700 ring-amber-600/20',
}
