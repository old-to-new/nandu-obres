import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TreballadorHistorial } from '../TreballadorHistorial'

interface EntradaHistorial {
  hores: number
  comentari: string | null
  planificat: boolean
  acta: {
    data: string
    obra: { id: string; nom: string }
  } | null
}

const entrades: EntradaHistorial[] = [
  {
    hores: 9,
    comentari: 'Feines de paleta',
    planificat: true,
    acta: { data: '2026-04-10', obra: { id: 'obra-1', nom: 'Obra Sarrià' } },
  },
  {
    hores: 6,
    comentari: null,
    planificat: false,
    acta: { data: '2026-04-11', obra: { id: 'obra-1', nom: 'Obra Sarrià' } },
  },
  {
    hores: 8,
    comentari: 'Formigonat',
    planificat: true,
    acta: { data: '2026-04-12', obra: { id: 'obra-2', nom: 'Rehabilitació Gràcia' } },
  },
]

describe('TreballadorHistorial', () => {
  it('mostra el total hores', () => {
    render(<TreballadorHistorial entrades={entrades} />)
    expect(screen.getByText('23h')).toBeInTheDocument()
  })

  it('mostra cada entrada amb data i obra', () => {
    render(<TreballadorHistorial entrades={entrades} />)
    expect(screen.getAllByText('Obra Sarrià').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Rehabilitació Gràcia').length).toBeGreaterThan(0)
  })

  it('mostra les hores de cada entrada', () => {
    render(<TreballadorHistorial entrades={entrades} />)
    expect(screen.getByText('9h')).toBeInTheDocument()
    expect(screen.getByText('6h')).toBeInTheDocument()
    // 8h apareix a la fila i al resum per obra (Gràcia només té 8h)
    expect(screen.getAllByText('8h').length).toBeGreaterThanOrEqual(1)
  })

  it('mostra el comentari quan existeix', () => {
    render(<TreballadorHistorial entrades={entrades} />)
    expect(screen.getByText('Feines de paleta')).toBeInTheDocument()
    expect(screen.getByText('Formigonat')).toBeInTheDocument()
  })

  it('mostra "sense comentari" quan no hi ha comentari', () => {
    render(<TreballadorHistorial entrades={entrades} />)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('mostra resum per obra (hores agrupades)', () => {
    render(<TreballadorHistorial entrades={entrades} />)
    // Obra Sarrià: 9+6 = 15h
    expect(screen.getByText('15h')).toBeInTheDocument()
  })

  it('mostra missatge quan no hi ha entrades', () => {
    render(<TreballadorHistorial entrades={[]} />)
    expect(screen.getByText(/no hi ha registres/i)).toBeInTheDocument()
  })
})
