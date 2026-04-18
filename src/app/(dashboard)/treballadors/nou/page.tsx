import { createTreballador } from '../actions'
import { TreballadorForm } from '@/components/treballadors/TreballadorForm'

export default function NouTreballadorPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nou treballador</h1>
        <p className="mt-1 text-sm text-gray-500">
          Afegeix un nou treballador a l&apos;empresa.
        </p>
      </div>
      <TreballadorForm action={createTreballador} />
    </div>
  )
}
