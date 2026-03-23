"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "../lib/supabase"

type Listing = {
  id: string
  title: string
  category: string
  location: string
  price: number
  images: string[]
}

export default function ToursPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategoryListings()
  }, [])

  const fetchCategoryListings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .ilike("category", "%tour%")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setListings(data || [])
    setLoading(false)
  }

  return (
    <div className="bg-zinc-50 dark:bg-[#0a0a0a] min-h-screen font-sans py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black dark:text-white capitalize tracking-tight">
            Exclusive Tours
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-lg">
            Explore the finest selection of tours curated for your perfect getaway.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center bg-white dark:bg-zinc-900/50 rounded-2xl p-16 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">No Tours Available</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Check back soon for new additions to this category.</p>
            <Link href="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition">
              Back to Home
            </Link>
          </div>
        ) : (
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
                      <p className="font-extrabold text-2xl text-black dark:text-white mt-0.5">${listing.price}<span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">/person</span></p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
