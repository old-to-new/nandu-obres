import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ObraFiltres from '../ObraFiltres'

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/obres',
}))

describe('ObraFiltres', () => {
  it('renderitza els selects de línia i estat', () => {
    render(<ObraFiltres />)
    expect(screen.getByLabelText(/línia/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/estat/i)).toBeInTheDocument()
  })

  it('mostra "Totes" com a opció per defecte a ambdós selects', () => {
    render(<ObraFiltres />)
    const liniaSelect = screen.getByLabelText(/línia/i)
    const estatSelect = screen.getByLabelText(/estat/i)
    expect(liniaSelect).toHaveValue('')
    expect(estatSelect).toHaveValue('')
  })

  it('crida router.replace amb els query params correctes en seleccionar línia', async () => {
    render(<ObraFiltres />)
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText(/línia/i), 'obra_nova')
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('linia=obra_nova'),
      expect.any(Object)
    )
  })

  it('crida router.replace amb els query params correctes en seleccionar estat', async () => {
    render(<ObraFiltres />)
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText(/estat/i), 'activa')
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('estat=activa'),
      expect.any(Object)
    )
  })
})
