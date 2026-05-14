import { BaseMockProvider } from './BaseMockProvider';
import { createClient } from '@supabase/supabase-js';

export class FlutterwaveMock extends BaseMockProvider {
  name = 'flutterwave';

  async handleCallback(bookingId: string, status: 'success' | 'failed', transactionRef: string): Promise<void> {
    console.log(`[FlutterwaveMock] Processing webhook for Booking: ${bookingId}, Status: ${status}, Ref: ${transactionRef}`);
    
    const dbStatus = status === 'success' ? 'confirmed' : 'failed';
    const paymentStatus = status === 'success' ? 'paid' : 'failed';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: dbStatus, 
        payment_status: paymentStatus,
        payment_reference: transactionRef 
      })
      .eq('id', bookingId);
      
    if (error) {
      console.error(`[FlutterwaveMock] DB Update Error:`, error);
      throw new Error('Failed to update booking status in Flutterwave callback');
    }
    
    console.log(`[FlutterwaveMock] Successfully updated Booking: ${bookingId} to ${dbStatus}`);
  }
}
