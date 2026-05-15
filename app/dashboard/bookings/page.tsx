"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/AuthContext";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MapPin, 
  Calendar, 
  Users, 
  CreditCard,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  AlertCircle,
  FileText,
  XCircle,
  RefreshCcw,
  CheckCircle2,
  MessageSquare
} from "lucide-react";

type Booking = {
  id: string;
  status: string;
  payment_status: string;
  total_price: number;
  start_date: string;
  end_date: string;
  created_at: string;
  customer_name: string;
  guest_count?: number;
  listing: {
    id: string;
    title: string;
    images: string[];
    location: string;
    category: string;
  };
};

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  async function fetchBookings() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, status, payment_status, total_price, start_date, end_date, created_at, customer_name,
        listing:listing_id (id, title, images, location, category)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setBookings(data as any);
      setFilteredBookings(data as any);
    }
    setLoading(false);
  }

  useEffect(() => {
    let result = bookings;
    
    // Filter by status
    if (activeFilter !== "all") {
      result = result.filter(b => b.status === activeFilter);
    }

    // Search by title or location
    if (searchTerm) {
      result = result.filter(b => 
        b.listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.listing.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(result);
  }, [searchTerm, activeFilter, bookings]);

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", id);
      
      if (error) throw error;
      fetchBookings();
      alert("Booking cancelled successfully.");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestRefund = async (id: string, amount: number) => {
    if (!confirm("Request a refund for this booking?")) return;
    setActionLoading(id);
    try {
      // 1. Create refund record
      const { error: refundError } = await supabase
        .from("refunds")
        .insert({
          booking_id: id,
          user_id: user?.id,
          amount: amount,
          reason: "User requested refund from dashboard",
          status: "pending"
        });

      if (refundError) throw refundError;

      // 2. Update booking status
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: "cancelled", payment_status: "refunding" })
        .eq("id", id);

      if (bookingError) throw bookingError;

      fetchBookings();
      alert("Refund request submitted successfully.");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'refunded': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">My Bookings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and track your Zanzibar adventures</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm"
            />
          </div>
          
          <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-sm">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeFilter === filter 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Content */}
      {loading ? (
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="grid gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                <div className="lg:w-80 h-64 lg:h-auto relative overflow-hidden">
                  <img 
                    src={booking.listing.images?.[0] || 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80'} 
                    alt={booking.listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-black text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm">
                      {booking.listing.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <Link href={`/dashboard/track?id=${booking.id}`} className="px-4 py-2 bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20">
                      Live Tracking
                    </Link>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                          <AlertCircle className="w-3 h-3" /> Booking ID: {booking.id.slice(0, 8)}
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{booking.listing.title}</h3>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium">{booking.listing.location}</span>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl border font-bold text-xs uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-slate-100 dark:border-slate-800">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dates</p>
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{new Date(booking.start_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                          <CreditCard className="w-4 h-4" />
                          <span>${booking.total_price}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment</p>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                          booking.payment_status === 'paid' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          booking.payment_status === 'refunding' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {booking.payment_status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guests</p>
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span>{booking.guest_count || 2} Adults</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      Booked on {new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/dashboard/messages?booking_id=${booking.id}&title=${encodeURIComponent('Inquiry: ' + booking.listing.title)}`}
                        className="p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-colors flex items-center gap-2 font-bold text-xs"
                      >
                        <MessageSquare className="w-5 h-5" /> Message Host
                      </Link>

                      <button 
                        className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2 font-bold text-xs"
                        onClick={() => alert("Downloading invoice...")}
                      >
                        <FileText className="w-5 h-5" /> Invoice
                      </button>

                      {booking.status === 'confirmed' && (
                        <button 
                          disabled={actionLoading === booking.id}
                          onClick={() => handleCancelBooking(booking.id)}
                          className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-colors flex items-center gap-2 font-bold text-xs disabled:opacity-50"
                        >
                          <XCircle className="w-5 h-5" /> Cancel
                        </button>
                      )}

                      {booking.status === 'confirmed' && booking.payment_status === 'paid' && (
                        <button 
                          disabled={actionLoading === booking.id}
                          onClick={() => handleRequestRefund(booking.id, booking.total_price)}
                          className="p-3 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-xl transition-colors flex items-center gap-2 font-bold text-xs disabled:opacity-50"
                        >
                          <RefreshCcw className="w-5 h-5" /> Refund
                        </button>
                      )}

                      <Link href={`/listing/${booking.listing.id}`} className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-black text-white font-bold rounded-xl hover:scale-105 transition-all text-sm">
                        View Property
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-20 text-center">
          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black mb-2">No Bookings Found</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-10">
            {searchTerm || activeFilter !== "all" 
              ? "Try adjusting your search or filters to find what you're looking for." 
              : "You haven't made any bookings yet. Zanzibar is waiting for you!"}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
             <Link href="/" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">
               Explore Experiences
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}
