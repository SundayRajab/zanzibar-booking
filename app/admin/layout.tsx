import AdminSidebar from './components/AdminSidebar';
import { ToastProvider } from './components/Toast';
import RoleGuard from '@/app/components/guards/RoleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a]">
        <AdminSidebar />
        <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <ToastProvider>
              {children}
            </ToastProvider>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
