"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/AuthContext";
import { 
  Heart, 
  MapPin, 
  Star, 
  ArrowRight, 
  Trash2, 
  Calendar,
  Zap,
  Loader2
} from "lucide-react";

type Favorite = {
  id: string;
  listing: {
    id: string;
    title: string;
    images: string[];
    location: string;
    price: number;
    category: string;
    average_rating: number;
  };
};

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  async function fetchFavorites() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("favorites")
      .select(`
        id,
        listing:listing_id (id, title, images, location, price, category, average_rating)
      `)
      .eq("user_id", user.id);

    if (data) setFavorites(data as any);
    setLoading(false);
  }

  const removeFavorite = async (id: string) => {
    setRemovingId(id);
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">My Wishlist</h1>
        <p className="text-slate-500 dark:text-slate-400">Items you've saved for your future Zanzibar trips</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((fav) => (
            <div key={fav.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all duration-500 relative">
              {/* Image Section */}
              <div className="aspect-[4/5] overflow-hidden relative">
                <img 
                  src={fav.listing.images?.[0] || 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80'} 
                  alt={fav.listing.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Actions Overlay */}
                <div className="absolute top-6 right-6">
                  <button 
                    disabled={removingId === fav.id}
                    onClick={() => removeFavorite(fav.id)}
                    className="p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-rose-500 transition-colors shadow-lg disabled:opacity-50"
                  >
                    {removingId === fav.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5 fill-current" />}
                  </button>
                </div>

                <div className="absolute bottom-8 left-8 right-8 text-white space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                      {fav.listing.category}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400 font-bold text-xs">
                      <Star className="w-3 h-3 fill-current" /> {fav.listing.average_rating || 4.8}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black leading-tight line-clamp-2">{fav.listing.title}</h3>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <MapPin className="w-4 h-4" /> {fav.listing.location}
                  </div>
                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black">${fav.listing.price}</span>
                      <span className="text-xs text-slate-300 ml-1">/night</span>
                    </div>
                    <Link href={`/listing/${fav.listing.id}`} className="px-6 py-3 bg-white text-slate-900 font-black rounded-xl hover:scale-105 transition-transform text-xs">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-20 text-center">
          <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-3xl font-black mb-2">Your wishlist is empty</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-10">
            Save your favorite hotels, cars, and tours to plan your dream Zanzibar trip.
          </p>
          <Link href="/" className="px-10 py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all inline-flex items-center gap-3">
             Discover Zanzibar <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
