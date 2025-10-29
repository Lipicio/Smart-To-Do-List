import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://smart-backend:3001/:path*' },
    ];
  },
};

export default nextConfig;