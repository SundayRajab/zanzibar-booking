"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "../../lib/supabase"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("booking_id")
  const txRef = searchParams.get("tx_ref")
  
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<any>(null)
  const [ticketNo, setTicketNo] = useState("")

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(bookingId)
    } else {
      setLoading(false)
    }
  }, [bookingId])

  const fetchBookingDetails = async (id: string) => {
    // Generate a consistent ticket number based on the booking ID
    const ticket = id.substring(0, 6).toUpperCase()
    setTicketNo(ticket)

    const { data, error } = await supabase
      .from('bookings')
      .select('*, listings(*)')
      .eq('id', id)
      .single()

    if (!error && data) {
      setBooking(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-medium">Loading your reservation...</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex flex-col justify-center items-center py-12 px-6 text-center">
         <div className="text-red-500 text-6xl mb-4">⚠️</div>
         <h1 className="text-2xl font-bold mb-2">Booking Not Found</h1>
         <p className="text-zinc-500 mb-6 font-medium">We couldn't retrieve your booking details. Please check your email or dashboard.</p>
         <Link href="/dashboard" className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full transition-transform active:scale-95 shadow-xl">
           Go to Dashboard
         </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] py-20 px-6 font-sans flex items-center justify-center">
      <div className="max-w-md w-full relative">
        {/* Ticket Top */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-3xl pt-10 px-8 pb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
          <div className="flex justify-center mb-6">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg shadow-green-500/20">
               <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
               </svg>
             </div>
          </div>
          <h1 className="text-3xl font-extrabold text-center text-black dark:text-white mb-2">Payment Confirmed</h1>
          <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
            Your stay at <strong>{booking.listings?.title}</strong> is secured. 
            <br />
            Our concierge will reach out via <strong>WhatsApp</strong> or <strong>Email</strong> within the next hour to finalize your check-in details.
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-1">Ticket Number</p>
                <p className="text-xl font-bold text-black dark:text-white font-mono">{ticketNo}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-1">Status</p>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded uppercase tracking-tighter">Verified</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-dashed border-zinc-200 dark:border-zinc-800">
               <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-1">Check-in</p>
                  <p className="text-sm font-bold text-black dark:text-white">{new Date(booking.start_date).toLocaleDateString()}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-1">Total Paid</p>
                  <p className="text-sm font-bold text-black dark:text-white">${booking.total_price}</p>
               </div>
            </div>

            <div className="pt-2 text-center">
               <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Transaction Ref</p>
               <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-500 truncate px-4">{txRef || booking.payment_reference || 'MANUAL-ENTRY'}</p>
            </div>
          </div>
        </div>

        {/* Ticket Perforations */}
        <div className="flex justify-between items-center -my-3 relative z-10 px-8">
           <div className="w-6 h-6 bg-zinc-50 dark:bg-[#0a0a0a] rounded-full -ml-11 border-r border-zinc-200 dark:border-zinc-800 absolute left-0 shadow-inner"></div>
           <div className="w-full border-t-[3px] border-dashed border-zinc-200 dark:border-zinc-800"></div>
           <div className="w-6 h-6 bg-zinc-50 dark:bg-[#0a0a0a] rounded-full -mr-11 border-l border-zinc-200 dark:border-zinc-800 absolute right-0 shadow-inner"></div>
        </div>

        {/* Ticket Bottom */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-b-3xl p-8 pt-10 shadow-2xl flex flex-col items-center">
          <div className="w-full h-12 flex justify-center items-center opacity-30 dark:filter dark:invert transition-opacity hover:opacity-50 grayscale">
             <div className="flex gap-1 h-full w-full justify-center">
                {[...Array(30)].map((_, i) => (
                   <div key={i} className={`w-[2px] bg-black ${i % 3 === 0 ? 'h-full' : i % 2 === 0 ? 'h-3/4' : 'h-1/2'}`}></div>
                ))}
             </div>
          </div>
          <Link href="/dashboard" className="w-full mt-8 bg-black dark:bg-white text-white dark:text-black text-center py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-xl hover:shadow-black/20 text-sm">
            Manage My Trips
          </Link>
        </div>
      </div>
    </div>
  )
}
