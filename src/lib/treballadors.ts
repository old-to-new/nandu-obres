import type { TipusTreballador, EncarregatTreballador } from '@/lib/types/database'

export const TIPUS_LABELS: Record<TipusTreballador, string> = {
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
  nandu: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  pare: 'bg-orange-50 text-orange-700 ring-orange-600/20',
}
