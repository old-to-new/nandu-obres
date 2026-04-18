import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Sidebar from '../Sidebar'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/obres'),
}))

vi.mock('@/app/(auth)/login/actions', () => ({
  signOut: vi.fn(),
}))

describe('Sidebar', () => {
  it('mostra les 3 seccions de navegació', () => {
    render(<Sidebar />)
    expect(screen.getByText('Obres')).toBeInTheDocument()
    expect(screen.getByText('Treballadors')).toBeInTheDocument()
    expect(screen.getByText('Planificació')).toBeInTheDocument()
  })

  it('marca la ruta activa amb bg-blue-50', () => {
    render(<Sidebar />)
    const obresLink = screen.getByRole('link', { name: /obres/i })
    expect(obresLink).toHaveClass('bg-blue-50')
  })

  it('mostra el botó de tancar sessió', () => {
    render(<Sidebar />)
    expect(screen.getByRole('button', { name: /tancar sessió/i })).toBeInTheDocument()
  })
})
