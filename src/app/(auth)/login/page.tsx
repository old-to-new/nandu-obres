import LoginForm from '@/components/auth/LoginForm'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Gestió d&apos;Obres</h1>
          <p className="mt-1 text-sm text-gray-500">Accés per a encarregats</p>
        </div>

        {error === 'invalid_credentials' && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            Correu o contrasenya incorrectes.
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
