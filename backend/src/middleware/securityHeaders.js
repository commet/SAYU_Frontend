const helmet = require('helmet');

// SAYU 보안 헤더 설정
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Next.js 인라인 스크립트 허용
        "'unsafe-eval'", // React 개발 모드용
        "https://js.sentry-cdn.com", // Sentry
        "https://browser.sentry-cdn.com",
        "https://cdn.vercel-insights.com" // Vercel Analytics
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Tailwind CSS
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:", // 외부 이미지들
        "https://res.cloudinary.com",
        "https://images.metmuseum.org",
        "https://replicate.delivery",
        "https://images.unsplash.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.openai.com",
        "https://api.replicate.com",
        "https://generativelanguage.googleapis.com", // Google AI
        "https://hgltvdshuyfffskvjmst.supabase.co", // Supabase
        "https://o4506460091260928.ingest.sentry.io", // Sentry
        "wss://realtime.supabase.co" // Supabase Realtime
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
    reportOnly: process.env.NODE_ENV === 'development', // 개발에서는 리포트만
  },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1년
    includeSubDomains: true,
    preload: true
  },

  // X-Frame-Options
  frameguard: {
    action: 'deny'
  },

  // X-Content-Type-Options
  noSniff: true,

  // Referrer Policy
  referrerPolicy: {
    policy: ['same-origin', 'strict-origin-when-cross-origin']
  },

  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: false,

  // Cross-Origin Embedder Policy (비활성화 - Three.js 등과 충돌)
  crossOriginEmbedderPolicy: false,

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: {
    policy: 'same-origin-allow-popups' // OAuth 팝업 허용
  },

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: {
    policy: 'cross-origin' // API 서버용
  },

  // Expect-CT (deprecated but still useful)
  expectCt: {
    maxAge: 86400,
    enforce: true
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // X-DNS-Prefetch-Control
  dnsPrefetchControl: {
    allow: true // 성능 향상을 위해 허용
  },

  // Feature Policy (Permissions Policy)
  permissionsPolicy: {
    camera: [], // 카메라 비활성화
    microphone: [], // 마이크 비활성화
    geolocation: ['self'], // 위치정보는 자체 도메인만
    notifications: ['self'], // 알림은 자체 도메인만
    push: ['self'], // 푸시는 자체 도메인만
    syncXhr: [], // 동기 XHR 비활성화
    accelerometer: [], // 가속도계 비활성화
    gyroscope: [], // 자이로스코프 비활성화
    magnetometer: [], // 자력계 비활성화
    payment: [], // 결제 API 비활성화 (미래에 필요시 활성화)
  }
});

// 추가 보안 헤더들
const additionalSecurityHeaders = (req, res, next) => {
  // X-Request-ID 추가 (디버깅용)
  if (!req.headers['x-request-id']) {
    req.headers['x-request-id'] = require('crypto').randomUUID();
  }
  res.setHeader('X-Request-ID', req.headers['x-request-id']);

  // Server 헤더 숨기기
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Cache Control for API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }

  // Security headers for static assets
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|avif)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }

  // API-specific security headers
  if (req.path.startsWith('/api/')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
  }

  next();
};

// Rate limiting per IP for security endpoints
const securityRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 100회 제한
  message: {
    error: 'Too many security-related requests from this IP',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 신뢰할 수 있는 프록시 설정 (Vercel/Railway용)
  trustProxy: true,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

module.exports = {
  securityHeaders,
  additionalSecurityHeaders,
  securityRateLimit
};