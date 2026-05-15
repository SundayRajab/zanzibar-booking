"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/AuthContext";
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Calendar, 
  Star, 
  Info,
  Trash2,
  BellRing,
  MoreHorizontal,
  Loader2,
  Check
} from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  link?: string;
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Real-time subscription
    const channel = supabase
      .channel('notifications_realtime')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function fetchNotifications() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setNotifications(data);
    }
    setLoading(false);
  }

  const markAsRead = async (id: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const markAllRead = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user?.id)
        .eq("read", false);
      
      if (error) throw error;
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'booking': return <Calendar className="w-5 h-5 text-indigo-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400">Stay updated with your bookings and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            disabled={loading || notifications.every(n => n.read)}
            onClick={markAllRead}
            className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="grid gap-4">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`group p-6 rounded-[2rem] border transition-all duration-300 flex gap-6 ${
                notif.read 
                  ? 'bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-70' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg shadow-blue-600/5 ring-1 ring-blue-600/10'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                notif.read ? 'bg-slate-50 dark:bg-slate-800' : 'bg-blue-50 dark:bg-blue-900/20'
              }`}>
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <h3 className={`font-black text-lg ${notif.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${notif.read ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {notif.message}
                </p>
                <div className="pt-2 flex items-center gap-4">
                  {notif.link && (
                    <Link href={notif.link} className="text-xs font-black text-blue-600 hover:underline">View Details</Link>
                  )}
                  {!notif.read && (
                    <button 
                      disabled={actionLoading === notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      {actionLoading === notif.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Mark as read
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  disabled={actionLoading === notif.id}
                  onClick={() => deleteNotification(notif.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all"
                >
                  {actionLoading === notif.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-20 text-center">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-3xl font-black mb-2">No new notifications</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            We'll let you know when something important happens with your bookings.
          </p>
        </div>
      )}

      {/* Preferences Preview */}
      <div className="bg-indigo-900 rounded-[2.5rem] p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-2xl font-black mb-2">Notification Preferences</h3>
          <p className="text-indigo-100 opacity-90 max-w-md">
            Control how and when you receive updates from us. Manage email, SMS, and push notifications.
          </p>
        </div>
        <button className="px-10 py-5 bg-white text-indigo-900 font-black rounded-2xl shadow-2xl hover:scale-105 transition-transform">
          Manage Settings
        </button>
      </div>
    </div>
  );
}
