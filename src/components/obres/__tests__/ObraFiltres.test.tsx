import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ObraFiltres from '../ObraFiltres'
import type { Categoria } from '@/lib/types/database'

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/obres',
}))

const mockLinies: Categoria[] = [
  { id: '1', tipus: 'linia_obra', valor: 'obra_nova', etiqueta: 'Obra nova', ordre: 1, color: null, empresa_id: 'emp-1', created_at: '2026-01-01T00:00:00Z' },
  { id: '2', tipus: 'linia_obra', valor: 'rehabilitacio', etiqueta: 'Rehabilitació', ordre: 2, color: null, empresa_id: 'emp-1', created_at: '2026-01-01T00:00:00Z' },
  { id: '3', tipus: 'linia_obra', valor: 'ascensors', etiqueta: 'Ascensors', ordre: 3, color: null, empresa_id: 'emp-1', created_at: '2026-01-01T00:00:00Z' },
  { id: '4', tipus: 'linia_obra', valor: 'altres', etiqueta: 'Altres', ordre: 4, color: null, empresa_id: 'emp-1', created_at: '2026-01-01T00:00:00Z' },
]

const mockEstats: Categoria[] = [
  { id: '5', tipus: 'estat_obra', valor: 'activa', etiqueta: 'Activa', ordre: 1, color: null, empresa_id: 'emp-1', created_at: '2026-01-01T00:00:00Z' },
  { id: '6', tipus: 'estat_obra', valor: 'pausada', etiqueta: 'Pausada', ordre: 2, color: null, empresa_id: 'emp-1', created_at: '2026-01-01T00:00:00Z' },
  { id: '7', tipus: 'estat_obra', valor: 'finalitzada', etiqueta: 'Finalitzada', ordre: 3, color: null, empresa_id: 'emp-1', created_at: '2026-01-01T00:00:00Z' },
]

describe('ObraFiltres', () => {
  it('renderitza els selects de línia i estat', () => {
    render(<ObraFiltres linies={mockLinies} estats={mockEstats} />)
    expect(screen.getByLabelText(/línia/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/estat/i)).toBeInTheDocument()
  })

  it('mostra "Totes" com a opció per defecte a ambdós selects', () => {
    render(<ObraFiltres linies={mockLinies} estats={mockEstats} />)
    const liniaSelect = screen.getByLabelText(/línia/i)
    const estatSelect = screen.getByLabelText(/estat/i)
    expect(liniaSelect).toHaveValue('')
    expect(estatSelect).toHaveValue('')
  })

  it('crida router.replace amb els query params correctes en seleccionar línia', async () => {
    render(<ObraFiltres linies={mockLinies} estats={mockEstats} />)
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText(/línia/i), 'obra_nova')
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('linia=obra_nova'),
      expect.any(Object)
    )
  })

  it('crida router.replace amb els query params correctes en seleccionar estat', async () => {
    render(<ObraFiltres linies={mockLinies} estats={mockEstats} />)
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText(/estat/i), 'activa')
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('estat=activa'),
      expect.any(Object)
    )
  })
})
