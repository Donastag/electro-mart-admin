import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: false,
  },
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
