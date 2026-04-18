import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VehicleForm } from '../VehicleForm'
import type { Vehicle } from '@/lib/types/database'

const mockAction = vi.fn()

const vehicleExistent: Vehicle = {
  id: 'uuid-v1', nom: 'Furgoneta Gran', matricula: 'B-1234-XY',
  actiu: true, created_at: '2026-01-01T00:00:00Z',
}

describe('VehicleForm — mode creacio', () => {
  it('renderitza camps Nom i Matricula', () => {
    render(<VehicleForm action={mockAction} />)
    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/matricula/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /desar/i })).toBeInTheDocument()
  })

  it('nom es obligatori', () => {
    render(<VehicleForm action={mockAction} />)
    expect(screen.getByLabelText(/nom/i)).toBeRequired()
  })
})

describe('VehicleForm — mode edicio', () => {
  it('pre-omple els camps', () => {
    render(<VehicleForm action={mockAction} vehicle={vehicleExistent} />)
    expect(screen.getByLabelText(/nom/i)).toHaveValue('Furgoneta Gran')
    expect(screen.getByLabelText(/matricula/i)).toHaveValue('B-1234-XY')
  })

  it('mostra boto Actualitzar en mode edicio', () => {
    render(<VehicleForm action={mockAction} vehicle={vehicleExistent} />)
    expect(screen.getByRole('button', { name: /actualitzar/i })).toBeInTheDocument()
  })
})
