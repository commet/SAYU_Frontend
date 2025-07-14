import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Disable ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during production builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Reduce build optimization for Railway
  poweredByHeader: false,
  
  // Simplified headers - removed PWA configuration due to 401 errors

  // Enhanced image optimization
  images: {
    // Enable Next.js image optimization
    unoptimized: false,
    
    // Remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.metmuseum.org',
      },
      {
        protocol: 'https',
        hostname: 'openaccess-cdn.clevelandart.org',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'www.rijksmuseum.nl',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    
    // Modern image formats (WebP/AVIF for better compression)
    formats: ['image/webp', 'image/avif'],
    
    // Responsive device sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Default quality is handled at component level
    
    // Image cache optimization
    minimumCacheTTL: 86400, // 24 hours
  },

  // Experimental features for better PWA performance
  // Removed experimental features that might cause build issues
  // experimental: {
  //   optimizeCss: true,
  //   scrollRestoration: true,
  // },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

// Only use bundle analyzer in development
let finalConfig = nextConfig;

if (process.env.NODE_ENV !== 'production' && process.env.ANALYZE === 'true') {
  try {
    const withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: true,
    });
    finalConfig = withBundleAnalyzer(nextConfig);
  } catch (e) {
    console.warn('Bundle analyzer not available:', e);
  }
}

export default finalConfig;
