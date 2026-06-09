'use client'

import { useState, useTransition } from 'react'
import { createCategoria, updateCategoria, deleteCategoria } from '@/app/(dashboard)/ajustos/actions'
import type { Categoria } from '@/lib/types/database'

interface Props {
  tipus: string
  titol: string
  categoriesInicials: Categoria[]
}

export default function CategoriesEditor({ tipus, titol, categoriesInicials }: Props) {
  const [categories, setCategories] = useState<Categoria[]>(categoriesInicials)
  const [nouText, setNouText] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAfegir() {
    if (!nouText.trim()) return
    setError(null)
    const etiqueta = nouText.trim()
    startTransition(async () => {
      const result = await createCategoria(tipus, etiqueta)
      if (result.error) { setError(result.error); return }
      setCategories((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          tipus,
          valor: etiqueta.toLowerCase().replace(/\s+/g, '_'),
          etiqueta,
          ordre: prev.length,
          empresa_id: '',
          created_at: new Date().toISOString(),
        },
      ])
      setNouText('')
    })
  }

  function handleGuardarEdit(cat: Categoria) {
    if (!editText.trim()) return
    setError(null)
    const etiqueta = editText.trim()
    startTransition(async () => {
      const result = await updateCategoria(cat.id, etiqueta)
      if (result.error) { setError(result.error); return }
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, etiqueta } : c))
      )
      setEditId(null)
    })
  }

  function handleEliminar(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await deleteCategoria(id)
      if (result.error) { setError(result.error); return }
      setCategories((prev) => prev.filter((c) => c.id !== id))
    })
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">{titol}</h3>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
      )}

      <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {categories.length === 0 && (
          <li className="px-4 py-3 text-sm text-gray-400">Cap categoria</li>
        )}
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center gap-2 px-4 py-2.5">
            {editId === cat.id ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGuardarEdit(cat)
                    if (e.key === 'Escape') setEditId(null)
                  }}
                  className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  autoFocus
                  disabled={isPending}
                />
                <button
                  onClick={() => handleGuardarEdit(cat)}
                  disabled={isPending}
                  className="text-xs font-medium text-green-600 hover:text-green-800 disabled:opacity-50"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="min-w-0 flex-1 text-sm text-gray-700">{cat.etiqueta}</span>
                <span className="shrink-0 font-mono text-xs text-gray-300">{cat.valor}</span>
                <button
                  onClick={() => { setEditId(cat.id); setEditText(cat.etiqueta) }}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(cat.id)}
                  disabled={isPending}
                  className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Afegir nova */}
      <div className="flex gap-2">
        <input
          value={nouText}
          onChange={(e) => setNouText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAfegir()}
          placeholder="Nova categoria…"
          disabled={isPending}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
        />
        <button
          onClick={handleAfegir}
          disabled={isPending || !nouText.trim()}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          + Afegir
        </button>
      </div>
    </div>
  )
}
