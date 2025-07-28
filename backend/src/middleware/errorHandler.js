const { log } = require('../config/logger');
// Sentry disabled for deployment
// const { captureException } = require('../config/sentry');
const alertingService = require('../services/alertingService');

// Enhanced error handler middleware with structured logging
const errorHandler = (err, req, res, next) => {
  // Extract useful information from request
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    userId: req.userId || null,
    body: sanitizeRequestBody(req.body),
    query: req.query,
    params: req.params
  };

  // Determine error type and status code
  let statusCode = 500;
  let errorType = 'INTERNAL_SERVER_ERROR';

  if (err.statusCode || err.status) {
    statusCode = err.statusCode || err.status;
  }

  // Categorize errors
  if (statusCode === 400) {
    errorType = 'BAD_REQUEST';
  } else if (statusCode === 401) {
    errorType = 'UNAUTHORIZED';
  } else if (statusCode === 403) {
    errorType = 'FORBIDDEN';
  } else if (statusCode === 404) {
    errorType = 'NOT_FOUND';
  } else if (statusCode === 422) {
    errorType = 'VALIDATION_ERROR';
  } else if (statusCode === 429) {
    errorType = 'RATE_LIMIT_EXCEEDED';
  } else if (statusCode >= 500) {
    errorType = 'INTERNAL_SERVER_ERROR';
  }

  // Log error with appropriate level
  if (statusCode >= 500) {
    // Server errors - log as errors and send to Sentry
    log.error('Server error occurred', err, {
      errorType,
      statusCode,
      request: requestInfo
    });
  } else if (statusCode >= 400) {
    // Client errors - log as warnings
    log.warn('Client error occurred', {
      errorType,
      statusCode,
      message: err.message,
      request: requestInfo
    });
  }

  // Prepare response
  const response = {
    error: getErrorMessage(err, statusCode),
    code: errorType,
    timestamp: new Date().toISOString()
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err;
  }

  // Add request ID if available
  if (req.id) {
    response.requestId = req.id;
  }

  // Send alerts for critical errors
  if (statusCode >= 500) {
    alertingService.sendApplicationAlert('database_error', err, {
      endpoint: `${req.method} ${req.originalUrl}`,
      userId: req.userId,
      ip: req.ip,
      statusCode
    }).catch(alertErr => {
      log('error', 'Failed to send error alert', { error: alertErr.message });
    });
  }

  res.status(statusCode).json(response);
};

// Sanitize request body for logging (remove sensitive data)
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = [
    'password',
    'token',
    'refreshToken',
    'secret',
    'apiKey',
    'authorization',
    'cookie'
  ];

  const sanitized = { ...body };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

// Get appropriate error message for response
function getErrorMessage(err, statusCode) {
  // Return generic messages for server errors in production
  if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
    return 'Internal server error';
  }

  // Return specific message for client errors or development
  return err.message || 'An error occurred';
}

// 404 handler for unmatched routes
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;

  log.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  next(error);
};

// Async error wrapper to catch errors in async route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode = 500, errorType = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 422, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

class ExternalServiceError extends AppError {
  constructor(service, message = 'External service error') {
    super(`${service}: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled promise rejection', reason, {
    promise: promise.toString(),
    source: 'unhandledRejection'
  });

  // Graceful shutdown
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception', error, {
    source: 'uncaughtException'
  });

  // Graceful shutdown
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError
};
