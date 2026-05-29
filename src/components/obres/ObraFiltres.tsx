'use client'

import { useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Categoria } from '@/lib/types/database'

interface Props {
  linies: Categoria[]
  estats: Categoria[]
}

export default function ObraFiltres({ linies, estats }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleSelectChange(key: 'linia' | 'estat', value: string) {
    updateParam(key, value)
  }

  function handleCercaChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => updateParam('cerca', value.trim()), 300)
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Buscador de text */}
      <div className="flex flex-col gap-1">
        <label htmlFor="filtre-cerca" className="text-xs font-medium text-gray-500">
          Cerca
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            id="filtre-cerca"
            type="search"
            defaultValue={searchParams.get('cerca') ?? ''}
            onChange={(e) => handleCercaChange(e.target.value)}
            placeholder="Nom o client…"
            className="w-44 rounded-lg border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:w-56"
          />
        </div>
      </div>

      {/* Filtre línia */}
      <div className="flex flex-col gap-1">
        <label htmlFor="filtre-linia" className="text-xs font-medium text-gray-500">
          Línia
        </label>
        <select
          id="filtre-linia"
          value={searchParams.get('linia') ?? ''}
          onChange={(e) => handleSelectChange('linia', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        >
          <option value="">Totes les línies</option>
          {linies.map((l) => (
            <option key={l.valor} value={l.valor}>
              {l.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {/* Filtre estat */}
      <div className="flex flex-col gap-1">
        <label htmlFor="filtre-estat" className="text-xs font-medium text-gray-500">
          Estat
        </label>
        <select
          id="filtre-estat"
          value={searchParams.get('estat') ?? ''}
          onChange={(e) => handleSelectChange('estat', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        >
          <option value="">Tots els estats</option>
          {estats.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.etiqueta}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
