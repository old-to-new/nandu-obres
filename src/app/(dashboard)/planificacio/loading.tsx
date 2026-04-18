import { SkeletonTable } from '@/components/ui/SkeletonTable'

export default function PlanificacioCargant() {
  return (
    <div className="p-6">
      <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
      <div className="h-10 bg-gray-100 rounded w-40 mb-6 animate-pulse" />
      <SkeletonTable rows={8} cols={4} />
    </div>
  )
}
