const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const { captureException } = require('./sentry');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logEntry = {
      timestamp,
      level,
      message,
      environment: process.env.NODE_ENV || 'development',
      service: 'sayu-backend'
    };

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logEntry.meta = meta;
    }

    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata in development
    if (Object.keys(meta).length > 0 && process.env.NODE_ENV === 'development') {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

// Create transports
const transports = [];

// Console transport
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
  })
);

// File transports (only in non-test environments)
if (process.env.NODE_ENV !== 'test') {
  // Error logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    })
  );

  // Combined logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '7d',
      zippedArchive: true
    })
  );

  // Security audit logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'warn',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'rejections.log'),
      format: logFormat
    })
  ],
  exitOnError: false
});

// Custom logging functions with Sentry integration
const log = {
  // Debug level - development only
  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },

  // Info level - general information
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },

  // Warning level - concerning but not breaking
  warn: (message, meta = {}) => {
    logger.warn(message, meta);
    
    // Send warnings to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      captureMessage(message, 'warning', { extra: meta });
    }
  },

  // Error level - actual errors
  error: (message, error = null, meta = {}) => {
    const logMeta = { ...meta };
    
    if (error instanceof Error) {
      logMeta.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
      
      // Send error to Sentry
      captureException(error, {
        tags: { component: 'logger' },
        extra: { originalMessage: message, ...meta }
      });
    }
    
    logger.error(message, logMeta);
  },

  // Security-related logs
  security: (message, meta = {}) => {
    const securityMeta = {
      ...meta,
      security: true,
      timestamp: new Date().toISOString()
    };
    
    logger.warn(message, securityMeta);
    
    // Always send security events to Sentry
    captureMessage(message, 'warning', {
      tags: { 
        component: 'security',
        security_event: true
      },
      extra: securityMeta
    });
  },

  // Performance-related logs
  performance: (message, duration, meta = {}) => {
    const performanceMeta = {
      ...meta,
      performance: true,
      duration_ms: duration
    };
    
    // Log as warning if duration is high
    if (duration > 5000) {
      logger.warn(message, performanceMeta);
      
      captureMessage(message, 'warning', {
        tags: { 
          component: 'performance',
          slow_operation: true
        },
        extra: performanceMeta
      });
    } else {
      logger.info(message, performanceMeta);
    }
  },

  // User action tracking
  userAction: (userId, action, meta = {}) => {
    const actionMeta = {
      ...meta,
      userId,
      action,
      userAction: true,
      timestamp: new Date().toISOString()
    };
    
    logger.info(`User ${userId} performed action: ${action}`, actionMeta);
  },

  // API request logging
  apiRequest: (req, responseTime, statusCode, meta = {}) => {
    const requestMeta = {
      ...meta,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      responseTime,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      userId: req.userId || null,
      apiRequest: true
    };

    if (statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl} - ${statusCode} (${responseTime}ms)`, requestMeta);
    } else {
      logger.info(`${req.method} ${req.originalUrl} - ${statusCode} (${responseTime}ms)`, requestMeta);
    }
  },

  // Database operation logging
  database: (operation, duration, meta = {}) => {
    const dbMeta = {
      ...meta,
      operation,
      duration_ms: duration,
      database: true
    };

    if (duration > 1000) {
      logger.warn(`Slow database operation: ${operation} (${duration}ms)`, dbMeta);
    } else {
      logger.debug(`Database operation: ${operation} (${duration}ms)`, dbMeta);
    }
  },

  // Cache operation logging
  cache: (operation, hit, duration, meta = {}) => {
    const cacheMeta = {
      ...meta,
      operation,
      cache_hit: hit,
      duration_ms: duration,
      cache: true
    };

    logger.debug(`Cache ${operation}: ${hit ? 'HIT' : 'MISS'} (${duration}ms)`, cacheMeta);
  }
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture original end function
  const originalEnd = res.end;
  
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Log the request
    log.apiRequest(req, responseTime, res.statusCode);
    
    // Call original end function
    originalEnd.apply(this, args);
  };
  
  next();
};

module.exports = {
  logger,
  log,
  requestLogger
};

// Add a default export for convenience
module.exports.default = logger;