'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmpresaContext } from '@/lib/empresa'

export async function createObra(formData: FormData) {
  const { supabase, empresaId } = await getEmpresaContext()

  const nom = formData.get('nom') as string
  const client_nom = formData.get('client_nom') as string
  const linia = formData.get('linia') as string
  const estat = formData.get('estat') as string
  const notes = (formData.get('notes') as string) || null

  const { data, error } = await supabase
    .from('obres')
    .insert({ nom, client_nom, linia, estat, notes, empresa_id: empresaId })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/obres')
  redirect(`/obres/${data.id}`)
}

export async function updateObra(id: string, formData: FormData) {
  const supabase = await createClient()

  const nom = formData.get('nom') as string
  const client_nom = formData.get('client_nom') as string
  const linia = formData.get('linia') as string
  const estat = formData.get('estat') as string
  const notes = (formData.get('notes') as string) || null

  const { error } = await supabase
    .from('obres')
    .update({ nom, client_nom, linia, estat, notes })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/obres')
  revalidatePath(`/obres/${id}`)
}

export async function deleteObra(obraId: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('obres').delete().eq('id', obraId)
    if (error) return { error: error.message }
    revalidatePath('/obres')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}

export async function transferAndDeleteObra(
  obraId: string,
  targetObraId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    // Actes de l'obra origen
    const { data: actesSource, error: srcErr } = await supabase
      .from('actes').select('id, data').eq('obra_id', obraId)
    if (srcErr) return { error: srcErr.message }

    // Actes de l'obra destí (per detectar conflictes de data)
    const { data: actesTarget, error: tgtErr } = await supabase
      .from('actes').select('id, data').eq('obra_id', targetObraId)
    if (tgtErr) return { error: tgtErr.message }

    const targetByDate: Record<string, string> = {}
    for (const a of (actesTarget ?? [])) targetByDate[a.data] = a.id

    for (const acte of (actesSource ?? [])) {
      if (targetByDate[acte.data]) {
        // Conflicte: fusionar amb l'acta existent al destí
        const targetActaId = targetByDate[acte.data]
        await supabase.from('acte_treballadors')
          .update({ acte_id: targetActaId }).eq('acte_id', acte.id)
        await supabase.from('acte_imatges')
          .update({ acte_id: targetActaId }).eq('acte_id', acte.id)
        await supabase.from('actes').delete().eq('id', acte.id)
      } else {
        // Sense conflicte: canviar obra_id directament
        await supabase.from('actes')
          .update({ obra_id: targetObraId }).eq('id', acte.id)
      }
    }

    // Traspassar planificació
    await supabase.from('planificacio')
      .update({ obra_id: targetObraId }).eq('obra_id', obraId)

    // Eliminar l'obra (cascade elimina la resta)
    const { error: delErr } = await supabase.from('obres').delete().eq('id', obraId)
    if (delErr) return { error: delErr.message }

    revalidatePath('/obres')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut' }
  }
}

export async function setDocumentUrl(
  obraId: string,
  tipus: 'pressupost' | 'projecte',
  url: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    const camp = tipus === 'pressupost' ? 'pressupost_pdf_url' : 'projecte_pdf_url'
    const { error: updateError } = await supabase
      .from('obres')
      .update({ [camp]: url })
      .eq('id', obraId)

    if (updateError) return { error: `DB error: ${updateError.message}` }

    revalidatePath(`/obres/${obraId}`)
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconegut al servidor' }
  }
}
