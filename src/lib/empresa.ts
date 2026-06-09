import { createClient } from '@/lib/supabase/server'
import type { Empresa, RolEmpresa } from '@/lib/types/database'

export interface EmpresaContext {
  supabase: Awaited<ReturnType<typeof createClient>>
  empresa: Empresa
  empresaId: string
  rol: RolEmpresa
}

/**
 * Retorna l'empresa i el rol de l'usuari actual.
 * Retorna null si l'usuari no té sessió o no pertany a cap empresa.
 */
export async function getEmpresaActual(): Promise<{ empresa: Empresa; rol: RolEmpresa } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('empresa_membres')
    .select('rol, empresa:empreses(*)')
    .eq('user_id', user.id)
    .single()

  if (!data) return null
  return {
    empresa: data.empresa as unknown as Empresa,
    rol: data.rol as RolEmpresa,
  }
}

/**
 * Com getEmpresaActual però també retorna el client de Supabase per reutilitzar-lo.
 * Llença error si l'usuari no té empresa (ús en Server Actions).
 */
export async function getEmpresaContext(): Promise<EmpresaContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autoritzat')

  const { data } = await supabase
    .from('empresa_membres')
    .select('rol, empresa:empreses(*)')
    .eq('user_id', user.id)
    .single()

  if (!data) throw new Error('L\'usuari no pertany a cap empresa')

  const empresa = data.empresa as unknown as Empresa
  return { supabase, empresa, empresaId: empresa.id, rol: data.rol as RolEmpresa }
}

/**
 * Retorna únicament l'empresa_id. Versió curta per a Server Actions.
 */
export async function requireEmpresaId(): Promise<string> {
  const ctx = await getEmpresaContext()
  return ctx.empresaId
}
