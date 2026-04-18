import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiaResum } from '../DiaResum'
import type { PlanificacioAmbDetalls } from '@/lib/types/database'

const mockDeleteAction = vi.fn()

const assignacions: PlanificacioAmbDetalls[] = [
  {
    id: 'p1', data: '2026-04-19', obra_id: 'o1', treballador_id: 't1',
    vehicle_id: 'v1', tasca: 'Paleta', created_at: '2026-01-01T00:00:00Z',
    obra: { id: 'o1', nom: 'Obra Sarria' },
    treballador: { id: 't1', nom: 'Pere Garriga' },
    vehicle: { id: 'v1', nom: 'Furgoneta Gran' },
  },
  {
    id: 'p2', data: '2026-04-19', obra_id: 'o1', treballador_id: 't2',
    vehicle_id: null, tasca: null, created_at: '2026-01-01T00:00:00Z',
    obra: { id: 'o1', nom: 'Obra Sarria' },
    treballador: { id: 't2', nom: 'Joan Mas' },
    vehicle: null,
  },
  {
    id: 'p3', data: '2026-04-19', obra_id: 'o2', treballador_id: 't3',
    vehicle_id: 'v1', tasca: 'Formigonat', created_at: '2026-01-01T00:00:00Z',
    obra: { id: 'o2', nom: 'Rehabilitacio Gracia' },
    treballador: { id: 't3', nom: 'Miquel Puig' },
    vehicle: { id: 'v1', nom: 'Furgoneta Gran' },
  },
]

describe('DiaResum', () => {
  it('mostra la data del dia', () => {
    render(<DiaResum data="2026-04-19" assignacions={assignacions} deleteAction={mockDeleteAction} />)
    expect(screen.getByText(/19\/04\/2026/)).toBeInTheDocument()
  })

  it('agrupa assignacions per obra', () => {
    render(<DiaResum data="2026-04-19" assignacions={assignacions} deleteAction={mockDeleteAction} />)
    expect(screen.getByText('Obra Sarria')).toBeInTheDocument()
    expect(screen.getByText('Rehabilitacio Gracia')).toBeInTheDocument()
  })

  it('mostra treballadors de cada obra', () => {
    render(<DiaResum data="2026-04-19" assignacions={assignacions} deleteAction={mockDeleteAction} />)
    expect(screen.getByText('Pere Garriga')).toBeInTheDocument()
    expect(screen.getByText('Joan Mas')).toBeInTheDocument()
    expect(screen.getByText('Miquel Puig')).toBeInTheDocument()
  })

  it('mostra el vehicle quan n hi ha', () => {
    render(<DiaResum data="2026-04-19" assignacions={assignacions} deleteAction={mockDeleteAction} />)
    expect(screen.getAllByText('Furgoneta Gran')).toHaveLength(2)
  })

  it('mostra la tasca quan n hi ha', () => {
    render(<DiaResum data="2026-04-19" assignacions={assignacions} deleteAction={mockDeleteAction} />)
    expect(screen.getByText('Paleta')).toBeInTheDocument()
    expect(screen.getByText('Formigonat')).toBeInTheDocument()
  })

  it('mostra "Sense vehicle" per assignacions sense vehicle', () => {
    render(<DiaResum data="2026-04-19" assignacions={assignacions} deleteAction={mockDeleteAction} />)
    expect(screen.getByText('Sense vehicle')).toBeInTheDocument()
  })

  it('mostra boto d eliminar per cada assignacio', () => {
    render(<DiaResum data="2026-04-19" assignacions={assignacions} deleteAction={mockDeleteAction} />)
    expect(screen.getAllByRole('button', { name: /eliminar/i })).toHaveLength(3)
  })

  it('mostra missatge quan no hi ha assignacions', () => {
    render(<DiaResum data="2026-04-19" assignacions={[]} deleteAction={mockDeleteAction} />)
    expect(screen.getByText(/no hi ha assignacions/i)).toBeInTheDocument()
  })

  it('mostra total de treballadors del dia', () => {
    render(<DiaResum data="2026-04-19" assignacions={assignacions} deleteAction={mockDeleteAction} />)
    expect(screen.getByText(/3 treballadors/i)).toBeInTheDocument()
  })
})
