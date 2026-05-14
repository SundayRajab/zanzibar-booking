import React from 'react';

type StatusBadgeProps = { status: string };

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isPositive = ['active', 'confirmed', 'approved', 'completed', 'paid'].includes(status?.toLowerCase());
  const isNegative = ['suspended', 'cancelled', 'rejected', 'refunded'].includes(status?.toLowerCase());
  const isWarning = ['pending', 'unpaid'].includes(status?.toLowerCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border
      ${isPositive ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
      : isNegative ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' 
      : isWarning ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
      : 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'}`}>
      {status || 'Unknown'}
    </span>
  );
}
