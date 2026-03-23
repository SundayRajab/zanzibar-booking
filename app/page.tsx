"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "./lib/supabase"

type Listing = {
  id: string
  title: string
  category: string
  location: string
  price: number
  images: string[]
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12) // show latest 12
    if (error) {
      console.log(error)
      setLoading(false)
      return
    }
    setListings(data)
    setLoading(false)
  }

  if (loading) return <p className="text-center mt-16">Loading listings...</p>

  return (
    <div className="bg-zinc-50 dark:bg-[#0a0a0a] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto py-12 px-6">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-black dark:text-white mb-6 tracking-tight">
            Discover Zanzibar in <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">Luxury</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Browse and book premium Hotels, Apartments, Car Rentals, and immersive Tours — curated just for you.
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {["hotels", "apartments", "cars", "tours"].map(cat => (
            <Link
              key={cat}
              href={`/${cat}`}
              className="group bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {cat === 'hotels' && <svg className="w-10 h-10 text-blue-600 dark:text-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                {cat === 'apartments' && <svg className="w-10 h-10 text-blue-600 dark:text-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                {cat === 'cars' && <svg className="w-10 h-10 text-blue-600 dark:text-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                {cat === 'tours' && <svg className="w-10 h-10 text-blue-600 dark:text-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              </div>
              <h2 className="font-semibold text-lg text-black dark:text-white capitalize tracking-wide">
                {cat}
              </h2>
            </Link>
          ))}
        </div>

        {/* Featured Listings */}
        <div id="book" className="flex items-center justify-between mb-8 scroll-mt-28">
          <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight">Featured Stays</h2>
          <Link href="/hotels" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map(listing => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="group bg-white dark:bg-zinc-900/40 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col"
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={listing.images && listing.images[0] ? listing.images[0] : `https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80&sig=${listing.id}`}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-black dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                  {listing.title}
                </h3>
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-4 text-sm mt-auto">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {listing.location}
                </div>
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 text-sm">From</span>
                    <p className="font-extrabold text-2xl text-black dark:text-white mt-0.5">${listing.price}<span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">/night</span></p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}