import React from 'react';

type RoleBadgeProps = { role: string };

export default function RoleBadge({ role }: RoleBadgeProps) {
  const isProvider = role === 'provider';
  const isAdmin = role === 'admin';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
      ${isAdmin ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' 
      : isProvider ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' 
      : 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'}`}>
      {role}
    </span>
  );
}
