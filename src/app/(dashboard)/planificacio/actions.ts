'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAssignacio(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const data = formData.get('data') as string
  const obra_id = formData.get('obra_id') as string
  const treballador_id = formData.get('treballador_id') as string
  const vehicle_id = (formData.get('vehicle_id') as string) || null
  const tasca = (formData.get('tasca') as string) || null
  const crear_acta_auto = formData.get('crear_acta_auto') === 'on'

  const { error } = await supabase.from('planificacio').insert({
    data,
    obra_id,
    treballador_id,
    vehicle_id,
    tasca,
    crear_acta_auto,
  })

  if (error) return { error: error.message }

  revalidatePath('/planificacio')
  return { error: null }
}

export async function deleteAssignacio(id: string, _data: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('planificacio').delete().eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/planificacio')
}

export async function updateAssignacio(id: string, _data: string, formData: FormData) {
  const supabase = await createClient()

  const vehicle_id = (formData.get('vehicle_id') as string) || null
  const tasca = (formData.get('tasca') as string) || null

  const { error } = await supabase
    .from('planificacio')
    .update({ vehicle_id, tasca })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/planificacio')
}
