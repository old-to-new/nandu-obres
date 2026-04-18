import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('renderitza el títol obligatori', () => {
    render(<EmptyState title="No hi ha obres" />)
    expect(screen.getByText('No hi ha obres')).toBeInTheDocument()
  })

  it('renderitza descripció opcional quan es passa', () => {
    render(
      <EmptyState
        title="No hi ha treballadors"
        description="Afegeix el primer treballador per començar."
      />
    )
    expect(screen.getByText(/Afegeix el primer treballador/)).toBeInTheDocument()
  })

  it('renderitza el botó d\'acció opcional', () => {
    render(
      <EmptyState
        title="No hi ha obres"
        actionLabel="Nova obra"
        actionHref="/obres/nova"
      />
    )
    const link = screen.getByRole('link', { name: 'Nova obra' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/obres/nova')
  })

  it('no renderitza botó si no es passen actionLabel i actionHref', () => {
    render(<EmptyState title="No hi ha obres" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('accepta className personalitzada', () => {
    const { container } = render(
      <EmptyState title="Test" className="mt-8" />
    )
    expect(container.firstChild).toHaveClass('mt-8')
  })
})
