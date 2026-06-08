export type TipusTreballador = string
export type EncarregatTreballador = 'nandu' | 'pare'
export type LiniaObra = string
export type EstatObra = string

export interface Categoria {
  id: string
  tipus: string
  valor: string
  etiqueta: string
  ordre: number
  created_at: string
}

export interface Treballador {
  id: string
  nom: string
  tipus: TipusTreballador
  actiu: boolean
  telefon: string | null
  notes: string | null
  encarregat: EncarregatTreballador | null
  created_at: string
}

export interface Vehicle {
  id: string
  nom: string
  matricula: string
  actiu: boolean
  created_at: string
}

export type MatterportEstat = 'pendent' | 'en_estudi' | 'actiu'

export interface Obra {
  id: string
  nom: string
  client_nom: string
  linia: LiniaObra
  estat: EstatObra
  pressupost_pdf_url: string | null
  projecte_pdf_url: string | null
  notes: string | null
  matterport_model_id: string | null
  matterport_estat: MatterportEstat | null
  created_at: string
}

export interface Acta {
  id: string
  obra_id: string
  data: string
  comentari_general: string | null
  deleted_at: string | null
  created_at: string
}

export interface ActeTreballador {
  id: string
  acte_id: string
  treballador_id: string
  hores: number
  comentari: string | null
  planificat: boolean
  created_at: string
}

export interface ActeImatge {
  id: string
  acte_id: string
  url: string
  caption: string | null
  created_at: string
}

export interface Planificacio {
  id: string
  data: string
  obra_id: string
  treballador_id: string
  vehicle_id: string | null
  tasca: string | null
  crear_acta_auto: boolean
  created_at: string
}

// Tipus enriquits (per a queries amb joins)
export interface ActeTreballadorAmbNom extends ActeTreballador {
  treballador: Pick<Treballador, 'id' | 'nom' | 'tipus'>
}

export interface PlanificacioAmbDetalls extends Planificacio {
  obra: Pick<Obra, 'id' | 'nom'>
  treballador: Pick<Treballador, 'id' | 'nom'>
  vehicle: Pick<Vehicle, 'id' | 'nom'> | null
}
