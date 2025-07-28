const { body, param, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const DOMPurify = require('isomorphic-dompurify');

// Custom sanitization functions
const sanitizers = {
  // Remove HTML tags and encode special characters
  sanitizeHtml: (value) => {
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  },

  // Sanitize text input (remove scripts, normalize whitespace)
  sanitizeText: (value) => {
    return validator.escape(value.trim().replace(/\s+/g, ' '));
  },

  // Sanitize and validate JSON
  sanitizeJson: (value) => {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed); // Re-stringify to ensure clean JSON
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  },

  // Sanitize numeric input
  sanitizeNumber: (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) throw new Error('Invalid number');
    return num;
  },

  // Sanitize and validate URL
  sanitizeUrl: (value) => {
    if (!validator.isURL(value, { protocols: ['http', 'https'] })) {
      throw new Error('Invalid URL format');
    }
    return value;
  }
};

// Common validation patterns
const patterns = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  typeCode: /^[GSARMEFC]{4}$/,
  artworkType: /^[A-Z_]+$/,
  mongoId: /^[0-9a-fA-F]{24}$/,
  ipAddress: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
};

// Rate limiting configurations
const rateLimits = {
  strict: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
  }),

  moderate: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Rate limit exceeded, please slow down' }
  }),

  lenient: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests from this IP' }
  })
};

