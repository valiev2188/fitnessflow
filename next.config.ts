import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Point root to the main project so Turbopack can resolve node_modules
    // and spawn worker processes from within its security boundary.
    root: path.resolve(__dirname, "../../../"),
  },
};

export default nextConfig;
