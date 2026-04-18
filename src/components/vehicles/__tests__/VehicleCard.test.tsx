import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VehicleCard } from '../VehicleCard'
import type { Vehicle } from '@/lib/types/database'

const vehicleActiu: Vehicle = {
  id: 'uuid-v1', nom: 'Furgoneta Gran', matricula: 'B-1234-XY',
  actiu: true, created_at: '2026-01-01T00:00:00Z',
}
const vehicleInactiu: Vehicle = {
  ...vehicleActiu, id: 'uuid-v2', nom: 'Camioneta', actiu: false,
}

describe('VehicleCard', () => {
  it('mostra nom i matricula', () => {
    render(<VehicleCard vehicle={vehicleActiu} />)
    expect(screen.getByText('Furgoneta Gran')).toBeInTheDocument()
    expect(screen.getByText('B-1234-XY')).toBeInTheDocument()
  })

  it('mostra badge "Inactiu" per vehicles inactius', () => {
    render(<VehicleCard vehicle={vehicleInactiu} />)
    expect(screen.getByText('Inactiu')).toBeInTheDocument()
  })

  it('no mostra badge "Inactiu" per vehicles actius', () => {
    render(<VehicleCard vehicle={vehicleActiu} />)
    expect(screen.queryByText('Inactiu')).not.toBeInTheDocument()
  })

  it('conte link a editar', () => {
    render(<VehicleCard vehicle={vehicleActiu} />)
    expect(screen.getByRole('link', { name: /editar/i })).toHaveAttribute('href', '/vehicles/uuid-v1/editar')
  })
})
