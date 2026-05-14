"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function CheckoutPortal() {
  const { booking_id } = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('flutterwave')
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])

  useEffect(() => {
    if (booking_id) fetchBooking()
  }, [booking_id])

  useEffect(() => {
    if (!booking || booking.status === 'confirmed' || booking.payment_status === 'paid') return;

    // Calculate initial time left (10 minutes = 600 seconds)
    const createdAt = new Date(booking.created_at).getTime()
    const expiresAt = createdAt + 10 * 60 * 1000
    
    const updateTimer = () => {
      const now = new Date().getTime()
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000))
      setTimeLeft(remaining)
      
      if (remaining === 0) {
        setIsExpired(true)
        // Automatically release inventory by marking it expired in background
        supabase.from('bookings').update({ status: 'expired' }).eq('id', booking.id).then()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [booking])

  const fetchBooking = async (retryCount = 0) => {
    const { data: sessionData } = await supabase.auth.getSession()
    const currentSession = sessionData.session
    setSession(currentSession)

    const { data, error } = await supabase
      .from("bookings")
      .select("*, listings(*)")
      .eq("id", booking_id)
      .single()

    if (!error && data) {
      setBooking(data)
      if (data.status === 'expired') setIsExpired(true)

      // Associate anonymous booking with logged in user
      if (currentSession && !data.user_id) {
        await supabase
          .from("bookings")
          .update({ user_id: currentSession.user.id })
          .eq("id", data.id)
      }
      setLoading(false)
    } else if (retryCount < 5) {
      // Optimistic UI fallback: wait 500ms and retry if the async DB insert is still processing
      setTimeout(() => fetchBooking(retryCount + 1), 500)
    } else {
      setLoading(false)
    }
  }

  const handlePayNow = async () => {
    if (isExpired) return;
    setPaying(true);
    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, provider: selectedProvider }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to initiate payment session');
      }
    } catch (err: any) {
      console.error('Payment Error:', err);
      alert("Error initiating payment: " + err.message);
      setPaying(false);
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex flex-col justify-center items-center py-12 px-6">
        <div className="text-center bg-white dark:bg-zinc-900/50 rounded-2xl p-16 border border-zinc-200 dark:border-zinc-800 max-w-lg w-full">
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Invoice Not Found</h2>
          <p className="text-zinc-500 dark:text-zinc-400">This invoice does not exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-50 dark:bg-[#0a0a0a] min-h-screen font-sans py-24 px-6 flex justify-center">
      <div className="max-w-xl w-full">
        {/* Reservation Timer Banner */}
        {!isExpired && booking.status === 'pending_payment' && timeLeft !== null && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold text-sm uppercase tracking-wide">Reservation Held</p>
                <p className="text-xs">Your reservation is secured while you complete payment.</p>
              </div>
            </div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 font-mono tracking-tighter">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}

        {isExpired && (
          <div className="mb-6 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 text-center shadow-sm">
             <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </div>
             <h3 className="text-xl font-bold text-black dark:text-white mb-2">Reservation expired. Please try again.</h3>
             <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Your 10-minute hold on these dates has expired. The inventory has been released.</p>
             <Link href={`/listing/${booking.listing_id}`} className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl inline-block hover:scale-105 transition-transform">
               Try Booking Again
             </Link>
          </div>
        )}

        <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500 ${isExpired ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          {/* Decorative Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h1 className="text-3xl font-extrabold text-black dark:text-white mb-2">Secure Checkout</h1>
              <p className="text-zinc-500 dark:text-zinc-400">Complete your payment to confirm your booking.</p>
            </div>
            <div className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest border ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800/50' : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-800/50'}`}>
              {booking.payment_status || 'Unpaid'}
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl mb-8 space-y-4 relative z-10">
            <h3 className="font-bold text-lg text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-3">Booking Details</h3>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Listing</span>
              <strong className="text-black dark:text-white text-right max-w-[200px] truncate" title={booking.listings?.title}>{booking.listings?.title}</strong>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Guest Name</span>
              <strong className="text-black dark:text-white text-right max-w-[200px] truncate">{booking.customer_name}</strong>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Dates</span>
              <strong className="text-black dark:text-white text-right break-words">{new Date(booking.start_date).toLocaleDateString()} to {new Date(booking.end_date).toLocaleDateString()}</strong>
            </div>

            {booking.booking_details && Object.keys(booking.booking_details).length > 0 && (
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2 mt-3">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">Customer Selection</span>
                {Object.entries(booking.booking_details).map(([k, v]) => (
                   <div key={k} className="flex justify-between text-xs">
                     <span className="capitalize text-zinc-600 dark:text-zinc-400">{k.replace(/_/g, ' ')}</span>
                     <strong className="text-black dark:text-white">{String(v)}</strong>
                   </div>
                ))}
              </div>
            )}
            
            <div className="pt-4 border-t border-zinc-300 dark:border-zinc-700 mt-4 flex justify-between items-center">
              <span className="text-lg font-medium text-black dark:text-white">Total Amount</span>
              <span className="text-3xl font-extrabold text-blue-600 dark:text-cyan-400">${booking.total_price}</span>
            </div>
          </div>
          
          {booking.payment_status !== 'paid' && booking.status !== 'confirmed' && (
             <div className="mb-6 space-y-3 relative z-10">
                <h4 className="font-semibold text-black dark:text-white mb-2 text-sm uppercase tracking-wider">Select Payment Method</h4>
                <div className="grid grid-cols-3 gap-3">
                   <button
                     onClick={() => setSelectedProvider('flutterwave')}
                     className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${selectedProvider === 'flutterwave' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
                   >
                      <span className="font-bold text-sm">Flutterwave</span>
                   </button>
                   <button
                     onClick={() => setSelectedProvider('selcom')}
                     className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${selectedProvider === 'selcom' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
                   >
                      <span className="font-bold text-sm">Selcom</span>
                   </button>
                   <button
                     onClick={() => setSelectedProvider('dpo')}
                     className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${selectedProvider === 'dpo' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
                   >
                      <span className="font-bold text-sm">DPO</span>
                   </button>
                </div>
             </div>
          )}

          {booking.payment_status === 'paid' ? (
            <div className="w-full py-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-bold rounded-xl flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Payment Complete
            </div>
          ) : !session ? (
            <button 
              onClick={() => router.push(`/sign-in?redirect=/checkout/${booking.id}`)}
              disabled={isExpired}
              className="w-full py-4 bg-gradient-to-r from-zinc-800 to-black dark:from-zinc-200 dark:to-white text-white dark:text-black font-bold rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 text-lg disabled:opacity-50 z-10 relative capitalize"
            >
              Sign In to Complete Payment
            </button>
          ) : (
            <button 
              onClick={handlePayNow}
              disabled={paying || booking.status === 'confirmed' || isExpired}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 text-lg disabled:opacity-50 z-10 relative capitalize"
            >
              {paying ? "Opening Secure Portal..." : booking.status === 'confirmed' ? "Booking Already Confirmed" : `Pay securely`}
            </button>
          )}

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl relative z-10">
            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What happens after payment?
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
              Once your payment is confirmed, our Zanzibar concierge will contact you via <strong>WhatsApp</strong> or <strong>Email</strong> to share check-in instructions, driver details, or meeting points.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Payments are secured and encrypted.
          </div>
        </div>
      </div>
    </div>
  )
}
