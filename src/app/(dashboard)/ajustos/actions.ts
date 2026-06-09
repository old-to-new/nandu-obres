'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getEmpresaContext } from '@/lib/empresa'

function toValor(etiqueta: string): string {
  return etiqueta
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

// ── Empresa ──────────────────────────────────────────────

export async function updateEmpresa(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  try {
    const { supabase, empresaId } = await getEmpresaContext()
    const nom = (formData.get('nom') as string).trim()
    const subtitol = (formData.get('subtitol') as string).trim() || null
    const logo_url = (formData.get('logo_url') as string).trim() || null

    if (!nom) return { error: 'El nom és obligatori' }

    const { error } = await supabase
      .from('empreses')
      .update({ nom, subtitol, logo_url })
      .eq('id', empresaId)

    if (error) return { error: error.message }
    revalidatePath('/', 'layout')
    revalidatePath('/ajustos')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}

// ── Membres ───────────────────────────────────────────────

export async function inviteMembre(
  _prevState: { error: string | null; success: string | null },
  formData: FormData
): Promise<{ error: string | null; success: string | null }> {
  try {
    const { empresaId, rol } = await getEmpresaContext()
    if (rol !== 'admin') return { error: 'Només els admins poden convidar membres', success: null }

    const email = (formData.get('email') as string).trim().toLowerCase()
    if (!email) return { error: 'L\'email és obligatori', success: null }

    const serviceClient = createServiceClient()

    // Convidar l'usuari (crea el compte si no existeix i envia email)
    const { data: inviteData, error: inviteError } =
      await serviceClient.auth.admin.inviteUserByEmail(email)

    if (inviteError || !inviteData?.user) {
      return { error: inviteError?.message ?? 'Error al convidar l\'usuari', success: null }
    }

    const userId = inviteData.user.id

    // Comprovar si ja és membre
    const { data: existing } = await serviceClient
      .from('empresa_membres')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      return { error: null, success: `${email} ja és membre d'aquesta empresa` }
    }

    // Afegir com a membre
    const { error: membreError } = await serviceClient
      .from('empresa_membres')
      .insert({ empresa_id: empresaId, user_id: userId, rol: 'membre', email })

    if (membreError) return { error: membreError.message, success: null }

    revalidatePath('/ajustos')
    return { error: null, success: `Invitació enviada a ${email}` }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut', success: null }
  }
}

export async function removeMembre(membreId: string): Promise<{ error: string | null }> {
  try {
    const { supabase, rol } = await getEmpresaContext()
    if (rol !== 'admin') return { error: 'Només els admins poden eliminar membres' }

    const { error } = await supabase.from('empresa_membres').delete().eq('id', membreId)
    if (error) return { error: error.message }

    revalidatePath('/ajustos')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}

// ── Categories ────────────────────────────────────────────

export async function createCategoria(
  tipus: string,
  etiqueta: string
): Promise<{ error: string | null }> {
  try {
    const { supabase, empresaId } = await getEmpresaContext()
    const valor = toValor(etiqueta.trim())
    if (!valor) return { error: 'Etiqueta no vàlida' }

    const { data: last } = await supabase
      .from('categories')
      .select('ordre')
      .eq('tipus', tipus)
      .order('ordre', { ascending: false })
      .limit(1)
      .maybeSingle()

    const ordre = (last?.ordre ?? -1) + 1

    const { error } = await supabase
      .from('categories')
      .insert({ tipus, valor, etiqueta: etiqueta.trim(), ordre, empresa_id: empresaId })

    if (error) return { error: error.message }
    revalidatePath('/ajustos')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}

export async function updateCategoria(
  id: string,
  etiqueta: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('categories')
      .update({ etiqueta: etiqueta.trim() })
      .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/ajustos')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}

export async function deleteCategoria(id: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/ajustos')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}
