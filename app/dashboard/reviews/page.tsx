"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/AuthContext";
import { 
  Star, 
  MessageSquare, 
  Image as ImageIcon, 
  Plus, 
  Filter,
  MoreVertical,
  ThumbsUp,
  MapPin,
  Loader2,
  Calendar,
  X
} from "lucide-react";

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    images: string[];
    location: string;
  };
};

type EligibleBooking = {
  id: string;
  listing_id: string;
  listing_title: string;
};

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligibleBookings, setEligibleBookings] = useState<EligibleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Review Form State
  const [selectedBooking, setSelectedBooking] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviewsData();
  }, [user]);

  async function fetchReviewsData() {
    if (!user) return;
    setLoading(true);

    // 1. Fetch existing reviews
    const { data: rData } = await supabase
      .from("reviews")
      .select(`
        id, rating, comment, created_at,
        listing:listing_id (id, title, images, location)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (rData) setReviews(rData as any);

    // 2. Fetch eligible bookings (Completed & No Review yet)
    // For simplicity, we just fetch completed bookings
    const { data: bData } = await supabase
      .from("bookings")
      .select(`
        id, 
        listing:listing_id (id, title)
      `)
      .eq("user_id", user.id)
      .eq("status", "completed");

    if (bData) {
      setEligibleBookings(bData.map(b => ({
        id: b.id,
        listing_id: (b.listing as any).id,
        listing_title: (b.listing as any).title
      })));
    }

    setLoading(false);
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !comment || submitting) return;

    setSubmitting(true);
    const booking = eligibleBookings.find(b => b.id === selectedBooking);
    
    try {
      const { error } = await supabase
        .from("reviews")
        .insert({
          user_id: user?.id,
          listing_id: booking?.listing_id,
          rating,
          comment
        });

      if (error) throw error;
      
      alert("Review posted successfully!");
      setIsModalOpen(false);
      setComment("");
      setRating(5);
      fetchReviewsData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">My Reviews</h1>
          <p className="text-slate-500 dark:text-slate-400">Share your experiences and help the community</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-105 transition-all text-sm"
        >
          <Plus className="w-5 h-5" /> Write New Review
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="text-4xl font-black text-blue-600 mb-1">{reviews.length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reviews Posted</div>
         </div>
         <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="text-4xl font-black text-emerald-600 mb-1">{eligibleBookings.length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Reviews</div>
         </div>
         <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="text-4xl font-black text-yellow-500 mb-1 flex items-center justify-center gap-1">
              {reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : '0.0'} <Star className="w-6 h-6 fill-current" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Rating Given</div>
         </div>
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
              <div className="flex flex-col md:flex-row">
                 <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
                    <img 
                      src={review.listing.images?.[0] || 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=400&q=80'} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={review.listing.title}
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                 </div>
                 <div className="flex-1 p-8 sm:p-10 space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                       <div>
                          <h3 className="text-xl font-black mb-1">{review.listing.title}</h3>
                          <div className="flex items-center gap-2 text-slate-500 text-sm">
                             <MapPin className="w-4 h-4" /> {review.listing.location}
                          </div>
                       </div>
                       <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-200 dark:text-slate-700'}`} />
                          ))}
                       </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                       <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">"{review.comment}"</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-2">
                             <ThumbsUp className="w-4 h-4" /> Recommended
                          </span>
                          <span>Reviewed on {new Date(review.created_at).toLocaleDateString()}</span>
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
            <MessageSquare className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black mb-2">No reviews yet</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-10">
            Share your experiences with other travelers! You can review any property or tour after your trip is completed.
          </p>
        </div>
      )}

      {/* New Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-2xl font-black">Write a Review</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Select Trip</label>
                <select 
                  required
                  value={selectedBooking}
                  onChange={(e) => setSelectedBooking(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 font-bold text-sm appearance-none"
                >
                  <option value="">Choose a completed trip...</option>
                  {eligibleBookings.map(b => (
                    <option key={b.id} value={b.id}>{b.listing_title}</option>
                  ))}
                  {eligibleBookings.length === 0 && <option disabled>No completed trips found</option>}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 text-center block">Your Rating</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                      key={s} 
                      type="button"
                      onClick={() => setRating(s)}
                      className={`p-2 transition-transform hover:scale-110 ${s <= rating ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-700'}`}
                    >
                      <Star className={`w-8 h-8 ${s <= rating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Your Feedback</label>
                <textarea 
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 text-sm resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting || eligibleBookings.length === 0}
                className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Post Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
