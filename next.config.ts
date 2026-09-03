import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Enable React Server Components optimizations
    serverActions: {
      bodySizeLimit: '2mb',
    },
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Optimize image loading
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Improve routing and page loading
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Improved page loading with better caching
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 4,
  },
  async redirects() {
    return [
      {
        source: '/privacy',
        destination: '/policies/privacy-policy',
        permanent: true,
      },
      {
        source: '/privacy-policy',
        destination: '/policies/privacy-policy',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/policies/terms-of-service',
        permanent: true,
      },
      {
        source: '/terms-of-service',
        destination: '/policies/terms-of-service',
        permanent: true,
      },
      {
        source: '/terms-and-conditions',
        destination: '/policies/terms-of-service',
        permanent: true,
      },
      {
        source: '/refund-policy',
        destination: '/policies/refund-policy',
        permanent: true,
      },
      {
        source: '/shipping-policy',
        destination: '/policies/shipping-policy',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

