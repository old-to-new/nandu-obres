import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase server client — usar vi.hoisted per evitar hoisting issues
const { mockInsert, mockUpdate, mockEq, mockFrom } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockEq: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}))

vi.mock('@/lib/empresa', () => ({
  getEmpresaContext: vi.fn().mockResolvedValue({
    supabase: { from: mockFrom },
    empresaId: 'emp-1',
    rol: 'admin',
    empresa: { id: 'emp-1', nom: 'Test', subtitol: null, logo_url: null, created_at: '' },
  }),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

import {
  createTreballador,
  updateTreballador,
  toggleActiu,
} from '@/app/(dashboard)/treballadors/actions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

describe('createTreballador', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ insert: mockInsert })
    mockInsert.mockResolvedValue({ error: null })
  })

  it('insereix un treballador amb camps basics', async () => {
    const formData = new FormData()
    formData.set('nom', 'Pere Garriga')
    formData.set('tipus', 'oficial')
    formData.set('telefon', '600111222')
    formData.set('notes', 'Conductor oficial')

    await createTreballador(formData)

    expect(mockFrom).toHaveBeenCalledWith('treballadors')
    expect(mockInsert).toHaveBeenCalledWith({
      nom: 'Pere Garriga',
      tipus: 'oficial',
      telefon: '600111222',
      notes: 'Conductor oficial',
      encarregat: null,
      empresa_id: 'emp-1',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/treballadors')
    expect(redirect).toHaveBeenCalledWith('/treballadors')
  })

  it('passa null quan telefon es buit', async () => {
    const formData = new FormData()
    formData.set('nom', 'Joan Mas')
    formData.set('tipus', 'peo')
    formData.set('telefon', '')

    await createTreballador(formData)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ telefon: null, notes: null, empresa_id: 'emp-1' })
    )
  })

  it("passa encarregat \"nandu\" quan s'especifica", async () => {
    const formData = new FormData()
    formData.set('nom', 'Albert Font')
    formData.set('tipus', 'oficial')
    formData.set('encarregat', 'nandu')

    await createTreballador(formData)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ encarregat: 'nandu', empresa_id: 'emp-1' })
    )
  })

  it('passa encarregat null quan el camp és buit (sense assignar)', async () => {
    const formData = new FormData()
    formData.set('nom', 'Joan Mas')
    formData.set('tipus', 'peo')
    formData.set('encarregat', '')

    await createTreballador(formData)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ encarregat: null, empresa_id: 'emp-1' })
    )
  })

  it('llenca error si Supabase retorna error', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'DB error' } })
    const formData = new FormData()
    formData.set('nom', 'X')
    formData.set('tipus', 'oficial')

    await expect(createTreballador(formData)).rejects.toThrow('DB error')
  })
})

describe('updateTreballador', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })
  })

  it('actualitza els camps correctes', async () => {
    const formData = new FormData()
    formData.set('nom', 'Pere Garriga Nou')
    formData.set('tipus', 'oficial_2a')
    formData.set('telefon', '600999888')
    formData.set('notes', '')

    await updateTreballador('uuid-123', formData)

    expect(mockUpdate).toHaveBeenCalledWith({
      nom: 'Pere Garriga Nou',
      tipus: 'oficial_2a',
      telefon: '600999888',
      notes: null,
      encarregat: null,
    })
    expect(mockEq).toHaveBeenCalledWith('id', 'uuid-123')
    expect(revalidatePath).toHaveBeenCalledWith('/treballadors')
    expect(redirect).toHaveBeenCalledWith('/treballadors/uuid-123')
  })

  it('actualitza el camp encarregat a "pare"', async () => {
    const formData = new FormData()
    formData.set('nom', 'Pere Garriga')
    formData.set('tipus', 'oficial_2a')
    formData.set('encarregat', 'pare')

    await updateTreballador('uuid-123', formData)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ encarregat: 'pare' })
    )
  })

  it('actualitza encarregat a null quan el camp és buit', async () => {
    const formData = new FormData()
    formData.set('nom', 'Pere Garriga')
    formData.set('tipus', 'oficial')
    formData.set('encarregat', '')

    await updateTreballador('uuid-123', formData)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ encarregat: null })
    )
  })
})

describe('toggleActiu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })
  })

  it('canvia actiu a false', async () => {
    await toggleActiu('uuid-456', false)
    expect(mockUpdate).toHaveBeenCalledWith({ actiu: false })
    expect(mockEq).toHaveBeenCalledWith('id', 'uuid-456')
    expect(revalidatePath).toHaveBeenCalledWith('/treballadors')
  })

  it('canvia actiu a true', async () => {
    await toggleActiu('uuid-456', true)
    expect(mockUpdate).toHaveBeenCalledWith({ actiu: true })
  })
})
