import { createClient } from '@supabase/supabase-js'

/**
 * Client amb la service-role key: evita les RLS policies.
 * Fer servir ÚNICAMENT en crons i operacions de servidor sense sessió d'usuari.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
