const { v4: uuidv4 } = require('uuid');
const { addRequestContext } = require('../config/sentry');
const { log } = require('../config/logger');

// Add request context for logging and tracing
const requestContext = (req, res, next) => {
  // Generate unique request ID
  req.id = uuidv4();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);
  
  // Extract request metadata
  req.startTime = Date.now();
  req.metadata = {
    id: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length']
  };

  // Add context to Sentry scope
  addRequestContext(req);

  // Log request start
  log.debug('Request started', {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - req.startTime;
    
    // Log response
    log.debug('Request completed', {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      responseSize: JSON.stringify(data).length
    });

    return originalJson.call(this, data);
  };

  next();
};

// Enhanced request logging middleware
const enhancedRequestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture original send and json methods
  const originalSend = res.send;
  const originalJson = res.json;
  
  let responseBody;
  let responseSize = 0;

  // Override send method
  res.send = function(data) {
    responseBody = data;
    responseSize = Buffer.byteLength(data || '', 'utf8');
    return originalSend.call(this, data);
  };

  // Override json method
  res.json = function(data) {
    responseBody = data;
    responseSize = JSON.stringify(data).length;
    return originalJson.call(this, data);
  };

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      responseSize,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.userId || null
    };

    // Add query params if present
    if (Object.keys(req.query).length > 0) {
      logData.query = req.query;
    }

    // Add error details for error responses
    if (res.statusCode >= 400) {
      logData.errorResponse = typeof responseBody === 'object' ? responseBody : { message: responseBody };
      
      // Log as warning for client errors, error for server errors
      if (res.statusCode >= 500) {
        log.error('Request failed with server error', null, logData);
      } else {
        log.warn('Request failed with client error', logData);
      }
    } else {
      log.info('Request completed successfully', logData);
    }

    // Log slow requests
    if (duration > 5000) {
      log.performance('Slow request detected', duration, {
        requestId: req.id,
        endpoint: `${req.method} ${req.originalUrl}`,
        userId: req.userId
      });
    }
  });

  next();
};

// User context middleware - adds user info to logging context
const userContext = (req, res, next) => {
  // This runs after authentication middleware
  if (req.userId) {
    req.userContext = {
      id: req.userId,
      role: req.userRole
    };

    // Add to logging context
    log.debug('User context established', {
      requestId: req.id,
      userId: req.userId,
      userRole: req.userRole
    });
  }

  next();
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime();
  const startMemory = process.memoryUsage();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1e6; // Convert to milliseconds
    const endMemory = process.memoryUsage();

    const memoryUsage = {
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external
    };

    // Log performance metrics
    if (duration > 1000 || memoryUsage.heapUsed > 50 * 1024 * 1024) { // 50MB threshold
      log.performance('Resource intensive request', duration, {
        requestId: req.id,
        endpoint: `${req.method} ${req.originalUrl}`,
        memoryUsage,
        userId: req.userId
      });
    }
  });

  next();
};

// Security context middleware
const securityContext = (req, res, next) => {
  // Add security-related headers to context
  req.securityContext = {
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer,
    origin: req.headers.origin,
    xForwardedFor: req.headers['x-forwarded-for'],
    xRealIP: req.headers['x-real-ip'],
    contentType: req.headers['content-type']
  };

  // Log suspicious patterns
  const userAgent = req.headers['user-agent'] || '';
  const suspiciousBots = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zap'];
  
  if (suspiciousBots.some(bot => userAgent.toLowerCase().includes(bot))) {
    log.security('Suspicious user agent detected', {
      requestId: req.id,
      ip: req.ip,
      userAgent,
      url: req.originalUrl
    });
  }

  next();
};

module.exports = {
  requestContext,
  enhancedRequestLogger,
  userContext,
  performanceMonitor,
  securityContext
};