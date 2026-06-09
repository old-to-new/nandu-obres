import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActaTreballadorsEditor from '../ActaTreballadorsEditor'
import type { Treballador } from '@/lib/types/database'

const treballadorsDisponibles: Treballador[] = [
  { id: 'treb-1', nom: 'Joan Martí', tipus: 'oficial', actiu: true, telefon: null, notes: null, encarregat: null, empresa_id: 'emp-1', created_at: '2026-01-01' },
  { id: 'treb-2', nom: 'Pau Ferrer', tipus: 'oficial_2a', actiu: true, telefon: null, notes: null, encarregat: null, empresa_id: 'emp-1', created_at: '2026-01-01' },
  { id: 'treb-3', nom: 'Marc Soler', tipus: 'peo', actiu: true, telefon: null, notes: null, encarregat: null, empresa_id: 'emp-1', created_at: '2026-01-01' },
]

const initialTreballadors = [
  { treballadorId: 'treb-1', hores: 9, comentari: '', planificat: true },
  { treballadorId: 'treb-2', hores: 9, comentari: '', planificat: true },
]

const mockOnChange = vi.fn()

describe('ActaTreballadorsEditor — renderització inicial', () => {
  beforeEach(() => vi.clearAllMocks())

  it('mostra els treballadors planificats pre-carregats', () => {
    render(
      <ActaTreballadorsEditor
        treballadorsDisponibles={treballadorsDisponibles}
        initialTreballadors={initialTreballadors}
        onChange={mockOnChange}
      />
    )
    expect(screen.getByText('Joan Martí')).toBeInTheDocument()
    expect(screen.getByText('Pau Ferrer')).toBeInTheDocument()
  })

  it('marca amb badge "Planificat" els treballadors planificat=true', () => {
    render(
      <ActaTreballadorsEditor
        treballadorsDisponibles={treballadorsDisponibles}
        initialTreballadors={initialTreballadors}
        onChange={mockOnChange}
      />
    )
    const badges = screen.getAllByText('Planificat')
    expect(badges).toHaveLength(2)
  })

  it('mostra el default de 9h per a cada treballador planificat', () => {
    render(
      <ActaTreballadorsEditor
        treballadorsDisponibles={treballadorsDisponibles}
        initialTreballadors={initialTreballadors}
        onChange={mockOnChange}
      />
    )
    const inputs = screen.getAllByRole('spinbutton') // inputs type="number"
    expect(inputs).toHaveLength(2)
    inputs.forEach((input) => expect(input).toHaveValue(9))
  })
})

describe('ActaTreballadorsEditor — edició local (sense crides al servidor)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('permet canviar les hores i crida onChange amb el nou estat', async () => {
    render(
      <ActaTreballadorsEditor
        treballadorsDisponibles={treballadorsDisponibles}
        initialTreballadors={initialTreballadors}
        onChange={mockOnChange}
      />
    )
    const user = userEvent.setup()
    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[0])
    await user.type(inputs[0], '7.5')

    // onChange ha de ser cridat amb el nou estat
    expect(mockOnChange).toHaveBeenCalled()
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall[0].hores).toBe(7.5)
  })

  it('mostra avís visual quan les hores totals ≠ 9h (no bloqueja)', async () => {
    render(
      <ActaTreballadorsEditor
        treballadorsDisponibles={treballadorsDisponibles}
        initialTreballadors={initialTreballadors}
        onChange={mockOnChange}
      />
    )
    const user = userEvent.setup()
    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[0])
    await user.type(inputs[0], '5')

    // L'avís ha d'aparèixer però el formulari no ha de bloquejar-se
    expect(screen.getAllByText(/hores/i).length).toBeGreaterThan(0)
    // Verificar que el camp segueix actiu (no disabled)
    expect(inputs[0]).not.toBeDisabled()
  })

  it('afegir un treballador no planificat li assigna planificat=false', async () => {
    render(
      <ActaTreballadorsEditor
        treballadorsDisponibles={treballadorsDisponibles}
        initialTreballadors={initialTreballadors}
        onChange={mockOnChange}
      />
    )
    const user = userEvent.setup()

    // Marc Soler no estava planificat — seleccionar al desplegable d'afegir
    const addSelect = screen.getByRole('combobox', { name: /afegir treballador/i })
    await user.selectOptions(addSelect, 'treb-3')

    // Ha d'aparèixer Marc Soler sense badge "Planificat"
    expect(screen.getByText('Marc Soler')).toBeInTheDocument()

    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    const marcEntry = lastCall.find((t: { treballadorId: string }) => t.treballadorId === 'treb-3')
    expect(marcEntry.planificat).toBe(false)
    expect(marcEntry.hores).toBe(9) // default
  })

  it('eliminar un treballador el treu de la llista i actualitza onChange', async () => {
    render(
      <ActaTreballadorsEditor
        treballadorsDisponibles={treballadorsDisponibles}
        initialTreballadors={initialTreballadors}
        onChange={mockOnChange}
      />
    )
    const user = userEvent.setup()

    // Clicar el botó d'eliminar del primer treballador
    const botonesEliminar = screen.getAllByRole('button', { name: /eliminar/i })
    await user.click(botonesEliminar[0])

    // Joan Martí ha de desaparèixer
    expect(screen.queryByText('Joan Martí')).not.toBeInTheDocument()

    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall).toHaveLength(1)
    expect(lastCall[0].treballadorId).toBe('treb-2')
  })
})
