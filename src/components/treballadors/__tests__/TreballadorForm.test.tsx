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
})
