import React from 'react';
import RoleGuard from '@/app/components/guards/RoleGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['user']}>
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a]">
        {/* User Sidebar/Navigation would go here */}
        <main className="min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
