import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TreballadorForm } from '../TreballadorForm'
import type { Treballador } from '@/lib/types/database'

const mockAction = vi.fn()

const treballadorExistent: Treballador = {
  id: 'uuid-1',
  nom: 'Pere Garriga',
  tipus: 'oficial',
  actiu: true,
  telefon: '600111222',
  notes: 'Bon conductor',
  encarregat: 'nandu',
  created_at: '2026-01-01T00:00:00Z',
}

describe('TreballadorForm — mode creacio', () => {
  it('renderitza tots els camps', () => {
    render(<TreballadorForm action={mockAction} />)
    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipus/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/telèfon/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /desar/i })).toBeInTheDocument()
  })

  it('el selector de tipus conte totes les opcions', () => {
    render(<TreballadorForm action={mockAction} />)
    const select = screen.getByLabelText(/tipus/i)
    expect(select).toContainElement(screen.getByRole('option', { name: /oficial$/i }))
    expect(select).toContainElement(screen.getByRole('option', { name: /oficial 2a/i }))
    expect(select).toContainElement(screen.getByRole('option', { name: /peó/i }))
    expect(select).toContainElement(screen.getByRole('option', { name: /altre/i }))
  })

  it('nom es obligatori', () => {
    render(<TreballadorForm action={mockAction} />)
    expect(screen.getByLabelText(/nom/i)).toBeRequired()
  })

  it("renderitza el select d'equip", () => {
    render(<TreballadorForm action={mockAction} />)
    expect(screen.getByLabelText(/equip/i)).toBeInTheDocument()
  })

  it("el select d'equip conte les tres opcions (sense assignar, Nandu, Pare)", () => {
    render(<TreballadorForm action={mockAction} />)
    const select = screen.getByLabelText(/equip/i)
    expect(select).toContainElement(screen.getByRole('option', { name: /sense assignar/i }))
    expect(select).toContainElement(screen.getByRole('option', { name: /equip nandu/i }))
    expect(select).toContainElement(screen.getByRole('option', { name: /equip pare/i }))
  })

  it('en mode creació, el valor per defecte és "sense assignar"', () => {
    render(<TreballadorForm action={mockAction} />)
    expect(screen.getByLabelText(/equip/i)).toHaveValue('')
  })
})

describe('TreballadorForm — mode edicio', () => {
  it('pre-omple els camps amb les dades existents', () => {
    render(<TreballadorForm action={mockAction} treballador={treballadorExistent} />)
    expect(screen.getByLabelText(/nom/i)).toHaveValue('Pere Garriga')
    expect(screen.getByLabelText(/telèfon/i)).toHaveValue('600111222')
    expect(screen.getByLabelText(/notes/i)).toHaveValue('Bon conductor')
  })

  it('el select de tipus mostra el valor correcte', () => {
    render(<TreballadorForm action={mockAction} treballador={treballadorExistent} />)
    expect(screen.getByLabelText(/tipus/i)).toHaveValue('oficial')
  })

  it('mostra boto "Actualitzar" en mode edicio', () => {
    render(<TreballadorForm action={mockAction} treballador={treballadorExistent} />)
    expect(screen.getByRole('button', { name: /actualitzar/i })).toBeInTheDocument()
  })

  it("pre-omple el select d'equip amb l'encarregat del treballador", () => {
    render(<TreballadorForm action={mockAction} treballador={treballadorExistent} />)
    expect(screen.getByLabelText(/equip/i)).toHaveValue('nandu')
  })

  it('pre-omple com a buit si encarregat és null', () => {
    const treballadorSenseEquip: Treballador = {
      ...treballadorExistent,
      encarregat: null,
    }
    render(<TreballadorForm action={mockAction} treballador={treballadorSenseEquip} />)
    expect(screen.getByLabelText(/equip/i)).toHaveValue('')
  })
})
