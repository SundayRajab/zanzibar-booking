"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

type Listing = {
  id: string
  title: string
  category: string
  location: string
  price: number
  images: string[]
}

type Booking = {
  id: string
  user_id: string
  listing_id: string
  booking_date: string
  status: string
  total_price: number
  listings?: Listing
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"listings" | "bookings">("listings")
  const [listings, setListings] = useState<Listing[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("hotels")
  const [location, setLocation] = useState("")
  const [price, setPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchListings()
    fetchBookings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error && data) {
      setListings(data)
    }
    setLoading(false)
  }

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, listings(*)")
      .order("created_at", { ascending: false })
    if (!error && data) {
      setBookings(data)
    }
  }

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id)
    if (error) {
      alert("Error updating booking: " + error.message)
    } else {
      fetchBookings()
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const newListing = {
      title,
      category,
      location,
      price: parseFloat(price),
      images: imageUrl ? [imageUrl] : [],
      description: "Added from Admin Panel"
    }

    const { error } = await supabase.from("listings").insert([newListing])
    if (error) {
      alert("Error adding listing: " + error.message)
    } else {
      // Reset form
      setTitle("")
      setCategory("hotels")
      setLocation("")
      setPrice("")
      setImageUrl("")
      fetchListings()
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return
    const { error } = await supabase.from("listings").delete().eq("id", id)
    if (error) {
      alert("Error deleting listing: " + error.message)
    } else {
      fetchListings()
    }
  }

  return (
    <div className="bg-zinc-50 dark:bg-[#0a0a0a] min-h-screen font-sans py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl sticky top-28">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mb-6">
              Add New Listing
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all">
                  <option value="hotels">Hotels</option>
                  <option value="apartments">Apartments</option>
                  <option value="cars">Cars</option>
                  <option value="tours">Tours</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Location</label>
                  <input required type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Price / Night</label>
                  <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Image URL (Optional)</label>
                <input type="url" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"/>
              </div>
              <button disabled={submitting} type="submit" className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex justify-center text-sm shadow-md">
                {submitting ? "Adding..." : "Publish Listing"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List / Bookings */}
        <div className="lg:col-span-2">
          
          <div className="mb-6 flex space-x-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 relative">
            <button 
              onClick={() => setActiveTab("listings")}
              className={`text-lg font-bold transition-colors ${activeTab === 'listings' ? 'text-blue-600 dark:text-cyan-400' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
            >
              Current Listings
            </button>
            <button 
              onClick={() => setActiveTab("bookings")}
              className={`text-lg font-bold transition-colors ${activeTab === 'bookings' ? 'text-blue-600 dark:text-cyan-400' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
            >
              Bookings
            </button>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-black dark:text-white">
              {activeTab === "listings" ? "All Listings" : "Booking Requests"}
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-cyan-400 rounded-full text-xs font-bold">
              {activeTab === "listings" ? listings.length : bookings.length} Total
            </span>
          </div>

          {loading ? (
             <div className="flex justify-center py-20">
               <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
             </div>
          ) : activeTab === "listings" ? (
            <div className="space-y-4">
              {listings.map(listing => (
                <div key={listing.id} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <div className="w-full sm:w-24 h-24 sm:h-auto aspect-square rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={listing.images && listing.images[0] ? listing.images[0] : `https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=200&q=80&sig=${listing.id}`}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-black dark:text-white leading-tight">{listing.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="capitalize px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-medium text-black dark:text-white">{listing.category}</span>
                      <span>•</span>
                      <span>{listing.location}</span>
                      <span>•</span>
                      <span className="font-bold text-blue-600 dark:text-cyan-400">${listing.price}/nt</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(listing.id)} className="px-4 py-2 mt-4 sm:mt-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-sm font-semibold transition-colors shrink-0">
                    Delete
                  </button>
                </div>
              ))}
              {listings.length === 0 && (
                <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                  No listings found. Add one on the left!
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : booking.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'}`}>
                         {booking.status}
                       </span>
                       <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                         {new Date(booking.booking_date).toLocaleDateString()}
                       </span>
                    </div>
                    <h3 className="font-bold text-lg text-black dark:text-white leading-tight">
                      {booking.listings?.title || "Unknown Listing"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <span>Total: <strong className="text-blue-600 dark:text-cyan-400">${booking.total_price}</strong></span>
                      <span>•</span>
                      <span className="text-xs text-zinc-400" title={booking.user_id}>User ID: {booking.user_id.slice(0,8)}...</span>
                    </div>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 rounded-lg text-sm font-bold transition-colors">
                        Approve
                      </button>
                      <button onClick={() => updateBookingStatus(booking.id, 'rejected')} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg text-sm font-bold transition-colors">
                        Reject
                      </button>
                    </div>
                  )}
                  {booking.status !== 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => updateBookingStatus(booking.id, 'pending')} className="px-4 py-2 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 rounded-lg text-xs font-semibold transition-colors">
                        Reset Status
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                   No bookings found yet.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
