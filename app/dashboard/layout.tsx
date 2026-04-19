"use client";

import { useAuth } from "../lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string>("user");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
    if (user) {
      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.role) setRole(data.role);
        });
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const guestNav = [
    { name: "Overview", path: "/dashboard", icon: "📊" },
    { name: "My Bookings", path: "/dashboard/bookings", icon: "🗓️" },
  ];

  const providerNav = [
    { name: "Provider Hub", path: "/dashboard/provider", icon: "🏠" },
  ];

  const navItems = role === "provider" || role === "admin"
    ? [...guestNav, ...providerNav]
    : guestNav;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 min-h-[80vh]">
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sticky top-28">
          <div className="mb-6 px-4">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">My Account</h2>
            <p className="text-sm text-zinc-500 truncate">{user.email}</p>
            {(role === "provider" || role === "admin") && (
              <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold uppercase tracking-widest">
                {role}
              </span>
            )}
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2.5 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-cyan-400"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
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
