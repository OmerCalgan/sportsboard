import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow connections from Docker network
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'backend:5001']
    }
  },
  // Environment variables for client-side
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
  }
};

export default nextConfig;
