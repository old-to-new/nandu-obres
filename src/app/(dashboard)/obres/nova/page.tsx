import ObraForm from '@/components/obres/ObraForm'

export default function NovaObraPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Nova obra</h1>
        <p className="mt-0.5 text-sm text-gray-500">Afegeix una nova obra al sistema</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ObraForm />
      </div>
    </div>
  )
}
