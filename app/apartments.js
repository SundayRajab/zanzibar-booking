import { supabase } from "../lib/supabase"
import { useEffect, useState } from "react"

export default function Apartments() {
  const [apartments, setApartments] = useState([])

  useEffect(() => {
    fetchApartments()
  }, [])

  const fetchApartments = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select(`
        id,
        title,
        location,
        price,
        apartments (
          bedrooms,
          kitchen,
          air_condition
        )
      `)
      .eq("category", "apartment")

    if (error) {
      console.log("ERROR:", error)
      return
    }

    setApartments(data)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Apartments</h1>

      {apartments.length === 0 && <p>No apartments found</p>}

      {apartments.map(item => {
        const apt = item.apartments?.[0]

        return (
          <div key={item.id} className="border p-4 mb-4 rounded">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p>📍 {item.location}</p>
            <p>💰 ${item.price}</p>

            {apt && (
              <>
                <p>🛏 Bedrooms: {apt.bedrooms}</p>
                <p>🍳 Kitchen: {apt.kitchen ? "Yes" : "No"}</p>
                <p>❄️ Air Conditioning: {apt.air_condition ? "Yes" : "No"}</p>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}