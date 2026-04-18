interface SkeletonTableProps {
  rows?: number
  cols?: number
}

export function SkeletonTable({ rows = 5, cols = 4 }: SkeletonTableProps) {
  // Use deterministic widths to avoid hydration mismatches
  const widths = ['25%', '35%', '20%', '40%', '30%', '45%', '22%', '38%']

  return (
    <div className="animate-pulse">
      <div className="flex gap-4 mb-4 px-4 py-3 border-b border-gray-200">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 rounded"
            style={{ width: widths[i % widths.length] }}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 px-4 py-3 border-b border-gray-100"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-4 bg-gray-100 rounded"
              style={{ width: widths[(rowIdx + colIdx) % widths.length] }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
