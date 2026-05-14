"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Users, Calendar, DollarSign, Building } from 'lucide-react';
import AdminPageHeader from './components/AdminPageHeader';
import ActivityTimeline from './components/ActivityTimeline';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    bookings: 0,
    revenue: 0,
    listings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      
      const [
        { count: usersCount },
        { count: bookingsCount, data: bookings },
        { count: listingsCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('total_price, status', { count: 'exact' }),
        supabase.from('listings').select('*', { count: 'exact', head: true }),
      ]);

      const revenue = bookings?.filter(b => b.status === 'completed' || b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

      setStats({
        users: usersCount || 0,
        bookings: bookingsCount || 0,
        revenue,
        listings: listingsCount || 0,
      });
      
      setLoading(false);
    }

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.users, icon: Users, prefix: '' },
    { title: 'Total Bookings', value: stats.bookings, icon: Calendar, prefix: '' },
    { title: 'Total Revenue', value: stats.revenue.toLocaleString(), icon: DollarSign, prefix: '$' },
    { title: 'Active Listings', value: stats.listings, icon: Building, prefix: '' },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader 
        title="Dashboard" 
        description="Welcome back. Here is the overview of Oceanora platform." 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
              </div>
              <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded mt-2"></div>
            </div>
          ))
        ) : (
          statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{card.title}</h3>
                  <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                    <Icon size={20} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  {card.prefix && <span className="text-xl font-bold text-zinc-400">{card.prefix}</span>}
                  <h2 className="text-3xl font-black text-black dark:text-white tracking-tight">{card.value}</h2>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <ActivityTimeline />
      </div>
    </div>
  );
}
