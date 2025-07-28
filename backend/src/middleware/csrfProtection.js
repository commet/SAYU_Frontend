const crypto = require('crypto');

/**
 * Enhanced CSRF Protection Middleware
 * 토큰 기반 CSRF 보호 구현
 */

// 토큰 저장소 (프로덕션에서는 Redis 사용 권장)
const tokenStore = new Map();
const TOKEN_EXPIRY = 4 * 60 * 60 * 1000; // 4시간

// CSRF 토큰 생성
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// 토큰 검증
const validateCSRFToken = (sessionId, token) => {
  const storedData = tokenStore.get(sessionId);

  if (!storedData) {
    return false;
  }

  // 토큰 만료 확인
  if (Date.now() > storedData.expiry) {
    tokenStore.delete(sessionId);
    return false;
  }

  return storedData.token === token;
};

// CSRF 토큰 미들웨어
const csrfMiddleware = (options = {}) => {
  const {
    excludePaths = ['/api/auth/login', '/api/auth/register', '/api/health'],
    cookieName = 'XSRF-TOKEN',
    headerName = 'X-XSRF-TOKEN',
    paramName = '_csrf',
    sameSite = 'strict',
    secure = process.env.NODE_ENV === 'production',
    httpOnly = false // 클라이언트에서 읽을 수 있어야 함
  } = options;

  return (req, res, next) => {
    // 제외 경로 확인
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // GET 요청에서는 토큰 생성 및 설정
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      // 세션 ID 확인 (express-session 사용 시)
      const sessionId = req.sessionID || req.ip;

      // 기존 토큰 확인
      let tokenData = tokenStore.get(sessionId);

      // 토큰이 없거나 만료된 경우 새로 생성
      if (!tokenData || Date.now() > tokenData.expiry) {
        const newToken = generateCSRFToken();
        tokenData = {
          token: newToken,
          expiry: Date.now() + TOKEN_EXPIRY
        };
        tokenStore.set(sessionId, tokenData);
      }

      // 쿠키로 토큰 전송
      res.cookie(cookieName, tokenData.token, {
        sameSite,
        secure,
        httpOnly
      });

      // 응답 헤더에도 추가 (SPA 지원)
      res.setHeader(headerName, tokenData.token);

      return next();
    }

    // POST, PUT, DELETE 등의 요청에서는 토큰 검증
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const sessionId = req.sessionID || req.ip;

      // 토큰 추출 (우선순위: 헤더 > 바디 > 쿼리)
      const token = req.headers[headerName.toLowerCase()] ||
                   req.body[paramName] ||
                   req.query[paramName];

      if (!token) {
        return res.status(403).json({
          error: 'CSRF token missing',
          code: 'CSRF_TOKEN_MISSING'
        });
      }

      // 토큰 검증
      if (!validateCSRFToken(sessionId, token)) {
        console.warn('CSRF token validation failed:', {
          sessionId,
          token: `${token.substring(0, 10)}...`,
          ip: req.ip,
          path: req.path,
          method: req.method
        });

        return res.status(403).json({
          error: 'Invalid CSRF token',
          code: 'CSRF_TOKEN_INVALID'
        });
      }

      // 토큰 갱신 (한 번 사용된 토큰은 갱신)
      const newToken = generateCSRFToken();
      tokenStore.set(sessionId, {
        token: newToken,
        expiry: Date.now() + TOKEN_EXPIRY
      });

      // 새 토큰을 응답 헤더에 추가
      res.setHeader(headerName, newToken);
    }

    next();
  };
};

// Double Submit Cookie 패턴 구현
const doubleSubmitCookie = (options = {}) => {
  const {
    cookieName = 'csrf-token',
    headerName = 'x-csrf-token',
    sameSite = 'strict',
    secure = process.env.NODE_ENV === 'production'
  } = options;

  return (req, res, next) => {
    // GET 요청에서 쿠키 설정
    if (req.method === 'GET') {
      const token = req.cookies[cookieName] || generateCSRFToken();

      res.cookie(cookieName, token, {
        sameSite,
        secure,
        httpOnly: false // 자바스크립트에서 읽을 수 있어야 함
      });

      return next();
    }

    // 상태 변경 요청에서 검증
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const cookieToken = req.cookies[cookieName];
      const headerToken = req.headers[headerName];

      if (!cookieToken || !headerToken) {
        return res.status(403).json({
          error: 'CSRF protection: Token missing',
          code: 'CSRF_TOKEN_MISSING'
        });
      }

      if (cookieToken !== headerToken) {
        return res.status(403).json({
          error: 'CSRF protection: Token mismatch',
          code: 'CSRF_TOKEN_MISMATCH'
        });
      }
    }

    next();
  };
};

// 토큰 저장소 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of tokenStore.entries()) {
    if (now > data.expiry) {
      tokenStore.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // 1시간마다 정리

module.exports = {
  csrfMiddleware,
  doubleSubmitCookie,
  generateCSRFToken,
  validateCSRFToken
};
