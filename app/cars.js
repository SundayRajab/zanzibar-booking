import { supabase } from "../lib/supabase"
import { useEffect, useState } from "react"

export default function Cars() {
  const [cars, setCars] = useState([])

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select(`
        id,
        title,
        location,
        price,
        cars (
          car_model,
          transmission,
          seats,
          has_ac
        )
      `)
      .eq("category", "car")

    if (error) {
      console.log("ERROR:", error)
      return
    }

    setCars(data)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Car Rentals</h1>

      {cars.length === 0 && <p>No cars found</p>}

      {cars.map(item => {
        const car = item.cars?.[0]

        return (
          <div key={item.id} className="border p-4 mb-4 rounded">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p>📍 {item.location}</p>
            <p>💰 ${item.price} / day</p>

            {car && (
              <>
                <p>🚘 Model: {car.car_model}</p>
                <p>⚙️ Transmission: {car.transmission}</p>
                <p>👥 Seats: {car.seats}</p>
                <p>❄️ AC: {car.has_ac ? "Yes" : "No"}</p>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}