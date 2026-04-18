import { SkeletonTable } from '@/components/ui/SkeletonTable'

export default function ObraDetallCargant() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-64 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-40 mb-6" />
      <SkeletonTable rows={8} cols={5} />
    </div>
  )
}
