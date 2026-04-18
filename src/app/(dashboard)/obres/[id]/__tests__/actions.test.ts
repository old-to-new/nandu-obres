import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

// Mocks granulars per a les cadenes de Supabase
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

import { guardarActa } from '../actions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Tipus helpers per als tests
interface TreballadorActa {
  treballadorId: string
  hores: number
  comentari: string
  planificat: boolean
}

describe('guardarActa — crear nova acta (cas feliç)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('insereix acta + treballadors en una seqüència i redirigeix al detall', async () => {
    // Mock: insert acta → retorna id
    const mockActaInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'acta-uuid-1' },
          error: null,
        }),
      }),
    })
    // Mock: delete acte_treballadors existents
    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null })
    const mockDeleteChain = vi.fn().mockReturnValue({ eq: mockDeleteEq })
    // Mock: insert acte_treballadors
    const mockTreballadorsInsert = vi.fn().mockResolvedValue({ error: null })

    // from() retorna diferent cosa segons la taula
    mockFrom.mockImplementation((table: string) => {
      if (table === 'actes') return { insert: mockActaInsert }
      if (table === 'acte_treballadors') return {
        delete: mockDeleteChain,
        insert: mockTreballadorsInsert,
      }
      return {}
    })

    const treballadors: TreballadorActa[] = [
      { treballadorId: 'treb-1', hores: 9, comentari: 'Encofrat', planificat: true },
      { treballadorId: 'treb-2', hores: 7.5, comentari: '', planificat: false },
    ]

    await guardarActa({
      obraId: 'obra-uuid-1',
      acteId: null, // nova acta
      data: '2026-04-18',
      comentariGeneral: 'Bon dia de treball',
      treballadors,
    })

    // Ha de crear l'acta
    expect(mockFrom).toHaveBeenCalledWith('actes')
    expect(mockActaInsert).toHaveBeenCalledWith({
      obra_id: 'obra-uuid-1',
      data: '2026-04-18',
      comentari_general: 'Bon dia de treball',
    })

    // Ha d'inserir els treballadors
    expect(mockTreballadorsInsert).toHaveBeenCalledWith([
      { acte_id: 'acta-uuid-1', treballador_id: 'treb-1', hores: 9, comentari: 'Encofrat', planificat: true },
      { acte_id: 'acta-uuid-1', treballador_id: 'treb-2', hores: 7.5, comentari: null, planificat: false },
    ])

    expect(revalidatePath).toHaveBeenCalledWith('/obres/obra-uuid-1')
    expect(redirect).toHaveBeenCalledWith('/obres/obra-uuid-1/actes/acta-uuid-1')
  })
})

describe('guardarActa — actualitzar acta existent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('actualitza el comentari i substitueix els treballadors', async () => {
    const mockActaUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null })
    const mockDeleteChain = vi.fn().mockReturnValue({ eq: mockDeleteEq })
    const mockTreballadorsInsert = vi.fn().mockResolvedValue({ error: null })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'actes') return { update: mockActaUpdate }
      if (table === 'acte_treballadors') return {
        delete: mockDeleteChain,
        insert: mockTreballadorsInsert,
      }
      return {}
    })

    await guardarActa({
      obraId: 'obra-uuid-1',
      acteId: 'acta-uuid-existing',
      data: '2026-04-17',
      comentariGeneral: 'Dia plujós, menys feina',
      treballadors: [
        { treballadorId: 'treb-1', hores: 8, comentari: 'Menys hores', planificat: true },
      ],
    })

    // Ha d'actualitzar (no inserir) l'acta
    expect(mockActaUpdate).toHaveBeenCalledWith({
      data: '2026-04-17',
      comentari_general: 'Dia plujós, menys feina',
    })

    // Ha d'esborrar els treballadors antics i inserir els nous
    expect(mockDeleteChain).toHaveBeenCalled()
    expect(mockDeleteEq).toHaveBeenCalledWith('acte_id', 'acta-uuid-existing')
    expect(mockTreballadorsInsert).toHaveBeenCalledWith([
      { acte_id: 'acta-uuid-existing', treballador_id: 'treb-1', hores: 8, comentari: 'Menys hores', planificat: true },
    ])
  })
})
