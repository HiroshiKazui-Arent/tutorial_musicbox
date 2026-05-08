import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  experimental: {
    middlewareClientMaxBodySize: 50 * 1024 * 1024, // 50MB
  },
}

export default nextConfig
