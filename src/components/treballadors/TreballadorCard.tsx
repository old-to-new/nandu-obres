import Link from 'next/link'
import type { Treballador } from '@/lib/types/database'
import { TIPUS_LABELS } from '@/lib/treballadors'

interface TreballadorCardProps {
  treballador: Treballador
}

export function TreballadorCard({ treballador }: TreballadorCardProps) {
  return (
    <Link
      href={`/treballadors/${treballador.id}`}
      className="block rounded-lg bg-white p-4 transition-colors duration-200"
      style={{ border: '1px solid var(--border)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-strong)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {treballador.nom}
          </p>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {TIPUS_LABELS[treballador.tipus]}
          </p>
          {treballador.telefon && (
            <p className="mt-1 text-sm text-gray-600">{treballador.telefon}</p>
          )}
        </div>
        {!treballador.actiu && (
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Inactiu
          </span>
        )}
      </div>
    </Link>
  )
}
