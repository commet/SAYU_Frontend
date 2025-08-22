/** @type {import('next').NextConfig} */
process.env.SKIP_ENV_VALIDATION = 'true';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require('@sentry/nextjs');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  register: false,
  skipWaiting: false,
  sw: 'sw.js',
  disable: true, // PWA 완전 비활성화
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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Custom headers for static files
  async headers() {
    return [
      {
        source: '/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // 웹팩 최적화 설정
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Three.js 관련 라이브러리 청크 분리로 초기 로딩 최적화
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        three: {
          test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
          name: 'three',
          chunks: 'all',
          priority: 10,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 5,
        },
      };
    }
    return config;
  },
  
  // 이미지 최적화 설정
  images: {
    unoptimized: true,  // 이미지 최적화 비활성화 - 프로덕션 404 에러 해결
    domains: ['www.sayu.my', 'sayu.my', 'localhost'],
    // Next.js는 remotePatterns를 최대 50개까지만 허용
    remotePatterns: [
      // 필수 도메인만 포함 (최대 50개 제한)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'replicate.delivery' },
      { protocol: 'https', hostname: 'pbxt.replicate.delivery' },
      { protocol: 'https', hostname: 'api.replicate.com' },
      { protocol: 'https', hostname: 'images.metmuseum.org' },
      { protocol: 'https', hostname: 'openaccess-cdn.clevelandart.org' },
      { protocol: 'https', hostname: 'api.artic.edu' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일로 증가
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // 디바이스별 이미지 크기 최적화
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // 실험적 기능으로 성능 향상
  experimental: {
    optimizeCss: true, // CSS 최적화 활성화
    optimizePackageImports: [
      '@radix-ui/react-icons', 
      'lucide-react',
      '@react-three/drei',
      'framer-motion'
    ],
  },
  
  // Next.js 15 설정
  serverExternalPackages: ['sharp'],
  
  // Turbopack 설정 (experimental에서 이동)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // 컴파일러 최적화
  compiler: {
    // 프로덕션에서 console.log 제거
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}

// Sentry configuration
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  
  // Disable in development
  disableInDevelopment: true,
  
  // Only upload source maps in production
  dryRun: process.env.NODE_ENV !== 'production',
  
  // Upload source maps after build
  widenClientFileUpload: true,
  
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  
  // Use smaller bundle
  tunnelRoute: '/monitoring',
};

// Apply Sentry configuration if DSN is available and not in development
const baseConfig = withPWA(nextConfig);

if ((process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) && process.env.NODE_ENV !== 'development') {
  module.exports = withSentryConfig(baseConfig, sentryWebpackPluginOptions);
} else {
  module.exports = baseConfig;
}