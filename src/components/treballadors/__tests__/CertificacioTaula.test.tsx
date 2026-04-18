import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CertificacioTaula } from '../CertificacioTaula'
import type { Treballador } from '@/lib/types/database'

// Mock window.print
Object.defineProperty(window, 'print', {
  value: vi.fn(),
  writable: true,
})

const treballador: Treballador = {
  id: 'uuid-1', nom: 'Pere Garriga', tipus: 'oficial',
  actiu: true, telefon: null, notes: null,
  created_at: '2026-01-01T00:00:00Z',
}

interface EntradaCertificacio {
  hores: number
  comentari: string | null
  acta: { data: string; obra: { id: string; nom: string } } | null
}

const entrades: EntradaCertificacio[] = [
  { hores: 9, comentari: 'Paleta', acta: { data: '2026-04-10', obra: { id: 'o1', nom: 'Obra Sarrià' } } },
  { hores: 8, comentari: null, acta: { data: '2026-04-11', obra: { id: 'o1', nom: 'Obra Sarrià' } } },
  { hores: 7, comentari: 'Formigonat', acta: { data: '2026-04-12', obra: { id: 'o2', nom: 'Gràcia' } } },
]

describe('CertificacioTaula', () => {
  it('mostra el nom del treballador', () => {
    render(<CertificacioTaula treballador={treballador} entrades={entrades} dataInici="2026-04-01" dataFi="2026-04-30" />)
    expect(screen.getByText('Pere Garriga')).toBeInTheDocument()
  })

  it('mostra el tipus del treballador', () => {
    render(<CertificacioTaula treballador={treballador} entrades={entrades} dataInici="2026-04-01" dataFi="2026-04-30" />)
    expect(screen.getByText('Oficial')).toBeInTheDocument()
  })

  it('mostra les columnes: Data, Obra, Hores, Comentari', () => {
    render(<CertificacioTaula treballador={treballador} entrades={entrades} dataInici="2026-04-01" dataFi="2026-04-30" />)
    expect(screen.getByText('Data')).toBeInTheDocument()
    expect(screen.getByText('Obra')).toBeInTheDocument()
    expect(screen.getByText('Hores')).toBeInTheDocument()
    expect(screen.getByText('Comentari')).toBeInTheDocument()
  })

  it('mostra el total hores al peu', () => {
    render(<CertificacioTaula treballador={treballador} entrades={entrades} dataInici="2026-04-01" dataFi="2026-04-30" />)
    // 9+8+7 = 24h
    expect(screen.getByText('24h')).toBeInTheDocument()
  })

  it('mostra totes les files d entrades', () => {
    render(<CertificacioTaula treballador={treballador} entrades={entrades} dataInici="2026-04-01" dataFi="2026-04-30" />)
    expect(screen.getByText('Paleta')).toBeInTheDocument()
    expect(screen.getByText('Formigonat')).toBeInTheDocument()
  })

  it('mostra el rang de dates', () => {
    render(<CertificacioTaula treballador={treballador} entrades={entrades} dataInici="2026-04-01" dataFi="2026-04-30" />)
    expect(screen.getByText(/01\/04\/2026/)).toBeInTheDocument()
    expect(screen.getByText(/30\/04\/2026/)).toBeInTheDocument()
  })

  it('crida window.print() en clicar el boto imprimir', async () => {
    const user = userEvent.setup()
    render(<CertificacioTaula treballador={treballador} entrades={entrades} dataInici="2026-04-01" dataFi="2026-04-30" />)
    await user.click(screen.getByRole('button', { name: /imprimir/i }))
    expect(window.print).toHaveBeenCalledTimes(1)
  })
})
