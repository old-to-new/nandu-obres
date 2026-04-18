import Link from 'next/link'
import { TreballadorCard } from './TreballadorCard'
import type { Treballador } from '@/lib/types/database'

interface TreballadorsPageContentProps {
  treballadors: Treballador[]
  mostraInactius: boolean
}

export default function TreballadorsPageContent({
  treballadors,
  mostraInactius,
}: TreballadorsPageContentProps) {
  const treballadorsVisibles = mostraInactius
    ? treballadors
    : treballadors.filter((t) => t.actiu)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Treballadors</h1>
        <Link
          href="/treballadors/nou"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nou treballador
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={mostraInactius ? '/treballadors' : '/treballadors?inactius=1'}
          className="text-sm text-blue-600 hover:underline"
        >
          {mostraInactius ? 'Amagar inactius' : 'Veure inactius'}
        </Link>
        {mostraInactius && (
          <span className="text-sm text-gray-500">
            ({treballadors.filter((t) => !t.actiu).length} inactius)
          </span>
        )}
      </div>

      {treballadorsVisibles.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          No hi ha treballadors{mostraInactius ? '' : ' actius'}.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {treballadorsVisibles.map((t) => (
            <TreballadorCard key={t.id} treballador={t} />
          ))}
        </div>
      )}
    </div>
  )
}
