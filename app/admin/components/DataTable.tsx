import React from 'react';

type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
};

export default function DataTable<T extends { id: string | number }>({ columns, data, isLoading, emptyMessage = 'No data available' }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden animate-pulse">
        <div className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center px-4">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              {columns.map(col => (
                <th key={col.key} className={`px-4 py-3 font-semibold text-zinc-500 uppercase tracking-wider text-${col.align || 'left'}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-4 whitespace-nowrap text-${col.align || 'left'}`}>
                      {col.render ? col.render(row) : String((row as any)[col.key] || '')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-zinc-500 dark:text-zinc-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
