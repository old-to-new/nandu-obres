'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/** Soft-delete: marca deleted_at però no esborra el registre. */
export async function deleteActa(
  acteId: string,
  obraId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('actes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', acteId)
      .eq('obra_id', obraId)
    if (error) return { error: error.message }
    revalidatePath(`/obres/${obraId}`)
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}

/** Actualitza el comentari general de l'acta. */
export async function updateActaComentari(
  acteId: string,
  obraId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const comentari_general = (formData.get('comentari_general') as string) || null
    const { error } = await supabase
      .from('actes')
      .update({ comentari_general })
      .eq('id', acteId)
      .eq('obra_id', obraId)
    if (error) return { error: error.message }
    revalidatePath(`/obres/${obraId}/actes/${acteId}`)
    revalidatePath(`/obres/${obraId}/actes/${acteId}/editar`)
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}

/** Actualitza hores i comentari d'un acte_treballador. */
export async function updateActeTreballador(
  id: string,
  acteId: string,
  obraId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const hores = parseFloat(formData.get('hores') as string)
    const comentari = (formData.get('comentari') as string) || null
    if (isNaN(hores) || hores <= 0) return { error: 'Hores no vàlides' }
    const { error } = await supabase
      .from('acte_treballadors')
      .update({ hores, comentari })
      .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath(`/obres/${obraId}/actes/${acteId}/editar`)
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}

/** Afegeix un treballador a l'acta. */
export async function addActeTreballador(
  acteId: string,
  obraId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const treballador_id = formData.get('treballador_id') as string
    const hores = parseFloat((formData.get('hores') as string) || '9')
    if (!treballador_id) return { error: 'Selecciona un treballador' }
    const { error } = await supabase
      .from('acte_treballadors')
      .insert({ acte_id: acteId, treballador_id, hores })
    if (error) return { error: error.message }
    revalidatePath(`/obres/${obraId}/actes/${acteId}/editar`)
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}

/** Elimina un treballador de l'acta. */
export async function removeActeTreballador(
  id: string,
  acteId: string,
  obraId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('acte_treballadors').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath(`/obres/${obraId}/actes/${acteId}/editar`)
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}
