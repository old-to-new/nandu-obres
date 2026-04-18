import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DocumentUpload from '../DocumentUpload'

vi.mock('@/app/(dashboard)/obres/actions', () => ({
  uploadDocument: vi.fn().mockResolvedValue(undefined),
}))

describe('DocumentUpload', () => {
  it('renderitza el títol i el botó de selecció', () => {
    render(
      <DocumentUpload
        obraId="obra-uuid-1"
        tipus="pressupost"
        label="Pressupost PDF"
        urlActual={null}
      />
    )
    expect(screen.getByText('Pressupost PDF')).toBeInTheDocument()
    expect(screen.getByLabelText(/seleccionar fitxer/i)).toBeInTheDocument()
  })

  it('mostra "No carregat" quan no hi ha URL', () => {
    render(
      <DocumentUpload
        obraId="obra-uuid-1"
        tipus="pressupost"
        label="Pressupost PDF"
        urlActual={null}
      />
    )
    expect(screen.getByText(/no carregat/i)).toBeInTheDocument()
  })

  it('mostra link "Obrir PDF" quan hi ha URL', () => {
    render(
      <DocumentUpload
        obraId="obra-uuid-1"
        tipus="pressupost"
        label="Pressupost PDF"
        urlActual="https://storage.supabase.co/obra-docs/obra-uuid-1/pressupost.pdf"
      />
    )
    const link = screen.getByRole('link', { name: /obrir pdf/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', expect.stringContaining('pressupost.pdf'))
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('accepta només fitxers PDF i imatges', () => {
    render(
      <DocumentUpload
        obraId="obra-uuid-1"
        tipus="projecte"
        label="Plànols"
        urlActual={null}
      />
    )
    const input = screen.getByLabelText(/seleccionar fitxer/i)
    expect(input).toHaveAttribute('accept', 'application/pdf,image/*')
  })
})
