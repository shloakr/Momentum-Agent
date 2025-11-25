import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*.replit.dev", "*.repl.co", "*.picard.replit.dev"],
    },
  },
  allowedDevOrigins: ["*.replit.dev", "*.repl.co", "*.picard.replit.dev"],
};

export default nextConfig;

