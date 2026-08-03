import type { NextConfig } from "next";
import path from "path";

const BACKEND_URL = process.env.BACKEND_API_URL?.replace('/api/v1', '') ?? 'http://127.0.0.1:3001';

const nextConfig: NextConfig = {
  // Browser certification runs use an isolated build directory so they do not
  // contend with a developer's running Next.js instance.
  distDir: process.env.NEXT_DIST_DIR || ".next-build",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
