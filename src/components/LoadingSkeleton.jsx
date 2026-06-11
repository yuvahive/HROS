import React from 'react'

export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
}

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="space-y-3">
        <SkeletonLine className="h-4 w-3/4" />
        {lines > 1 && <SkeletonLine className="h-3 w-1/2" />}
        {lines > 2 && <SkeletonLine className="h-3 w-full" />}
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLine key={j} className={`h-4 ${j === 0 ? 'w-1/4' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonBoard({ title = true, cards = 6 }) {
  return (
    <div className="p-6 space-y-6">
      {title && (
        <div className="space-y-2">
          <SkeletonLine className="h-6 w-48" />
          <SkeletonLine className="h-4 w-72" />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonCard key={i} lines={3} />
        ))}
      </div>
    </div>
  )
}

export default SkeletonBoard
