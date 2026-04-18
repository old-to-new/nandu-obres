'use client'

interface ErrorDisplayProps {
  title?: string
  message?: string
  reset?: () => void
}

export function ErrorDisplay({
  title = 'Ha passat un error',
  message = 'No s\'ha pogut carregar aquesta secció.',
  reset,
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 text-red-300" aria-hidden="true">
        <svg
          className="w-12 h-12 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{message}</p>

      {reset && (
        <button
          onClick={reset}
          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Tornar a intentar
        </button>
      )}
    </div>
  )
}
