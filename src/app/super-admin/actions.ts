'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

// ── Categories per defecte ────────────────────────────────

interface CategoriaDefecte {
  tipus: string
  valor: string
  etiqueta: string
  ordre: number
  color: string
}

const CATEGORIES_DEFECTE: CategoriaDefecte[] = [
  // Línies d'obra
  { tipus: 'linia_obra', valor: 'construccio', etiqueta: 'Construcció', ordre: 0, color: '#3b82f6' },
  { tipus: 'linia_obra', valor: 'rehabilitacio', etiqueta: 'Rehabilitació', ordre: 1, color: '#8b5cf6' },
  { tipus: 'linia_obra', valor: 'obra_nova', etiqueta: 'Obra nova', ordre: 2, color: '#10b981' },
  { tipus: 'linia_obra', valor: 'reforma', etiqueta: 'Reforma', ordre: 3, color: '#f59e0b' },
  // Estats d'obra
  { tipus: 'estat_obra', valor: 'activa', etiqueta: 'Activa', ordre: 0, color: '#22c55e' },
  { tipus: 'estat_obra', valor: 'acabada', etiqueta: 'Acabada', ordre: 1, color: '#6b7280' },
  { tipus: 'estat_obra', valor: 'pendent', etiqueta: 'Pendent', ordre: 2, color: '#f59e0b' },
  { tipus: 'estat_obra', valor: 'paralitzada', etiqueta: 'Paralitzada', ordre: 3, color: '#ef4444' },
  // Tipus treballador
  { tipus: 'tipus_treballador', valor: 'oficial', etiqueta: 'Oficial', ordre: 0, color: '#3b82f6' },
  { tipus: 'tipus_treballador', valor: 'peo', etiqueta: 'Peó', ordre: 1, color: '#6b7280' },
  { tipus: 'tipus_treballador', valor: 'encarregat', etiqueta: 'Encarregat', ordre: 2, color: '#f59e0b' },
]

// ── Helpers ───────────────────────────────────────────────

export async function isSuperAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return false

  const allowed = (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  return allowed.includes(user.email.toLowerCase())
}

// ── Crear empresa ─────────────────────────────────────────

export async function createEmpresa(
  _prevState: { error: string | null; success: string | null },
  formData: FormData
): Promise<{ error: string | null; success: string | null }> {
  try {
    if (!(await isSuperAdmin())) return { error: 'No autoritzat', success: null }

    const nom = (formData.get('nom') as string).trim()
    const subtitol = (formData.get('subtitol') as string).trim() || null
    const logo_url = (formData.get('logo_url') as string).trim() || null
    const email_admin = (formData.get('email_admin') as string).trim().toLowerCase()

    if (!nom) return { error: 'El nom és obligatori', success: null }
    if (!email_admin) return { error: 'L\'email de l\'admin és obligatori', success: null }

    const service = createServiceClient()

    // Crear empresa
    const { data: empresa, error: empresaError } = await service
      .from('empreses')
      .insert({ nom, subtitol, logo_url })
      .select()
      .single()

    if (empresaError || !empresa) {
      return { error: empresaError?.message ?? 'Error creant empresa', success: null }
    }

    // Convidar el primer admin
    const { data: inviteData, error: inviteError } =
      await service.auth.admin.inviteUserByEmail(email_admin)

    if (inviteError || !inviteData?.user) {
      // Empresa creada però invite fallat — retornem warning
      return {
        error: `Empresa creada (id: ${empresa.id}) però l'invitació ha fallat: ${inviteError?.message ?? 'Error desconegut'}. Afegiu el membre manualment.`,
        success: null,
      }
    }

    const { error: membreError } = await service
      .from('empresa_membres')
      .insert({
        empresa_id: empresa.id,
        user_id: inviteData.user.id,
        rol: 'admin',
        email: email_admin,
      })

    if (membreError) {
      return {
        error: `Empresa creada i usuari convidat però no s'ha pogut afegir com a membre: ${membreError.message}`,
        success: null,
      }
    }

    // Inserir categories per defecte
    const categoriesAmbEmpresa = CATEGORIES_DEFECTE.map((c) => ({
      ...c,
      empresa_id: empresa.id,
    }))
    await service.from('categories').insert(categoriesAmbEmpresa)

    revalidatePath('/super-admin')
    return { error: null, success: `Empresa "${nom}" creada i invitació enviada a ${email_admin}` }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut', success: null }
  }
}

// ── Convidar membre addicional a empresa existent ─────────

export async function inviteToEmpresa(
  _prevState: { error: string | null; success: string | null },
  formData: FormData
): Promise<{ error: string | null; success: string | null }> {
  try {
    if (!(await isSuperAdmin())) return { error: 'No autoritzat', success: null }

    const empresa_id = (formData.get('empresa_id') as string).trim()
    const email = (formData.get('email') as string).trim().toLowerCase()
    const rol = (formData.get('rol') as string) === 'admin' ? 'admin' : 'membre'

    if (!empresa_id || !email) return { error: 'Camps obligatoris', success: null }

    const service = createServiceClient()

    const { data: inviteData, error: inviteError } =
      await service.auth.admin.inviteUserByEmail(email)

    if (inviteError || !inviteData?.user) {
      return { error: inviteError?.message ?? 'Error convidant l\'usuari', success: null }
    }

    // Comprovar si ja és membre
    const { data: existing } = await service
      .from('empresa_membres')
      .select('id')
      .eq('empresa_id', empresa_id)
      .eq('user_id', inviteData.user.id)
      .maybeSingle()

    if (existing) {
      return { error: null, success: `${email} ja és membre d'aquesta empresa` }
    }

    const { error: membreError } = await service
      .from('empresa_membres')
      .insert({ empresa_id, user_id: inviteData.user.id, rol, email })

    if (membreError) return { error: membreError.message, success: null }

    revalidatePath('/super-admin')
    return { error: null, success: `Invitació enviada a ${email}` }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut', success: null }
  }
}

// ── Eliminar membre d'empresa ─────────────────────────────

export async function removeMemberFromEmpresa(membreId: string): Promise<{ error: string | null }> {
  try {
    if (!(await isSuperAdmin())) return { error: 'No autoritzat' }

    const service = createServiceClient()
    const { error } = await service.from('empresa_membres').delete().eq('id', membreId)
    if (error) return { error: error.message }

    revalidatePath('/super-admin')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}

// ── Eliminar empresa ──────────────────────────────────────

export async function deleteEmpresa(empresaId: string): Promise<{ error: string | null }> {
  try {
    if (!(await isSuperAdmin())) return { error: 'No autoritzat' }

    const service = createServiceClient()
    const { error } = await service.from('empreses').delete().eq('id', empresaId)
    if (error) return { error: error.message }

    revalidatePath('/super-admin')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}
