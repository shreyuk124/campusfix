// components/ui/Skeleton.jsx - Shimmer loading skeleton
import React from 'react';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-stone-200/70 ${className}`}
      {...props}
    />
  );
}

/**
 * IssueCardSkeleton - Matches the exact layout of IssueCard
 */
export function IssueCardSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        </div>
        <Skeleton className="h-4 w-20 rounded" />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      <div className="border-t border-line/60 pt-3 flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
  );
}

/**
 * IssueDetailSkeleton - Matches IssueDetail page layout
 */
export function IssueDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-48 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-line bg-surface p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-2/3 rounded" />
              <Skeleton className="h-5 w-24 rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-line bg-surface p-6 shadow-card space-y-4">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
