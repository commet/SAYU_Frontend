/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  sw: 'service-worker.js',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
        }
      }
    },
    {
      urlPattern: /^https:\/\/api\.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5 // 5 minutes
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    }
  ]
});

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
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
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'pbxt.replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'api.replicate.com',
      },
      {
        protocol: 'https',
        hostname: 'harvardartmuseums.org',
      },
      {
        protocol: 'https',
        hostname: 'collections.vam.ac.uk',
      },
      {
        protocol: 'https',
        hostname: 'api.artic.edu',
      },
      {
        protocol: 'https',
        hostname: 'media.nga.gov',
      },
      {
        protocol: 'https',
        hostname: 'images.collection.cooperhewitt.org',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'artvee.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizeCss: false,
  },
}

module.exports = withPWA(nextConfig)