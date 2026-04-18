import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActaGaleria from '../ActaGaleria'
import type { ActeImatge } from '@/lib/types/database'

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  },
}))

// Mock next/link
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

// Mock yet-another-react-lightbox — we test state, not the real lightbox UI
vi.mock('yet-another-react-lightbox', () => ({
  default: ({
    open,
    slides,
    close,
  }: {
    open: boolean
    slides: { src: string }[]
    close: () => void
  }) =>
    open ? (
      <div data-testid="lightbox" aria-label="lightbox">
        <span data-testid="lightbox-slide-count">{slides.length}</span>
        <button onClick={close} aria-label="tancar lightbox">
          ×
        </button>
      </div>
    ) : null,
}))

// Mock the CSS import from yet-another-react-lightbox
vi.mock('yet-another-react-lightbox/styles.css', () => ({}))

type ImatgeAmbData = ActeImatge & { acta_data: string; acte_id: string }

const makeImatge = (
  id: string,
  acta_data: string,
  acte_id: string,
  created_at: string,
  caption: string | null = null
): ImatgeAmbData => ({
  id,
  acte_id,
  acta_data,
  url: `https://storage.test/foto-${id}.jpg`,
  caption,
  created_at,
})

describe('ActaGaleria — estat buit', () => {
  it('mostra missatge quan no hi ha fotos', () => {
    render(<ActaGaleria imatges={[]} obraId="obra-1" />)
    expect(
      screen.getByText(/no hi ha fotos per a aquesta obra/i)
    ).toBeInTheDocument()
  })
})

describe('ActaGaleria — agrupació i ordenació', () => {
  const imatges: ImatgeAmbData[] = [
    // Acta del 18 d'abril — 2 fotos (uploaded later → listed first within group)
    makeImatge('img-3', '2026-04-18', 'acta-2', '2026-04-18T11:00:00Z'),
    makeImatge('img-4', '2026-04-18', 'acta-2', '2026-04-18T09:00:00Z'),
    // Acta del 17 d'abril — 1 foto
    makeImatge('img-1', '2026-04-17', 'acta-1', '2026-04-17T10:00:00Z'),
  ]

  it('agrupa les fotos per data d\'acta i mostra els grups en ordre decreixent', () => {
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    const headings = screen.getAllByRole('heading', { level: 3 })
    // First heading should contain "abril" for the later date (18)
    expect(headings[0].textContent?.toLowerCase()).toContain('18')
    expect(headings[1].textContent?.toLowerCase()).toContain('17')
  })

  it('dins d\'un grup, les fotos apareixen en ordre de created_at descendent', () => {
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    const imgs = screen.getAllByRole('img')
    // img-3 (11:00) should come before img-4 (09:00) — both in the 18-Apr group
    const src3 = imgs.findIndex((img) => img.getAttribute('src')?.includes('img-3'))
    const src4 = imgs.findIndex((img) => img.getAttribute('src')?.includes('img-4'))
    expect(src3).toBeLessThan(src4)
  })
})

describe('ActaGaleria — tooltip hora de pujada', () => {
  it('cada foto té un title amb l\'hora de pujada', () => {
    const imatges: ImatgeAmbData[] = [
      makeImatge('img-1', '2026-04-18', 'acta-1', '2026-04-18T10:30:00Z'),
    ]
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    // The clickable wrapper should have a title attribute with the upload time
    const button = screen.getByRole('button', { name: /foto d'obra/i })
    expect(button).toHaveAttribute('title')
    expect(button.getAttribute('title')).toMatch(/10:30/)
  })
})

describe('ActaGaleria — lightbox', () => {
  const imatges: ImatgeAmbData[] = [
    makeImatge('img-1', '2026-04-18', 'acta-1', '2026-04-18T10:00:00Z', 'Teulada'),
    makeImatge('img-2', '2026-04-18', 'acta-1', '2026-04-18T09:00:00Z'),
  ]

  it('el lightbox NO és visible inicialment', () => {
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument()
  })

  it('clicar una foto obre el lightbox', async () => {
    const user = userEvent.setup()
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    expect(screen.getByTestId('lightbox')).toBeInTheDocument()
  })

  it('el lightbox rep totes les diapositives del grup', async () => {
    const user = userEvent.setup()
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    // 2 imatges en el grup
    expect(screen.getByTestId('lightbox-slide-count').textContent).toBe('2')
  })

  it('tancar el lightbox l\'amaga', async () => {
    const user = userEvent.setup()
    render(<ActaGaleria imatges={imatges} obraId="obra-1" />)
    await user.click(screen.getAllByRole('button')[0])
    expect(screen.getByTestId('lightbox')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /tancar lightbox/i }))
    expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument()
  })
})
