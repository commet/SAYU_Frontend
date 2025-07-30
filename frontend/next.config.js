/** @type {import('next').NextConfig} */
process.env.SKIP_ENV_VALIDATION = 'true';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require('@sentry/nextjs');

// eslint-disable-next-line @typescript-eslint/no-require-imports
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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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
  
  // 이미지 최적화 강화
  images: {
    // 우선순위별 도메인 정렬 (자주 사용되는 순서)
    remotePatterns: [
      // 1순위: 자체 CDN
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // 2순위: AI 생성 이미지
      { protocol: 'https', hostname: 'replicate.delivery' },
      { protocol: 'https', hostname: 'pbxt.replicate.delivery' },
      { protocol: 'https', hostname: 'api.replicate.com' },
      // 3순위: 주요 미술관
      { protocol: 'https', hostname: 'images.metmuseum.org' },
      { protocol: 'https', hostname: 'openaccess-cdn.clevelandart.org' },
      { protocol: 'https', hostname: 'api.artic.edu' },
      // 4순위: 기타 미술관 및 서비스
      { protocol: 'https', hostname: 'harvardartmuseums.org' },
      { protocol: 'https', hostname: 'collections.vam.ac.uk' },
      { protocol: 'https', hostname: 'media.nga.gov' },
      { protocol: 'https', hostname: 'images.collection.cooperhewitt.org' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'artvee.com' },
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

// Apply Sentry configuration if DSN is available
const baseConfig = withPWA(nextConfig);

if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
  module.exports = withSentryConfig(baseConfig, sentryWebpackPluginOptions);
} else {
  module.exports = baseConfig;
}