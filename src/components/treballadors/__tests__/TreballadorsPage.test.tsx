import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TreballadorsPageContent from '../TreballadorsPageContent'
import type { Treballador } from '@/lib/types/database'

const treballadors: Treballador[] = [
  {
    id: 'uuid-1', nom: 'Pere Garriga', tipus: 'oficial',
    actiu: true, telefon: '600111222', notes: null,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'uuid-2', nom: 'Joan Mas', tipus: 'peo',
    actiu: false, telefon: null, notes: null,
    created_at: '2026-01-01T00:00:00Z',
  },
]

describe('TreballadorsPageContent', () => {
  it('mostra el titol de la pagina', () => {
    render(<TreballadorsPageContent treballadors={treballadors} mostraInactius={false} />)
    expect(screen.getByRole('heading', { name: /treballadors/i })).toBeInTheDocument()
  })

  it('mostra els treballadors actius', () => {
    render(<TreballadorsPageContent treballadors={treballadors} mostraInactius={false} />)
    expect(screen.getByText('Pere Garriga')).toBeInTheDocument()
  })

  it('amaga treballadors inactius per defecte', () => {
    render(<TreballadorsPageContent treballadors={treballadors} mostraInactius={false} />)
    expect(screen.queryByText('Joan Mas')).not.toBeInTheDocument()
  })

  it('mostra treballadors inactius quan mostraInactius=true', () => {
    render(<TreballadorsPageContent treballadors={treballadors} mostraInactius={true} />)
    expect(screen.getByText('Joan Mas')).toBeInTheDocument()
  })

  it('mostra boto per crear nou treballador', () => {
    render(<TreballadorsPageContent treballadors={treballadors} mostraInactius={false} />)
    expect(screen.getByRole('link', { name: /nou treballador/i })).toBeInTheDocument()
  })

  it('mostra toggle per veure inactius', () => {
    render(<TreballadorsPageContent treballadors={treballadors} mostraInactius={false} />)
    expect(screen.getByRole('link', { name: /veure inactius/i })).toBeInTheDocument()
  })

  it('mostra "amagar inactius" quan mostraInactius=true', () => {
    render(<TreballadorsPageContent treballadors={treballadors} mostraInactius={true} />)
    expect(screen.getByRole('link', { name: /amagar inactius/i })).toBeInTheDocument()
  })
})
