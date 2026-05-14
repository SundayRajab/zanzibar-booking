export interface PaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  description: string;
  redirectUrl: string;
}

export interface PaymentResponse {
  checkoutUrl: string;
  transactionRef: string;
}

export interface PaymentProvider {
  name: string;
  initiatePayment(request: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(transactionRef: string): Promise<boolean>;
  handleCallback(bookingId: string, status: 'success' | 'failed', transactionRef: string): Promise<void>;
}
