import NovaContrasenyaForm from './NovaContrasenyaForm'

export default function NovaContrasenyaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-9 w-1.5"
              style={{ background: 'var(--brand-red)' }}
            />
            <span
              className="text-3xl font-bold uppercase tracking-widest"
              style={{
                fontFamily: 'var(--font-heading, Oswald, Arial, sans-serif)',
                color: 'var(--brand-red)',
              }}
            >
              Obres
            </span>
          </div>
          <p className="text-sm text-gray-500">Crea la teva contrasenya</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <NovaContrasenyaForm />
        </div>
      </div>
    </div>
  )
}
