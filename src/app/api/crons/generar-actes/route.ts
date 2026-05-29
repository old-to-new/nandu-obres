import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * Cron de generació automàtica d'actes.
 *
 * S'executa cada dia a les 22:00 UTC (= 23:00 CET / 00:00 CEST).
 * Per a cada obra que tingui planificació del dia amb crear_acta_auto = TRUE:
 *   - Si l'acta ja existeix → no fa res
 *   - Si no existeix → crea l'acta + acte_treballadors (planificat = true)
 *
 * Es pot executar manualment amb ?data=YYYY-MM-DD per a qualsevol data.
 */
export async function GET(request: NextRequest) {
  // --- Autenticació del cron ---
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // En local (sense CRON_SECRET definit) es permet accés lliure per facilitar proves.
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  // --- Data a processar ---
  const { searchParams } = new URL(request.url)
  const dataParam = searchParams.get('data')
  const dataAvui = dataParam ?? new Date().toISOString().split('T')[0]

  const supabase = createServiceClient()

  // --- Obtenir planificacions del dia amb acta auto activada ---
  const { data: planificacions, error: planError } = await supabase
    .from('planificacio')
    .select('obra_id, treballador_id')
    .eq('data', dataAvui)
    .eq('crear_acta_auto', true)

  if (planError) {
    console.error('[cron/generar-actes] Error llegint planificació:', planError)
    return NextResponse.json({ error: planError.message }, { status: 500 })
  }

  if (!planificacions || planificacions.length === 0) {
    return NextResponse.json({
      data: dataAvui,
      message: 'Cap planificació amb acta auto per avui.',
      creades: 0,
    })
  }

  // --- Agrupar treballadors per obra (evitant duplicats) ---
  const perObra: Record<string, Set<string>> = {}
  for (const p of planificacions) {
    if (!perObra[p.obra_id]) perObra[p.obra_id] = new Set()
    perObra[p.obra_id].add(p.treballador_id)
  }

  const resultats: Array<{ obra_id: string; estat: string }> = []

  for (const [obra_id, treballadorsSet] of Object.entries(perObra)) {
    // Comprovar si l'acta ja existeix per a aquesta obra i data
    const { data: actaExistent, error: checkError } = await supabase
      .from('actes')
      .select('id')
      .eq('obra_id', obra_id)
      .eq('data', dataAvui)
      .maybeSingle()

    if (checkError) {
      resultats.push({ obra_id, estat: `error_comprovació: ${checkError.message}` })
      continue
    }

    if (actaExistent) {
      resultats.push({ obra_id, estat: 'ja_existeix' })
      continue
    }

    // Crear acta
    const { data: novaActa, error: actaError } = await supabase
      .from('actes')
      .insert({ obra_id, data: dataAvui })
      .select('id')
      .single()

    if (actaError || !novaActa) {
      resultats.push({ obra_id, estat: `error_acta: ${actaError?.message ?? 'desconegut'}` })
      continue
    }

    // Inserir acte_treballadors per a cada treballador planificat
    const entries = Array.from(treballadorsSet).map((treballador_id) => ({
      acte_id: novaActa.id,
      treballador_id,
      hores: 9.0,
      planificat: true,
    }))

    const { error: tError } = await supabase.from('acte_treballadors').insert(entries)

    if (tError) {
      resultats.push({ obra_id, estat: `error_treballadors: ${tError.message}` })
    } else {
      resultats.push({ obra_id, estat: 'creat' })
    }
  }

  const creades = resultats.filter((r) => r.estat === 'creat').length

  return NextResponse.json({ data: dataAvui, creades, resultats })
}
