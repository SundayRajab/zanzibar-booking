"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/lib/AuthContext';
import { Loader2 } from 'lucide-react';

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'provider' | 'user')[];
  redirectTo?: string;
};

export default function RoleGuard({ children, allowedRoles, redirectTo = '/sign-in' }: RoleGuardProps) {
  const { role, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      } else if (role && !allowedRoles.includes(role)) {
        // Redirect based on actual role
        if (role === 'admin') router.push('/admin');
        else if (role === 'provider') router.push('/provider');
        else router.push('/dashboard');
      }
    }
  }, [loading, user, role, allowedRoles, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-zinc-500" size={32} />
      </div>
    );
  }

  // Prevent flash of unauthorized content
  if (!user || (role && !allowedRoles.includes(role))) {
    return null;
  }

  return <>{children}</>;
}
