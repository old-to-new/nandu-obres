'use client'

import { useRouter } from 'next/navigation'

interface DataSelectorProps {
  dataActual: string
  basePath: string
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00Z')
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().split('T')[0]
}

export function DataSelector({ dataActual, basePath }: DataSelectorProps) {
  const router = useRouter()

  function navigateTo(data: string) {
    router.push(`${basePath}?data=${data}`)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value) navigateTo(e.target.value)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => navigateTo(addDays(dataActual, -1))}
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        aria-label="Dia anterior"
      >
        ‹ Anterior
      </button>

      <input
        type="date"
        value={dataActual}
        onChange={handleInputChange}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <button
        type="button"
        onClick={() => navigateTo(addDays(dataActual, 1))}
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        aria-label="Dia següent"
      >
        Següent ›
      </button>
    </div>
  )
}
