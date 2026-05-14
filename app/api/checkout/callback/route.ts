import { NextResponse } from 'next/server';
import { PaymentFactory } from '../../../services/payment/PaymentFactory';

export async function POST(req: Request) {
  try {
    const { bookingId, status, provider, tx_ref } = await req.json();

    if (!bookingId || !status || !provider || !tx_ref) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const paymentProvider = PaymentFactory.getPaymentProvider(provider);
    
    await paymentProvider.handleCallback(bookingId, status, tx_ref);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Checkout Callback API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
