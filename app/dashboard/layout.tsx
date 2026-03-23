"use client";

import { useAuth } from "../lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const navItems = [
    { name: "Overview", path: "/dashboard" },
    { name: "My Bookings", path: "/dashboard/bookings" },
    { name: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 min-h-[80vh]">
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sticky top-28">
          <div className="mb-6 px-4">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">My Account</h2>
            <p className="text-sm text-zinc-500 truncate">{user.email}</p>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-cyan-400" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"}`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
