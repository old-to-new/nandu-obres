import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ObraFotosPreview from '../ObraFotosPreview'
import type { ActeImatge } from '@/lib/types/database'

// Mock next/image — jsdom cannot process optimised images
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  },
}))

// Mock next/link — renders a plain <a>
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const makePhoto = (id: string): ActeImatge & { acte: { data: string } } => ({
  id,
  acte_id: 'acta-uuid-1',
  url: `https://storage.test/foto-${id}.jpg`,
  caption: null,
  created_at: `2026-04-18T10:0${id}:00Z`,
  acte: { data: '2026-04-18' },
})

describe('ObraFotosPreview', () => {
  it('mostra estat buit quan no hi ha fotos', () => {
    render(<ObraFotosPreview obraId="obra-1" fotos={[]} />)
    expect(
      screen.getByText(/encara no hi ha fotos/i)
    ).toBeInTheDocument()
  })

  it('no mostra el grid quan no hi ha fotos', () => {
    render(<ObraFotosPreview obraId="obra-1" fotos={[]} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renderitza fins a 4 fotos en el grid', () => {
    const fotos = [makePhoto('1'), makePhoto('2'), makePhoto('3'), makePhoto('4')]
    render(<ObraFotosPreview obraId="obra-1" fotos={fotos} />)
    expect(screen.getAllByRole('img')).toHaveLength(4)
  })

  it('renderitza correctament amb menys de 4 fotos', () => {
    const fotos = [makePhoto('1'), makePhoto('2')]
    render(<ObraFotosPreview obraId="obra-1" fotos={fotos} />)
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })

  it('mostra el link "Veure totes →" apuntant a la galeria', () => {
    const fotos = [makePhoto('1')]
    render(<ObraFotosPreview obraId="obra-uuid-1" fotos={fotos} />)
    const link = screen.getByRole('link', { name: /veure totes/i })
    expect(link).toHaveAttribute('href', '/obres/obra-uuid-1/galeria')
  })

  it('mostra el link "Veure totes →" fins i tot sense fotos', () => {
    render(<ObraFotosPreview obraId="obra-uuid-1" fotos={[]} />)
    const link = screen.getByRole('link', { name: /veure totes/i })
    expect(link).toHaveAttribute('href', '/obres/obra-uuid-1/galeria')
  })

  it('cada foto linka a la galeria', () => {
    const fotos = [makePhoto('1'), makePhoto('2')]
    render(<ObraFotosPreview obraId="obra-uuid-1" fotos={fotos} />)
    const links = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href') === '/obres/obra-uuid-1/galeria')
    // Header link + 2 photo links
    expect(links.length).toBeGreaterThanOrEqual(2)
  })
})
