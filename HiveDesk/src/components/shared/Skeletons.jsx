import React from 'react';

function SkeletonPulse({ className = '' }) {
  return <div className={`animate-pulse bg-hd-raised rounded-xl ${className}`} />;
}

export function MetricCardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex justify-between">
        <SkeletonPulse className="w-9 h-9 rounded-xl" />
        <SkeletonPulse className="w-12 h-4 rounded" />
      </div>
      <SkeletonPulse className="w-20 h-3 rounded" />
      <SkeletonPulse className="w-16 h-8 rounded" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <SkeletonPulse key={j} className={`h-4 rounded ${j === 0 ? 'w-16' : j === 1 ? 'flex-1' : 'w-24'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="w-10 h-10 rounded-xl" />
            <div className="space-y-2 flex-1">
              <SkeletonPulse className="w-24 h-4 rounded" />
              <SkeletonPulse className="w-32 h-3 rounded" />
            </div>
          </div>
          <SkeletonPulse className="w-full h-3 rounded" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <SkeletonPulse className="w-48 h-8 rounded" />
        <SkeletonPulse className="w-32 h-10 rounded-xl" />
      </div>
      <MetricCardSkeleton />
      <TableSkeleton />
    </div>
  );
}
