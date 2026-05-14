"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Clock, Activity, Edit, Plus, Trash2 } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  created_at: string;
  profiles: { full_name: string };
}

export default function ActivityTimeline() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      // Fetch the 5 most recent audit logs, joined with profiles for the user's name
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setLogs(data as any);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  const getActionIcon = (action: string) => {
    if (action.includes('CREATE')) return <Plus size={16} className="text-green-500" />;
    if (action.includes('DELETE')) return <Trash2 size={16} className="text-red-500" />;
    if (action.includes('UPDATE')) return <Edit size={16} className="text-blue-500" />;
    return <Activity size={16} className="text-zinc-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-full animate-pulse">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-full shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={20} className="text-zinc-500" />
        <h3 className="text-lg font-bold text-black dark:text-white tracking-tight">Recent Activity</h3>
      </div>
      
      {logs.length === 0 ? (
        <p className="text-zinc-500 text-sm">No recent activity found.</p>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
          {logs.map((log) => (
            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                {getActionIcon(log.action)}
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-black dark:text-white capitalize">{log.action.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{log.profiles?.full_name || 'System'}</span> operated on <span className="font-medium uppercase">{log.entity}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
