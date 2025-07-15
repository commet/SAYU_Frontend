const { body, param, query, validationResult } = require('express-validator');
const validator = require('validator');
const { log } = require('../config/logger');

/**
 * Enhanced validation middleware for exhibition endpoints
 * Provides comprehensive input validation and sanitization for exhibition data
 */

// Exhibition creation/update validation
const exhibitionValidation = [
  body('title')
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters')
    .trim()
    .escape()
    .custom((value) => {
      // Check for suspicious patterns
      if (/<script|javascript:|data:/gi.test(value)) {
        throw new Error('Title contains invalid content');
      }
      return true;
    }),

  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters')
    .trim()
    .escape(),

  body('venue_name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Venue name is required and must be less than 100 characters')
    .trim()
    .escape(),

  body('venue_address')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Venue address must be less than 300 characters')
    .trim(),

  body('venue_city')
    .isLength({ min: 1, max: 50 })
    .withMessage('City is required and must be less than 50 characters')
    .trim()
    .escape(),

  body('venue_phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),

  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date < now.setHours(0, 0, 0, 0)) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),

  body('end_date')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.start_date);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('admission_fee')
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Admission fee must be a positive number')
    .toFloat(),

  body('website_url')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Website URL must be valid')
    .custom((value) => {
      // Additional URL validation
      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol');
        }
        return true;
      } catch (error) {
        throw new Error('Invalid URL format');
      }
    }),

  body('image_url')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Image URL must be valid')
    .custom((value) => {
      // Validate image URL format
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const lowercaseUrl = value.toLowerCase();
      const hasValidExtension = imageExtensions.some(ext => 
        lowercaseUrl.includes(ext) || lowercaseUrl.includes('cloudinary.com')
      );
      
      if (!hasValidExtension) {
        throw new Error('Image URL must point to a valid image file');
      }
      return true;
    }),

  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Tags must be an array with maximum 20 items')
    .custom((tags) => {
      if (tags.some(tag => 
        typeof tag !== 'string' || 
        tag.length < 1 || 
        tag.length > 50 ||
        /<script|javascript:/gi.test(tag)
      )) {
        throw new Error('Invalid tag format');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['upcoming', 'ongoing', 'ended'])
    .withMessage('Status must be one of: upcoming, ongoing, ended'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
];

// Exhibition submission validation
const exhibitionSubmissionValidation = [
  param('id')
    .isUUID()
    .withMessage('Exhibition ID must be a valid UUID'),

  body('submitter_name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Submitter name must be between 2 and 100 characters')
    .trim()
    .escape(),

  body('submitter_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('submitter_phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),

  body('organization')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Organization name must be less than 200 characters')
    .trim()
    .escape(),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
    .trim()
    .escape(),

  body('additional_info')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Additional info must be less than 2000 characters')
    .trim()
    .escape()
];

// Exhibition query validation
const exhibitionQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('city')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('City filter must be between 1 and 50 characters')
    .trim()
    .escape(),

  query('status')
    .optional()
    .isIn(['upcoming', 'ongoing', 'ended', 'all'])
    .withMessage('Status must be one of: upcoming, ongoing, ended, all'),

  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
    .trim()
    .escape()
    .custom((value) => {
      // Prevent SQL injection patterns in search
      const dangerousPatterns = [
        /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/gi,
        /(\-\-|\#|\/\*|\*\/)/gi,
        /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi
      ];
      
      if (dangerousPatterns.some(pattern => pattern.test(value))) {
        throw new Error('Search term contains invalid characters');
      }
      return true;
    }),

  query('sort')
    .optional()
    .isIn(['date', 'popularity', 'alphabetical', 'relevance'])
    .withMessage('Sort must be one of: date, popularity, alphabetical, relevance'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),

  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),

  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query.date_from) {
        const dateFrom = new Date(req.query.date_from);
        const dateTo = new Date(value);
        if (dateTo <= dateFrom) {
          throw new Error('Date to must be after date from');
        }
      }
      return true;
    }),

  query('price_max')
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Maximum price must be a positive number')
    .toFloat(),

  query('has_image')
    .optional()
    .isBoolean()
    .withMessage('Has image must be a boolean value')
    .toBoolean()
];

// Exhibition ID parameter validation
const exhibitionIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Exhibition ID must be a valid UUID')
];

// Exhibition interaction validation (likes, views)
const exhibitionInteractionValidation = [
  param('id')
    .isUUID()
    .withMessage('Exhibition ID must be a valid UUID'),

  body('action')
    .isIn(['like', 'unlike', 'view'])
    .withMessage('Action must be one of: like, unlike, view'),

  body('metadata')
    .optional()
    .isObject()
    .custom((value) => {
      // Validate metadata structure and size
      const stringified = JSON.stringify(value);
      if (stringified.length > 1000) {
        throw new Error('Metadata too large');
      }
      
      const allowedKeys = ['source', 'device', 'referrer', 'duration'];
      const keys = Object.keys(value);
      if (keys.some(key => !allowedKeys.includes(key))) {
        throw new Error('Invalid metadata keys');
      }
      
      return true;
    })
];

// Validation result handler with enhanced logging
const handleExhibitionValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    // Log validation failures for security monitoring
    log.warn('Exhibition validation failed', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      userId: req.userId,
      errors: errorDetails,
      body: sanitizeLogData(req.body),
      query: req.query,
      params: req.params
    });

    return res.status(400).json({
      error: 'Validation failed',
      code: 'EXHIBITION_VALIDATION_ERROR',
      details: errorDetails,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Sanitize data for logging (remove sensitive info)
function sanitizeLogData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

// Input sanitization for exhibition data
const sanitizeExhibitionInput = (req, res, next) => {
  if (req.body) {
    // Sanitize string fields
    const stringFields = [
      'title', 'description', 'venue_name', 'venue_address', 
      'venue_city', 'submitter_name', 'organization'
    ];
    
    stringFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        // Remove HTML tags and normalize whitespace
        req.body[field] = req.body[field]
          .replace(/<[^>]*>/g, '') // Strip HTML tags
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
      }
    });

    // Sanitize arrays (tags)
    if (req.body.tags && Array.isArray(req.body.tags)) {
      req.body.tags = req.body.tags
        .filter(tag => typeof tag === 'string')
        .map(tag => tag.replace(/<[^>]*>/g, '').trim())
        .filter(tag => tag.length > 0);
    }

    // Ensure numeric fields are properly typed
    const numericFields = ['admission_fee', 'latitude', 'longitude'];
    numericFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        const num = parseFloat(req.body[field]);
        if (!isNaN(num)) {
          req.body[field] = num;
        }
      }
    });
  }

  next();
};

// Rate limiting for exhibition submissions
const submissionRateLimit = require('express-rate-limit')({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 submissions per hour per IP
  message: {
    error: 'Too many exhibition submissions, please try again later',
    code: 'SUBMISSION_RATE_LIMIT_EXCEEDED',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by IP + user ID if authenticated
    return req.userId ? `${req.ip}-${req.userId}` : req.ip;
  }
});

module.exports = {
  exhibitionValidation,
  exhibitionSubmissionValidation,
  exhibitionQueryValidation,
  exhibitionIdValidation,
  exhibitionInteractionValidation,
  handleExhibitionValidationResult,
  sanitizeExhibitionInput,
  submissionRateLimit
};