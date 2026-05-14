"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { trackEvent } from "@/app/lib/analytics";

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Error Boundary caught an error:", error);
    trackEvent("admin_dashboard_error", { message: error.message, stack: error.stack });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Something went wrong!</h2>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
        We encountered an unexpected error loading this page. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => window.location.href = '/admin'}
          className="px-6 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold rounded-lg hover:opacity-80 transition"
        >
          Go Home
        </button>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:opacity-80 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
