'use client'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'

export default function ObraDetallError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Error carregant l'obra"
      message="No s'ha pogut carregar el detall de l'obra."
      reset={reset}
    />
  )
}
