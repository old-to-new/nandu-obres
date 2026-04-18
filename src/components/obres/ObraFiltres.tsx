'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { LiniaObra, EstatObra } from '@/lib/types/database'

const LINIES: { value: LiniaObra | ''; label: string }[] = [
  { value: '', label: 'Totes les línies' },
  { value: 'obra_nova', label: 'Obra nova' },
  { value: 'rehabilitacio', label: 'Rehabilitació' },
  { value: 'ascensors', label: 'Ascensors' },
  { value: 'altres', label: 'Altres' },
]

const ESTATS: { value: EstatObra | ''; label: string }[] = [
  { value: '', label: 'Tots els estats' },
  { value: 'activa', label: 'Activa' },
  { value: 'pausada', label: 'Pausada' },
  { value: 'finalitzada', label: 'Finalitzada' },
]

export default function ObraFiltres() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(key: 'linia' | 'estat', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="filtre-linia" className="text-xs font-medium text-gray-500">
          Línia
        </label>
        <select
          id="filtre-linia"
          value={searchParams.get('linia') ?? ''}
          onChange={(e) => handleChange('linia', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {LINIES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filtre-estat" className="text-xs font-medium text-gray-500">
          Estat
        </label>
        <select
          id="filtre-estat"
          value={searchParams.get('estat') ?? ''}
          onChange={(e) => handleChange('estat', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {ESTATS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
