import { createClient } from '@/lib/supabase/server'
import TreballadorsLlista from '@/components/treballadors/TreballadorsLlista'

export default async function TreballadorsPage() {
  const supabase = await createClient()
  const { data: treballadors, error } = await supabase
    .from('treballadors')
    .select('*')
    .order('nom')

  if (error) throw new Error(error.message)

  return <TreballadorsLlista treballadors={treballadors ?? []} />
}
