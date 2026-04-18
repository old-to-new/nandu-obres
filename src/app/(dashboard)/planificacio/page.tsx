import { createClient } from '@/lib/supabase/server'
import { DataSelector } from '@/components/planificacio/DataSelector'
import { DiaResum } from '@/components/planificacio/DiaResum'
import { AssignacioForm } from '@/components/planificacio/AssignacioForm'
import { createAssignacio, deleteAssignacio } from './actions'
import type { PlanificacioAmbDetalls } from '@/lib/types/database'

interface PlanificacioPageProps {
  searchParams: Promise<{ data?: string }>
}

function getDema(): string {
  const dema = new Date()
  dema.setDate(dema.getDate() + 1)
  return dema.toISOString().split('T')[0]
}

export default async function PlanificacioPage({ searchParams }: PlanificacioPageProps) {
  const sp = await searchParams
  const dataSeleccionada = sp.data ?? getDema()

  const supabase = await createClient()

  const [assignacionsRes, obresRes, treballadorsRes, vehiclesRes] = await Promise.all([
    supabase
      .from('planificacio')
      .select(`*, obra:obres(id, nom), treballador:treballadors(id, nom), vehicle:vehicles(id, nom)`)
      .eq('data', dataSeleccionada)
      .order('obra_id'),
    supabase.from('obres').select('*').eq('estat', 'activa').order('nom'),
    supabase.from('treballadors').select('*').eq('actiu', true).order('nom'),
    supabase.from('vehicles').select('*').eq('actiu', true).order('nom'),
  ])

  const assignacions = (assignacionsRes.data ?? []) as unknown as PlanificacioAmbDetalls[]

  const treballadorsJaAssignats = assignacions.map((a) => a.treballador_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Planificacio</h1>
      </div>

      <DataSelector dataActual={dataSeleccionada} basePath="/planificacio" />

      <DiaResum
        data={dataSeleccionada}
        assignacions={assignacions}
        deleteAction={deleteAssignacio}
      />

      <AssignacioForm
        action={createAssignacio}
        data={dataSeleccionada}
        obres={obresRes.data ?? []}
        treballadors={treballadorsRes.data ?? []}
        vehicles={vehiclesRes.data ?? []}
        treballadorsJaAssignats={treballadorsJaAssignats}
      />
    </div>
  )
}
