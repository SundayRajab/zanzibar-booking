"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/AuthContext";

type Listing = {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  images: string[];
};

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3); // show latest 3 recommendations
      if (data) setListings(data);
      setLoading(false);
    }
    fetchListings();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mb-8">
            Ready for your next luxury getaway in Zanzibar? Explore our curated recommendations or manage your upcoming trips.
          </p>
          <div className="flex gap-4">
            <Link href="/" className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              Explore Zanzibar
            </Link>
          </div>
        </div>
        {/* Decorative background circle */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Recommended Stays (Similar to Home Page) */}
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Recommended for You</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl aspect-[4/3] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="group bg-white dark:bg-zinc-900/40 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={listing.images && listing.images[0] ? listing.images[0] : `https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80&sig=${listing.id}`}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {listing.title}
                  </h3>
                  <div className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                    {listing.location}
                  </div>
                  <div className="mt-auto">
                    <p className="font-extrabold text-xl text-black dark:text-white">${listing.price}<span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">/night</span></p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
