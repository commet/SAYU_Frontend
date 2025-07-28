const DOMPurify = require('isomorphic-dompurify');
const validator = require('validator');

/**
 * Enhanced XSS Protection Middleware
 * 다층 방어 전략을 사용한 XSS 공격 방지
 */

// XSS 위험 패턴 정의
const XSS_PATTERNS = [
  // JavaScript 실행 패턴
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick, onload 등

  // 위험한 HTML 태그
  /<iframe[\s\S]*?>/gi,
  /<embed[\s\S]*?>/gi,
  /<object[\s\S]*?>/gi,
  /<link[\s\S]*?>/gi,
  /<meta[\s\S]*?>/gi,

  // 데이터 URI 스크립트
  /data:.*?base64/gi,

  // 위험한 속성
  /style\s*=\s*["'].*?expression\s*\(/gi,
  /style\s*=\s*["'].*?javascript:/gi,

  // SQL Injection 시도 (보너스 보호)
  /(\b(union|select|insert|update|delete|drop|create)\b[\s\S]*?\b(from|where|table)\b)/gi,

  // 경로 순회 공격
  /\.\.[\/\\]/g,

  // Null 바이트
  /\x00/g
];

// 콘텐츠 타입별 살균 설정
const SANITIZATION_CONFIGS = {
  // 일반 텍스트 (HTML 태그 완전 제거)
  text: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false
  },

  // 제한된 HTML (안전한 태그만 허용)
  html: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: {
      a: ['href', 'title', 'target'],
      code: ['class']
    },
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):\/\/|[^:/?#]*(?:[/?#]|$))/i,
    FORBID_CONTENTS: ['script', 'style'],
    KEEP_CONTENT: true,
    RETURN_DOM: false
  },

  // 마크다운 (더 많은 태그 허용)
  markdown: {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'],
    ALLOWED_ATTR: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'width', 'height'],
      code: ['class']
    },
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):\/\/|[^:/?#]*(?:[/?#]|$))/i,
    FORBID_CONTENTS: ['script', 'style'],
    KEEP_CONTENT: true,
    RETURN_DOM: false
  }
};

// XSS 위험도 점수 계산
const calculateXSSRisk = (input) => {
  let riskScore = 0;

  if (typeof input !== 'string') return 0;

  // 패턴 매칭으로 위험도 계산
  XSS_PATTERNS.forEach(pattern => {
    const matches = input.match(pattern);
    if (matches) {
      riskScore += matches.length * 10;
    }
  });

  // 특수 문자 밀도 계산
  const specialChars = input.match(/[<>&'"]/g);
  if (specialChars) {
    riskScore += specialChars.length;
  }

  // 의심스러운 키워드
  const suspiciousKeywords = ['eval', 'exec', 'Function', 'setTimeout', 'setInterval'];
  suspiciousKeywords.forEach(keyword => {
    if (input.includes(keyword)) {
      riskScore += 5;
    }
  });

  return riskScore;
};

// 재귀적 객체 살균
const sanitizeObject = (obj, config = SANITIZATION_CONFIGS.text) => {
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj, config);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, config));
  }

  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // 키도 살균
      const sanitizedKey = validator.escape(key);
      sanitized[sanitizedKey] = sanitizeObject(value, config);
    }
    return sanitized;
  }

  return obj;
};

// Content-Type 기반 자동 살균
const getConfigByContentType = (contentType) => {
  if (!contentType) return SANITIZATION_CONFIGS.text;

  if (contentType.includes('html')) {
    return SANITIZATION_CONFIGS.html;
  } else if (contentType.includes('markdown')) {
    return SANITIZATION_CONFIGS.markdown;
  }

  return SANITIZATION_CONFIGS.text;
};

