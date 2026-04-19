import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createFlutterwaveSession } from '../../../lib/flutterwave';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
    }

    // Fetch booking details from Supabase to ensure price integrity
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, listings(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Create Flutterwave v4 Session
    const session = await createFlutterwaveSession({
      amount: booking.total_price,
      currency: 'USD',
      tx_ref: `oceanora-${bookingId}-${Date.now()}`,
      customer: {
        email: booking.customer_email,
        name: booking.customer_name,
        phone_number: booking.customer_phone,
      },
      customizations: {
        title: 'Oceanora Booking',
        description: `Payment for ${booking.listings?.title}`,
      },
      redirect_url: `${origin}/checkout/success?booking_id=${bookingId}`,
    });

    return NextResponse.json({ url: session.checkout_url });
  } catch (error: any) {
    console.error('Checkout Session API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
