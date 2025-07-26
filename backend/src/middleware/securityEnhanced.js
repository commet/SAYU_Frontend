const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const DOMPurify = require('isomorphic-dompurify');

// Account lockout tracking
const accountLockouts = new Map();
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Account lockout middleware
 */
const accountLockoutMiddleware = (req, res, next) => {
  const identifier = req.body.email || req.body.username || req.ip;
  const lockoutKey = `lockout:${identifier}`;
  
  const lockoutData = accountLockouts.get(lockoutKey);
  
  if (lockoutData && lockoutData.lockedUntil > Date.now()) {
    const remainingTime = Math.ceil((lockoutData.lockedUntil - Date.now()) / 1000 / 60);
    return res.status(429).json({
      error: `계정이 잠겼습니다. ${remainingTime}분 후에 다시 시도해주세요.`,
      code: 'ACCOUNT_LOCKED'
    });
  }
  
  next();
};

/**
 * Track failed login attempts
 */
const trackFailedAttempt = (identifier) => {
  const lockoutKey = `lockout:${identifier}`;
  const lockoutData = accountLockouts.get(lockoutKey) || { attempts: 0 };
  
  lockoutData.attempts++;
  lockoutData.lastAttempt = Date.now();
  
  if (lockoutData.attempts >= LOCKOUT_THRESHOLD) {
    lockoutData.lockedUntil = Date.now() + LOCKOUT_DURATION;
    console.warn(`Account locked: ${identifier}`);
  }
  
  accountLockouts.set(lockoutKey, lockoutData);
};

/**
 * Clear failed attempts on successful login
 */
const clearFailedAttempts = (identifier) => {
  const lockoutKey = `lockout:${identifier}`;
  accountLockouts.delete(lockoutKey);
};

/**
 * Request fingerprinting for advanced rate limiting
 */
const generateRequestFingerprint = (req) => {
  const components = [
    req.ip,
    req.get('user-agent') || '',
    req.get('accept-language') || '',
    req.get('accept-encoding') || '',
    req.method,
    req.originalUrl
  ];
  
  const fingerprintString = components.join('|');
  return crypto.createHash('sha256').update(fingerprintString).digest('hex');
};

/**
 * API key validation middleware with enhanced security
 */
const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key is required',
      code: 'MISSING_API_KEY'
    });
  }
  
  // Validate API key format
  if (!/^[a-zA-Z0-9]{32,64}$/.test(apiKey)) {
    return res.status(401).json({
      error: 'Invalid API key format',
      code: 'INVALID_API_KEY_FORMAT'
    });
  }
  
  try {
    // TODO: Implement actual API key validation against database
    // This should check:
    // 1. Key exists and is active
    // 2. Key hasn't exceeded rate limits
    // 3. Key is authorized for the requested resource
    // 4. Log API key usage
    
    req.apiKeyInfo = {
      key: apiKey,
      tier: 'standard', // Should come from database
      rateLimit: 1000,
      fingerprint: generateRequestFingerprint(req)
    };
    
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      error: 'API key validation failed',
      code: 'API_KEY_VALIDATION_ERROR'
    });
  }
};

/**
 * File upload security middleware
 */
