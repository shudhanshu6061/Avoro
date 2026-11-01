import type { NextConfig } from "next";

const API = process.env.SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ADMIN = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5173';

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['three'],
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: '**.instagram.com' },
    ],
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API}/api/:path*` },
      { source: '/admin', destination: `${ADMIN}/admin/` },
      { source: '/admin/:path*', destination: `${ADMIN}/admin/:path*` },
    ];
  },
};

export default nextConfig;
