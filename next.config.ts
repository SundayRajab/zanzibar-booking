import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network IP for testing
  // @ts-ignore
  allowedDevOrigins: ["192.168.88.42"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.flutterwave.com https://ptzvgibyktkujwslpdsb.supabase.co; connect-src 'self' ws: wss: https: http:; img-src 'self' data: blob: https: http:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
