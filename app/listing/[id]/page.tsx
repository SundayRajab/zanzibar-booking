"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
  details?: Record<string, any>
  average_rating?: number
  reviews_count?: number
}

type Review = {
  id: string
  rating: number
  comment: string
  created_at: string
  profiles?: { full_name: string }
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [bookingDetails, setBookingDetails] = useState<Record<string, any>>({})
  
  // Specific states for advanced pricing logic
  const [tourDuration, setTourDuration] = useState("Full Day")
  const [tourHours, setTourHours] = useState<number>(3)
  const [mileagePackage, setMileagePackage] = useState("Limited (50 miles/day)")

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState("")

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState("")
  const [reviewSuccess, setReviewSuccess] = useState(false)

  useEffect(() => {
    if (id) {
      fetchListingDetails()
      fetchReviews()
    }
  }, [id])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?listing_id=${id}`)
      const data = await res.json()
      if (Array.isArray(data)) setReviews(data)
    } catch (e) {
      console.error("Failed to fetch reviews:", e)
    }
  }

  const handleSubmitReview = async () => {
    setSubmittingReview(true)
    setReviewError("")
    setReviewSuccess(false)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      setReviewError("You must be signed in to leave a review.")
      setSubmittingReview(false)
      return
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.user.id,
          listing_id: id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setReviewError(result.error || 'Failed to submit review.')
      } else {
        setReviewSuccess(true)
        setReviewComment("")
        fetchReviews() // refresh the list
      }
    } catch {
      setReviewError('Network error. Please try again.')
    }
    setSubmittingReview(false)
  }

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
        <div className="text-center bg-white dark:bg-zinc-900/50 rounded-2xl p-16 border border-zinc-200 dark:border-zinc-800 max-w-lg w-full shadow-lg">
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Listing Not Found</h2>
          <p className="text-zinc-500 dark:text-zinc-400">The listing you are looking for does not exist or has been removed.</p>
          <Link href="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const isTour = listing?.category?.toLowerCase().includes('tour')
  const isCar = listing?.category?.toLowerCase().includes('car')
  const isHotel = listing && (listing.category.toLowerCase().includes('hotel') || listing.category.toLowerCase().includes('apartment'))

  const calculateDays = () => {
    if (!startDate || (!endDate && !isTour)) return 1
    const start = new Date(startDate)
    const end = new Date(endDate || startDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }

  const getCurrentPrice = () => {
    if (!listing) return 0;
    let price = listing.price;
    if (isHotel) {
      const roomType = bookingDetails.room_type || 'Standard';
      const rt = roomType.toLowerCase();
      if (rt.includes('suite')) price = listing.price * 2.5;
      else if (rt.includes('deluxe') || rt.includes('family')) price = listing.price * 2.0;
      else if (rt.includes('double') || rt.includes('twin')) price = listing.price * 1.5;
    } else if (isTour) {
      if (tourDuration === 'Half Day') price = listing.price * 0.6;
      else if (tourDuration === 'Hourly') price = listing.price * 0.15;
    }
    return price;
  }

  const currentPrice = getCurrentPrice();

  const calculateTotalPrice = () => {
    if (!listing) return 0;
    const basePrice = currentPrice;
    
    if (isTour) {
      const tickets = bookingDetails.tickets || 1;
      if (tourDuration === 'Hourly') {
         return basePrice * tourHours * tickets;
      }
      return basePrice * tickets;
    } else if (isCar) {
      let days = calculateDays();
      let total = 0;
      
      // Auto-apply logic for Cars (Weekly/Monthly discounts)
      if (days >= 30) {
        const months = Math.floor(days / 30);
        const remainderDays = days % 30;
        total = (basePrice * 20 * months) + (basePrice * remainderDays);
      } else if (days >= 7) {
        const weeks = Math.floor(days / 7);
        const remainderDays = days % 7;
        total = (basePrice * 5 * weeks) + (basePrice * remainderDays);
      } else {
        total = basePrice * days;
      }

      if (bookingDetails.driver === 'Yes (+ $20/day)') {
        total += 20 * days;
      }
      if (mileagePackage === 'Unlimited (+ $10/day)') {
        total += 10 * days;
      }
      return total;
    } else {
      // Hotel / Apartment (Calculation is per night)
      let days = calculateDays();
      let total = basePrice * days;
      return total;
    }
  }

  const totalPrice = calculateTotalPrice();
  const calculatedDays = calculateDays();

  const handleBookNow = async () => {
    setBookingError("");
    if (!startDate || (!isTour && !endDate)) {
      setBookingError("Please select your dates first.")
      return
    }
    if (!customerName || !customerEmail || !customerPhone) {
      setBookingError("Please enter your contact details so we can coordinate your booking.")
      return
    }

    setSubmitting(true)

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null

    const finalEndDate = isTour && !endDate ? startDate : endDate;

    // Real-Time Availability Pre-Check via Frontend (Double Booking Prevention Validation)
    // We must block BOTH 'confirmed' and 'pending_payment' bookings to prevent double-booking during checkout.
    const { data: overlappingBookings } = await supabase
      .from('bookings')
      .select('id, status, created_at')
      .eq('listing_id', listing.id)
      .in('status', ['confirmed', 'pending_payment'])
      .lte('start_date', finalEndDate)
      .gte('end_date', startDate)

    // Filter out expired pending_payment bookings (older than 10 minutes)
    const validOverlaps = overlappingBookings?.filter(b => {
      if (b.status === 'confirmed') return true;
      const createdTime = new Date(b.created_at).getTime();
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      return createdTime > tenMinutesAgo; // if it's newer than 10 mins, it's a valid lock
    });

    if (validOverlaps && validOverlaps.length > 0) {
      setSubmitting(false)
      setBookingError("These dates are no longer available. Please select different dates.")
      return
    }


    // Extend booking details with new properties
    const extendedBookingDetails = {
      ...bookingDetails,
      ...(isTour && { tourDuration, tourHours }),
      ...(isCar && { mileagePackage }),
    };

    // Optimistic UI: Generate ID and redirect instantly to eliminate waiting
    const newBookingId = crypto.randomUUID();

    // Fire DB insert asynchronously (fire-and-forget from the client's perspective)
    supabase
      .from('bookings')
      .insert([
        {
          id: newBookingId,
          user_id: userId,
          listing_id: listing.id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          start_date: startDate,
          end_date: finalEndDate,
          status: 'pending_payment',
          payment_status: 'unpaid',
          booking_details: extendedBookingDetails,
          total_price: totalPrice
        }
      ]).then(({ error }) => {
        if (error) console.error("Async Booking Error:", error)
      });

    // Instantly route to the checkout portal for payment
    router.push(`/checkout/${newBookingId}`);
  }

  if (isSubmitted) {
    return (
      <div className="bg-zinc-50 dark:bg-[#0a0a0a] min-h-screen font-sans flex items-center justify-center p-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl">
           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
             </svg>
           </div>
           <h2 className="text-3xl font-extrabold text-black dark:text-white mb-4">Request Received!</h2>
           <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-8 leading-relaxed">
             We are coordinating directly with the provider to secure your dates. 
             <br /><br />
             <strong>What happens next?</strong><br />
             Once availability is confirmed, we will reach out to you via <strong>WhatsApp</strong> or <strong>Email</strong> with a secure link to complete your payment (Full or Half deposit).
           </p>
           <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl transition-transform active:scale-95 shadow-xl">
             Browse More Experiences
           </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-50 dark:bg-[#0a0a0a] min-h-screen font-sans pb-24">
      {/* Hero Header Section */}
      <div className="max-w-7xl mx-auto px-6 py-8 lg:px-24">
        <h1 className="text-3xl md:text-5xl font-extrabold text-black dark:text-white tracking-tight mb-4">
          {listing.title}
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-300 font-medium md:text-lg mb-6">
          <span className="flex items-center gap-1">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {listing.average_rating || 'New'} ({listing.reviews_count || 0} reviews)
          </span>
          <span className="underline decoration-zinc-400">{listing.location}</span>
          <span className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
            {listing.category}
          </span>
        </div>

        {/* Image Grid Airbnb Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-[50vh] md:h-[60vh] rounded-3xl overflow-hidden">
          <div className="md:col-span-2 md:row-span-2 h-full">
            <img
              src={listing.images && listing.images[0] ? listing.images[0] : `https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=1920&q=80&sig=${listing.id}1`}
              alt={listing.title}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
            />
          </div>
          <div className="hidden md:block col-span-1 row-span-1 h-full">
            <img
              src={listing.images && listing.images[1] ? listing.images[1] : `https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80&sig=${listing.id}2`}
              alt={listing.title}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
            />
          </div>
          <div className="hidden md:block col-span-1 row-span-1 h-full">
            <img
              src={listing.images && listing.images[2] ? listing.images[2] : `https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80&sig=${listing.id}3`}
              alt={listing.title}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
            />
          </div>
          <div className="hidden md:block col-span-1 row-span-1 h-full">
            <img
              src={listing.images && listing.images[3] ? listing.images[3] : `https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80&sig=${listing.id}4`}
              alt={listing.title}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
            />
          </div>
          <div className="hidden md:block col-span-1 row-span-1 h-full">
            <img
              src={listing.images && listing.images[4] ? listing.images[4] : `https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80&sig=${listing.id}5`}
              alt={listing.title}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-8 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Left Column (Details) */}
          <div className="lg:col-span-2 space-y-12">
            <section className="pb-8 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                {isCar ? 'Premium Vehicle Detail' : isTour ? 'Curated Experience' : `Hosted in ${listing.location}`}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
                {listing.description || (isCar 
                  ? `Drive around Zanzibar in comfort with this reliable ${listing.category}. Whether you are exploring the beautiful beaches or navigating the town, it provides everything you need for a smooth and enjoyable journey.`
                  : isTour 
                  ? `Discover the beauty of Zanzibar with this exclusive ${listing.category}. This experience is perfectly curated to offer you unforgettable memories, breathtaking views, and local insights.`
                  : `Experience the ultimate ${listing.category} with this premium offering in ${listing.location}. Elegantly designed and perfectly situated, it offers everything you need for an unforgettable stay in Zanzibar.`)}
              </p>
            </section>

            {listing.details && Object.keys(listing.details).length > 0 && (
              <section className="pb-8 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xl font-bold text-black dark:text-white mb-6">Specific Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
                  {Object.entries(listing.details).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-zinc-500 font-semibold uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</p>
                      <p className="text-black dark:text-white font-medium text-lg">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="pb-8 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
                {isCar ? 'Vehicle Features' : isTour ? 'Tour Highlights' : 'What this place offers'}
              </h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                {(isCar 
                  ? ['Automatic Transmission', 'Air Conditioning', 'Leather Seats', 'Comprehensive Insurance', 'Bluetooth Audio', '24/7 Roadside Assistance']
                  : isTour
                  ? ['Expert Guide', 'Roundtrip Transfer', 'Refreshments Included', 'All Entrance Fees', 'Safety Equipment', 'Professional Photos']
                  : ['High-Speed WiFi', 'Air Conditioning', 'Free Parking on premises', 'Ocean View', 'Breakfast Included', 'Dedicated Workspace']
                ).map((amenity, i) => (
                  <div key={i} className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                    <svg className="w-6 h-6 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-lg">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="pb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  {listing.average_rating ? `${listing.average_rating} · ` : ''}{reviews.length} Review{reviews.length !== 1 ? 's' : ''}
                </h2>
              </div>

              {/* Review Cards */}
              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                            {(r.profiles?.full_name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-black dark:text-white text-sm">{r.profiles?.full_name || 'Anonymous'}</p>
                            <p className="text-xs text-zinc-400">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} className={`w-4 h-4 ${s <= r.rating ? 'text-yellow-500' : 'text-zinc-200 dark:text-zinc-700'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 italic text-sm mb-10">No reviews yet. Be the first to share your experience!</p>
              )}

              {/* Write a Review */}
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-4">Leave a Review</h3>
                
                {reviewSuccess ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl text-green-700 dark:text-green-400 text-sm font-semibold">
                    ✓ Thank you! Your review has been published.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400 text-sm">
                        {reviewError}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setReviewRating(s)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <svg className={`w-8 h-8 ${s <= reviewRating ? 'text-yellow-500' : 'text-zinc-300 dark:text-zinc-700'} transition-colors`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Your Experience</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Tell future guests about your stay..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white resize-none"
                      />
                    </div>
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50 text-sm"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column (Sticky Booking Widget) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 mb-8">
                
                {/* Price Header */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-black dark:text-white">${currentPrice}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    / {isCar ? 'day' : isTour ? 'person' : 'night'}
                  </span>
                </div>
                
                <div className="border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden mb-4">
                  {/* Dates Row */}
                  <div className="flex border-b border-zinc-300 dark:border-zinc-700">
                    <div className="w-1/2 p-3 border-r border-zinc-300 dark:border-zinc-700">
                      <label className="block text-xs font-bold text-zinc-900 dark:text-white uppercase mb-1">
                        {isCar ? 'Pick-up' : isTour ? 'Date' : 'Check-in'}
                      </label>
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)} 
                        min={new Date().toISOString().split('T')[0]} 
                        className="w-full bg-transparent text-zinc-700 dark:text-zinc-300 text-sm focus:outline-none appearance-none" 
                      />
                    </div>
                    {!isTour && (
                      <div className="w-1/2 p-3">
                        <label className="block text-xs font-bold text-zinc-900 dark:text-white uppercase mb-1">
                          {isCar ? 'Drop-off' : 'Check-out'}
                        </label>
                        <input 
                          type="date" 
                          value={endDate} 
                          onChange={e => setEndDate(e.target.value)} 
                          min={startDate || new Date().toISOString().split('T')[0]} 
                          className="w-full bg-transparent text-zinc-700 dark:text-zinc-300 text-sm focus:outline-none appearance-none" 
                        />
                      </div>
                    )}
                  </div>

                  {/* Dynamic Options based on Category */}
                  <div className="p-3">
                    {isHotel && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-zinc-900 dark:text-white uppercase mb-1">Guests</label>
                          <select 
                            value={bookingDetails.guests || '1'} 
                            onChange={e => setBookingDetails({...bookingDetails, guests: e.target.value})} 
                            className="w-full bg-transparent text-zinc-700 dark:text-zinc-300 text-sm focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="1">1 Person</option>
                            <option value="2">2 People</option>
                            <option value="3">3 People</option>
                            <option value="4">4+ People</option>
                          </select>
                        </div>
                        <div className="border-t border-zinc-300 dark:border-zinc-700 pt-3">
                          <label className="block text-xs font-bold text-zinc-900 dark:text-white uppercase mb-1">Room Type</label>
                          <select 
                            value={bookingDetails.room_type || 'Standard'} 
                            onChange={e => setBookingDetails({...bookingDetails, room_type: e.target.value})} 
                            className="w-full bg-transparent text-zinc-700 dark:text-zinc-300 text-sm focus:outline-none appearance-none cursor-pointer"
                          >
                            {(listing.details?.room_types ? listing.details.room_types.split(',') : ['Standard', 'Double', 'Suite']).map((rt: string) => (
                              <option key={rt} value={rt.trim()}>{rt.trim()}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {isTour && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-zinc-900 dark:text-white uppercase mb-1">Tickets / People</label>
                          <input 
                            type="number" 
                            min="1" 
                            value={bookingDetails.tickets || 1} 
                            onChange={e => setBookingDetails({...bookingDetails, tickets: parseInt(e.target.value) || 1})} 
                            className="w-full bg-transparent text-zinc-700 dark:text-zinc-300 text-sm focus:outline-none appearance-none" 
                          />
                        </div>
                        <div className="border-t border-zinc-300 dark:border-zinc-700 pt-3">
                          <label className="block text-xs font-bold text-zinc-900 dark:text-white uppercase mb-1">Duration</label>
                          <select 
                            value={tourDuration} 
                            onChange={e => setTourDuration(e.target.value)} 
                            className="w-full bg-transparent text-zinc-700 dark:text-zinc-300 text-sm focus:outline-none appearance-none cursor-pointer"
                          >
                            <option>Full Day</option>
                            <option>Half Day</option>
                            <option>Hourly</option>
                          </select>
                        </div>
                        {tourDuration === 'Hourly' && (
                          <div className="border-t border-zinc-300 dark:border-zinc-700 pt-3">
                            <label className="block text-xs font-bold text-zinc-900 dark:text-white uppercase mb-1">Hours</label>
                            <input 
                              type="number" 
                              min="1" 
                              max="24"
                              value={tourHours} 
                              onChange={e => setTourHours(parseInt(e.target.value) || 1)} 
                              className="w-full bg-transparent text-zinc-700 dark:text-zinc-300 text-sm focus:outline-none appearance-none" 
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {isCar && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-zinc-900 dark:text-white uppercase mb-1">Driver Option</label>
                          <select 
                            value={bookingDetails.driver || 'No'} 
                            onChange={e => setBookingDetails({...bookingDetails, driver: e.target.value})} 
                            className="w-full bg-transparent text-zinc-700 dark:text-zinc-300 text-sm focus:outline-none appearance-none cursor-pointer"
                          >
                            <option>No, I will drive</option>
                            <option>Yes (+ $20/day)</option>
                          </select>
                        </div>
                        <div className="border-t border-zinc-300 dark:border-zinc-700 pt-3">
                          <label className="block text-xs font-bold text-zinc-900 dark:text-white uppercase mb-1">Mileage Package</label>
                          <select 
                            value={mileagePackage} 
                            onChange={e => setMileagePackage(e.target.value)} 
                            className="w-full bg-transparent text-zinc-700 dark:text-zinc-300 text-sm focus:outline-none appearance-none cursor-pointer"
                          >
                            <option>Limited (50 miles/day)</option>
                            <option>Unlimited (+ $10/day)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {bookingError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium animate-pulse">
                    {bookingError}
                  </div>
                )}

                <button 
                  onClick={handleBookNow}
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-[#e61e4d] to-[#d70466] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 active:scale-95 text-lg disabled:opacity-50"
                >
                  {submitting ? "Requesting..." : "Reserve"}
                </button>
                <div className="text-center mt-4">
                   <p className="text-zinc-500 text-sm">You won't be charged yet</p>
                </div>

                {/* Price Breakdown Calculation */}
                {totalPrice > 0 && startDate && (isTour || endDate) && (
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                    {!isTour && (
                      <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                        <span className="underline">
                          ${currentPrice} x {calculatedDays} {isCar ? 'day(s)' : 'night(s)'}
                        </span>
                        <span>
                          ${(isCar && calculatedDays >= 30) 
                            ? (currentPrice * 20 * Math.floor(calculatedDays/30) + currentPrice * (calculatedDays % 30))
                            : (isCar && calculatedDays >= 7)
                            ? (currentPrice * 5 * Math.floor(calculatedDays/7) + currentPrice * (calculatedDays % 7))
                            : currentPrice * calculatedDays}
                        </span>
                      </div>
                    )}
                    {isCar && calculatedDays >= 7 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400 font-medium text-sm">
                        <span>Bulk Discount Applied</span>
                        <span>Auto-Calculated</span>
                      </div>
                    )}
                    {isTour && (
                      <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                        <span className="underline">
                          ${currentPrice} x {bookingDetails.tickets || 1} tickets
                          {tourDuration === 'Hourly' && ` x ${tourHours} hrs`}
                        </span>
                        <span>
                          ${tourDuration === 'Hourly' ? currentPrice * tourHours * (bookingDetails.tickets || 1) : currentPrice * (bookingDetails.tickets || 1)}
                        </span>
                      </div>
                    )}
                    {isCar && bookingDetails.driver === 'Yes (+ $20/day)' && (
                      <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                        <span className="underline">Driver Fee ($20 x {calculatedDays})</span>
                        <span>${20 * calculatedDays}</span>
                      </div>
                    )}
                    {isCar && mileagePackage === 'Unlimited (+ $10/day)' && (
                      <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                        <span className="underline">Unlimited Mileage ($10 x {calculatedDays})</span>
                        <span>${10 * calculatedDays}</span>
                      </div>
                    )}

                    {/* Final Total */}
                    <div className="flex justify-between font-extrabold text-black dark:text-white pt-4 border-t border-zinc-200 dark:border-zinc-800 text-lg">
                      <span>Total</span>
                      <span>${totalPrice}</span>
                    </div>
                  </div>
                )}

                {/* Contact Information Form for the Request */}
                <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-4">Guest Information</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Full Name" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all" />
                    <input type="email" placeholder="Email Address" required value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all" />
                    <input type="tel" placeholder="Phone (e.g. +1...)" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all" />
                  </div>
                </div>

              </div>

              {/* WhatsApp Support Box */}
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 text-center">
                 <h3 className="text-lg font-bold text-black dark:text-white mb-2">Have questions?</h3>
                 <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                   Our concierge is available 24/7 to assist you.
                 </p>
                 <a 
                   href={`https://wa.me/255674020254?text=${encodeURIComponent(`Hi, I'm interested in the ${listing.title} (${listing.category}) I found on your platform. Could you provide more information?`)}`}
                   target="_blank"
                   rel="noreferrer"
                   className="w-full py-3 border-2 border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                 >
                   <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                     <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                   </svg>
                   Message Us
                 </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
