import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TreballadorsLlista from '../TreballadorsLlista'
import type { Treballador } from '@/lib/types/database'

const treballadors: Treballador[] = [
  {
    id: 'uuid-1',
    nom: 'Albert Font',
    tipus: 'oficial',
    actiu: true,
    telefon: '600111222',
    notes: null,
    encarregat: 'nandu',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'uuid-2',
    nom: 'Joan Martí',
    tipus: 'peo',
    actiu: true,
    telefon: null,
    notes: null,
    encarregat: 'pare',
    created_at: '2026-01-02T00:00:00Z',
  },
  {
    id: 'uuid-3',
    nom: 'Miquel Serra',
    tipus: 'oficial_2a',
    actiu: false,
    telefon: '611000111',
    notes: null,
    encarregat: 'nandu',
    created_at: '2026-01-03T00:00:00Z',
  },
  {
    id: 'uuid-4',
    nom: 'Pere Gómez',
    tipus: 'altre',
    actiu: true,
    telefon: null,
    notes: null,
    encarregat: null,
    created_at: '2026-01-04T00:00:00Z',
  },
]

describe('TreballadorsLlista — render inicial', () => {
  it('mostra el títol "Treballadors"', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByRole('heading', { name: /treballadors/i })).toBeInTheDocument()
  })

  it('mostra el botó "Nou treballador"', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByRole('link', { name: /nou treballador/i })).toHaveAttribute('href', '/treballadors/nou')
  })

  it('per defecte mostra els 3 treballadors actius (oculta inactius)', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByText('Albert Font')).toBeInTheDocument()
    expect(screen.getByText('Joan Martí')).toBeInTheDocument()
    expect(screen.getByText('Pere Gómez')).toBeInTheDocument()
    expect(screen.queryByText('Miquel Serra')).not.toBeInTheDocument()
  })

  it('mostra el comptador de treballadors visibles', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    expect(screen.getByText(/3 treballadors/i)).toBeInTheDocument()
  })

  it('cada fila és un link a la fitxa del treballador', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const link = screen.getByRole('link', { name: /albert font/i })
    expect(link).toHaveAttribute('href', '/treballadors/uuid-1')
  })
})

describe("TreballadorsLlista — badge d'equip", () => {
  it('mostra el badge "Equip Nandu" per treballadors de Nandu', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const badges = screen.getAllByText('Equip Nandu')
    expect(badges.length).toBeGreaterThanOrEqual(1)
  })

  it('mostra el badge "Equip Pare" per treballadors del Pare', () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const badges = screen.getAllByText('Equip Pare')
    expect(badges.length).toBeGreaterThanOrEqual(1)
  })

  it("no mostra badge d'equip per treballadors sense assignar", () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    // Pere Gómez (uuid-4) no té encarregat
    const row = screen.getByRole('link', { name: /pere gómez/i })
    expect(row).not.toHaveTextContent('Equip Nandu')
    expect(row).not.toHaveTextContent('Equip Pare')
  })
})

describe('TreballadorsLlista — filtre per equip', () => {
  it('filtrar per "Equip Nandu" mostra només treballadors de Nandu actius', async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /equip nandu/i }))

    expect(screen.getByText('Albert Font')).toBeInTheDocument()
    expect(screen.queryByText('Joan Martí')).not.toBeInTheDocument()
    expect(screen.queryByText('Pere Gómez')).not.toBeInTheDocument()
  })

  it('filtrar per "Equip Pare" mostra només treballadors del Pare actius', async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /equip pare/i }))

    expect(screen.getByText('Joan Martí')).toBeInTheDocument()
    expect(screen.queryByText('Albert Font')).not.toBeInTheDocument()
  })

  it('filtrar per "Tots" restaura la vista amb tots els actius', async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /equip nandu/i }))
    await user.click(screen.getByRole('button', { name: /tots/i }))

    expect(screen.getByText('Albert Font')).toBeInTheDocument()
    expect(screen.getByText('Joan Martí')).toBeInTheDocument()
  })
})

describe('TreballadorsLlista — filtre inactius', () => {
  it('activar "Veure inactius" mostra el treballador inactiu', async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /veure inactius/i }))

    expect(screen.getByText('Miquel Serra')).toBeInTheDocument()
  })

  it('el treballador inactiu té el badge "Inactiu"', async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /veure inactius/i }))

    expect(screen.getByText('Inactiu')).toBeInTheDocument()
  })

  it('tornar a clicar oculta els inactius', async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /veure inactius/i }))
    await user.click(screen.getByRole('button', { name: /amagar inactius/i }))

    expect(screen.queryByText('Miquel Serra')).not.toBeInTheDocument()
  })

  it("filtre d'equip + inactius: Nandu amb inactius mostra Albert i Miquel", async () => {
    render(<TreballadorsLlista treballadors={treballadors} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /equip nandu/i }))
    await user.click(screen.getByRole('button', { name: /veure inactius/i }))

    expect(screen.getByText('Albert Font')).toBeInTheDocument()
    expect(screen.getByText('Miquel Serra')).toBeInTheDocument()
    expect(screen.queryByText('Joan Martí')).not.toBeInTheDocument()
  })
})

describe('TreballadorsLlista — estat buit', () => {
  it('mostra missatge quan no hi ha treballadors visibles', async () => {
    render(<TreballadorsLlista treballadors={[]} />)
    expect(screen.getByText(/no hi ha treballadors/i)).toBeInTheDocument()
  })
})
