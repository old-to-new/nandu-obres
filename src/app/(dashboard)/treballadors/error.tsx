'use client'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'

export default function TreballadorsError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Error carregant treballadors"
      message="No s'han pogut carregar els treballadors."
      reset={reset}
    />
  )
}
