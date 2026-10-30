'use client';

import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'chart';
  count?: number;
  rows?: number;
}

export function CardSkeleton() {
  return (
    <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-800 rounded w-20" />
        <div className="h-4 bg-slate-800 rounded w-12" />
      </div>
      <div className="h-6 bg-slate-800 rounded w-28" />
      <div className="h-3 bg-slate-800 rounded w-36" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4 animate-pulse space-y-3">
      <div className="h-6 bg-slate-800 rounded w-48 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 bg-slate-800/60 rounded w-full" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 h-72 animate-pulse flex flex-col justify-between">
      <div className="flex justify-between">
        <div className="h-5 bg-slate-800 rounded w-32" />
        <div className="h-5 bg-slate-800 rounded w-20" />
      </div>
      <div className="h-44 bg-slate-800/40 rounded w-full" />
    </div>
  );
}

export default function LoadingSkeleton({ type = 'card', count = 1, rows = 6 }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: count || 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return <TableSkeleton rows={rows} />;
  }

  return <ChartSkeleton />;
}
