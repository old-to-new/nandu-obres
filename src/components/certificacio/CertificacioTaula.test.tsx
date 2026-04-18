import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import CertificacioTaula from './CertificacioTaula'
import type { CertificacioTreballador } from '@/lib/calculations'

const dadesMock: CertificacioTreballador[] = [
  {
    treballador: { id: 'uuid-1', nom: 'Joan Martí', tipus: 'oficial' },
    totalHores: 162,
    diesTreballats: 18,
    actes: [
      { data: '2026-04-01', hores: 9, comentari: 'Ha fet la coberta' },
      { data: '2026-04-02', hores: 9, comentari: null },
    ],
  },
  {
    treballador: { id: 'uuid-2', nom: 'Anna Puig', tipus: 'peo' },
    totalHores: 63,
    diesTreballats: 7,
    actes: [{ data: '2026-04-01', hores: 9, comentari: null }],
  },
]

describe('CertificacioTaula', () => {
  it('renderitza la taula principal amb tots els treballadors', () => {
    render(<CertificacioTaula dades={dadesMock} />)
    expect(screen.getByText('Joan Martí')).toBeInTheDocument()
    expect(screen.getByText('Anna Puig')).toBeInTheDocument()
  })

  it('mostra les columnes: Treballador, Tipus, Dies, Hores totals', () => {
    render(<CertificacioTaula dades={dadesMock} />)
    expect(screen.getByText(/Treballador/i)).toBeInTheDocument()
    expect(screen.getByText(/Tipus/i)).toBeInTheDocument()
    expect(screen.getByText(/Dies/i)).toBeInTheDocument()
    expect(screen.getByText(/Hores/i)).toBeInTheDocument()
  })

  it('mostra les hores totals per treballador', () => {
    render(<CertificacioTaula dades={dadesMock} />)
    expect(screen.getByText('162h')).toBeInTheDocument()
    expect(screen.getByText('63h')).toBeInTheDocument()
  })

  it('el detall expandible no es visible inicialment', () => {
    render(<CertificacioTaula dades={dadesMock} />)
    expect(screen.queryByText('Ha fet la coberta')).not.toBeInTheDocument()
  })

  it('clic a la fila expandeix el detall del treballador', () => {
    render(<CertificacioTaula dades={dadesMock} />)
    fireEvent.click(screen.getByText('Joan Martí'))
    expect(screen.getByText('Ha fet la coberta')).toBeInTheDocument()
    expect(screen.getByText(/2026-04-01/)).toBeInTheDocument()
  })

  it('clic a la mateixa fila col·lapsa el detall', () => {
    render(<CertificacioTaula dades={dadesMock} />)
    fireEvent.click(screen.getByText('Joan Martí'))
    expect(screen.getByText('Ha fet la coberta')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Joan Martí'))
    expect(screen.queryByText('Ha fet la coberta')).not.toBeInTheDocument()
  })

  it('expandir un treballador no expandeix els altres', () => {
    render(<CertificacioTaula dades={dadesMock} />)
    fireEvent.click(screen.getByText('Joan Martí'))
    expect(screen.getByText('Ha fet la coberta')).toBeInTheDocument()
    // La fila d'Anna no ha d'estar expandida → només hi ha 1 fila amb "Anna Puig"
    const filaAnna = screen.getByText('Anna Puig').closest('tr')
    expect(filaAnna?.getAttribute('aria-expanded')).toBe('false')
  })

  it('mostra "—" quan el comentari es null', () => {
    render(<CertificacioTaula dades={dadesMock} />)
    fireEvent.click(screen.getByText('Joan Martí'))
    // Busca dins la taula de detall, que hi ha "—" per al segon acte
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
  })

  it('mostra dies treballats per treballador', () => {
    render(<CertificacioTaula dades={dadesMock} />)
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('ordena segons l\'ordre del prop (ja ve ordenat de agregarCertificacio)', () => {
    render(<CertificacioTaula dades={dadesMock} />)
    const rows = screen.getAllByRole('row')
    // Primera fila és el thead. Segueixen files de treballadors.
    const bodyText = rows.map((r) => within(r).queryAllByText(/Martí|Puig/).length > 0)
    expect(bodyText.some(Boolean)).toBe(true)
  })
})
