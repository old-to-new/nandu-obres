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
  it('mostra les seccions de navegació', () => {
    render(<Sidebar />)
    // Use getAllByText since 'Obres' now appears in both logo and nav
    expect(screen.getAllByText('Obres').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Treballadors')).toBeInTheDocument()
    expect(screen.getByText('Planificació')).toBeInTheDocument()
  })

  it('marca la ruta activa amb el color de marca', () => {
    render(<Sidebar />)
    // The active link uses inline style with brand-red token instead of bg-blue-50 class
    // Emoji is aria-hidden so accessible name is just the text label
    const obresLink = screen.getByRole('link', { name: 'Obres' })
    expect(obresLink).toHaveStyle({ background: 'var(--sidebar-active-bg)' })
  })

  it('mostra el botó de tancar sessió', () => {
    render(<Sidebar />)
    expect(screen.getByRole('button', { name: /tancar sessió/i })).toBeInTheDocument()
  })
})
