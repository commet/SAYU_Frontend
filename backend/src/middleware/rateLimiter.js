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

module.exports = createRateLimiter;
module.exports.createRateLimiter = createRateLimiter;
module.exports.createSpeedLimiter = createSpeedLimiter;
module.exports.apiLimiter = apiLimiter;
module.exports.authLimiter = authLimiter;
module.exports.aiLimiter = aiLimiter;
module.exports.uploadLimiter = uploadLimiter;
module.exports.chatbotLimiter = chatbotLimiter;
module.exports.chatbotSpeedLimiter = chatbotSpeedLimiter;