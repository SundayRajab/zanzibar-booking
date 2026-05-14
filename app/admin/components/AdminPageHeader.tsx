import React from 'react';

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-extrabold text-black dark:text-white tracking-tight">{title}</h1>
        {description && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
