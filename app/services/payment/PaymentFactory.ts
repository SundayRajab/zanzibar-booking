import { PaymentProvider } from './types';
import { FlutterwaveMock } from './providers/FlutterwaveMock';
import { SelcomMock } from './providers/SelcomMock';
import { DpoMock } from './providers/DpoMock';

export class PaymentFactory {
  static getPaymentProvider(providerName?: string): PaymentProvider {
    const activeProvider = providerName || process.env.PAYMENT_PROVIDER || 'flutterwave';
    
    switch (activeProvider.toLowerCase()) {
      case 'selcom':
        return new SelcomMock();
      case 'dpo':
        return new DpoMock();
      case 'flutterwave':
      default:
        return new FlutterwaveMock();
    }
  }
}
