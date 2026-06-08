import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ObraForm from '../ObraForm'
import type { Obra, Categoria } from '@/lib/types/database'

// Stable mock ref so we can assert on it
const mockPush = vi.fn()

// Mocks
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))
vi.mock('@/app/(dashboard)/obres/actions', () => ({
  createObra: vi.fn(),
  updateObra: vi.fn(),
}))

import { createObra, updateObra } from '@/app/(dashboard)/obres/actions'

const mockLinies: Categoria[] = [
  { id: '1', tipus: 'linia_obra', valor: 'obra_nova', etiqueta: 'Obra nova', ordre: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: '2', tipus: 'linia_obra', valor: 'rehabilitacio', etiqueta: 'Rehabilitació', ordre: 2, created_at: '2026-01-01T00:00:00Z' },
  { id: '3', tipus: 'linia_obra', valor: 'ascensors', etiqueta: 'Ascensors', ordre: 3, created_at: '2026-01-01T00:00:00Z' },
  { id: '4', tipus: 'linia_obra', valor: 'altres', etiqueta: 'Altres', ordre: 4, created_at: '2026-01-01T00:00:00Z' },
]

const mockEstats: Categoria[] = [
  { id: '5', tipus: 'estat_obra', valor: 'activa', etiqueta: 'Activa', ordre: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: '6', tipus: 'estat_obra', valor: 'pausada', etiqueta: 'Pausada', ordre: 2, created_at: '2026-01-01T00:00:00Z' },
  { id: '7', tipus: 'estat_obra', valor: 'finalitzada', etiqueta: 'Finalitzada', ordre: 3, created_at: '2026-01-01T00:00:00Z' },
]

const obraExistent: Obra = {
  id: 'obra-uuid-1',
  nom: 'Casa Test',
  client_nom: 'Client Test',
  linia: 'obra_nova',
  estat: 'activa',
  pressupost_pdf_url: null,
  projecte_pdf_url: null,
  notes: 'Nota de prova',
  matterport_model_id: null,
  matterport_estat: null,
  created_at: '2026-04-18T10:00:00Z',
}

describe('ObraForm — mode creació', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockReset()
  })

  it('renderitza tots els camps necessaris', () => {
    render(<ObraForm linies={mockLinies} estats={mockEstats} />)
    expect(screen.getByLabelText(/nom de l'obra/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/client/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/línia/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/estat/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear obra/i })).toBeInTheDocument()
  })

  it('els selects de línia contenen les 4 opcions', () => {
    render(<ObraForm linies={mockLinies} estats={mockEstats} />)
    const select = screen.getByLabelText(/línia/i)
    expect(select).toContainElement(screen.getByText('Obra nova'))
    expect(select).toContainElement(screen.getByText('Rehabilitació'))
    expect(select).toContainElement(screen.getByText('Ascensors'))
    expect(select).toContainElement(screen.getByText('Altres'))
  })

  it('els selects d\'estat contenen les 3 opcions', () => {
    render(<ObraForm linies={mockLinies} estats={mockEstats} />)
    const select = screen.getByLabelText(/estat/i)
    expect(select).toContainElement(screen.getByText('Activa'))
    expect(select).toContainElement(screen.getByText('Pausada'))
    expect(select).toContainElement(screen.getByText('Finalitzada'))
  })

  it('crida createObra en mode creació i no mostra error si NEXT_REDIRECT', async () => {
    // Replicar l'objecte que llança Next.js redirect() — isRedirectError comprova .digest
    // Format: "NEXT_REDIRECT;<type>;<destination>;<statusCode>;" (trailing semicolon obligatori)
    const NEXT_REDIRECT_ERR = Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT;push;/obres;307;',
    })
    vi.mocked(createObra).mockRejectedValue(NEXT_REDIRECT_ERR)

    render(<ObraForm linies={mockLinies} estats={mockEstats} />)

    fireEvent.change(screen.getByLabelText(/nom de l'obra/i), {
      target: { value: 'Test Obra' },
    })
    fireEvent.change(screen.getByLabelText(/client/i), {
      target: { value: 'Client Test' },
    })
    fireEvent.click(screen.getByRole('button', { name: /crear obra/i }))

    await waitFor(() => {
      expect(createObra).toHaveBeenCalledOnce()
    })

    // No hauria de mostrar missatge d'error per NEXT_REDIRECT
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mostra missatge d\'error si createObra llança error real', async () => {
    vi.mocked(createObra).mockRejectedValue(new Error('DB connection failed'))

    render(<ObraForm linies={mockLinies} estats={mockEstats} />)

    fireEvent.change(screen.getByLabelText(/nom de l'obra/i), {
      target: { value: 'Test' },
    })
    fireEvent.change(screen.getByLabelText(/client/i), {
      target: { value: 'Client' },
    })
    fireEvent.click(screen.getByRole('button', { name: /crear obra/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/DB connection failed/i)).toBeInTheDocument()
    })
  })
})

describe('ObraForm — mode edició', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockReset()
  })

  it('pre-omple els camps amb les dades de l\'obra existent', () => {
    render(<ObraForm obra={obraExistent} linies={mockLinies} estats={mockEstats} />)
    expect(screen.getByLabelText(/nom de l'obra/i)).toHaveValue('Casa Test')
    expect(screen.getByLabelText(/client/i)).toHaveValue('Client Test')
    expect(screen.getByLabelText(/notes/i)).toHaveValue('Nota de prova')
    expect(screen.getByRole('button', { name: /guardar canvis/i })).toBeInTheDocument()
  })

  it('permet modificar el nom i reflecteix el canvi', async () => {
    render(<ObraForm obra={obraExistent} linies={mockLinies} estats={mockEstats} />)
    const user = userEvent.setup()
    const nomInput = screen.getByLabelText(/nom de l'obra/i)
    await user.clear(nomInput)
    await user.type(nomInput, 'Casa Renovada')
    expect(nomInput).toHaveValue('Casa Renovada')
  })

  it('crida updateObra en mode edició i navega a la pàgina de l\'obra', async () => {
    vi.mocked(updateObra).mockResolvedValue(undefined)

    render(<ObraForm obra={obraExistent} linies={mockLinies} estats={mockEstats} />)

    fireEvent.click(screen.getByRole('button', { name: /guardar canvis/i }))

    await waitFor(() => {
      expect(updateObra).toHaveBeenCalledWith('obra-uuid-1', expect.any(FormData))
      expect(mockPush).toHaveBeenCalledWith('/obres/obra-uuid-1')
    })
  })
})
