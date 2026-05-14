import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function ListingDetail() {
  const router = useRouter()
  const { id } = router.query
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchListing()
  }, [id])

  const fetchListing = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select(`
        *,
        hotels(*),
        apartments(*),
        cars(*),
        tours(*),
        images(image_url)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.log("ERROR:", error)
      setLoading(false)
      return
    }

    setListing(data)
    setLoading(false)
  }

  if (loading) return <p>Loading...</p>
  if (!listing) return <p>Listing not found</p>

  const renderCategoryDetails = () => {
    switch (listing.category) {
      case "hotel":
        const hotel = listing.hotels?.[0]
        return hotel && (
          <>
            <p>🛏 Rooms: {hotel.rooms}</p>
            <p>🏊 Pool: {hotel.has_pool ? "Yes" : "No"}</p>
            <p>📶 WiFi: {hotel.has_wifi ? "Yes" : "No"}</p>
            <p>🍳 Breakfast: {hotel.has_breakfast ? "Yes" : "No"}</p>
          </>
        )

      case "apartment":
        const apt = listing.apartments?.[0]
        return apt && (
          <>
            <p>🛏 Bedrooms: {apt.bedrooms}</p>
            <p>🍳 Kitchen: {apt.kitchen ? "Yes" : "No"}</p>
            <p>❄️ Air Conditioning: {apt.air_condition ? "Yes" : "No"}</p>
          </>
        )

      case "car":
        const car = listing.cars?.[0]
        return car && (
          <>
            <p>🚘 Model: {car.car_model}</p>
            <p>⚙️ Transmission: {car.transmission}</p>
            <p>👥 Seats: {car.seats}</p>
            <p>❄️ AC: {car.has_ac ? "Yes" : "No"}</p>
          </>
        )

      case "tour":
        const tour = listing.tours?.[0]
        return tour && (
          <>
            <p>⏱ Duration: {tour.duration}</p>
            <p>🍽 Lunch: {tour.includes_lunch ? "Included" : "Not Included"}</p>
            <p>🧑‍🏫 Guide: {tour.guide ? "Yes" : "No"}</p>
          </>
        )

      default:
        return <p>No details available</p>
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
      <p>📍 {listing.location}</p>
      <p>💰 ${listing.price}</p>
      <p className="my-2">{listing.description}</p>

      {/* Images */}
      {listing.images?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-4">
          {listing.images.map(img => (
            <img key={img.image_url} src={img.image_url} alt={listing.title} className="h-32 rounded" />
          ))}
        </div>
      )}

      {/* Category-specific details */}
      {renderCategoryDetails()}

      {/* Booking button */}
      <a
        href={`/booking/${listing.id}`}
        className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded"
      >
        Book Now
      </a>
    </div>
  )
}