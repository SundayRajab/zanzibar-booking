import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { v4 as uuidv4 } from "uuid"

export default function BookingPage() {
  const router = useRouter()
  const { id } = router.query
  const [listing, setListing] = useState(null)
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    start_date: "",
    end_date: "",
    guests: 1,
  })
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [bookingID, setBookingID] = useState("")

  useEffect(() => {
    if (id) fetchListing()
  }, [id])

  const fetchListing = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, price")
      .eq("id", id)
      .single()

    if (error) {
      console.log(error)
      setLoading(false)
      return
    }

    setListing(data)
    setLoading(false)
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleBooking = async e => {
    e.preventDefault()
    const newBookingID = "ZNZ-" + Math.floor(1000 + Math.random() * 9000)
    setBookingID(newBookingID)

    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          booking_id: newBookingID,
          listing_id: id,
          customer_name: form.customer_name,
          phone: form.phone,
          email: form.email,
          start_date: form.start_date,
          end_date: form.end_date,
          guests: form.guests,
          status: "pending",
          payment_status: "unpaid",
        },
      ])

    if (error) {
      console.log(error)
      return
    }

    setSuccess(true)
  }

  if (loading) return <p>Loading...</p>
  if (!listing) return <p>Listing not found</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Booking: {listing.title}</h1>
      <p>Price: ${listing.price}</p>

      {success ? (
        <div className="p-4 border rounded bg-green-100">
          <h2 className="text-xl font-semibold mb-2">Booking Successful!</h2>
          <p>Your Booking ID: <strong>{bookingID}</strong></p>
          <p>Next: Proceed to payment (Flutterwave / Stripe)</p>
        </div>
      ) : (
        <form onSubmit={handleBooking} className="flex flex-col gap-3 max-w-md">
          <input
            type="text"
            name="customer_name"
            placeholder="Full Name"
            value={form.customer_name}
            onChange={handleChange}
            required
            className="border px-2 py-1 rounded"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            required
            className="border px-2 py-1 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="border px-2 py-1 rounded"
          />
          <label>
            Start Date:
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
              className="border px-2 py-1 rounded"
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              required
              className="border px-2 py-1 rounded"
            />
          </label>
          <input
            type="number"
            name="guests"
            min="1"
            value={form.guests}
            onChange={handleChange}
            required
            className="border px-2 py-1 rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Book Now
          </button>
        </form>
      )}
    </div>
  )
}