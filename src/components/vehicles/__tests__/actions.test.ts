import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockInsert, mockUpdate, mockEq, mockFrom } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockEq: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({ from: mockFrom }),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

import { createVehicle, updateVehicle, toggleVehicleActiu } from '@/app/(dashboard)/vehicles/actions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

describe('createVehicle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ insert: mockInsert })
    mockInsert.mockResolvedValue({ error: null })
  })

  it('insereix vehicle amb nom i matricula', async () => {
    const formData = new FormData()
    formData.set('nom', 'Furgoneta Gran')
    formData.set('matricula', 'B-1234-XY')

    await createVehicle(formData)

    expect(mockFrom).toHaveBeenCalledWith('vehicles')
    expect(mockInsert).toHaveBeenCalledWith({
      nom: 'Furgoneta Gran',
      matricula: 'B-1234-XY',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/vehicles')
    expect(redirect).toHaveBeenCalledWith('/vehicles')
  })

  it('llenca error si Supabase falla', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'Unique constraint' } })
    const formData = new FormData()
    formData.set('nom', 'Test')
    formData.set('matricula', 'B-0000-XX')

    await expect(createVehicle(formData)).rejects.toThrow('Unique constraint')
  })
})

describe('updateVehicle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })
  })

  it('actualitza nom i matricula', async () => {
    const formData = new FormData()
    formData.set('nom', 'Furgoneta Petita')
    formData.set('matricula', 'B-9999-ZZ')

    await updateVehicle('uuid-v1', formData)

    expect(mockUpdate).toHaveBeenCalledWith({
      nom: 'Furgoneta Petita',
      matricula: 'B-9999-ZZ',
    })
    expect(mockEq).toHaveBeenCalledWith('id', 'uuid-v1')
    expect(redirect).toHaveBeenCalledWith('/vehicles')
  })
})

describe('toggleVehicleActiu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })
  })

  it('desactiva un vehicle', async () => {
    await toggleVehicleActiu('uuid-v2', false)
    expect(mockUpdate).toHaveBeenCalledWith({ actiu: false })
    expect(mockEq).toHaveBeenCalledWith('id', 'uuid-v2')
    expect(revalidatePath).toHaveBeenCalledWith('/vehicles')
  })

  it('activa un vehicle', async () => {
    await toggleVehicleActiu('uuid-v2', true)
    expect(mockUpdate).toHaveBeenCalledWith({ actiu: true })
  })
})