const fileUploadSecurity = (allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }
    
    const errors = [];
    
    Object.entries(req.files).forEach(([fieldName, file]) => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${fieldName}: 파일 크기가 너무 큽니다 (최대 ${maxSize / 1024 / 1024}MB)`);
      }
      
      // Check file type
      if (allowedTypes.length > 0) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const mimeType = file.mimetype;
        
        const isAllowed = allowedTypes.some(type => {
          if (type.includes('/')) {
            // MIME type check
            return mimeType === type || mimeType.startsWith(type.split('/')[0] + '/');
          } else {
            // Extension check
            return fileExtension === type;
          }
        });
        
        if (!isAllowed) {
          errors.push(`${fieldName}: 허용되지 않은 파일 형식입니다`);
        }
      }
      
      // Check for potentially dangerous file names
      if (/[<>:"|?*\x00-\x1f]/g.test(file.name)) {
        errors.push(`${fieldName}: 잘못된 파일 이름입니다`);
      }
    });
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: '파일 업로드 검증 실패',
        details: errors
      });
    }
    
    next();
  };
};

/**
 * Query complexity limiting middleware
 */
const queryComplexityLimit = (maxComplexity = 1000) => {
  return (req, res, next) => {
    // Estimate query complexity based on request parameters
    let complexity = 0;
    
    // Count nested includes/joins
    if (req.query.include) {
      const includes = Array.isArray(req.query.include) ? req.query.include : [req.query.include];
      complexity += includes.length * 100;
    }
    
    // Count filters
    const filterParams = Object.keys(req.query).filter(key => key.startsWith('filter'));
    complexity += filterParams.length * 50;
    
    // Count sorting parameters
    if (req.query.sort) {
      const sorts = Array.isArray(req.query.sort) ? req.query.sort : [req.query.sort];
      complexity += sorts.length * 20;
    }
    
    // Large limit increases complexity
    const limit = parseInt(req.query.limit) || 100;
    complexity += limit;
    
    if (complexity > maxComplexity) {
      return res.status(400).json({
        error: '쿼리가 너무 복잡합니다',
        code: 'QUERY_TOO_COMPLEX',
        complexity,
        maxComplexity
      });
    }
    
    req.queryComplexity = complexity;
    next();
  };
};

/**
 * Session fingerprinting for enhanced security
 */
const generateSessionFingerprint = (req) => {
  const components = [
    req.ip,
    req.get('user-agent') || '',
    req.get('accept-language') || '',
    // Don't include changing headers that might break the session
  ];
  
  const fingerprintString = components.join('|');
  return crypto.createHash('sha256').update(fingerprintString).digest('hex').substring(0, 16);
};

/**
 * Session security middleware
 */
const sessionSecurity = (req, res, next) => {
  if (!req.session) {
    return next();
  }
  
  const currentFingerprint = generateSessionFingerprint(req);
  
  if (req.session.fingerprint) {
    // Validate session fingerprint
    if (req.session.fingerprint !== currentFingerprint) {
      console.warn('Session fingerprint mismatch:', {
        expected: req.session.fingerprint,
        actual: currentFingerprint,
        ip: req.ip,
        sessionId: req.sessionID
      });
      
      // Destroy potentially hijacked session
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      
      return res.status(401).json({
        error: '세션이 만료되었습니다. 다시 로그인해주세요.',
        code: 'SESSION_FINGERPRINT_MISMATCH'
      });
    }
  } else {
    // Set fingerprint for new sessions
    req.session.fingerprint = currentFingerprint;
  }
  
  // Regenerate session ID periodically
  if (req.session.user && !req.session.regenerated) {
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
      } else {
        req.session.regenerated = Date.now();
        req.session.fingerprint = currentFingerprint;
        if (req.session.user) {
          req.session.user = req.session.user; // Preserve user data
        }
      }
    });
  }
  
  next();
};

/**
 * Response data filtering based on user permissions
 */
const filterResponseData = (allowedFields = []) => {
  return (req, res, next) => {
    // Override res.json to filter data
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      if (allowedFields.length > 0 && typeof data === 'object') {
        const filtered = filterObjectFields(data, allowedFields);
        return originalJson(filtered);
      }
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Helper function to filter object fields
 */
const filterObjectFields = (obj, allowedFields) => {
  if (Array.isArray(obj)) {
    return obj.map(item => filterObjectFields(item, allowedFields));
  }
  
  if (obj && typeof obj === 'object') {
    const filtered = {};
    allowedFields.forEach(field => {
      if (field.includes('.')) {
        // Handle nested fields
        const [parent, ...rest] = field.split('.');
        if (obj.hasOwnProperty(parent)) {
          filtered[parent] = filterObjectFields(obj[parent], [rest.join('.')]);
        }
      } else if (obj.hasOwnProperty(field)) {
        filtered[field] = obj[field];
      }
    });
    return filtered;
  }
  
  return obj;
};

/**
 * Anomaly detection middleware
 */
const anomalyDetection = (req, res, next) => {
  const fingerprint = generateRequestFingerprint(req);
  const now = Date.now();
  
  // Track request patterns
  if (!req.app.locals.requestPatterns) {
    req.app.locals.requestPatterns = new Map();
  }
  
  const patterns = req.app.locals.requestPatterns;
  const userPattern = patterns.get(fingerprint) || {
    requests: [],
    suspiciousActivity: 0
  };
  
  // Add current request
  userPattern.requests.push({
    timestamp: now,
    path: req.path,
    method: req.method
  });
  
  // Keep only recent requests (last 5 minutes)
  userPattern.requests = userPattern.requests.filter(r => now - r.timestamp < 5 * 60 * 1000);
  
  // Detect anomalies
  const anomalies = [];
  
  // Rapid request pattern (more than 100 requests in 1 minute)
  const recentRequests = userPattern.requests.filter(r => now - r.timestamp < 60 * 1000);
  if (recentRequests.length > 100) {
    anomalies.push('RAPID_REQUESTS');
  }
  
  // Path scanning pattern
  const uniquePaths = new Set(userPattern.requests.map(r => r.path));
  if (uniquePaths.size > 50) {
    anomalies.push('PATH_SCANNING');
  }
  
  // Method variation pattern
  const methods = userPattern.requests.map(r => r.method);
  const methodCounts = methods.reduce((acc, method) => {
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});
  
  if (Object.keys(methodCounts).length > 4) {
    anomalies.push('METHOD_FUZZING');
  }
  
  if (anomalies.length > 0) {
    userPattern.suspiciousActivity++;
    console.warn('Anomalies detected:', {
      fingerprint,
      anomalies,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // Block if too many anomalies
    if (userPattern.suspiciousActivity > 5) {
      return res.status(429).json({
        error: '비정상적인 활동이 감지되었습니다',
        code: 'ANOMALY_DETECTED'
      });
    }
  }
  
  patterns.set(fingerprint, userPattern);
  
  // Clean up old patterns periodically
  if (Math.random() < 0.01) { // 1% chance
    for (const [key, pattern] of patterns.entries()) {
      if (pattern.requests.length === 0) {
        patterns.delete(key);
      }
    }
  }
  
  next();
};

// Validation chains for common operations
const validationChains = {
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ],
  
  register: [
    body('email').isEmail().normalizeEmail(),
    body('username').isAlphanumeric().isLength({ min: 3, max: 20 }),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다'),
  ],
  
  updateProfile: [
    body('bio').optional().isLength({ max: 500 }),
    body('website').optional().isURL(),
    body('location').optional().isLength({ max: 100 }),
  ],
  
  createPost: [
    body('title').isLength({ min: 1, max: 200 }).trim(),
    body('content').isLength({ min: 1, max: 50000 }),
    body('tags').optional().isArray({ max: 10 }),
  ],
};

module.exports = {
  accountLockoutMiddleware,
  trackFailedAttempt,
  clearFailedAttempts,
  generateRequestFingerprint,
  validateApiKey,
  fileUploadSecurity,
  queryComplexityLimit,
  sessionSecurity,
  filterResponseData,
  anomalyDetection,
  validationChains,
  generateSessionFingerprint
};