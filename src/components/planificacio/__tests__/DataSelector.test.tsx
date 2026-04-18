import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataSelector } from '../DataSelector'

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('DataSelector', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('mostra la data actual com a valor de l input', () => {
    render(<DataSelector dataActual="2026-04-20" basePath="/planificacio" />)
    expect(screen.getByDisplayValue('2026-04-20')).toBeInTheDocument()
  })

  it('conte botons de dia anterior i dia seguent', () => {
    render(<DataSelector dataActual="2026-04-20" basePath="/planificacio" />)
    expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /seg.ent/i })).toBeInTheDocument()
  })

  it('el boto anterior navega al dia -1', async () => {
    const user = userEvent.setup()
    render(<DataSelector dataActual="2026-04-20" basePath="/planificacio" />)
    await user.click(screen.getByRole('button', { name: /anterior/i }))
    expect(mockPush).toHaveBeenCalledWith('/planificacio?data=2026-04-19')
  })

  it('el boto seguent navega al dia +1', async () => {
    const user = userEvent.setup()
    render(<DataSelector dataActual="2026-04-20" basePath="/planificacio" />)
    await user.click(screen.getByRole('button', { name: /seg.ent/i }))
    expect(mockPush).toHaveBeenCalledWith('/planificacio?data=2026-04-21')
  })
})
