const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// General rate limiter factory
const createRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  };

  return rateLimit({
    ...defaults,
    ...options
  });
};

// Speed limiter factory
const createSpeedLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per windowMs without slowing down
    delayMs: 500, // begin adding 500ms of delay per request above delayAfter
    maxDelayMs: 20000, // maximum delay of 20 seconds
  };

  return slowDown({
    ...defaults,
    ...options
  });
};

// Pre-configured limiters for specific use cases

// API endpoints limiter
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
});

// Auth endpoints limiter (stricter)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: '너무 많은 인증 시도가 있었습니다. 15분 후 다시 시도해주세요.'
});

// AI/expensive operations limiter
const aiLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  message: 'AI 서비스 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
});

// File upload limiter
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: '파일 업로드 한도를 초과했습니다. 1시간 후 다시 시도해주세요.'
});

// Chatbot message limiter with speed limiting
const chatbotLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: '너무 많은 메시지를 보내셨습니다. 잠시 후 다시 시도해주세요.'
});

const chatbotSpeedLimiter = createSpeedLimiter({
  windowMs: 1 * 60 * 1000,
  delayAfter: 5,
  delayMs: 500,
  maxDelayMs: 2000
});

// Exhibition and gallery endpoints limiter
const exhibitionLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60,
  message: '전시 정보 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
});

// Museum API limiter (expensive external calls)
const museumApiLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,
  message: '박물관 API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
});

// Artist portal limiter
const artistPortalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  message: '아티스트 포털 요청 한도를 초과했습니다.'
});

// Gallery operations limiter
const galleryLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  message: '갤러리 요청 한도를 초과했습니다.'
});

// Chat functionality limiter
const chatLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: '채팅 요청 한도를 초과했습니다.'
});

// Real-time data limiter (for live endpoints)
const realtimeLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: '실시간 데이터 요청 한도를 초과했습니다.'
});

// Public API limiter with tier support
const createPublicApiLimiter = (req) => {
  const hasApiKey = req.headers['x-api-key'] || req.query.apiKey;
  const isPremium = req.user?.tier === 'premium';
  
  return createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: isPremium ? 5000 : hasApiKey ? 1000 : 100,
    message: hasApiKey 
      ? 'API 키 요청 한도를 초과했습니다. 더 높은 한도가 필요하시면 프리미엄으로 업그레이드하세요.'
      : '공개 API 요청 한도를 초과했습니다. API 키를 발급받으세요.',
    keyGenerator: (req) => hasApiKey || req.ip
  });
};

// Account security limiter (for password reset, etc.)
const accountSecurityLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  skipSuccessfulRequests: true,
  message: '보안을 위해 계정 관련 요청이 제한되었습니다. 1시간 후 다시 시도해주세요.'
});

// Email sending limiter
const emailLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: '이메일 전송 한도를 초과했습니다.'
});

// Dynamic rate limiter based on operation cost
const createCostBasedLimiter = (cost = 1) => {
  return createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: Math.floor(100 / cost), // Adjust limit based on operation cost
    message: `요청 한도를 초과했습니다. (Cost: ${cost})`,
    keyGenerator: (req) => {
      // Include user tier in key generation for different limits
      const tier = req.user?.tier || 'free';
      return `${req.ip}:${tier}`;
    }
  });
};

module.exports = createRateLimiter;
module.exports.createRateLimiter = createRateLimiter;
module.exports.createSpeedLimiter = createSpeedLimiter;
module.exports.apiLimiter = apiLimiter;
module.exports.authLimiter = authLimiter;
module.exports.aiLimiter = aiLimiter;
module.exports.uploadLimiter = uploadLimiter;
module.exports.chatbotLimiter = chatbotLimiter;
module.exports.chatbotSpeedLimiter = chatbotSpeedLimiter;
module.exports.exhibitionLimiter = exhibitionLimiter;
module.exports.museumApiLimiter = museumApiLimiter;
module.exports.artistPortalLimiter = artistPortalLimiter;
module.exports.galleryLimiter = galleryLimiter;
module.exports.chatLimiter = chatLimiter;
module.exports.realtimeLimiter = realtimeLimiter;
module.exports.createPublicApiLimiter = createPublicApiLimiter;
module.exports.accountSecurityLimiter = accountSecurityLimiter;
module.exports.emailLimiter = emailLimiter;
module.exports.createCostBasedLimiter = createCostBasedLimiter;