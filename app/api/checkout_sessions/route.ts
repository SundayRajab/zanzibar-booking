import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { createClient } from '@supabase/supabase-js'

// Initialize Stripe with the secret key from environment variables or a mock fallback
const stripePublicKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock'
const stripe = new Stripe(stripePublicKey, {
  apiVersion: '2023-10-16' as any, // fallback type
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { bookingId } = body
    
    if (!bookingId) return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 })

    // SECURE FIX: Fetch the exact booking price and details directly from database to prevent manipulation.
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, listings(*)')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const title = booking.listings?.title || 'Zanzibar Booking'
    const price = booking.total_price
    const category = booking.listings?.category || 'service'
    const startDate = booking.start_date
    const endDate = booking.end_date

    // For the prototype: if no real Stripe key is provided, bypass to success page
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock') {
      return NextResponse.json({ url: `${req.headers.get('origin')}/checkout/success?session_id=mock_session_${bookingId}&booking_id=${bookingId}` })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${title} (${category.toUpperCase()})`,
              description: `Dates: ${startDate} to ${endDate}`,
            },
            unit_amount: Math.round(price * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${req.headers.get('origin')}/checkout/${bookingId}?canceled=true`,
      client_reference_id: bookingId,
      metadata: {
        bookingId: bookingId,
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe session creation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
