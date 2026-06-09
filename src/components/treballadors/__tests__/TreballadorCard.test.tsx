import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TreballadorCard } from '../TreballadorCard'
import type { Treballador } from '@/lib/types/database'

const treballadorActiu: Treballador = {
  id: 'uuid-1',
  nom: 'Pere Garriga',
  tipus: 'oficial',
  actiu: true,
  telefon: '600111222',
  notes: null,
  encarregat: null,
  empresa_id: 'emp-1',
  created_at: '2026-01-01T00:00:00Z',
}

const treballadorInactiu: Treballador = {
  ...treballadorActiu,
  id: 'uuid-2',
  nom: 'Joan Mas',
  actiu: false,
  tipus: 'peo',
  encarregat: 'pare',
}

describe('TreballadorCard', () => {
  it('mostra nom i tipus del treballador', () => {
    render(<TreballadorCard treballador={treballadorActiu} />)
    expect(screen.getByText('Pere Garriga')).toBeInTheDocument()
    expect(screen.getByText('Oficial 1a')).toBeInTheDocument()
  })

  it('mostra el telefon quan existeix', () => {
    render(<TreballadorCard treballador={treballadorActiu} />)
    expect(screen.getByText('600111222')).toBeInTheDocument()
  })

  it('mostra badge "Inactiu" per treballadors inactius', () => {
    render(<TreballadorCard treballador={treballadorInactiu} />)
    expect(screen.getByText('Inactiu')).toBeInTheDocument()
  })

  it('no mostra badge "Inactiu" per treballadors actius', () => {
    render(<TreballadorCard treballador={treballadorActiu} />)
    expect(screen.queryByText('Inactiu')).not.toBeInTheDocument()
  })

  it('conte un link a la fitxa del treballador', () => {
    render(<TreballadorCard treballador={treballadorActiu} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/treballadors/uuid-1')
  })

  it('mostra "Peo" com a etiqueta per tipus peo', () => {
    render(<TreballadorCard treballador={treballadorInactiu} />)
    expect(screen.getByText('Peó')).toBeInTheDocument()
  })
})
