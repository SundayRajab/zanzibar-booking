import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PaymentFactory } from '../../../services/payment/PaymentFactory';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { bookingId, provider: requestProvider } = await req.json();

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

    const provider = PaymentFactory.getPaymentProvider(requestProvider);

    const session = await provider.initiatePayment({
      bookingId: bookingId,
      amount: booking.total_price,
      currency: 'USD',
      customerEmail: booking.customer_email || 'guest@example.com',
      customerName: booking.customer_name || 'Guest',
      customerPhone: booking.customer_phone,
      description: `Payment for ${booking.listings?.title}`,
      redirectUrl: `${origin}/checkout/success?booking_id=${bookingId}`,
    });

    return NextResponse.json({ url: session.checkoutUrl });
  } catch (error: any) {
    console.error('Checkout Session API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
