const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { body, validationResult } = require('express-validator');
const { log } = require('../config/logger');

/**
 * Enhanced Security Middleware
 * Implements stricter rate limiting, brute force protection, and input validation
 */

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { 
    error: 'Too many authentication attempts, please try again later',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by IP + User Agent for better accuracy
    return `${req.ip}-${req.headers['user-agent'] || 'unknown'}`;
  },
  handler: (req, res) => {
    log.warn('Authentication rate limit exceeded', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes'
    });
  }
});

// Progressive delay for repeated authentication attempts
const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 2, // Start delaying after 2 attempts
  delayMs: () => 500, // Delay each request by 500ms (updated API)
  maxDelayMs: 5000, // Maximum delay of 5 seconds
  keyGenerator: (req) => {
    return `${req.ip}-${req.headers['user-agent'] || 'unknown'}`;
  },
  validate: {
    delayMs: false // Disable deprecation warning
  }
});

// API rate limiting with more reasonable limits
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Reduced from 200 to 100
  message: { 
    error: 'API rate limit exceeded, please try again later',
    code: 'API_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and static files
    return req.url === '/api/health' || req.url.startsWith('/api/static/');
  }
});

// Enhanced input validation for authentication
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ min: 3, max: 254 })
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      log.warn('Login validation failed', {
        ip: req.ip,
        errors: errors.array(),
        email: req.body.email
      });
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ min: 3, max: 254 })
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('nickname')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z0-9가-힣\s]+$/)
    .withMessage('Nickname must be 2-50 characters and contain only letters, numbers, and Korean characters'),
  body('age')
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('personalManifesto')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Personal manifesto must be less than 500 characters'),
  
  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      log.warn('Registration validation failed', {
        ip: req.ip,
        errors: errors.array(),
        email: req.body.email
      });
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Remove server identification
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  next();
};

// Request size validation middleware
const requestSizeValidator = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    log.warn('Request size exceeded', {
      ip: req.ip,
      contentLength,
      maxSize,
      path: req.path
    });
    return res.status(413).json({
      error: 'Request too large',
      code: 'REQUEST_SIZE_EXCEEDED',
      maxSize: '10MB'
    });
  }
  
  next();
};

// IP whitelist for admin endpoints (if needed)
const adminIPWhitelist = (req, res, next) => {
  // Skip in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  
  const allowedIPs = (process.env.ADMIN_ALLOWED_IPS || '').split(',').filter(ip => ip.trim());
  
  if (allowedIPs.length === 0) {
    return next(); // No IP restriction if not configured
  }
  
  const clientIP = req.ip;
  
  if (!allowedIPs.includes(clientIP)) {
    log.warn('Admin access denied - IP not whitelisted', {
      ip: clientIP,
      allowedIPs,
      path: req.path
    });
    return res.status(403).json({
      error: 'Access denied',
      code: 'IP_NOT_WHITELISTED'
    });
  }
  
  next();
};

// CSRF protection for state-changing operations
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and API endpoints using Bearer tokens
  if (req.method === 'GET' || req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }
  
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.BACKEND_URL,
    'http://localhost:3000',
    'http://localhost:3001'
  ].filter(Boolean);
  
  if (!origin && !referer) {
    log.warn('CSRF protection: No origin or referer header', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    return res.status(403).json({
      error: 'CSRF protection: Origin required',
      code: 'CSRF_PROTECTION_TRIGGERED'
    });
  }
  
  const requestOrigin = origin || new URL(referer).origin;
  
  if (!allowedOrigins.includes(requestOrigin)) {
    log.warn('CSRF protection: Invalid origin', {
      ip: req.ip,
      origin: requestOrigin,
      allowedOrigins,
      path: req.path
    });
    return res.status(403).json({
      error: 'CSRF protection: Invalid origin',
      code: 'CSRF_PROTECTION_TRIGGERED'
    });
  }
  
  next();
};

// Security audit logging
const securityAuditLogger = (req, res, next) => {
  const securityEvents = [];
  
  // Log suspicious patterns
  if (req.body) {
    const bodyStr = JSON.stringify(req.body);
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(\b(OR|AND)\s+['"]\s*['"]\s*=\s*['"])/gi
    ];
    
    sqlPatterns.forEach(pattern => {
      if (pattern.test(bodyStr)) {
        securityEvents.push('SQL_INJECTION_ATTEMPT');
      }
    });
    
    // Check for XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    
    xssPatterns.forEach(pattern => {
      if (pattern.test(bodyStr)) {
        securityEvents.push('XSS_ATTEMPT');
      }
    });
  }
  
  // Log security events
  if (securityEvents.length > 0) {
    log.warn('Security audit: Suspicious activity detected', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      events: securityEvents,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

module.exports = {
  authLimiter,
  authSlowDown,
  apiLimiter,
  loginValidation,
  registerValidation,
  securityHeaders,
  requestSizeValidator,
  adminIPWhitelist,
  csrfProtection,
  securityAuditLogger
};