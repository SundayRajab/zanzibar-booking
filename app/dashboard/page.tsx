"use client";

import { useAuth } from "../lib/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Profile = {
  full_name: string;
  loyalty_points: number;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      // Intentionally ignoring error handling here so the page still loads the fallback UI if SQL hasn't been run yet
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-8 text-white shadow-xl shadow-cyan-500/20">
          <h3 className="text-blue-100 font-medium mb-1">Oceanora Member</h3>
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
          <h3 className="text-lg font-bold text-black dark:text-white mb-4">Saved Preferences</h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800">
               <span className="text-sm text-zinc-600 dark:text-zinc-400">Dietary Requirements</span>
               <span className="text-sm font-medium text-black dark:text-white">None</span>
             </div>
             <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800">
               <span className="text-sm text-zinc-600 dark:text-zinc-400">Bed Preference</span>
               <span className="text-sm font-medium text-black dark:text-white">King Size</span>
             </div>
             <div className="flex justify-between items-center py-3">
               <span className="text-sm text-zinc-600 dark:text-zinc-400">Currency</span>
               <span className="text-sm font-medium text-black dark:text-white">USD ($)</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
