"use client"

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

function MockPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const provider = searchParams.get('provider') || 'Unknown';
  const bookingId = searchParams.get('booking_id');
  const txRef = searchParams.get('tx_ref');
  const amount = searchParams.get('amount');
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDisplayProviderName = (name: string) => {
    switch (name.toLowerCase()) {
      case 'flutterwave': return 'Flutterwave';
      case 'selcom': return 'Selcom';
      case 'dpo': return 'DPO Group';
      default: return name;
    }
  };

  const simulatePayment = async (status: 'success' | 'failed') => {
    setLoading(true);
    setError(null);

    try {
      // Simulate network delay for UI realism
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await fetch('/api/checkout/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          status,
          provider,
          tx_ref: txRef,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to handle callback server-side');
      }

      if (status === 'success') {
        if (redirectUrl.includes('?')) {
            router.push(`${redirectUrl}&tx_ref=${txRef}`);
        } else {
            router.push(`${redirectUrl}?tx_ref=${txRef}`);
        }
      } else {
        router.push('/dashboard/bookings');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during simulation');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
      
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-800">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Simulated Payment</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Testing Environment - No real charges will be made.</p>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 mb-8 border border-zinc-100 dark:border-zinc-800">
        <div className="flex justify-between mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-4">
          <span className="text-zinc-500 text-sm">Gateway Provider</span>
          <span className="font-semibold text-black dark:text-white">{handleDisplayProviderName(provider)}</span>
        </div>
        <div className="flex justify-between mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-4">
          <span className="text-zinc-500 text-sm">Booking ID</span>
          <span className="font-mono text-xs text-black dark:text-white truncate max-w-[150px]">{bookingId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 text-sm">Amount due</span>
          <span className="font-bold text-lg text-black dark:text-white">${amount}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-4 text-center">
        {loading ? (
           <div className="flex flex-col items-center py-6">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-zinc-500 animate-pulse">Processing mock request...</p>
           </div>
        ) : (
          <>
            <button
              onClick={() => simulatePayment('success')}
              className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-95 hover:shadow-2xl"
            >
              Simulate Successful Payment
            </button>
            
            <button
              onClick={() => simulatePayment('failed')}
              className="w-full bg-white dark:bg-transparent text-red-500 font-semibold py-4 rounded-2xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
            >
              Simulate Failed Payment
            </button>
          </>
        )}
      </div>
      
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
      <Suspense fallback={<div className="animate-pulse flex flex-col items-center"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div><p className="text-zinc-500">Loading mock interface...</p></div>}>
        <MockPaymentContent />
      </Suspense>
    </div>
  );
}
