import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockInsert, mockDelete, mockUpdate, mockEq, mockFrom } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockDelete: vi.fn(),
  mockUpdate: vi.fn(),
  mockEq: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({ from: mockFrom }),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import {
  createAssignacio,
  deleteAssignacio,
  updateAssignacio,
} from '@/app/(dashboard)/planificacio/actions'
import { revalidatePath } from 'next/cache'

describe('createAssignacio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ insert: mockInsert })
    mockInsert.mockResolvedValue({ error: null })
  })

  it('insereix assignacio amb tots els camps', async () => {
    const formData = new FormData()
    formData.set('data', '2026-04-20')
    formData.set('obra_id', 'obra-uuid-1')
    formData.set('treballador_id', 'treb-uuid-1')
    formData.set('vehicle_id', 'vehicle-uuid-1')
    formData.set('tasca', 'Paleta')

    await createAssignacio(formData)

    expect(mockFrom).toHaveBeenCalledWith('planificacio')
    expect(mockInsert).toHaveBeenCalledWith({
      data: '2026-04-20',
      obra_id: 'obra-uuid-1',
      treballador_id: 'treb-uuid-1',
      vehicle_id: 'vehicle-uuid-1',
      tasca: 'Paleta',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/planificacio')
  })

  it('passa null quan vehicle_id es buit', async () => {
    const formData = new FormData()
    formData.set('data', '2026-04-20')
    formData.set('obra_id', 'obra-uuid-1')
    formData.set('treballador_id', 'treb-uuid-1')
    formData.set('vehicle_id', '')
    formData.set('tasca', '')

    await createAssignacio(formData)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ vehicle_id: null, tasca: null })
    )
  })

  it('llenca error si Supabase falla', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'FK violation' } })
    const formData = new FormData()
    formData.set('data', '2026-04-20')
    formData.set('obra_id', 'x')
    formData.set('treballador_id', 'y')

    await expect(createAssignacio(formData)).rejects.toThrow('FK violation')
  })
})

describe('deleteAssignacio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockResolvedValue({ error: null })
    mockDelete.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ delete: mockDelete })
  })

  it('elimina l assignacio per id', async () => {
    await deleteAssignacio('assign-uuid-1', '2026-04-20')

    expect(mockFrom).toHaveBeenCalledWith('planificacio')
    expect(mockDelete).toHaveBeenCalled()
    expect(mockEq).toHaveBeenCalledWith('id', 'assign-uuid-1')
    expect(revalidatePath).toHaveBeenCalledWith('/planificacio')
  })
})

describe('updateAssignacio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })
  })

  it('actualitza tasca i vehicle', async () => {
    const formData = new FormData()
    formData.set('vehicle_id', 'vehicle-uuid-2')
    formData.set('tasca', 'Formigonat')

    await updateAssignacio('assign-uuid-2', '2026-04-20', formData)

    expect(mockUpdate).toHaveBeenCalledWith({
      vehicle_id: 'vehicle-uuid-2',
      tasca: 'Formigonat',
    })
    expect(mockEq).toHaveBeenCalledWith('id', 'assign-uuid-2')
  })
})
