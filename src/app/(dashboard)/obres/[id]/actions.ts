'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface TreballadorActaInput {
  treballadorId: string
  hores: number
  comentari: string
  planificat: boolean
}

export interface GuardarActaInput {
  obraId: string
  acteId: string | null // null = nova acta
  data: string // ISO date: "2026-04-18"
  comentariGeneral: string
  treballadors: TreballadorActaInput[]
}

export async function guardarActa(input: GuardarActaInput): Promise<{ acteId: string }> {
  const supabase = await createClient()

  let acteId: string

  if (input.acteId === null) {
    // Nova acta — inserir
    const { data, error } = await supabase
      .from('actes')
      .insert({
        obra_id: input.obraId,
        data: input.data,
        comentari_general: input.comentariGeneral || null,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    acteId = data.id
  } else {
    // Acta existent — actualitzar
    acteId = input.acteId
    const { error } = await supabase
      .from('actes')
      .update({
        data: input.data,
        comentari_general: input.comentariGeneral || null,
      })
      .eq('id', acteId)

    if (error) throw new Error(error.message)
  }

  // Esborrar treballadors anteriors (si existien) i reinserir
  const { error: deleteError } = await supabase
    .from('acte_treballadors')
    .delete()
    .eq('acte_id', acteId)

  if (deleteError) throw new Error(deleteError.message)

  if (input.treballadors.length > 0) {
    const { error: insertError } = await supabase
      .from('acte_treballadors')
      .insert(
        input.treballadors.map((t) => ({
          acte_id: acteId,
          treballador_id: t.treballadorId,
          hores: t.hores,
          comentari: t.comentari || null,
          planificat: t.planificat,
        }))
      )

    if (insertError) throw new Error(insertError.message)
  }

  revalidatePath(`/obres/${input.obraId}`)
  return { acteId }
}

export async function uploadFoto(obraId: string, acteId: string, formData: FormData) {
  const supabase = await createClient()

  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('Cap fitxer seleccionat')

  // Path: {obraId}/{acteId}/{timestamp}-{filename}
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${obraId}/${acteId}/${timestamp}-${safeName}`

  const { error: uploadError } = await supabase.storage
    .from('actes-imatges')
    .upload(path, file)

  if (uploadError) throw new Error(uploadError.message)

  const {
    data: { publicUrl },
  } = supabase.storage.from('actes-imatges').getPublicUrl(path)

  const caption = (formData.get('caption') as string) || null

  const { error: dbError } = await supabase
    .from('acte_imatges')
    .insert({ acte_id: acteId, url: publicUrl, caption })

  if (dbError) throw new Error(dbError.message)

  revalidatePath(`/obres/${obraId}/actes/${acteId}`)
}

export async function eliminarFoto(obraId: string, acteId: string, imatgeId: string) {
  const supabase = await createClient()

  // Obtenir la URL per extreure el path del Storage
  const { data: imatge, error: fetchError } = await supabase
    .from('acte_imatges')
    .select('url')
    .eq('id', imatgeId)
    .single()

  if (fetchError || !imatge) throw new Error('Imatge no trobada')

  // Esborrar del Storage (extreure path relatiu de la URL pública)
  // La URL té format: https://xxx.supabase.co/storage/v1/object/public/actes-imatges/{path}
  const urlParts = imatge.url.split('/actes-imatges/')
  if (urlParts.length === 2) {
    const storagePath = urlParts[1]
    await supabase.storage.from('actes-imatges').remove([storagePath])
  }

  // Esborrar de la BD
  const { error: deleteError } = await supabase
    .from('acte_imatges')
    .delete()
    .eq('id', imatgeId)

  if (deleteError) throw new Error(deleteError.message)

  revalidatePath(`/obres/${obraId}/actes/${acteId}`)
  revalidatePath(`/obres/${obraId}`)
}
