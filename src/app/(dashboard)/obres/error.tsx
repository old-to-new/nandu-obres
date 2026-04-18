'use client'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'

export default function ObresError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Error carregant obres"
      message="No s'han pogut carregar les obres. Comprova la connexió i torna a intentar-ho."
      reset={reset}
    />
  )
}
