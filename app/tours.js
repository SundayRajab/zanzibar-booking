import { supabase } from "../lib/supabase"
import { useEffect, useState } from "react"

export default function Tours() {
  const [tours, setTours] = useState([])

  useEffect(() => {
    fetchTours()
  }, [])

  const fetchTours = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select(`
        id,
        title,
        location,
        price,
        tours (
          duration,
          includes_lunch,
          guide
        )
      `)
      .eq("category", "tour")

    if (error) {
      console.log("ERROR:", error)
      return
    }

    setTours(data)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tours & Activities</h1>

      {tours.length === 0 && <p>No tours found</p>}

      {tours.map(item => {
        const tour = item.tours?.[0]

        return (
          <div key={item.id} className="border p-4 mb-4 rounded">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p>📍 {item.location}</p>
            <p>💰 ${item.price}</p>

            {tour && (
              <>
                <p>⏱ Duration: {tour.duration}</p>
                <p>🍽 Lunch: {tour.includes_lunch ? "Included" : "Not Included"}</p>
                <p>🧑‍🏫 Guide: {tour.guide ? "Yes" : "No"}</p>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}