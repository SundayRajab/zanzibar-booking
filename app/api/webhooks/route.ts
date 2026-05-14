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
    const bookingId = session.metadata?.bookingId

    if (bookingId) {
      // 1. Fetch booking to get total price and listing ID
      const { data: booking, error: fetchErr } = await supabase
        .from('bookings')
        .select('*, listings(user_id)')
        .eq('id', bookingId)
        .single();

      if (!fetchErr && booking) {
        // 2. Update booking to confirmed
        const { error: updateErr } = await supabase
          .from('bookings')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            stripe_session_id: session.id
          })
          .eq('id', bookingId)

        if (!updateErr) {
          console.log(`Booking ${bookingId} successfully confirmed!`);
          
          // 3. Generate Provider Earnings (e.g., 15% system commission)
          const providerId = booking.listings?.user_id; // Assume listings.user_id is the provider
          if (providerId) {
            const totalAmount = Number(booking.total_price) || 0;
            const commission = totalAmount * 0.15; // 15% platform fee
            const earnings = totalAmount - commission;

            await supabase.from('provider_payouts').insert({
              provider_id: providerId,
              booking_id: bookingId,
              total_amount: totalAmount,
              commission_amount: commission,
              provider_earnings: earnings,
              payout_status: 'pending'
            });
          }

          // TODO: Fire Email / WhatsApp notification via Resend/Twilio confirming dates.
        } else {
           console.error('Error updating booking status:', updateErr);
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
