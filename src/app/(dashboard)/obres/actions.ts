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

export async function uploadDocument(
  obraId: string,
  tipus: 'pressupost' | 'projecte',
  formData: FormData
) {
  const supabase = await createClient()

  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('Cap fitxer seleccionat')

  const extension = file.name.split('.').pop() ?? 'pdf'
  const path = `${obraId}/${tipus}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('obra-docs')
    .upload(path, file, { upsert: true })

  if (uploadError) throw new Error(uploadError.message)

  const {
    data: { publicUrl },
  } = supabase.storage.from('obra-docs').getPublicUrl(path)

  const camp = tipus === 'pressupost' ? 'pressupost_pdf_url' : 'projecte_pdf_url'
  const { error: updateError } = await supabase
    .from('obres')
    .update({ [camp]: publicUrl })
    .eq('id', obraId)

  if (updateError) throw new Error(updateError.message)

  revalidatePath(`/obres/${obraId}`)
}
