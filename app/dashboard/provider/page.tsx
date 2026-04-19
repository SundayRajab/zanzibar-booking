"use client";

import { useAuth } from "../../lib/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

type Listing = {
  id: string;
  title: string;
  category: string;
  price: number;
  location: string;
  images: string[];
  average_rating: number;
  reviews_count: number;
};

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  status: string;
  payment_status: string;
  total_price: number;
  created_at: string;
  listings: {
    title: string;
    category: string;
  };
};

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "listings" | "bookings">("overview");

  useEffect(() => {
    if (!user) return;
    fetchProviderData();
  }, [user]);

  const fetchProviderData = async () => {
    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();
    setProfile(profileData);

    // Fetch provider's listings
    const { data: listingsData } = await supabase
      .from("listings")
      .select("*")
      .eq("provider_id", user!.id)
      .order("created_at", { ascending: false });
    setListings(listingsData || []);

    // Fetch bookings for this provider's listings
    // We need to get listing IDs first, then query bookings
    if (listingsData && listingsData.length > 0) {
      const listingIds = listingsData.map((l: any) => l.id);
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*, listings(title, category)")
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false });
      setBookings(bookingsData || []);
    }

    setLoading(false);
  };

  const handleBookingAction = async (bookingId: string, action: "confirmed" | "rejected") => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: action })
      .eq("id", bookingId);

    if (!error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: action } : b))
      );
    } else {
      alert("Error: " + error.message);
    }
  };

  const totalRevenue = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile || profile.role !== "provider") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-black dark:text-white">Provider Dashboard</h1>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">Provider Access Required</h2>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-6">
            You need a Provider account to access this dashboard. You can upgrade your account by contacting support or registering as a Provider.
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
          >
            Register as Provider
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Provider Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Manage your properties, track bookings, and view revenue.
          </p>
        </div>
        <span className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-xs font-extrabold uppercase tracking-widest rounded-full shadow-lg shadow-purple-500/25">
          Provider
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl text-white shadow-xl shadow-green-500/20">
          <p className="text-green-100 text-sm font-medium mb-1">Total Revenue</p>
          <p className="text-3xl font-extrabold">${totalRevenue.toLocaleString()}</p>
          <p className="text-green-200 text-xs mt-2">{confirmedBookings} confirmed bookings</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
          <p className="text-zinc-500 text-sm font-medium mb-1">Active Listings</p>
          <p className="text-3xl font-extrabold text-black dark:text-white">{listings.length}</p>
          <p className="text-zinc-400 text-xs mt-2">Properties on the platform</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <p className="text-zinc-500 text-sm font-medium mb-1">Pending Requests</p>
          <p className="text-3xl font-extrabold text-black dark:text-white">{pendingBookings}</p>
          {pendingBookings > 0 && (
            <span className="absolute top-4 right-4 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
          )}
          <p className="text-zinc-400 text-xs mt-2">Awaiting your response</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl w-fit">
        {(["overview", "listings", "bookings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              tab === t
                ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-black dark:text-white">Recent Booking Activity</h2>
          {bookings.length === 0 ? (
            <p className="text-zinc-500 italic text-sm py-8">No booking activity yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-black dark:text-white">{b.customer_name}</span>
                    <span className="text-xs text-zinc-500">{b.listings?.title} · {new Date(b.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-black dark:text-white">${b.total_price}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        b.status === "confirmed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : b.status === "rejected"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "listings" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black dark:text-white">My Properties</h2>
          </div>
          {listings.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <p className="text-zinc-500 text-lg mb-2">No listings yet</p>
              <p className="text-zinc-400 text-sm">Contact the admin to add your properties to the platform.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="h-40 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <img
                      src={listing.images?.[0] || `https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&q=80`}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-black dark:text-white text-lg">{listing.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full font-bold uppercase text-zinc-600 dark:text-zinc-400">
                        {listing.category}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mb-3">{listing.location}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-lg font-extrabold text-blue-600 dark:text-cyan-400">${listing.price}<span className="text-xs text-zinc-400 font-normal">/night</span></span>
                      <div className="flex items-center gap-1 text-sm text-zinc-500">
                        <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        {listing.average_rating || "New"} ({listing.reviews_count || 0})
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "bookings" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-black dark:text-white">All Booking Requests</h2>
          {bookings.length === 0 ? (
            <p className="text-zinc-500 italic text-sm py-8">No booking requests received yet.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-black dark:text-white">{b.customer_name}</h3>
                      <p className="text-sm text-zinc-500">{b.listings?.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                          b.payment_status === "paid"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {b.payment_status}
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                          b.status === "confirmed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : b.status === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Dates</p>
                      <p className="text-black dark:text-white font-medium">
                        {new Date(b.start_date).toLocaleDateString()} → {new Date(b.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Contact</p>
                      <p className="text-black dark:text-white font-medium truncate">{b.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Phone</p>
                      <p className="text-black dark:text-white font-medium">{b.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Revenue</p>
                      <p className="text-lg font-extrabold text-blue-600 dark:text-cyan-400">${b.total_price}</p>
                    </div>
                  </div>

                  {b.status === "pending" && (
                    <div className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        onClick={() => handleBookingAction(b.id, "confirmed")}
                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleBookingAction(b.id, "rejected")}
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
