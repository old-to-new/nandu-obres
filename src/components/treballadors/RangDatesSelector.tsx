'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface RangDatesSelectorProps {
  dataInici: string
  dataFi: string
  basePath: string
}

export function RangDatesSelector({ dataInici, dataFi, basePath }: RangDatesSelectorProps) {
  const router = useRouter()
  const [inici, setInici] = useState(dataInici)
  const [fi, setFi] = useState(dataFi)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push(`${basePath}?inici=${inici}&fi=${fi}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="inici" className="block text-xs font-medium text-gray-600">
          Des de
        </label>
        <input
          id="inici"
          type="date"
          value={inici}
          onChange={(e) => setInici(e.target.value)}
          className="mt-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="fi" className="block text-xs font-medium text-gray-600">
          Fins a
        </label>
        <input
          id="fi"
          type="date"
          value={fi}
          onChange={(e) => setFi(e.target.value)}
          className="mt-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Filtrar
      </button>
    </form>
  )
}
