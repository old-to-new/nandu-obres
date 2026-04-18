import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TreballadorsLlista from '../TreballadorsLlista'
import type { Treballador } from '@/lib/types/database'

// Nota: TreballadorsPage és un Server Component — es testa indirectament
// a través de TreballadorsLlista, que és el component que rep les dades.

const treballadors: Treballador[] = [
  {
    id: 'uuid-1',
    nom: 'Pere Garriga',
    tipus: 'oficial',
    actiu: true,
    telefon: '600111222',
    notes: null,
    encarregat: 'nandu',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'uuid-2',
    nom: 'Joan Mas',
    tipus: 'peo',
    actiu: false,
    telefon: null,
    notes: null,
    encarregat: null,
    created_at: '2026-01-01T00:00:00Z',
  },
]

describe('TreballadorsLlista — integració pàgina', () => {
  it('mostra el títol de la pàgina', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByRole('heading', { name: /treballadors/i })).toBeInTheDocument()
  })

  it('mostra els treballadors actius per defecte', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByText('Pere Garriga')).toBeInTheDocument()
  })

  it('oculta els treballadors inactius per defecte', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.queryByText('Joan Mas')).not.toBeInTheDocument()
  })

  it('mostra el botó per crear un nou treballador', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByRole('link', { name: /nou treballador/i })).toBeInTheDocument()
  })

  it('mostra el comptador de treballadors visibles', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByText(/1 treballador/i)).toBeInTheDocument()
  })
})
