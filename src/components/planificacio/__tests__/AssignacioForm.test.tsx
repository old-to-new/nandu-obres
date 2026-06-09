import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AssignacioForm } from '../AssignacioForm'
import type { Obra, Treballador, Vehicle } from '@/lib/types/database'

const mockAction = vi.fn()

const obres: Obra[] = [
  { id: 'o1', nom: 'Obra Sarria', client_nom: 'Client A', linia: 'obra_nova', estat: 'activa', pressupost_pdf_url: null, projecte_pdf_url: null, notes: null, matterport_model_id: null, matterport_estat: null, empresa_id: 'emp-1', created_at: '' },
  { id: 'o2', nom: 'Gracia', client_nom: 'Client B', linia: 'rehabilitacio', estat: 'activa', pressupost_pdf_url: null, projecte_pdf_url: null, notes: null, matterport_model_id: null, matterport_estat: null, empresa_id: 'emp-1', created_at: '' },
]

const treballadors: Treballador[] = [
  { id: 't1', nom: 'Pere Garriga', tipus: 'oficial', actiu: true, telefon: null, notes: null, encarregat: null, empresa_id: 'emp-1', created_at: '' },
  { id: 't2', nom: 'Joan Mas', tipus: 'peo', actiu: true, telefon: null, notes: null, encarregat: null, empresa_id: 'emp-1', created_at: '' },
]

const vehicles: Vehicle[] = [
  { id: 'v1', nom: 'Furgoneta Gran', matricula: 'B-1234-XY', actiu: true, empresa_id: 'emp-1', created_at: '' },
]

const treballadorsJaAssignats = ['t1']

describe('AssignacioForm', () => {
  it('renderitza selectors d obra, treballador i vehicle', () => {
    render(
      <AssignacioForm
        action={mockAction}
        data="2026-04-20"
        obres={obres}
        treballadors={treballadors}
        vehicles={vehicles}
        treballadorsJaAssignats={[]}
      />
    )
    expect(screen.getByLabelText(/obra/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/treballador/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/vehicle/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tasca/i)).toBeInTheDocument()
  })

  it('inclou totes les obres al selector', () => {
    render(
      <AssignacioForm
        action={mockAction}
        data="2026-04-20"
        obres={obres}
        treballadors={treballadors}
        vehicles={vehicles}
        treballadorsJaAssignats={[]}
      />
    )
    expect(screen.getByRole('option', { name: 'Obra Sarria' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Gracia' })).toBeInTheDocument()
  })

  it('inclou tots els treballadors actius al selector', () => {
    render(
      <AssignacioForm
        action={mockAction}
        data="2026-04-20"
        obres={obres}
        treballadors={treballadors}
        vehicles={vehicles}
        treballadorsJaAssignats={[]}
      />
    )
    expect(screen.getByRole('option', { name: /Pere Garriga/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Joan Mas/i })).toBeInTheDocument()
  })

  it('mostra alerta visual per treballadors ja assignats (sense bloqueig)', () => {
    render(
      <AssignacioForm
        action={mockAction}
        data="2026-04-20"
        obres={obres}
        treballadors={treballadors}
        vehicles={vehicles}
        treballadorsJaAssignats={treballadorsJaAssignats}
      />
    )
    expect(screen.getByRole('option', { name: /Pere Garriga.*ja assignat/i })).toBeInTheDocument()
  })

  it('vehicle es opcional (opcio "Sense vehicle")', () => {
    render(
      <AssignacioForm
        action={mockAction}
        data="2026-04-20"
        obres={obres}
        treballadors={treballadors}
        vehicles={vehicles}
        treballadorsJaAssignats={[]}
      />
    )
    expect(screen.getByRole('option', { name: /sense vehicle/i })).toBeInTheDocument()
  })

  it('data hidden field te el valor correcte', () => {
    render(
      <AssignacioForm
        action={mockAction}
        data="2026-04-20"
        obres={obres}
        treballadors={treballadors}
        vehicles={vehicles}
        treballadorsJaAssignats={[]}
      />
    )
    const hiddenInput = document.querySelector('input[name="data"]') as HTMLInputElement
    expect(hiddenInput?.value).toBe('2026-04-20')
  })

  it('mostra boto d afegir', () => {
    render(
      <AssignacioForm
        action={mockAction}
        data="2026-04-20"
        obres={obres}
        treballadors={treballadors}
        vehicles={vehicles}
        treballadorsJaAssignats={[]}
      />
    )
    expect(screen.getByRole('button', { name: /afegir/i })).toBeInTheDocument()
  })
})
