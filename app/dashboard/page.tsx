"use client";

import { useAuth } from "../lib/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Profile = {
  full_name: string;
  loyalty_points: number;
}

type Booking = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  payment_status: string;
  total_price: number;
  listings: {
    title: string;
    category: string;
  }
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Fetch Profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);

      // Fetch Bookings
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*, listings(title, category)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (bookingData) setBookings(bookingData);
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-8 text-white shadow-xl shadow-cyan-500/20">
          <h3 className="text-blue-100 font-medium mb-1 capitalize">{profile?.full_name?.split(' ')[0] || 'User'} Member</h3>
          <p className="text-2xl font-bold mb-6 truncate">{profile?.full_name || user?.email}</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-blue-100 mb-1">Loyalty Points</p>
              <p className="text-4xl font-extrabold">{profile?.loyalty_points || 0}</p>
            </div>
            <svg className="w-12 h-12 text-white/40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-black dark:text-white mb-6">Active Trips</h3>
          <div className="space-y-4">
             {bookings.length > 0 ? bookings.slice(0, 3).map((b) => (
                <div key={b.id} className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-black dark:text-white truncate max-w-[150px]">{b.listings?.title}</span>
                    <span className="text-xs text-zinc-500">{new Date(b.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${b.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {b.payment_status}
                    </span>
                  </div>
                </div>
             )) : (
                <p className="text-sm text-zinc-500 py-4 italic">No active bookings found.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
