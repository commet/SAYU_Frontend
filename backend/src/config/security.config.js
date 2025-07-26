/**
 * Security Configuration for SAYU Backend
 * Centralized security settings and policies
 */

module.exports = {
  // Rate Limiting Configuration
  rateLimiting: {
    // Default rate limit settings
    default: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
    },
    
    // Endpoint-specific limits
    endpoints: {
      auth: {
        login: { windowMs: 15 * 60 * 1000, max: 5, skipSuccessfulRequests: true },
        register: { windowMs: 60 * 60 * 1000, max: 3 },
        passwordReset: { windowMs: 60 * 60 * 1000, max: 3 },
        verifyEmail: { windowMs: 60 * 60 * 1000, max: 5 }
      },
      api: {
        general: { windowMs: 15 * 60 * 1000, max: 100 },
        ai: { windowMs: 5 * 60 * 1000, max: 20 },
        upload: { windowMs: 60 * 60 * 1000, max: 50 },
        exhibition: { windowMs: 10 * 60 * 1000, max: 60 },
        museum: { windowMs: 5 * 60 * 1000, max: 30 },
        realtime: { windowMs: 1 * 60 * 1000, max: 60 }
      },
      public: {
        freeUser: { windowMs: 15 * 60 * 1000, max: 100 },
        apiKeyUser: { windowMs: 15 * 60 * 1000, max: 1000 },
        premiumUser: { windowMs: 15 * 60 * 1000, max: 5000 }
      }
    }
  },
  
  // Account Security Configuration
  accountSecurity: {
    lockout: {
      threshold: 5, // Failed attempts before lockout
      duration: 30 * 60 * 1000, // 30 minutes
      resetOnSuccess: true
    },
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      specialCharsRegex: /[@$!%*?&]/,
      preventCommon: true, // Check against common passwords
      preventUserInfo: true, // Prevent using username/email in password
      historyLimit: 5 // Prevent reusing last 5 passwords
    },
    session: {
      timeout: 24 * 60 * 60 * 1000, // 24 hours
      regenerateInterval: 60 * 60 * 1000, // 1 hour
      maxConcurrent: 5, // Max concurrent sessions per user
      fingerprintComponents: ['userAgent', 'acceptLanguage', 'ip']
    },
    twoFactor: {
      enabled: false, // Enable when ready
      gracePeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
      backupCodes: 10
    }
  },
  
  // API Security Configuration
  apiSecurity: {
    keys: {
      length: 32,
      format: /^[a-zA-Z0-9]{32,64}$/,
      rotationInterval: 90 * 24 * 60 * 60 * 1000, // 90 days
      maxPerUser: 5,
      requireApproval: false,
      ipWhitelist: false // Enable for production
    },
    versioning: {
      current: 'v1',
      supported: ['v1'],
      deprecationNotice: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    cors: {
      allowedOrigins: process.env.NODE_ENV === 'production' ? [
        'https://sayu.co.kr',
        'https://www.sayu.co.kr',
        'https://app.sayu.co.kr'
      ] : ['http://localhost:3000', 'http://localhost:3001'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
      credentials: true,
      maxAge: 86400 // 24 hours
    }
  },
  
  // File Upload Security
  fileUpload: {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB default
      files: 5, // Max files per request
      fields: 50, // Max non-file fields
      parts: 100 // Max parts (files + fields)
    },
    allowedTypes: {
      images: {
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxSize: 5 * 1024 * 1024 // 5MB
      },
      documents: {
        mimeTypes: ['application/pdf', 'text/plain'],
        extensions: ['pdf', 'txt'],
        maxSize: 10 * 1024 * 1024 // 10MB
      },
      videos: {
        mimeTypes: ['video/mp4', 'video/webm'],
        extensions: ['mp4', 'webm'],
        maxSize: 100 * 1024 * 1024 // 100MB
      }
    },
    storage: {
      temp: '/tmp/uploads',
      permanent: '/var/uploads',
      cloudinary: {
        folder: 'sayu-uploads',
        resourceType: 'auto',
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']
      }
    },
    sanitization: {
      removeExif: true,
      scanVirus: false, // Enable with ClamAV in production
      validateContent: true
    }
  },
  
  // Query Security
  querySecurity: {
    complexity: {
      maxDepth: 5,
      maxFields: 100,
      maxComplexity: 1000,
      timeout: 30000 // 30 seconds
    },
    pagination: {
      defaultLimit: 20,
      maxLimit: 100,
      requirePagination: true
    },
    filtering: {
      maxFilters: 10,
      allowedOperators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'like'],
      sanitizeInput: true
    }
  },
  
  // Monitoring and Logging
  monitoring: {
    security: {
      logLevel: 'warn',
      alertThreshold: 10, // Security events before alert
      alertChannels: ['email', 'slack'],
      retentionDays: 90
    },
    anomaly: {
      enabled: true,
      patterns: {
        rapidRequests: { threshold: 100, window: 60000 }, // 100 requests in 1 minute
        pathScanning: { threshold: 50, window: 300000 }, // 50 unique paths in 5 minutes
        methodFuzzing: { threshold: 5, window: 60000 }, // 5 different methods in 1 minute
        failedAuth: { threshold: 10, window: 300000 } // 10 failed auths in 5 minutes
      },
      actions: {
        block: true,
        alert: true,
        captcha: false // Enable when implemented
      }
    }
  },
  
  // Headers Security
  headers: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          scriptSrc: ["'self'", 'https://www.google-analytics.com'],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          connectSrc: ["'self'", 'https://api.sayu.co.kr'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    },
    custom: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  },
  
  // Encryption and Hashing
  crypto: {
    bcrypt: {
      saltRounds: 12
    },
    jwt: {
      algorithm: 'HS256',
      expiresIn: '24h',
      refreshExpiresIn: '7d',
      issuer: 'sayu-api',
      audience: 'sayu-users'
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      keyDerivation: 'pbkdf2',
      iterations: 100000
    }
  },
  
  // Content Security
  content: {
    sanitization: {
      html: {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        allowedAttributes: {
          a: ['href', 'title']
        },
        allowedSchemes: ['http', 'https', 'mailto']
      },
      json: {
        maxDepth: 10,
        maxStringLength: 10000,
        stripNullBytes: true
      }
    },
    validation: {
      email: {
        maxLength: 254,
        checkDisposable: true,
        checkDNS: false // Enable in production
      },
      username: {
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_-]+$/,
        reserved: ['admin', 'root', 'api', 'sayu', 'system']
      },
      url: {
        protocols: ['http', 'https'],
        requireProtocol: true,
        maxLength: 2048
      }
    }
  },
  
  // Emergency Response
  emergency: {
    killSwitch: {
      enabled: true,
      triggers: {
        requestRate: 10000, // requests per minute
        errorRate: 0.5, // 50% error rate
        cpuUsage: 0.9, // 90% CPU
        memoryUsage: 0.9 // 90% memory
      },
      actions: {
        blockAllRequests: false,
        blockNewRegistrations: true,
        blockUploads: true,
        enableReadOnly: true
      }
    },
    contacts: {
      security: process.env.SECURITY_EMAIL || 'security@sayu.co.kr',
      emergency: process.env.EMERGENCY_PHONE || '+82-10-0000-0000'
    }
  }
};