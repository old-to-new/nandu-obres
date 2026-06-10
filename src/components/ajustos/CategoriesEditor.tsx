'use client'

import { useState, useTransition } from 'react'
import { createCategoria, updateCategoria, deleteCategoria } from '@/app/(dashboard)/ajustos/actions'
import type { Categoria } from '@/lib/types/database'

interface Props {
  tipus: string
  titol: string
  categoriesInicials: Categoria[]
}

const DEFAULT_COLOR = '#6b7280'

export default function CategoriesEditor({ tipus, titol, categoriesInicials }: Props) {
  const [categories, setCategories] = useState<Categoria[]>(categoriesInicials)
  const [nouText, setNouText] = useState('')
  const [nouColor, setNouColor] = useState(DEFAULT_COLOR)
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editColor, setEditColor] = useState(DEFAULT_COLOR)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAfegir() {
    if (!nouText.trim()) return
    setError(null)
    const etiqueta = nouText.trim()
    startTransition(async () => {
      const result = await createCategoria(tipus, etiqueta, nouColor)
      if (result.error) { setError(result.error); return }
      setCategories((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          tipus,
          valor: etiqueta.toLowerCase().replace(/\s+/g, '_'),
          etiqueta,
          ordre: prev.length,
          color: nouColor,
          empresa_id: '',
          created_at: new Date().toISOString(),
        },
      ])
      setNouText('')
      setNouColor(DEFAULT_COLOR)
    })
  }

  function handleStartEdit(cat: Categoria) {
    setEditId(cat.id)
    setEditText(cat.etiqueta)
    setEditColor(cat.color ?? DEFAULT_COLOR)
  }

  function handleGuardarEdit(cat: Categoria) {
    if (!editText.trim()) return
    setError(null)
    const etiqueta = editText.trim()
    startTransition(async () => {
      const result = await updateCategoria(cat.id, etiqueta, editColor)
      if (result.error) { setError(result.error); return }
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, etiqueta, color: editColor } : c))
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
                {/* Color picker en edició */}
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  disabled={isPending}
                  className="h-7 w-7 shrink-0 cursor-pointer rounded border-0 p-0.5 disabled:opacity-50"
                  title="Triar color"
                />
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
                {/* Pastilla de color */}
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-white shadow-sm"
                  style={{ background: cat.color ?? DEFAULT_COLOR }}
                />
                <span className="min-w-0 flex-1 text-sm text-gray-700">{cat.etiqueta}</span>
                <span className="shrink-0 font-mono text-xs text-gray-300">{cat.valor}</span>
                <button
                  onClick={() => handleStartEdit(cat)}
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
          type="color"
          value={nouColor}
          onChange={(e) => setNouColor(e.target.value)}
          disabled={isPending}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-gray-300 p-1 disabled:opacity-50"
          title="Triar color"
        />
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
