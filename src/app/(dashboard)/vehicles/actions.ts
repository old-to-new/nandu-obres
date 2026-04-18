'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createVehicle(formData: FormData) {
  const supabase = await createClient()

  const nom = formData.get('nom') as string
  const matricula = formData.get('matricula') as string

  const { error } = await supabase.from('vehicles').insert({ nom, matricula })

  if (error) throw new Error(error.message)

  revalidatePath('/vehicles')
  redirect('/vehicles')
}

export async function updateVehicle(id: string, formData: FormData) {
  const supabase = await createClient()

  const nom = formData.get('nom') as string
  const matricula = formData.get('matricula') as string

  const { error } = await supabase
    .from('vehicles')
    .update({ nom, matricula })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/vehicles')
  redirect('/vehicles')
}

export async function toggleVehicleActiu(id: string, actiu: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('vehicles')
    .update({ actiu })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/vehicles')
}
