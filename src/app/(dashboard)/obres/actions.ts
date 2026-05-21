'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createObra(formData: FormData) {
  const supabase = await createClient()

  const nom = formData.get('nom') as string
  const client_nom = formData.get('client_nom') as string
  const linia = formData.get('linia') as string
  const estat = formData.get('estat') as string
  const notes = (formData.get('notes') as string) || null

  const { data, error } = await supabase
    .from('obres')
    .insert({ nom, client_nom, linia, estat, notes })
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

export async function setDocumentUrl(
  obraId: string,
  tipus: 'pressupost' | 'projecte',
  url: string
) {
  const supabase = await createClient()

  const camp = tipus === 'pressupost' ? 'pressupost_pdf_url' : 'projecte_pdf_url'
  const { error: updateError } = await supabase
    .from('obres')
    .update({ [camp]: url })
    .eq('id', obraId)

  if (updateError) throw new Error(updateError.message)

  revalidatePath(`/obres/${obraId}`)
}
