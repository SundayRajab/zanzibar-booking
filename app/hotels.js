import { supabase } from "../lib/supabase"
import { useEffect, useState } from "react"

export default function Hotels() {
  const [hotels, setHotels] = useState([])

  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select(`
        id,
        title,
        location,
        price,
        hotels (
          rooms,
          has_pool,
          has_wifi
        )
      `)
      .eq("category", "hotel")

    if (error) {
      console.log("ERROR:", error)
      return
    }

    setHotels(data)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hotels</h1>

      {hotels.length === 0 && <p>No hotels found</p>}

      {hotels.map(item => {
        const hotel = item.hotels?.[0]

        return (
          <div key={item.id} className="border p-4 mb-4 rounded">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p>📍 {item.location}</p>
            <p>💰 ${item.price}</p>

            {hotel && (
              <>
                <p>🛏 Rooms: {hotel.rooms}</p>
                <p>🏊 Pool: {hotel.has_pool ? "Yes" : "No"}</p>
                <p>📶 WiFi: {hotel.has_wifi ? "Yes" : "No"}</p>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}