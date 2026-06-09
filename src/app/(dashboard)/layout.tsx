import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmpresaActual } from '@/lib/empresa'
import Sidebar from '@/components/layout/Sidebar'
import MobileHeader from '@/components/layout/MobileHeader'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getEmpresaActual()

  if (!ctx) {
    // Comprova si té sessió activa (sense empresa → potser és super-admin)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/super-admin')
    redirect('/login')
  }

  const { empresa } = ctx

  return (
    <div className="flex h-screen" style={{ background: 'var(--surface-brand)' }}>
      {/* Sidebar — visible des de md en amunt */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar empresa={empresa} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header mòbil amb burger menu */}
        <MobileHeader empresa={empresa} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
