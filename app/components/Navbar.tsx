"use client";

import Link from "next/link";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const { session, loading } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 tracking-tight">
            Oceanora
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Hotels", "Apartments", "Cars", "Tours"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-sm font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-cyan-400 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-600 dark:after:bg-cyan-400 hover:after:w-full after:transition-all after:duration-300 pb-1"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          {!loading && session ? (
             <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/';
                  }}
                  className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-bold rounded-full hover:opacity-90 transition-all active:scale-95"
                >
                  Sign Out
                </button>
             </div>
          ) : !loading ? (
             <>
               <Link
                 href="/sign-in"
                 className="hidden sm:inline-block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
               >
                 Sign In
               </Link>
               <Link
                 href="/sign-up"
                 className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/25 transition-all active:scale-95"
               >
                 Get Started
               </Link>
             </>
          ) : (
            <div className="flex gap-2">
              <div className="w-20 h-9 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="w-24 h-9 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
