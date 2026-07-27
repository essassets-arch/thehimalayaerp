import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  distDir: ".next-build",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
