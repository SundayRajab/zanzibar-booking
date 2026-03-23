import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network IP for testing
  // @ts-ignore
  allowedDevOrigins: ["192.168.88.42"],
};

export default nextConfig;
