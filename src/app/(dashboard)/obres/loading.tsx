import { SkeletonCardList } from '@/components/ui/SkeletonCard'

export default function ObresCargant() {
  return (
    <div className="p-6">
      <div className="h-8 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
      <SkeletonCardList count={6} />
    </div>
  )
}
