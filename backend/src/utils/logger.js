// Utility functions for enhanced logging across the application
const { log } = require('../config/logger');

// Database operation logging helper
function logDatabaseOperation(operation, duration, query = null, error = null) {
  const logData = {
    operation,
    duration_ms: duration,
    database: true
  };

  if (query) {
    // Sanitize query for logging (remove sensitive data)
    logData.query = sanitizeQuery(query);
  }

  if (error) {
    log.error(`Database operation failed: ${operation}`, error, logData);
  } else if (duration > 1000) {
    log.warn(`Slow database operation: ${operation} (${duration}ms)`, logData);
  } else {
    log.debug(`Database operation: ${operation} (${duration}ms)`, logData);
  }
}

// API call logging helper
function logApiCall(service, endpoint, duration, success, error = null) {
  const logData = {
    service,
    endpoint,
    duration_ms: duration,
    success,
    externalApi: true
  };

  if (error) {
    log.error(`External API call failed: ${service}${endpoint}`, error, logData);
  } else if (duration > 3000) {
    log.warn(`Slow external API call: ${service}${endpoint} (${duration}ms)`, logData);
  } else {
    log.info(`External API call: ${service}${endpoint} (${duration}ms)`, logData);
  }
}

// Cache operation logging helper
function logCacheOperation(operation, key, hit = null, duration = null) {
  const logData = {
    operation,
    key: sanitizeCacheKey(key),
    cache: true
  };

  if (hit !== null) {
    logData.cache_hit = hit;
  }

  if (duration !== null) {
    logData.duration_ms = duration;
  }

  log.debug(`Cache ${operation}: ${hit ? 'HIT' : 'MISS'}`, logData);
}

// User action logging helper
function logUserAction(userId, action, details = {}) {
  log.userAction(userId, action, {
    ...details,
    timestamp: new Date().toISOString()
  });
}

// Security event logging helper
function logSecurityEvent(eventType, details = {}) {
  log.security(`Security event: ${eventType}`, {
    eventType,
    ...details,
    timestamp: new Date().toISOString()
  });
}

// Performance metric logging helper
function logPerformanceMetric(metric, value, context = {}) {
  log.performance(`Performance metric: ${metric}`, value, {
    metric,
    value,
    ...context,
    timestamp: new Date().toISOString()
  });
}

// Business logic logging helper
function logBusinessEvent(event, data = {}) {
  log.info(`Business event: ${event}`, {
    event,
    ...data,
    businessEvent: true,
    timestamp: new Date().toISOString()
  });
}

// Error context helper
function createErrorContext(req, additionalContext = {}) {
  return {
    requestId: req?.id,
    userId: req?.userId,
    method: req?.method,
    url: req?.originalUrl,
    ip: req?.ip,
    userAgent: req?.headers?.['user-agent'],
    ...additionalContext
  };
}

// Helper functions
function sanitizeQuery(query) {
  if (typeof query === 'string') {
    // Remove potential sensitive data from SQL queries
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password='[REDACTED]'")
      .replace(/token\s*=\s*'[^']*'/gi, "token='[REDACTED]'")
      .replace(/secret\s*=\s*'[^']*'/gi, "secret='[REDACTED]'");
  }
  return query;
}

function sanitizeCacheKey(key) {
  if (typeof key === 'string') {
    // Remove user IDs and sensitive data from cache keys for logging
    return key.replace(/user:\d+/g, 'user:[ID]')
              .replace(/token:[a-f0-9-]+/g, 'token:[TOKEN]');
  }
  return key;
}

// Request timing helper
function createTimer() {
  const start = Date.now();
  return {
    end: () => Date.now() - start
  };
}

// Batch logging for multiple events
function logBatch(events) {
  events.forEach(event => {
    const { level, message, meta } = event;
    log[level](message, meta);
  });
}

// Structured error logging with automatic context
function logError(error, context = {}) {
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...context
  };

  log.error('Application error occurred', error, errorInfo);
}

module.exports = {
  logDatabaseOperation,
  logApiCall,
  logCacheOperation,
  logUserAction,
  logSecurityEvent,
  logPerformanceMetric,
  logBusinessEvent,
  createErrorContext,
  createTimer,
  logBatch,
  logError
};