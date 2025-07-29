const validator = require('validator');
let redisClient = null;
try {
  const redisModule = require('../config/redis');
  redisClient = redisModule.getRedisClient || redisModule.redisClient;
} catch (error) {
  // Redis is optional
}

class SecurityAuditService {
  constructor() {
    this.suspiciousPatterns = [
      // SQL Injection patterns
      /(\b(union|select|insert|delete|drop|create|alter|exec|execute)\b)/i,
      /(--|\/\*|\*\/|;|'|")/,

      // XSS patterns
      /<script[^>]*>[\s\S]*?<\/script[^>]*>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe\b[^>]*>/i,

      // Path traversal
      /(\.\.[\/\\]){2,}/,
      /(\/|\\)\.\.(\/|\\)/,

      // Command injection
      /[;&|`$(){}[\]]/,
      /\b(wget|curl|nc|netcat|bash|sh|cmd|powershell)\b/i,

      // LDAP injection
      /[*()\\]/,

      // NoSQL injection
      /\$where|\$ne|\$gt|\$lt/i
    ];

    this.rateLimitViolations = new Map();
    this.ipWhitelist = new Set(['127.0.0.1', '::1']); // Add trusted IPs
    this.ipBlacklist = new Set(); // Blocked IPs
  }

  // Main security audit middleware
  auditRequest = async (req, res, next) => {
    const auditData = {
      timestamp: Date.now(),
      ip: this.getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      method: req.method,
      url: req.url,
      headers: this.sanitizeHeaders(req.headers),
      userId: req.userId || null,
      userRole: req.userRole || 'anonymous'
    };

    try {
      // Check IP blacklist
      if (this.ipBlacklist.has(auditData.ip)) {
        return this.blockRequest(res, 'IP_BLACKLISTED', auditData);
      }

      // Validate request size
      const contentLength = parseInt(req.headers['content-length'] || '0');
      if (contentLength > 50 * 1024 * 1024) { // 50MB limit
        return this.blockRequest(res, 'REQUEST_TOO_LARGE', auditData);
      }

      // Check for suspicious patterns in URL
      if (this.containsSuspiciousPattern(req.url)) {
        await this.logSecurityEvent('SUSPICIOUS_URL', auditData);
        return this.blockRequest(res, 'SUSPICIOUS_REQUEST', auditData);
      }

      // Check request body for suspicious content
      if (req.body && this.checkSuspiciousContent(req.body)) {
        await this.logSecurityEvent('SUSPICIOUS_PAYLOAD', auditData);
        return this.blockRequest(res, 'SUSPICIOUS_REQUEST', auditData);
      }

      // Rate limiting per IP
      const rateLimit = await this.checkRateLimit(auditData.ip, req.url);
      if (rateLimit.exceeded) {
        return this.blockRequest(res, 'RATE_LIMIT_EXCEEDED', auditData);
      }

      // Check for bot behavior
      const botScore = this.calculateBotScore(req);
      if (botScore > 0.8) {
        await this.logSecurityEvent('POTENTIAL_BOT', { ...auditData, botScore });
      }

      // Log normal request (for analytics)
      await this.logRequest(auditData);

      // Add security headers to response
      this.addSecurityHeaders(res);

      next();
    } catch (error) {
      console.error('Security audit error:', error);
      // Don't block on audit errors, but log them
      await this.logSecurityEvent('AUDIT_ERROR', { ...auditData, error: error.message });
      next();
    }
  };

  // Check for suspicious patterns in content
  containsSuspiciousPattern(content) {
    if (typeof content !== 'string') return false;
    return this.suspiciousPatterns.some(pattern => pattern.test(content));
  }

  // Recursively check object for suspicious content
  checkSuspiciousContent(obj, depth = 0) {
    if (depth > 10) return false; // Prevent deep recursion

    if (typeof obj === 'string') {
      return this.containsSuspiciousPattern(obj);
    }

    if (Array.isArray(obj)) {
      return obj.some(item => this.checkSuspiciousContent(item, depth + 1));
    }

    if (obj && typeof obj === 'object') {
      return Object.values(obj).some(value =>
        this.checkSuspiciousContent(value, depth + 1)
      );
    }

    return false;
  }

  // Rate limiting check
  async checkRateLimit(ip, endpoint) {
    const limit = this.getRateLimitForEndpoint(endpoint);

    if (!redisClient || typeof redisClient !== 'function') {
      return { exceeded: false, current: 0, limit, resetTime: Date.now() + 60000 };
    }

    try {
      const redis = redisClient();
      if (!redis) {
        return { exceeded: false, current: 0, limit, resetTime: Date.now() + 60000 };
      }

      const key = `rate_limit:${ip}:${endpoint}`;
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, 60); // 1 minute window
      }

      return {
        exceeded: current > limit,
        current,
        limit,
        resetTime: Date.now() + 60000
      };
    } catch (error) {
      return { exceeded: false, current: 0, limit, resetTime: Date.now() + 60000 };
    }
  }

  // Get rate limit based on endpoint
  getRateLimitForEndpoint(endpoint) {
    const limits = {
      '/api/auth/login': 5,
      '/api/auth/register': 3,
      '/api/auth/refresh': 10,
      '/api/agent/chat': 20,
      '/api/quiz/complete': 5,
      default: 60
    };

    for (const [path, limit] of Object.entries(limits)) {
      if (endpoint.includes(path)) {
        return limit;
      }
    }

    return limits.default;
  }

  // Calculate bot probability score
  calculateBotScore(req) {
    let score = 0;
    const userAgent = req.headers['user-agent'] || '';

    // Check for bot user agents
    const botUserAgents = [
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
      'python-requests', 'http', 'java', 'go-http-client'
    ];

    if (botUserAgents.some(bot => userAgent.toLowerCase().includes(bot))) {
      score += 0.5;
    }

    // Check for missing common headers
    const commonHeaders = ['accept', 'accept-language', 'accept-encoding'];
    const missingHeaders = commonHeaders.filter(header => !req.headers[header]);
    score += missingHeaders.length * 0.2;

    // Check for rapid sequential requests (would need to implement timing)
    // This is a simplified version
    if (!req.headers.referer && req.method === 'POST') {
      score += 0.3;
    }

    return Math.min(score, 1);
  }

  // Block malicious requests
  blockRequest(res, reason, auditData) {
    this.logSecurityEvent('REQUEST_BLOCKED', { ...auditData, reason });

    return res.status(403).json({
      error: 'Request blocked for security reasons',
      code: reason,
      timestamp: new Date().toISOString()
    });
  }

  // Add security headers to response
  addSecurityHeaders(res) {
    res.setHeader('X-Security-Audit', 'enabled');
    res.setHeader('X-Request-ID', require('crypto').randomUUID());
  }

  // Log security events
  async logSecurityEvent(eventType, data) {
    const logEntry = {
      eventType,
      timestamp: Date.now(),
      ...data
    };

    // Store in Redis for real-time monitoring (if available)
    if (redisClient && typeof redisClient === 'function') {
      try {
        const redis = redisClient();
        if (redis) {
          const key = `security_events:${eventType}:${Date.now()}`;
          await redis.setEx(key, 86400, JSON.stringify(logEntry)); // 24 hour retention

          // Also maintain a rolling count of events by type
          const countKey = `security_count:${eventType}:${Math.floor(Date.now() / 3600000)}`; // Hourly buckets
          await redis.incr(countKey);
          await redis.expire(countKey, 86400);
        }
      } catch (error) {
        // Continue without Redis
      }
    }

    console.log(`Security Event [${eventType}]:`, logEntry);
  }

  // Log normal requests for analytics
  async logRequest(auditData) {
    // Only log to Redis if it's an important endpoint
    const importantEndpoints = ['/api/auth/', '/api/quiz/', '/api/agent/'];

    if (importantEndpoints.some(endpoint => auditData.url.includes(endpoint))) {
      if (redisClient && typeof redisClient === 'function') {
        try {
          const redis = redisClient();
          if (redis) {
            const key = `request_log:${auditData.timestamp}`;
            await redis.setEx(key, 3600, JSON.stringify(auditData)); // 1 hour retention
          }
        } catch (error) {
          // Continue without Redis
        }
      }
    }
  }

  // Utility methods
  getClientIP(req) {
    return req.headers['x-forwarded-for'] ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           req.ip ||
           'unknown';
  }

  sanitizeHeaders(headers) {
    const sensitive = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = {};

    for (const [key, value] of Object.entries(headers)) {
      if (sensitive.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Admin methods for managing security
  async getSecurityStats() {
    const stats = {};
    const eventTypes = ['SUSPICIOUS_URL', 'SUSPICIOUS_PAYLOAD', 'REQUEST_BLOCKED', 'POTENTIAL_BOT'];

    if (redisClient && typeof redisClient === 'function') {
      try {
        const redis = redisClient();
        if (redis) {
          for (const eventType of eventTypes) {
            const pattern = `security_count:${eventType}:*`;
            const keys = await redis.keys(pattern);
            let total = 0;

            for (const key of keys) {
              const count = await redis.get(key);
              total += parseInt(count || 0);
            }

            stats[eventType] = total;
          }
        }
      } catch (error) {
        // Return empty stats if Redis is not available
      }
    }

    return stats;
  }

  async addToBlacklist(ip, reason = 'Manual block') {
    if (validator.isIP(ip)) {
      this.ipBlacklist.add(ip);
      if (redisClient && typeof redisClient === 'function') {
        try {
          const redis = redisClient();
          if (redis) {
            await redis.setEx(`blacklist:${ip}`, 86400 * 7, reason); // 7 days
          }
        } catch (error) {
          // Continue without Redis
        }
      }
      await this.logSecurityEvent('IP_BLACKLISTED', { ip, reason });
      return true;
    }
    return false;
  }

  async removeFromBlacklist(ip) {
    this.ipBlacklist.delete(ip);
    if (redisClient && typeof redisClient === 'function') {
      try {
        const redis = redisClient();
        if (redis) {
          await redis.del(`blacklist:${ip}`);
        }
      } catch (error) {
        // Continue without Redis
      }
    }
    await this.logSecurityEvent('IP_UNBLACKLISTED', { ip });
    return true;
  }

  async getRecentSecurityEvents(limit = 100) {
    const events = [];

    if (redisClient && typeof redisClient === 'function') {
      try {
        const redis = redisClient();
        if (redis) {
          const pattern = 'security_events:*';
          const keys = await redis.keys(pattern);

          // Sort keys by timestamp (newest first)
          keys.sort().reverse();

          for (const key of keys.slice(0, limit)) {
            const event = await redis.get(key);
            if (event) {
              events.push(JSON.parse(event));
            }
          }
        }
      } catch (error) {
        // Return empty events if Redis is not available
      }
    }

    return events;
  }
}

const securityAudit = new SecurityAuditService();

module.exports = {
  securityAudit: securityAudit.auditRequest,
  SecurityAuditService: securityAudit
};
