"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"
import { useAuth } from "@/app/lib/AuthContext"

type Listing = {
  id: string
  title: string
  category: string
}

type Booking = {
  id: string
  user_id: string
  listing_id: string
  start_date: string
  end_date: string
  status: string
  payment_status: string
  total_price: number
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  booking_details?: Record<string, any>
  created_at: string
  listings?: Listing
}

export default function AdminBookingsPage() {
  const { user, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!authLoading && user) {
      fetchBookings()
    }
  }, [authLoading, user])

  const fetchBookings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("bookings")
      .select("*, listings(id, title, category)")
      .order("created_at", { ascending: false })
    
    if (!error && data) {
      setBookings(data)
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, field: 'status' | 'payment_status', value: string) => {
    if (!confirm(`Are you sure you want to change ${field} to ${value}?`)) return

    const { error } = await supabase.from("bookings").update({ [field]: value }).eq("id", id)
    if (error) {
      alert("Error updating booking: " + error.message)
    } else {
      // If approved, maybe trigger the email like the old flow, but we'll leave that to the separate button or just update DB here
      fetchBookings()
    }
  }

  const handleApproveAndEmail = async (booking: Booking) => {
    // 1. Update DB to approved
    const { error } = await supabase.from("bookings").update({ status: 'approved' }).eq("id", booking.id)
    if (error) {
      alert("Error approving: " + error.message)
      return
    }

    // 2. Trigger Automated Payment Link Email
    try {
      const res = await fetch('/api/send-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          customerEmail: booking.customer_email || 'test@example.com',
          customerName: booking.customer_name || 'Guest',
          title: booking.listings?.title || 'Booking Details',
          price: booking.total_price
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      
      if (data.simulated) {
        alert(`Booking approved! Simulated payment link (copy and paste this): \n\n${data.link}`)
      } else {
        alert(`Booking approved! Payment link emailed successfully.`)
      }
    } catch (err: any) {
      alert("Approved, but failed to send email: " + err.message)
    }

    fetchBookings()
  }

  const filteredBookings = bookings.filter(b => statusFilter === "all" || b.status === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black dark:text-white tracking-tight">Booking Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Review, approve, and manage customer bookings.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'approved', 'confirmed', 'completed', 'cancelled', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-colors ${
              statusFilter === status 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Customer / Date</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Listing</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Payment</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-black dark:text-white">{booking.customer_name || "Guest"}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{booking.customer_email}</div>
                      <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-sm text-black dark:text-white line-clamp-1">{booking.listings?.title || "Unknown"}</div>
                      <div className="text-xs font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">{booking.listings?.category}</div>
                    </td>
                    <td className="p-4">
                      <select 
                        value={booking.status}
                        onChange={(e) => updateStatus(booking.id, 'status', e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border appearance-none outline-none cursor-pointer
                          ${booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800' :
                            booking.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800' :
                            booking.status === 'rejected' || booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-800'
                          }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4">
                       <select 
                        value={booking.payment_status}
                        onChange={(e) => updateStatus(booking.id, 'payment_status', e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border appearance-none outline-none cursor-pointer
                          ${booking.payment_status === 'paid' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-800' :
                            booking.payment_status === 'refunded' ? 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700' :
                            'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800'
                          }`}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="font-black text-black dark:text-white">${booking.total_price}</div>
                    </td>
                    <td className="p-4 text-right">
                      {booking.status === 'pending' && (
                        <button 
                          onClick={() => handleApproveAndEmail(booking)}
                          className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold transition-colors shadow-sm whitespace-nowrap"
                        >
                          Approve & Email
                        </button>
                      )}
                      <div className="flex justify-end mt-2 gap-2">
                        <button onClick={() => updateStatus(booking.id, 'status', 'cancelled')} className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 font-semibold">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">No bookings match the current filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
