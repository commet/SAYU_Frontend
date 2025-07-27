const cors = require('cors');
const { logger } = require('../config/logger');

// 환경별 허용 도메인 설정
const getAllowedOrigins = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://localhost:3000',
      'https://localhost:3001'
    ];
  }
  
  // 프로덕션 환경
  return [
    'https://sayu.art',
    'https://www.sayu.art',
    'https://sayu-frontend.vercel.app',
    'https://sayu-living.vercel.app',
    process.env.FRONTEND_URL, // 환경 변수에서 추가 도메인
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`
  ].filter(Boolean); // null/undefined 제거
};

// Artist Portal 전용 CORS 설정
const artistPortalCorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // 개발 환경에서는 origin이 없는 요청도 허용 (Postman 등)
    if (process.env.NODE_ENV === 'development' && !origin) {
      return callback(null, true);
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request:', {
        origin,
        allowedOrigins,
        timestamp: new Date().toISOString()
      });
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'Accept',
    'Origin',
    'User-Agent'
  ],
  credentials: true,
  maxAge: 86400, // 24시간 preflight 캐시
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// 일반 API용 CORS 설정 (덜 제한적)
const generalCorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    if (process.env.NODE_ENV === 'development' && !origin) {
      return callback(null, true);
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // 일반 API는 로그만 남기고 허용
      logger.info('CORS request from unknown origin:', { origin });
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  maxAge: 3600 // 1시간 preflight 캐시
};

// CORS 보안 체크 미들웨어
const corsSecurityCheck = (req, res, next) => {
  const origin = req.get('Origin') || req.get('Referer');
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // 의심스러운 요청 패턴 감지
  const suspiciousPatterns = [
    /bot|crawl|spider|scrape/i,
    /python-requests|curl|wget/i,
    /scanner|exploit|hack/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious) {
    logger.warn('Suspicious CORS request detected:', {
      origin,
      userAgent,
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    // 의심스러운 요청은 차단하지 않지만 로깅
    // 필요시 return res.status(403).json({ error: 'Request blocked' });
  }
  
  // Origin 헤더 검증
  if (origin) {
    try {
      const url = new URL(origin);
      
      // localhost가 아닌 HTTP 요청 차단 (개발 환경 제외)
      if (process.env.NODE_ENV === 'production' && 
          url.protocol === 'http:' && 
          !url.hostname.includes('localhost')) {
        logger.warn('Insecure HTTP origin blocked:', { origin, ip: req.ip });
        return res.status(403).json({ error: 'HTTPS required' });
      }
      
    } catch (error) {
      logger.warn('Invalid origin header:', { origin, error: error.message });
    }
  }
  
  next();
};

// 환경별 CORS 미들웨어 팩토리
const createCorsMiddleware = (options = {}) => {
  const corsOptions = options.strict ? artistPortalCorsOptions : generalCorsOptions;
  
  return [
    corsSecurityCheck,
    cors(corsOptions)
  ];
};

module.exports = {
  artistPortalCors: createCorsMiddleware({ strict: true }),
  generalCors: createCorsMiddleware({ strict: false }),
  corsSecurityCheck,
  getAllowedOrigins
};