import { SkeletonTable } from '@/components/ui/SkeletonTable'

export default function TreballadorsCargant() {
  return (
    <div className="p-6">
      <div className="h-8 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
      <SkeletonTable rows={12} cols={4} />
    </div>
  )
}
