import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  icon?: React.ReactNode
  className?: string
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 text-gray-300" aria-hidden="true">
          {icon}
        </div>
      )}

      {!icon && (
        <div className="mb-4 text-gray-300" aria-hidden="true">
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}

      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 max-w-sm">{description}</p>
      )}

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
