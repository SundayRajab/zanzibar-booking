"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Building, Calendar, Settings, Menu, X, LogOut } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Listings', href: '/admin/listings', icon: Building },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/sign-in';
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
      <div className="p-6">
        <Link href="/" className="text-2xl font-black tracking-tighter text-blue-600 dark:text-cyan-400">
          Oceanora.
        </Link>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${isActive 
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}
            >
              <Icon size={18} className={isActive ? 'text-white dark:text-black' : 'text-zinc-400 dark:text-zinc-500'} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-50 flex items-center justify-between px-4">
        <span className="font-black text-xl">Oceanora Admin</span>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 -mr-2 text-zinc-600 dark:text-zinc-300">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <NavContent />
      </aside>
    </>
  );
}
