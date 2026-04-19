import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string

  let event: Stripe.Event

  // For the prototype: Allow mock testing without a webhook secret
  if (!webhookSecret || webhookSecret === 'whsec_mock') {
     try {
        event = JSON.parse(body)
     } catch (err: any) {
        return NextResponse.json({ error: `Mock Event parsing failed: ${err.message}` }, { status: 400 })
     }
  } else {
     try {
       event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
     } catch (err: any) {
       console.error(`Webhook signature verification failed: ${err.message}`)
       return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
     }
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Retrieve the booking ID from the metadata previously attached in checkout session creation
    const bookingId = session.metadata?.bookingId

    if (bookingId) {
      // 1. Update the database: mark as paid and confirm the booking instantly!
      // 2. This triggers the PostgreSQL `prevent_double_booking` logic.
      // 3. If someone managed to book those dates while payment was processing, the DB will violently reject the update here, preventing overbooking.
      const { error } = await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          stripe_session_id: session.id
        })
        .eq('id', bookingId)

      if (error) {
        // If error.message includes 'DOUBLE_BOOKING_PREVENTED', trigger a refund and email the user.
        console.error('Error updating booking status (Potentially overlapping dates!):', error)
        // TODO: Trigger Stripe Refund API here, notify via Twilio/Resend.
        return NextResponse.json({ error: 'Database update failed - potential overlap' }, { status: 500 })
      }
      
      console.log(`Booking ${bookingId} successfully locked and paid!`)
      // TODO: Fire Email / WhatsApp notification via Resend/Twilio confirming dates.
    }
  }

  return NextResponse.json({ received: true })
}
