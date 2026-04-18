import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActaFotosUpload from '../ActaFotosUpload'

vi.mock('@/app/(dashboard)/obres/[id]/actions', () => ({
  uploadFoto: vi.fn().mockResolvedValue(undefined),
  eliminarFoto: vi.fn().mockResolvedValue(undefined),
}))

// Mock next/image per evitar configuracions en tests
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  },
}))

describe('ActaFotosUpload', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderitza l\'input de selecció de fitxers', () => {
    render(
      <ActaFotosUpload
        obraId="obra-uuid-1"
        acteId="acta-uuid-1"
        fotosInicials={[]}
      />
    )
    expect(screen.getByLabelText(/afegir fotos/i)).toBeInTheDocument()
  })

  it('accepta imatges (no PDFs)', () => {
    render(
      <ActaFotosUpload
        obraId="obra-uuid-1"
        acteId="acta-uuid-1"
        fotosInicials={[]}
      />
    )
    const input = screen.getByLabelText(/afegir fotos/i)
    expect(input).toHaveAttribute('accept', 'image/*')
    expect(input).toHaveAttribute('multiple')
  })

  it('mostra les fotos inicials com a thumbnails', () => {
    const fotos = [
      { id: 'img-1', acte_id: 'acta-uuid-1', url: 'https://storage.test/foto1.jpg', caption: null, created_at: '2026-04-18' },
      { id: 'img-2', acte_id: 'acta-uuid-1', url: 'https://storage.test/foto2.jpg', caption: 'Teulada', created_at: '2026-04-18' },
    ]
    render(
      <ActaFotosUpload
        obraId="obra-uuid-1"
        acteId="acta-uuid-1"
        fotosInicials={fotos}
      />
    )
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
    expect(screen.getByAltText('Teulada')).toBeInTheDocument()
  })

  it('mostra botó eliminar per a cada foto', () => {
    const fotos = [
      { id: 'img-1', acte_id: 'acta-uuid-1', url: 'https://storage.test/foto1.jpg', caption: null, created_at: '2026-04-18' },
    ]
    render(
      <ActaFotosUpload
        obraId="obra-uuid-1"
        acteId="acta-uuid-1"
        fotosInicials={fotos}
      />
    )
    expect(screen.getByRole('button', { name: /eliminar foto/i })).toBeInTheDocument()
  })
})
