'use client'

import type { Vehicle } from '@/lib/types/database'

interface VehicleFormProps {
  action: (formData: FormData) => Promise<void>
  vehicle?: Vehicle
}

export function VehicleForm({ action, vehicle }: VehicleFormProps) {
  const isEdit = !!vehicle

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
          Nom
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          defaultValue={vehicle?.nom ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          placeholder="Furgoneta gran"
        />
      </div>

      <div>
        <label htmlFor="matricula" className="block text-sm font-medium text-gray-700">
          Matrícula
        </label>
        <input
          id="matricula"
          name="matricula"
          type="text"
          required
          defaultValue={vehicle?.matricula ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          placeholder="B-0000-XX"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          {isEdit ? 'Actualitzar' : 'Desar'}
        </button>
        <a
          href="/vehicles"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel·lar
        </a>
      </div>
    </form>
  )
}
