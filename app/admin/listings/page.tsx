"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"

type Listing = {
  id: string
  title: string
  category: string
  location: string
  price: number
  images: string[]
  details?: Record<string, any>
  created_at: string
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState("all")

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("hotels")
  const [location, setLocation] = useState("")
  const [price, setPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [details, setDetails] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchListings()
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { data: sessionData } = await supabase.auth.getSession()

    const newListing = {
      title,
      category,
      location,
      price: parseFloat(price),
      images: imageUrl ? [imageUrl] : [],
      description: "Added from Admin Panel",
      details,
      provider_id: sessionData?.session?.user?.id
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
      setDetails({})
      setIsModalOpen(false)
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

  const filteredListings = listings.filter(l => filterCategory === "all" || l.category === filterCategory)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black dark:text-white tracking-tight">Content Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage hotels, apartments, cars, and tours.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          + Add Listing
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'hotels', 'apartments', 'cars', 'tours'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-colors ${
              filterCategory === cat 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
         <div className="flex justify-center py-20">
           <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <div key={listing.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="h-48 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                <img
                  src={listing.images && listing.images[0] ? listing.images[0] : `https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=400&q=80&sig=${listing.id}`}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-md">
                  {listing.category}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-black dark:text-white leading-tight mb-1 line-clamp-1">{listing.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-1">📍 {listing.location}</p>
                <div className="mt-auto flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <div className="text-lg font-black text-blue-600 dark:text-cyan-400">
                    ${listing.price}<span className="text-sm font-medium text-zinc-500">/day</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(listing.id)} 
                    className="text-sm font-bold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredListings.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
              <p className="text-zinc-500 font-medium">No listings found for this category.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Add New Listing</h2>
            
            <form onSubmit={handleAdd} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Title</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all appearance-none">
                    <option value="hotels">Hotels</option>
                    <option value="apartments">Apartments</option>
                    <option value="cars">Cars</option>
                    <option value="tours">Tours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Location</label>
                  <input required type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Price / Day ($)</label>
                  <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Image URL (Optional)</label>
                  <input type="url" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"/>
                </div>
              </div>

              {/* Dynamic Details Area based on Category */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-black dark:text-white mb-3">Category Specific Features</h3>
                
                {category === 'hotels' || category === 'apartments' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Room Types Provided</label>
                      <input type="text" placeholder="e.g. Single, Double, Suite" value={details.room_types || ''} onChange={e => setDetails({...details, room_types: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Max Target Guests</label>
                      <input type="number" placeholder="2" value={details.max_guests || ''} onChange={e => setDetails({...details, max_guests: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all" />
                    </div>
                  </div>
                ) : category === 'cars' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Transmission</label>
                      <select value={details.transmission || 'Automatic'} onChange={e => setDetails({...details, transmission: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all">
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Seats</label>
                      <input type="number" placeholder="4" value={details.seats || ''} onChange={e => setDetails({...details, seats: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all" />
                    </div>
                  </div>
                ) : category === 'tours' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Tour Duration</label>
                      <input type="text" placeholder="e.g. 4 Hours / Full Day" value={details.duration || ''} onChange={e => setDetails({...details, duration: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Hotel Pickup</label>
                      <select value={details.pickup || 'Yes'} onChange={e => setDetails({...details, pickup: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all">
                         <option value="Yes">Yes</option>
                         <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 text-zinc-600 dark:text-zinc-400 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button disabled={submitting} type="submit" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md disabled:opacity-50">
                  {submitting ? "Publishing..." : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
