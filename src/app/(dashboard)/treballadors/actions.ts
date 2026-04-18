'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { TipusTreballador } from '@/lib/types/database'

export async function createTreballador(formData: FormData) {
  const supabase = await createClient()

  const nom = formData.get('nom') as string
  const tipus = formData.get('tipus') as TipusTreballador
  const telefon = (formData.get('telefon') as string) || null
  const notes = (formData.get('notes') as string) || null

  const { error } = await supabase.from('treballadors').insert({
    nom,
    tipus,
    telefon,
    notes,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/treballadors')
  redirect('/treballadors')
}

export async function updateTreballador(id: string, formData: FormData) {
  const supabase = await createClient()

  const nom = formData.get('nom') as string
  const tipus = formData.get('tipus') as TipusTreballador
  const telefon = (formData.get('telefon') as string) || null
  const notes = (formData.get('notes') as string) || null

  const { error } = await supabase
    .from('treballadors')
    .update({ nom, tipus, telefon, notes })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/treballadors')
  redirect(`/treballadors/${id}`)
}

export async function toggleActiu(id: string, actiu: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('treballadors')
    .update({ actiu })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/treballadors')
}
