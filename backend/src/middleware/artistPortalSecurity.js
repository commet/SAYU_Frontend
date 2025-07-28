const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { body, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { getRedisClient } = require('../config/redis');

// Artist Portal 전용 Helmet 설정
const artistPortalHelmet = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false, // 이미지 업로드를 위해 비활성화
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// 지능형 속도 제한 (패턴 기반)
const intelligentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: async (req) => {
    // 인증된 사용자는 더 관대한 제한
    if (req.userId) {
      return 20;
    }

    // IP 기반 평판 확인
    const redis = getRedisClient();
    if (redis) {
      const reputation = await redis.get(`ip_reputation:${req.ip}`) || 0;

      // 평판이 좋은 IP는 더 많은 요청 허용
      if (reputation > 50) return 15;
      if (reputation < -10) return 3; // 나쁜 평판 IP는 엄격히 제한
    }

    return 10; // 기본값
  },
  message: (req) => ({
    error: 'Too many requests from this IP',
    retryAfter: 900,
    ip: req.ip,
    timestamp: new Date().toISOString()
  }),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // 인증된 사용자는 사용자 ID 기반, 그렇지 않으면 IP 기반
    return req.userId ? `user:${req.userId}` : `ip:${req.ip}`;
  },
  skip: (req) => {
    // 관리자는 제한 없음
    return req.user && req.user.role === 'admin';
  },
  onLimitReached: async (req, res, options) => {
    logger.warn('Rate limit reached for Artist Portal:', {
      ip: req.ip,
      userId: req.userId,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      method: req.method
    });

    // IP 평판 하락
    const redis = getRedisClient();
    if (redis && !req.userId) {
      await redis.decr(`ip_reputation:${req.ip}`);
      await redis.expire(`ip_reputation:${req.ip}`, 24 * 60 * 60);
    }
  }
});

// 점진적 속도 감소 (너무 빠른 요청 시 응답 지연)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15분
  delayAfter: 5, // 5번째 요청부터 지연 시작
  delayMs: 500, // 500ms씩 지연 증가
  maxDelayMs: 10000, // 최대 10초 지연
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.ip
});

// 악성 페이로드 감지
const maliciousPayloadDetector = (req, res, next) => {
  const suspiciousPatterns = [
    // SQL Injection 패턴
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
    // XSS 패턴
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    // Path Traversal 패턴
    /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/gi,
    // Command Injection 패턴
    /(\||&|;|`|\$\(|\${)/gi,
    // LDAP Injection 패턴
    /(\*|\)|\(|\\|\||&)/gi
  ];

  const checkPayload = (obj, path = '') => {
    if (typeof obj === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(obj)) {
          logger.error('Malicious payload detected:', {
            pattern: pattern.toString(),
            payload: obj.substring(0, 200), // 처음 200자만 로깅
            path,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          });

          throw new Error('Malicious payload detected');
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        checkPayload(item, `${path}[${index}]`);
      });
    } else if (obj && typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        checkPayload(value, path ? `${path}.${key}` : key);
      });
    }
  };

  try {
    if (req.body) {
      checkPayload(req.body, 'body');
    }
    if (req.query) {
      checkPayload(req.query, 'query');
    }
    if (req.params) {
      checkPayload(req.params, 'params');
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Request contains invalid content',
      error: 'MALICIOUS_PAYLOAD_DETECTED'
    });
  }
};

// 파일 업로드 보안 강화
const secureFileUpload = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  for (const file of req.files) {
    // 파일 크기 이중 체크
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit'
      });
    }

    // 파일명 보안 체크
    const dangerousChars = /[<>:"\/\\|?*\x00-\x1f]/g;
    if (dangerousChars.test(file.originalname)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid characters in filename'
      });
    }

    // MIME 타입 화이트리스트
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }
  }

  next();
};

// 사용자 행동 분석
const behaviorAnalyzer = async (req, res, next) => {
  const redis = getRedisClient();
  if (!redis) return next();

  try {
    const userId = req.userId || req.ip;
    const key = `behavior:${userId}`;

    // 행동 패턴 수집
    const behavior = {
      timestamp: Date.now(),
      endpoint: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      contentLength: req.get('Content-Length') || 0
    };

    // Redis에 최근 행동 저장 (최대 50개)
    await redis.lpush(key, JSON.stringify(behavior));
    await redis.ltrim(key, 0, 49);
    await redis.expire(key, 24 * 60 * 60); // 24시간 후 만료

    // 의심스러운 패턴 감지
    const recentBehaviors = await redis.lrange(key, 0, 10);
    const behaviors = recentBehaviors.map(b => JSON.parse(b));

    // 짧은 시간 내 반복 요청 감지
    const recentRequests = behaviors.filter(b =>
      Date.now() - b.timestamp < 60 * 1000 // 1분 이내
    );

    if (recentRequests.length > 10) {
      logger.warn('Rapid requests detected:', {
        userId,
        requestCount: recentRequests.length,
        timeframe: '1 minute'
      });

      // IP 평판 하락
      if (!req.userId) {
        await redis.decr(`ip_reputation:${req.ip}`);
      }
    }

  } catch (error) {
    logger.error('Behavior analysis failed:', error);
  }

  next();
};

// 통합 보안 미들웨어
const artistPortalSecurity = [
  artistPortalHelmet,
  intelligentRateLimit,
  speedLimiter,
  maliciousPayloadDetector,
  behaviorAnalyzer,
  secureFileUpload
];

module.exports = {
  artistPortalSecurity,
  intelligentRateLimit,
  speedLimiter,
  maliciousPayloadDetector,
  secureFileUpload,
  behaviorAnalyzer
};
