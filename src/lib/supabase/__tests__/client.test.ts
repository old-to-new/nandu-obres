import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

describe('createBrowserClient', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('crea un client Supabase amb les env vars correctes', async () => {
    const { createBrowserClient } = await import('../client')
    const client = createBrowserClient()
    expect(client).toBeDefined()
    expect(typeof client.from).toBe('function')
    expect(typeof client.auth.signInWithPassword).toBe('function')
  })
})
