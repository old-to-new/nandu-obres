import type { ActeTreballadorAmbNom, Treballador } from './types/database'

export interface ActeResum {
  data: string
  hores: number
  comentari: string | null
}

export interface CertificacioTreballador {
  treballador: Pick<Treballador, 'id' | 'nom' | 'tipus'>
  totalHores: number
  diesTreballats: number
  actes: ActeResum[]
}

/**
 * Agrupa les entrades d'acte_treballadors per treballador, calcula totals
 * (hores i dies únics treballats) i retorna array ordenat per nom A-Z.
 *
 * Entrada esperada: array pla de `acte_treballadors` amb join a `treballadors`
 * (camp `treballador`) i a `actes` (camp `acta` amb `data`). Supabase pot
 * retornar `acta` com a objecte o com a array d'un element; es gestionen totes
 * dues formes.
 */
export function agregarCertificacio(
  actesTreballadors: Array<
    ActeTreballadorAmbNom & {
      acta?:
        | { data: string; obra_id?: string }
        | Array<{ data: string; obra_id?: string }>
        | null
    }
  >
): CertificacioTreballador[] {
  if (actesTreballadors.length === 0) return []

  const map = new Map<string, CertificacioTreballador>()

  for (const entrada of actesTreballadors) {
    const { treballador, hores, comentari } = entrada
    const actaRaw = entrada.acta
    const acta = Array.isArray(actaRaw) ? actaRaw[0] : actaRaw
    const data: string = acta?.data ?? ''

    if (!map.has(treballador.id)) {
      map.set(treballador.id, {
        treballador,
        totalHores: 0,
        diesTreballats: 0,
        actes: [],
      })
    }

    const entry = map.get(treballador.id)!
    entry.totalHores += Number(hores)
    entry.actes.push({ data, hores: Number(hores), comentari })
  }

  for (const entry of map.values()) {
    entry.actes.sort((a, b) => a.data.localeCompare(b.data))
    const datesUniques = new Set(entry.actes.map((a) => a.data))
    entry.diesTreballats = datesUniques.size
  }

  return Array.from(map.values()).sort((a, b) =>
    a.treballador.nom.localeCompare(b.treballador.nom, 'ca', {
      sensitivity: 'base',
    })
  )
}
