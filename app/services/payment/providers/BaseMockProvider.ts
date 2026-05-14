import { PaymentProvider, PaymentRequest, PaymentResponse } from '../types';

export abstract class BaseMockProvider implements PaymentProvider {
  abstract name: string;

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const transactionRef = `mock-${this.name}-${request.bookingId}-${Date.now()}`;
    console.log(`[${this.name}] Initiating payment for Booking: ${request.bookingId}, Amount: ${request.amount}`);
    
    // In our mock environment, redirect to a mock UI that simulates the payment process
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      provider: this.name,
      booking_id: request.bookingId,
      tx_ref: transactionRef,
      amount: request.amount.toString(),
      redirect_url: request.redirectUrl,
    });
    
    const checkoutUrl = `${baseUrl}/mock-payment?${params.toString()}`;
    
    return {
      checkoutUrl,
      transactionRef
    };
  }

  async verifyPayment(transactionRef: string): Promise<boolean> {
    console.log(`[${this.name}] Verifying payment for Ref: ${transactionRef}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true; 
  }

  abstract handleCallback(bookingId: string, status: 'success' | 'failed', transactionRef: string): Promise<void>;
}
