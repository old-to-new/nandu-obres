import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../LoginForm'

const mockSignIn = vi.fn()
vi.mock('@/app/(auth)/login/actions', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}))

describe('LoginForm', () => {
  it('renderitza camp email i contrasenya', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/correu/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contrasenya/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('no crida signIn si els camps estan buits (HTML5 validation)', async () => {
    render(<LoginForm />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('permet introduir email i contrasenya', async () => {
    render(<LoginForm />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/correu/i), 'nandu@empresa.cat')
    await user.type(screen.getByLabelText(/contrasenya/i), 'password123')
    expect(screen.getByLabelText(/correu/i)).toHaveValue('nandu@empresa.cat')
    expect(screen.getByLabelText(/contrasenya/i)).toHaveValue('password123')
  })
})
