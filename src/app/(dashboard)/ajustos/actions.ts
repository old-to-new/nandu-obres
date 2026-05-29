'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

function toValor(etiqueta: string): string {
  return etiqueta
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export async function createCategoria(
  tipus: string,
  etiqueta: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const valor = toValor(etiqueta.trim())
    if (!valor) return { error: 'Etiqueta no vàlida' }

    // Ordre = màxim actual + 1
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
      .insert({ tipus, valor, etiqueta: etiqueta.trim(), ordre })

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
