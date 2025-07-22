import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Ensure proper module resolution
    esmExternals: 'loose',
  },
};

export default nextConfig;
