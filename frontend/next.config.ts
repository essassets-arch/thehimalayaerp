import type { NextConfig } from "next";
import path from "path";

const rawBackendUrl = process.env.BACKEND_INTERNAL_URL || process.env.BACKEND_API_URL || 'http://backend:4000';
const BACKEND_URL = rawBackendUrl.replace('/api/v1', '');

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname),
  turbopack: {
    root: path.resolve(__dirname),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/firebase-messaging-sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
      {
        source: '/api/backend/uploads/:path*',
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
      {
        source: '/api/backend/files/:path*',
        destination: `${BACKEND_URL}/api/v1/files/:path*`,
      },
      {
        source: '/socket.io',
        destination: `${BACKEND_URL}/socket.io`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${BACKEND_URL}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