// Validation schemas
const validationSchemas = {
  // User registration validation
  userRegistration: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .isLength({ max: 255 })
      .custom(async (value) => {
        // Check for disposable email domains
        const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
        const domain = value.split('@')[1];
        if (disposableDomains.includes(domain)) {
          throw new Error('Disposable email addresses are not allowed');
        }
        return true;
      }),

    body('password')
      .isLength({ min: 8, max: 128 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    body('nickname')
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-Z0-9\s\-_]+$/)
      .withMessage('Nickname can only contain letters, numbers, spaces, hyphens, and underscores')
      .customSanitizer(sanitizers.sanitizeText),

    body('age')
      .optional()
      .isInt({ min: 13, max: 120 })
      .withMessage('Age must be between 13 and 120'),

    body('location')
      .optional()
      .custom((value) => {
        if (typeof value === 'object' && value !== null) {
          const { city, country, latitude, longitude } = value;
          if (city && !validator.isLength(city, { min: 1, max: 100 })) {
            throw new Error('Invalid city name');
          }
          if (country && !validator.isLength(country, { min: 2, max: 100 })) {
            throw new Error('Invalid country name');
          }
          if (latitude && !validator.isFloat(latitude.toString(), { min: -90, max: 90 })) {
            throw new Error('Invalid latitude');
          }
          if (longitude && !validator.isFloat(longitude.toString(), { min: -180, max: 180 })) {
            throw new Error('Invalid longitude');
          }
        }
        return true;
      }),

    body('personalManifesto')
      .optional()
      .isLength({ max: 1000 })
      .customSanitizer(sanitizers.sanitizeHtml)
      .customSanitizer(sanitizers.sanitizeText)
  ],

  // User login validation
  userLogin: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .isLength({ max: 255 }),

    body('password')
      .notEmpty()
      .isLength({ max: 128 })
  ],

  // Quiz submission validation
  quizSubmission: [
    body('responses')
      .isObject()
      .custom((value) => {
        const { exhibition, artwork } = value;

        // Validate exhibition responses
        if (!exhibition || typeof exhibition !== 'object') {
          throw new Error('Exhibition responses are required');
        }

        // Validate artwork responses
        if (!artwork || typeof artwork !== 'object') {
          throw new Error('Artwork responses are required');
        }

        // Validate response structure
        Object.values(exhibition).forEach(response => {
          if (typeof response !== 'number' || response < 1 || response > 7) {
            throw new Error('Exhibition responses must be numbers between 1 and 7');
          }
        });

        Object.values(artwork).forEach(response => {
          if (typeof response !== 'number' || response < 1 || response > 7) {
            throw new Error('Artwork responses must be numbers between 1 and 7');
          }
        });

        return true;
      }),

    body('metadata')
      .optional()
      .isObject()
      .custom((value) => {
        const allowedKeys = ['timeSpent', 'deviceInfo', 'userAgent'];
        const keys = Object.keys(value);
        if (keys.some(key => !allowedKeys.includes(key))) {
          throw new Error('Invalid metadata fields');
        }
        return true;
      })
  ],

  // Agent chat validation
  agentChat: [
    body('message')
      .isLength({ min: 1, max: 2000 })
      .customSanitizer(sanitizers.sanitizeText)
      .custom((value) => {
        // Check for spam patterns
        const spamPatterns = [
          /(.)\1{10,}/, // Repeated characters
          /https?:\/\/[^\s]+/gi, // URLs
          /\b(?:buy|sell|cheap|free|money|earn|click|visit)\b/gi // Spam keywords
        ];

        if (spamPatterns.some(pattern => pattern.test(value))) {
          throw new Error('Message contains spam or inappropriate content');
        }

        return true;
      }),

    body('context')
      .optional()
      .isObject()
      .custom((value) => {
        const allowedKeys = ['mood', 'previousMessage', 'artworkId'];
        const keys = Object.keys(value);
        if (keys.some(key => !allowedKeys.includes(key))) {
          throw new Error('Invalid context fields');
        }
        return true;
      })
  ],

  // Artwork interaction validation
  artworkInteraction: [
    body('artworkId')
      .isLength({ min: 1, max: 100 })
      .matches(/^[a-zA-Z0-9\-_]+$/)
      .withMessage('Invalid artwork ID format'),

    body('action')
      .isIn(['view', 'like', 'unlike', 'dislike', 'share', 'save'])
      .withMessage('Invalid action type'),

    body('metadata')
      .optional()
      .isObject()
      .custom((value) => {
        // Validate metadata size
        if (JSON.stringify(value).length > 1000) {
          throw new Error('Metadata too large');
        }
        return true;
      })
  ],

  // Profile update validation
  profileUpdate: [
    body('archetypeName')
      .optional()
      .isLength({ min: 2, max: 100 })
      .customSanitizer(sanitizers.sanitizeText),

    body('emotionalTags')
      .optional()
      .isArray({ min: 1, max: 50 })
      .custom((value) => {
        if (!value.every(tag =>
          typeof tag === 'string' &&
          validator.isLength(tag, { min: 1, max: 50 }) &&
          /^[a-zA-Z\s\-]+$/.test(tag)
        )) {
          throw new Error('Invalid emotional tags format');
        }
        return true;
      }),

    body('interactionStyle')
      .optional()
      .isIn(['guided', 'exploratory', 'analytical', 'intuitive'])
      .withMessage('Invalid interaction style'),

    body('uiCustomization')
      .optional()
      .isObject()
      .custom((value) => {
        const allowedKeys = ['theme', 'fontSize', 'animations', 'notifications'];
        const keys = Object.keys(value);
        if (keys.some(key => !allowedKeys.includes(key))) {
          throw new Error('Invalid UI customization fields');
        }
        return true;
      })
  ],

  // Admin operations validation
  adminOperations: [
    body('userId')
      .optional()
      .matches(patterns.uuid)
      .withMessage('Invalid user ID format'),

    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Invalid role'),

    query('pattern')
      .optional()
      .isLength({ min: 1, max: 100 })
      .matches(/^[a-zA-Z0-9\*\:\-_]+$/)
      .withMessage('Invalid cache pattern'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Limit must be between 1 and 1000')
  ],

  // File upload validation
  fileUpload: [
    body('imageUrl')
      .optional()
      .customSanitizer(sanitizers.sanitizeUrl)
      .isURL({ protocols: ['http', 'https'] })
      .withMessage('Invalid image URL'),

    body('fileSize')
      .optional()
      .isInt({ min: 1, max: 10 * 1024 * 1024 }) // 10MB max
      .withMessage('File size must be between 1 byte and 10MB'),

    body('mimeType')
      .optional()
      .isIn(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
      .withMessage('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed')
  ]
};

// Validation result handler
const handleValidationResult = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      error: 'Validation failed',
      details: errorMessages,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.openai.com https://collectionapi.metmuseum.org"
  );

  next();
};

// Request size limiter
const requestSizeLimiter = (maxSize = '1mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxBytes = parseRequestSize(maxSize);

    if (contentLength > maxBytes) {
      return res.status(413).json({
        error: 'Request too large',
        maxSize,
        receivedSize: `${Math.round(contentLength / 1024)}KB`
      });
    }

    next();
  };
};

// Helper function to parse size strings like '1mb', '500kb'
const parseRequestSize = (sizeStr) => {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = sizeStr.toLowerCase().match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb)$/);

  if (!match) return 1024 * 1024; // Default 1MB

  const [, size, unit] = match;
  return parseFloat(size) * units[unit];
};

// Comprehensive input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return sanitizers.sanitizeText(value);
    } else if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    } else if (value && typeof value === 'object') {
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

module.exports = {
  validationSchemas,
  handleValidationResult,
  securityHeaders,
  requestSizeLimiter,
  sanitizeInput,
  rateLimits,
  sanitizers,
  patterns
};
