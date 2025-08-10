const rateLimit = require('express-rate-limit');
const { getRedisClient } = require('../config/redis');

// Redis 기반 rate limiter 스토어 설정
const createRateLimiter = (options) => {
  const redis = getRedisClient();

  if (redis && redis.status === 'ready') {
    try {
      // Redis가 사용 가능한 경우 Redis 스토어 사용
      const { RedisStore } = require('rate-limit-redis');
      return rateLimit({
        store: new RedisStore({
          sendCommand: (...args) => redis.call(...args)
        }),
        ...options
      });
    } catch (error) {
      console.warn('Redis store creation failed, falling back to memory store:', error.message);
      // Redis 스토어 생성 실패 시 메모리 스토어 사용
      return rateLimit(options);
    }
  } else {
    // Redis가 없는 경우 메모리 스토어 사용
    return rateLimit(options);
  }
};

// 매칭 요청 생성 제한 (시간당 5개)
const createMatchRequest = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 5,
  message: {
    error: 'Too many match requests. Please try again later.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `match_create:${req.userId}`,
  skip: (req) => {
    // 관리자는 제한 없음
    return req.user && req.user.role === 'admin';
  }
});

// 매칭 결과 조회 제한 (분당 10개)
const findMatches = createRateLimiter({
  windowMs: 60 * 1000, // 1분
  max: 10,
  message: {
    error: 'Too many match queries. Please slow down.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `match_find:${req.userId}`
});

// 매칭 액션 제한 (분당 5개) - 수락/거절
const matchAction = createRateLimiter({
  windowMs: 60 * 1000, // 1분
  max: 5,
  message: {
    error: 'Too many match actions. Please wait before trying again.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `match_action:${req.userId}`
});

// 일반적인 API 호출 제한 (분당 100개)
const general = createRateLimiter({
  windowMs: 60 * 1000, // 1분
  max: 100,
  message: {
    error: 'Too many requests. Please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `general:${req.ip}:${req.userId || 'anonymous'}`
});

// 엄격한 제한 (분당 20개) - 민감한 작업용
const strict = createRateLimiter({
  windowMs: 60 * 1000, // 1분
  max: 20,
  message: {
    error: 'Rate limit exceeded for sensitive operation.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `strict:${req.userId}`
});

// Museum API 제한 (분당 30개)
const museumApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1분
  max: 30,
  message: {
    error: 'Too many museum API requests. Please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `museum:${req.ip}`
});

// Exhibition API 제한 (분당 60개)
const exhibitionLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1분
  max: 60,
  message: {
    error: 'Too many exhibition requests. Please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `exhibition:${req.ip}`
});

// Realtime API 제한 (분당 100개)
const realtimeLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1분
  max: 100,
  message: {
    error: 'Too many realtime requests. Please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `realtime:${req.ip}`
});

// 매칭 시스템별 적응형 rate limiting
const adaptiveMatchingLimiter = (req, res, next) => {
  const redis = getRedisClient();
  if (!redis) return next();

  const { userId } = req;
  const key = `adaptive_limit:${userId}`;

  redis.get(key).then(data => {
    const userStats = data ? JSON.parse(data) : {
      successfulMatches: 0,
      rejections: 0,
      spamScore: 0,
      lastActivity: Date.now()
    };

    // 스팸 점수에 따른 동적 제한
    let maxRequests = 10; // 기본값

    if (userStats.spamScore > 80) {
      maxRequests = 2; // 스팸 의심 사용자
    } else if (userStats.spamScore > 50) {
      maxRequests = 5; // 주의 필요
    } else if (userStats.successfulMatches > 10) {
      maxRequests = 20; // 활성 사용자에게 더 많은 허용
    }

    // 실제 rate limiting 적용
    const dynamicLimiter = createRateLimiter({
      windowMs: 60 * 1000,
      max: maxRequests,
      keyGenerator: () => `adaptive:${userId}`,
      message: {
        error: `Rate limit exceeded. Max ${maxRequests} requests per minute.`,
        retryAfter: 60,
        spamScore: userStats.spamScore
      }
    });

    dynamicLimiter(req, res, next);
  }).catch(() => {
    // Redis 오류 시 기본 제한 적용
    general(req, res, next);
  });
};

// 매칭 성공/실패에 따른 스팸 점수 업데이트
const updateSpamScore = async (userId, action) => {
  const redis = getRedisClient();
  if (!redis) return;

  const key = `adaptive_limit:${userId}`;
  const data = await redis.get(key);
  const userStats = data ? JSON.parse(data) : {
    successfulMatches: 0,
    rejections: 0,
    spamScore: 0,
    lastActivity: Date.now()
  };

  switch (action) {
    case 'match_success':
      userStats.successfulMatches++;
      userStats.spamScore = Math.max(0, userStats.spamScore - 5);
      break;
    case 'match_rejection':
      userStats.rejections++;
      userStats.spamScore += 2;
      break;
    case 'rapid_requests':
      userStats.spamScore += 10;
      break;
    case 'suspicious_behavior':
      userStats.spamScore += 20;
      break;
  }

  userStats.lastActivity = Date.now();

  // 24시간 후 만료
  await redis.setex(key, 24 * 60 * 60, JSON.stringify(userStats));
};

// IP 기반 글로벌 제한 (DDoS 방지)
const globalIpLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15분
  max: 1000, // IP당 최대 1000개 요청
  message: {
    error: 'Too many requests from this IP. Please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `global_ip:${req.ip}`
});

// 사용자별 일일 제한
const dailyUserLimit = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24시간
  max: 1000, // 사용자당 일일 최대 1000개 요청
  message: {
    error: 'Daily request limit exceeded. Please try again tomorrow.',
    retryAfter: 86400
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `daily_user:${req.userId || req.ip}`
});

module.exports = {
  createMatchRequest,
  findMatches,
  matchAction,
  general,
  strict,
  museumApiLimiter,
  exhibitionLimiter,
  realtimeLimiter,
  adaptiveMatchingLimiter,
  updateSpamScore,
  globalIpLimit,
  dailyUserLimit
};
