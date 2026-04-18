import { describe, it, expect } from 'vitest'
import { agregarCertificacio } from './calculations'
import type { ActeTreballadorAmbNom, Treballador } from './types/database'

// Helper — construeix una entrada d'acte_treballador amb join a acta
type ActeJoin = { data: string; obra_id: string }
type ActeTreballadorAmbActa = ActeTreballadorAmbNom & { acta: ActeJoin }

const t1: Pick<Treballador, 'id' | 'nom' | 'tipus'> = {
  id: 'uuid-1',
  nom: 'Joan Martí',
  tipus: 'oficial',
}
const t2: Pick<Treballador, 'id' | 'nom' | 'tipus'> = {
  id: 'uuid-2',
  nom: 'Anna Puig',
  tipus: 'peo',
}

function makeActeTreballador(
  treballador: Pick<Treballador, 'id' | 'nom' | 'tipus'>,
  data: string,
  hores: number,
  comentari: string | null = null
): ActeTreballadorAmbActa {
  return {
    id: `at-${treballador.id}-${data}-${hores}`,
    acte_id: `acte-${data}`,
    treballador_id: treballador.id,
    hores,
    comentari,
    planificat: true,
    created_at: '2026-01-01T00:00:00Z',
    treballador,
    acta: { data, obra_id: 'obra-1' },
  }
}

describe('agregarCertificacio', () => {
  it('retorna array buit si no hi ha dades', () => {
    const result = agregarCertificacio([])
    expect(result).toEqual([])
  })

  it('un sol treballador, un sol dia', () => {
    const dades = [makeActeTreballador(t1, '2026-04-01', 9, 'Ha fet la coberta')]
    const result = agregarCertificacio(dades)
    expect(result).toHaveLength(1)
    expect(result[0].treballador.nom).toBe('Joan Martí')
    expect(result[0].totalHores).toBe(9)
    expect(result[0].diesTreballats).toBe(1)
    expect(result[0].actes).toHaveLength(1)
    expect(result[0].actes[0]).toEqual({
      data: '2026-04-01',
      hores: 9,
      comentari: 'Ha fet la coberta',
    })
  })

  it('un treballador, múltiples dies — suma hores i compta dies únics', () => {
    const dades = [
      makeActeTreballador(t1, '2026-04-01', 9),
      makeActeTreballador(t1, '2026-04-02', 7),
      makeActeTreballador(t1, '2026-04-03', 9),
    ]
    const result = agregarCertificacio(dades)
    expect(result).toHaveLength(1)
    expect(result[0].totalHores).toBe(25)
    expect(result[0].diesTreballats).toBe(3)
    expect(result[0].actes).toHaveLength(3)
  })

  it('múltiples treballadors — retorna un element per treballador ordenat per nom', () => {
    const dades = [
      makeActeTreballador(t2, '2026-04-01', 9),
      makeActeTreballador(t1, '2026-04-01', 9),
    ]
    const result = agregarCertificacio(dades)
    expect(result).toHaveLength(2)
    expect(result[0].treballador.nom).toBe('Anna Puig')
    expect(result[1].treballador.nom).toBe('Joan Martí')
  })

  it('actes ordenats per data ascendent dins de cada treballador', () => {
    const dades = [
      makeActeTreballador(t1, '2026-04-03', 9),
      makeActeTreballador(t1, '2026-04-01', 9),
      makeActeTreballador(t1, '2026-04-02', 9),
    ]
    const result = agregarCertificacio(dades)
    expect(result[0].actes.map((a) => a.data)).toEqual([
      '2026-04-01',
      '2026-04-02',
      '2026-04-03',
    ])
  })

  it('un treballador pot tenir múltiples actes el mateix dia (obres diferents)', () => {
    const dades = [
      makeActeTreballador(t1, '2026-04-01', 4, 'Matí obra A'),
      makeActeTreballador(t1, '2026-04-01', 5, 'Tarda obra B'),
    ]
    const result = agregarCertificacio(dades)
    expect(result[0].actes).toHaveLength(2)
    expect(result[0].totalHores).toBe(9)
    expect(result[0].diesTreballats).toBe(1)
  })

  it('retorna tipus correctes (totalHores és number, no string)', () => {
    const dades = [makeActeTreballador(t1, '2026-04-01', 9)]
    const result = agregarCertificacio(dades)
    expect(typeof result[0].totalHores).toBe('number')
    expect(typeof result[0].diesTreballats).toBe('number')
  })

  it('calcula totals globals correctament', () => {
    const dades = [
      makeActeTreballador(t1, '2026-04-01', 8),
      makeActeTreballador(t1, '2026-04-02', 9),
      makeActeTreballador(t2, '2026-04-01', 7),
    ]
    const result = agregarCertificacio(dades)
    const totalHoresGlobal = result.reduce((acc, t) => acc + t.totalHores, 0)
    expect(totalHoresGlobal).toBe(24)
  })
})
