'use client'

import type { Treballador, TipusTreballador, EncarregatTreballador } from '@/lib/types/database'

const TIPUS_OPTIONS: { value: TipusTreballador; label: string }[] = [
  { value: 'oficial', label: 'Oficial' },
  { value: 'oficial_2a', label: 'Oficial 2a' },
  { value: 'peo', label: 'Peó' },
  { value: 'altre', label: 'Altre' },
]

const ENCARREGAT_OPTIONS: { value: EncarregatTreballador | ''; label: string }[] = [
  { value: '', label: 'Sense assignar' },
  { value: 'nandu', label: 'Equip Nandu' },
  { value: 'pare', label: 'Equip Pare' },
]

interface TreballadorFormProps {
  action: (formData: FormData) => Promise<void>
  treballador?: Treballador
}

export function TreballadorForm({ action, treballador }: TreballadorFormProps) {
  const isEdit = !!treballador

  return (
    <form action={action} className="space-y-5">
      <div>
        <label
          htmlFor="nom"
          className="block text-sm font-medium text-gray-700"
        >
          Nom
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          defaultValue={treballador?.nom ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          placeholder="Nom complet"
        />
      </div>

      <div>
        <label
          htmlFor="tipus"
          className="block text-sm font-medium text-gray-700"
        >
          Tipus
        </label>
        <select
          id="tipus"
          name="tipus"
          defaultValue={treballador?.tipus ?? 'oficial'}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        >
          {TIPUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="encarregat"
          className="block text-sm font-medium text-gray-700"
        >
          Equip
        </label>
        <select
          id="encarregat"
          name="encarregat"
          defaultValue={treballador?.encarregat ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        >
          {ENCARREGAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="telefon"
          className="block text-sm font-medium text-gray-700"
        >
          Telèfon
        </label>
        <input
          id="telefon"
          name="telefon"
          type="tel"
          defaultValue={treballador?.telefon ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          placeholder="600 000 000"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={treballador?.notes ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          placeholder="Notes addicionals..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {isEdit ? 'Actualitzar' : 'Desar'}
        </button>
        <a
          href="/treballadors"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel·lar
        </a>
      </div>
    </form>
  )
}
