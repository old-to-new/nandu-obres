'use client'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'

export default function PlanificacioError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Error carregant planificació"
      message="No s'ha pogut carregar la planificació."
      reset={reset}
    />
  )
}
