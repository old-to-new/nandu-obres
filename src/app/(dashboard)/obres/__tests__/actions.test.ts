import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

const { mockSelect, mockInsert, mockUpdate, mockEq, mockSingle, mockFrom } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockEq: vi.fn(),
  mockSingle: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

vi.mock('@/lib/empresa', () => ({
  getEmpresaContext: vi.fn().mockResolvedValue({
    supabase: { from: mockFrom },
    empresaId: 'emp-1',
    rol: 'admin',
    empresa: { id: 'emp-1', nom: 'Test', subtitol: null, logo_url: null, created_at: '' },
  }),
}))

import { createObra, updateObra } from '../actions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

describe('createObra', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ insert: mockInsert })
    mockInsert.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ single: mockSingle })
  })

  it('insereix una obra amb les dades del FormData i redirigeix', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'obra-uuid-1', nom: 'Casa Test', client_nom: 'Client Test', linia: 'obra_nova', estat: 'activa' },
      error: null,
    })

    const formData = new FormData()
    formData.set('nom', 'Casa Test')
    formData.set('client_nom', 'Client Test')
    formData.set('linia', 'obra_nova')
    formData.set('estat', 'activa')
    formData.set('notes', '')

    await createObra(formData)

    expect(mockFrom).toHaveBeenCalledWith('obres')
    expect(mockInsert).toHaveBeenCalledWith({
      nom: 'Casa Test',
      client_nom: 'Client Test',
      linia: 'obra_nova',
      estat: 'activa',
      notes: null,
      empresa_id: 'emp-1',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/obres')
    expect(redirect).toHaveBeenCalledWith('/obres/obra-uuid-1')
  })

  it('llança error si Supabase retorna error', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
    })

    const formData = new FormData()
    formData.set('nom', 'Test')
    formData.set('client_nom', 'Test')
    formData.set('linia', 'obra_nova')
    formData.set('estat', 'activa')
    formData.set('notes', '')

    await expect(createObra(formData)).rejects.toThrow('DB error')
  })
})

describe('updateObra', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ update: mockUpdate })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ error: null })
  })

  it('actualitza una obra existent i revalida', async () => {
    const formData = new FormData()
    formData.set('nom', 'Casa Renovada')
    formData.set('client_nom', 'Client Renovat')
    formData.set('linia', 'rehabilitacio')
    formData.set('estat', 'pausada')
    formData.set('notes', 'Obra pausada per vacances')

    await updateObra('obra-uuid-1', formData)

    expect(mockFrom).toHaveBeenCalledWith('obres')
    expect(mockUpdate).toHaveBeenCalledWith({
      nom: 'Casa Renovada',
      client_nom: 'Client Renovat',
      linia: 'rehabilitacio',
      estat: 'pausada',
      notes: 'Obra pausada per vacances',
    })
    expect(mockEq).toHaveBeenCalledWith('id', 'obra-uuid-1')
    expect(revalidatePath).toHaveBeenCalledWith('/obres')
    expect(revalidatePath).toHaveBeenCalledWith('/obres/obra-uuid-1')
  })
})