// XSS 보호 미들웨어
const xssProtection = (options = {}) => {
  const {
    enableLogging = true,
    blockHighRisk = true,
    riskThreshold = 50,
    customPatterns = [],
    defaultConfig = 'text',
    headerName = 'X-XSS-Protection'
  } = options;

  // 커스텀 패턴 추가
  const allPatterns = [...XSS_PATTERNS, ...customPatterns];

  return (req, res, next) => {
    // XSS 보호 헤더 설정
    res.setHeader(headerName, '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 요청 본문 살균
    if (req.body) {
      const originalBody = JSON.stringify(req.body);
      const riskScore = calculateXSSRisk(originalBody);

      if (enableLogging && riskScore > 10) {
        console.warn('XSS Risk Detected:', {
          ip: req.ip,
          path: req.path,
          method: req.method,
          riskScore,
          userAgent: req.get('user-agent')
        });
      }

      // 고위험 요청 차단
      if (blockHighRisk && riskScore > riskThreshold) {
        return res.status(400).json({
          error: 'Request contains potentially malicious content',
          code: 'XSS_RISK_HIGH'
        });
      }

      // 콘텐츠 타입에 따른 설정 선택
      const contentType = req.get('content-type') || '';
      const config = getConfigByContentType(contentType);

      // 본문 살균
      req.body = sanitizeObject(req.body, config);
    }

    // 쿼리 파라미터 살균
    if (req.query) {
      req.query = sanitizeObject(req.query, SANITIZATION_CONFIGS.text);
    }

    // 파라미터 살균
    if (req.params) {
      req.params = sanitizeObject(req.params, SANITIZATION_CONFIGS.text);
    }

    // 쿠키 살균
    if (req.cookies) {
      for (const [key, value] of Object.entries(req.cookies)) {
        if (typeof value === 'string') {
          req.cookies[key] = validator.escape(value);
        }
      }
    }

    // 헤더 살균 (User-Agent 등 위험한 헤더)
    const dangerousHeaders = ['user-agent', 'referer', 'x-forwarded-for'];
    dangerousHeaders.forEach(header => {
      const value = req.get(header);
      if (value && calculateXSSRisk(value) > 20) {
        req.headers[header] = validator.escape(value);
      }
    });

    // 응답 인터셉터 추가 (동적 콘텐츠 보호)
    const originalSend = res.send;
    res.send = function(data) {
      if (typeof data === 'string') {
        // HTML 응답인 경우 추가 살균
        if (res.get('content-type')?.includes('html')) {
          data = DOMPurify.sanitize(data, SANITIZATION_CONFIGS.html);
        }
      } else if (typeof data === 'object') {
        // JSON 응답 살균
        data = sanitizeObject(data, SANITIZATION_CONFIGS.text);
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

// 특정 필드에 대한 선택적 살균
const sanitizeFields = (fields = [], config = 'text') => {
  return (req, res, next) => {
    const sanitizationConfig = SANITIZATION_CONFIGS[config] || SANITIZATION_CONFIGS.text;

    fields.forEach(field => {
      const value = req.body?.[field];
      if (value) {
        req.body[field] = DOMPurify.sanitize(value, sanitizationConfig);
      }
    });

    next();
  };
};

// 파일 업로드 XSS 보호
const fileUploadXSSProtection = (req, res, next) => {
  if (!req.files) return next();

  const dangerousExtensions = ['.html', '.htm', '.svg', '.xml', '.xhtml'];
  const dangerousMimeTypes = ['text/html', 'application/xhtml+xml', 'image/svg+xml'];

  for (const file of Object.values(req.files)) {
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    // 위험한 확장자 차단
    if (dangerousExtensions.includes(extension)) {
      return res.status(400).json({
        error: 'File type not allowed for security reasons',
        code: 'FILE_TYPE_DANGEROUS'
      });
    }

    // 위험한 MIME 타입 차단
    if (dangerousMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'File MIME type not allowed',
        code: 'MIME_TYPE_DANGEROUS'
      });
    }

    // 파일명 살균
    file.name = validator.escape(file.name);
  }

  next();
};

module.exports = {
  xssProtection,
  sanitizeFields,
  fileUploadXSSProtection,
  calculateXSSRisk,
  sanitizeObject,
  SANITIZATION_CONFIGS
};
