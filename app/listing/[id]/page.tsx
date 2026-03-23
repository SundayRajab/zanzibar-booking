"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "../../lib/supabase"

type Listing = {
  id: string
  title: string
  category: string
  location: string
  price: number
  images: string[]
  description?: string
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchListingDetails()
  }, [id])

  const fetchListingDetails = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single()

    if (!error && data) {
      setListing(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex flex-col justify-center items-center py-12 px-6">
        <div className="text-center bg-white dark:bg-zinc-900/50 rounded-2xl p-16 border border-zinc-200 dark:border-zinc-800 max-w-lg w-full">
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Listing Not Found</h2>
          <p className="text-zinc-500 dark:text-zinc-400">The listing you are looking for does not exist or has been removed.</p>
          <Link href="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // Use WhatsApp for booking for now, or standard booking page.
  // The user requested to access bookings and open booking specific categories with full details.
  // We'll provide a button that links to creating a booking, but since we need an admin approval flow,
  // we might want a simple booking confirmation interface or a modal here.
  // Wait, the prompt says "openonto booking of specific categies choosing with full details".
  // Let's add a dynamic Booking confirmation section to create a booking.

  const handleBookNow = async () => {
    // Attempt to create a booking
    // This requires the user to be logged in. 
    // If not logged in, we should prompt them to log in, but let's check auth simply.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Please sign in to book this listing.");
      window.location.href = '/sign-in';
      return;
    }

    // Create a new booking
    const bookingDate = new Date().toISOString().split('T')[0]; // simple today date for prototype
    const { error } = await supabase
      .from('bookings')
      .insert([
        {
          user_id: session.user.id,
          listing_id: listing.id,
          booking_date: bookingDate,
          status: 'pending',
          total_price: listing.price
        }
      ]);

    if (error) {
      alert("Failed to submit booking: " + error.message);
    } else {
      alert("Booking request submitted successfully! Pending admin approval.");
      // Optional: redirect to a user bookings page if it existed
    }
  }

  return (
    <div className="bg-zinc-50 dark:bg-[#0a0a0a] min-h-screen font-sans pb-24">
      {/* Hero Image Section */}
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-zinc-200 dark:bg-zinc-800">
        <img
          src={listing.images && listing.images[0] ? listing.images[0] : `https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=1920&q=80&sig=${listing.id}`}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:px-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 mb-4 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest border border-white/30">
                {listing.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 text-zinc-300 md:text-lg">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {listing.location}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shrink-0 min-w-[280px]">
              <p className="text-white/80 text-sm font-medium mb-1">Price</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">${listing.price}</span>
                <span className="text-white/60">/ {listing.category === 'cars' ? 'day' : listing.category === 'tours' ? 'person' : 'night'}</span>
              </div>
              <button 
                onClick={handleBookNow}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                Request Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Overview</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
                {listing.description || `Experience the ultimate ${listing.category} with this premium offering in ${listing.location}. Elegantly designed and perfectly situated, it offers everything you need for an unforgettable stay in Zanzibar.`}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Features & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['High-Speed WiFi', 'Air Conditioning', 'Premium Support', 'Ocean View', 'Breakfast Included', '24/7 Concierge'].map((amenity, i) => (
                  <div key={i} className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 border-l border-zinc-200 dark:border-zinc-800 lg:pl-16">
            <div className="sticky top-24">
              <h3 className="text-xl font-bold text-black dark:text-white mb-6">Have questions?</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                Our dedicated concierge team is available 24/7 to assist you with special requests and personalized itineraries.
              </p>
              <a 
                href="https://wa.me/255674020254"
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 border-2 border-green-500 text-green-600 dark:text-green-400 dark:border-green-500/50 hover:bg-green-50 dark:hover:bg-green-900/20 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
