import React from 'react';
import RoleGuard from '@/app/components/guards/RoleGuard';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['provider']}>
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a]">
        {/* Provider Sidebar/Navigation would go here */}
        <main className="min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Provider Portal</h1>
            {children}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
