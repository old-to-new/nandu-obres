import { createClient } from '@/lib/supabase/server'
import TreballadorsPageContent from '@/components/treballadors/TreballadorsPageContent'

interface TreballadorsPageProps {
  searchParams: Promise<{ inactius?: string }>
}

export default async function TreballadorsPage({ searchParams }: TreballadorsPageProps) {
  const { inactius } = await searchParams
  const mostraInactius = inactius === '1'

  const supabase = await createClient()
  const { data: treballadors, error } = await supabase
    .from('treballadors')
    .select('*')
    .order('nom')

  if (error) throw new Error(error.message)

  return (
    <TreballadorsPageContent
      treballadors={treballadors ?? []}
      mostraInactius={mostraInactius}
    />
  )
}
