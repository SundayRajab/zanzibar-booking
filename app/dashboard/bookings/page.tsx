"use client";

import { useAuth } from "../../lib/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const { data } = await supabase.from('bookings').select(`
        *,
        listings (*)
      `).order('created_at', { ascending: false });
      
      setBookings(data || []);
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-black dark:text-white mb-8">My Bookings</h1>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full"></div>
          <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center bg-white dark:bg-zinc-900/50 rounded-3xl p-16 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">No bookings yet</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">Explore our premium listings and book your next getaway!</p>
          <Link href="/" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 hover:shadow-lg transition-shadow">
               <div className="w-full sm:w-48 h-32 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                 {booking.listings?.images?.[0] ? (
                   <img src={booking.listings.images[0]} className="w-full h-full object-cover" alt="" />
                 ) : (
                   <img src={`https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=400&q=80`} className="w-full h-full object-cover" alt="" />
                 )}
               </div>
               <div className="flex-grow flex flex-col">
                 <div className="flex justify-between items-start">
                   <div>
                     <h3 className="text-xl font-bold text-black dark:text-white mb-1">{booking.listings?.title || "Unknown Property"}</h3>
                     <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{booking.listings?.location}</p>
                   </div>
                   <div className="flex gap-2">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                       booking.status === 'confirmed' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                       booking.status === 'rejected' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                       'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                     }`}>
                       {booking.status}
                     </span>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                       booking.payment_status === 'paid' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                       'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                     }`}>
                       {booking.payment_status}
                     </span>
                   </div>
                 </div>
                 <div className="mt-auto grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                   <div>
                     <p className="text-xs text-zinc-500 uppercase tracking-wide">Check-in</p>
                     <p className="text-sm font-medium text-black dark:text-white">{new Date(booking.start_date).toLocaleDateString()}</p>
                   </div>
                   <div>
                     <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Price</p>
                     <p className="text-sm font-bold text-blue-600 dark:text-cyan-400">${booking.total_price}</p>
                   </div>
                   {booking.payment_status !== 'paid' && booking.status !== 'rejected' && (
                     <div className="flex items-end">
                       <Link
                         href={`/checkout/${booking.id}`}
                         className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-lg shadow-md transition-all active:scale-95 hover:shadow-lg"
                       >
                         Pay Now →
                       </Link>
                     </div>
                   )}
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
