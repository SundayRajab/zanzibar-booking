"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/AuthContext";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  ChevronRight,
  Star,
  MessageSquare
} from "lucide-react";

type Booking = {
  id: string;
  status: string;
  payment_status: string;
  total_price: number;
  start_date: string;
  end_date: string;
  listing: {
    title: string;
    images: string[];
    location: string;
  };
};

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    pendingPayment: 0
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      // Fetch bookings with listing details
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(`
          id, status, payment_status, total_price, start_date, end_date,
          listing:listing_id (title, images, location)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bookings) {
        setRecentBookings(bookings.slice(0, 3) as any);

        const total = bookings.length;
        const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.start_date) > new Date()).length;
        const completed = bookings.filter(b => b.status === 'completed').length;
        const pendingPayment = bookings.filter(b => b.payment_status === 'unpaid').length;

        setStats({ total, upcoming, completed, pendingPayment });
      }
      setLoading(false);
    }
    fetchDashboardData();
  }, [user]);

  const statCards = [
    { label: "Total Bookings", value: stats.total, icon: Briefcase, color: "blue" },
    { label: "Upcoming Trips", value: stats.upcoming, icon: Clock, color: "orange" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "green" },
    { label: "Pending Payment", value: stats.pendingPayment, icon: CreditCard, color: "red" },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 sm:p-12 text-white shadow-2xl">
        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-blue-100 text-sm font-medium">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>Premium Traveler Member</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Habari, {user?.user_metadata?.full_name?.split(' ')[0] || 'Traveler'}!
            </h1>
            <p className="text-blue-100 text-lg max-w-md leading-relaxed opacity-90">
              Welcome back to your luxury gateway dashboard. You have {stats.upcoming} upcoming trips scheduled.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/" className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform">
                Book a New Trip
              </Link>
              <Link href="/dashboard/messages" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Message Concierge
              </Link>
              <Link href="/dashboard/profile" className="px-8 py-4 bg-blue-500/20 backdrop-blur-md text-white border border-white/30 font-bold rounded-2xl hover:bg-white/10 transition-colors">
                View Profile
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex justify-end relative">
            <div className="w-80 h-80 bg-white/10 rounded-full blur-3xl absolute -top-20 -right-20 animate-pulse"></div>
            <img
              src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80"
              alt="Zanzibar"
              className="w-full max-w-sm rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-500/5 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-1">{stat.label}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight">{loading ? '...' : stat.value}</span>
                <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +20%
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Main Grid: Recent Bookings & Activity */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Recent Bookings</h2>
            <Link href="/dashboard/bookings" className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-4">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
              ))
            ) : recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking.id} className="group bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      src={booking.listing?.images?.[0] || `https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=400&q=80`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={booking.listing?.title}
                    />
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                        {booking.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.payment_status === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {booking.payment_status}
                      </span>
                    </div>
                    <h3 className="font-black text-lg line-clamp-1">{booking.listing?.title}</h3>
                    <div className="flex items-center justify-center sm:justify-start gap-4 text-slate-500 dark:text-slate-400 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {booking.listing?.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {new Date(booking.start_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right sm:pr-4">
                    <p className="text-2xl font-black">${booking.total_price}</p>
                    <Link href={`/dashboard/track?id=${booking.id}`} className="text-blue-600 text-xs font-bold hover:underline">
                      Track Status
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 text-center">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-bold text-lg mb-1">No bookings yet</h3>
                <p className="text-slate-500 text-sm mb-6">Start your Zanzibar adventure today!</p>
                <Link href="/" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                  Browse Properties
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar activity & Info */}
        <section className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" /> Recent Activity
            </h3>
            <div className="space-y-6">
              {[
                { title: "Booking Confirmed", desc: "Zanzibar Rock Resort", time: "2h ago", type: "success" },
                { title: "Payment Received", desc: "Invoice #INV-2024-001", time: "5h ago", type: "info" },
                { title: "Welcome Gift", desc: "50 loyalty points added", time: "1d ago", type: "warning" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 2 && <div className="absolute left-2.5 top-8 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800"></div>}
                  <div className={`w-5 h-5 rounded-full mt-1 flex-shrink-0 ${item.type === 'success' ? 'bg-green-500' : item.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                    } ring-4 ring-white dark:ring-slate-900`}></div>
                  <div className="flex-1 pb-2">
                    <p className="font-bold text-sm leading-none mb-1">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.desc}</p>
                    <span className="text-[10px] font-medium text-slate-400">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors border-t border-slate-100 dark:border-slate-800 pt-6">
              View All Activity
            </button>
          </div>

          <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2">Invite Friends</h3>
              <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
                Refer a friend and get $50 credit for your next luxury stay.
              </p>
              <button className="w-full py-3 bg-white text-indigo-900 font-black rounded-2xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                Share Link <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </section>
      </div>
    </div>
  );
}
