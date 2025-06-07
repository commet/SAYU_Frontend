const nodemailer = require('nodemailer');
const { log } = require('../config/logger');
const { redisClient } = require('../config/redis');
const { captureException } = require('../config/sentry');

class AlertingService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmailTransporter();
    
    // Alert thresholds
    this.thresholds = {
      errorRate: 0.05, // 5% error rate
      responseTime: 5000, // 5 seconds
      memoryUsage: 0.85, // 85% memory usage
      cpuUsage: 0.80, // 80% CPU usage
      diskUsage: 0.90, // 90% disk usage
      redisConnections: 100, // Max Redis connections
      dbConnections: 20 // Max DB connections
    };
    
    // Alert cooldown periods (in seconds)
    this.cooldowns = {
      critical: 300, // 5 minutes
      warning: 900, // 15 minutes
      info: 1800 // 30 minutes
    };
  }

  async initializeEmailTransporter() {
    if (!process.env.ALERT_EMAIL_HOST) {
      console.warn('Email alerting not configured - missing ALERT_EMAIL_HOST');
      return;
    }

    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.ALERT_EMAIL_HOST,
      port: process.env.ALERT_EMAIL_PORT || 587,
      secure: process.env.ALERT_EMAIL_SECURE === 'true',
      auth: {
        user: process.env.ALERT_EMAIL_USER,
        pass: process.env.ALERT_EMAIL_PASS
      }
    });

    console.info('Email alerting initialized');
  }

  // Main alert method
  async sendAlert(level, title, message, metadata = {}) {
    try {
      const alertKey = `alert:${level}:${this.hashString(title)}`;
      
      // Check cooldown
      if (await this.isInCooldown(alertKey, level)) {
        console.debug(`Alert skipped due to cooldown: ${title}`);
        return false;
      }

      // Set cooldown
      await this.setCooldown(alertKey, level);

      const alert = {
        level,
        title,
        message,
        metadata,
        timestamp: new Date().toISOString(),
        server: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      };

      // Send via multiple channels
      await Promise.all([
        this.sendEmailAlert(alert),
        this.logAlert(alert),
        this.sendSentryAlert(alert)
      ]);

      return true;
    } catch (error) {
      console.error('Failed to send alert', { error: error.message, title });
      return false;
    }
  }

  // Performance monitoring alerts
  async checkPerformanceMetrics() {
    try {
      const metrics = await this.gatherMetrics();
      
      // Check error rate
      if (metrics.errorRate > this.thresholds.errorRate) {
        await this.sendAlert(
          'critical',
          'High Error Rate Detected',
          `Error rate is ${(metrics.errorRate * 100).toFixed(2)}% (threshold: ${this.thresholds.errorRate * 100}%)`,
          { errorRate: metrics.errorRate, threshold: this.thresholds.errorRate }
        );
      }

      // Check response time
      if (metrics.avgResponseTime > this.thresholds.responseTime) {
        await this.sendAlert(
          'warning',
          'High Response Time',
          `Average response time is ${metrics.avgResponseTime}ms (threshold: ${this.thresholds.responseTime}ms)`,
          { responseTime: metrics.avgResponseTime, threshold: this.thresholds.responseTime }
        );
      }

      // Check memory usage
      if (metrics.memoryUsage > this.thresholds.memoryUsage) {
        await this.sendAlert(
          'critical',
          'High Memory Usage',
          `Memory usage is ${(metrics.memoryUsage * 100).toFixed(2)}% (threshold: ${this.thresholds.memoryUsage * 100}%)`,
          { memoryUsage: metrics.memoryUsage, threshold: this.thresholds.memoryUsage }
        );
      }

      // Check Redis connection count
      if (metrics.redisConnections > this.thresholds.redisConnections) {
        await this.sendAlert(
          'warning',
          'High Redis Connection Count',
          `Redis connections: ${metrics.redisConnections} (threshold: ${this.thresholds.redisConnections})`,
          { connections: metrics.redisConnections, threshold: this.thresholds.redisConnections }
        );
      }

    } catch (error) {
      console.error('Performance monitoring check failed', { error: error.message });
    }
  }

  // Security alerts
  async sendSecurityAlert(type, details) {
    const securityAlerts = {
      'suspicious_login': {
        level: 'warning',
        title: 'Suspicious Login Attempt',
        message: `Suspicious login attempt detected from IP: ${details.ip}`
      },
      'rate_limit_exceeded': {
        level: 'warning',
        title: 'Rate Limit Exceeded',
        message: `Rate limit exceeded for IP: ${details.ip}, endpoint: ${details.endpoint}`
      },
      'malicious_request': {
        level: 'critical',
        title: 'Malicious Request Detected',
        message: `Malicious request pattern detected from IP: ${details.ip}`
      },
      'admin_action': {
        level: 'info',
        title: 'Admin Action Performed',
        message: `Admin action: ${details.action} by user: ${details.userId}`
      }
    };

    const alert = securityAlerts[type];
    if (alert) {
      await this.sendAlert(alert.level, alert.title, alert.message, details);
    }
  }

  // Application alerts
  async sendApplicationAlert(type, error, context = {}) {
    const appAlerts = {
      'database_error': {
        level: 'critical',
        title: 'Database Connection Error',
        message: `Database error: ${error.message}`
      },
      'redis_error': {
        level: 'warning',
        title: 'Redis Connection Error',
        message: `Redis error: ${error.message}`
      },
      'external_api_error': {
        level: 'warning',
        title: 'External API Error',
        message: `External API error: ${error.message}`
      },
      'openai_error': {
        level: 'warning',
        title: 'OpenAI API Error',
        message: `OpenAI API error: ${error.message}`
      }
    };

    const alert = appAlerts[type];
    if (alert) {
      await this.sendAlert(alert.level, alert.title, alert.message, { 
        error: error.message, 
        stack: error.stack,
        ...context 
      });
    }
  }

  // Email alert sender
  async sendEmailAlert(alert) {
    if (!this.emailTransporter || !process.env.ALERT_EMAIL_TO) {
      return false;
    }

    try {
      const subject = `[SAYU ${alert.level.toUpperCase()}] ${alert.title}`;
      const htmlContent = this.generateEmailHTML(alert);

      await this.emailTransporter.sendMail({
        from: process.env.ALERT_EMAIL_FROM || process.env.ALERT_EMAIL_USER,
        to: process.env.ALERT_EMAIL_TO,
        subject,
        html: htmlContent
      });

      return true;
    } catch (error) {
      console.error('Failed to send email alert', { error: error.message });
      return false;
    }
  }

  // Generate HTML email content
  generateEmailHTML(alert) {
    const levelColors = {
      critical: '#dc2626',
      warning: '#d97706',
      info: '#2563eb'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .alert-container { max-width: 600px; margin: 0 auto; }
          .alert-header { 
            background: ${levelColors[alert.level] || '#6b7280'}; 
            color: white; 
            padding: 20px; 
            border-radius: 8px 8px 0 0; 
          }
          .alert-body { 
            background: #f9fafb; 
            padding: 20px; 
            border-radius: 0 0 8px 8px; 
            border: 1px solid #e5e7eb; 
          }
          .metadata { 
            background: #fff; 
            padding: 15px; 
            margin-top: 15px; 
            border-radius: 6px; 
            border-left: 4px solid ${levelColors[alert.level] || '#6b7280'}; 
          }
          .timestamp { color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="alert-container">
          <div class="alert-header">
            <h2>${alert.title}</h2>
            <div class="timestamp">${alert.timestamp}</div>
          </div>
          <div class="alert-body">
            <p>${alert.message}</p>
            
            ${Object.keys(alert.metadata).length > 0 ? `
            <div class="metadata">
              <strong>Details:</strong>
              <ul>
                ${Object.entries(alert.metadata).map(([key, value]) => 
                  `<li><strong>${key}:</strong> ${JSON.stringify(value)}</li>`
                ).join('')}
              </ul>
            </div>
            ` : ''}
            
            <div class="metadata">
              <strong>Server Info:</strong>
              <ul>
                <li><strong>Environment:</strong> ${alert.server}</li>
                <li><strong>Version:</strong> ${alert.version}</li>
                <li><strong>Alert Level:</strong> ${alert.level.toUpperCase()}</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Log alert
  async logAlert(alert) {
    console[alert.level === 'critical' ? 'error' : alert.level](
        `ALERT: ${alert.title}`, 
        { 
          message: alert.message, 
          metadata: alert.metadata,
          alertLevel: alert.level
        });
  }

  // Send to Sentry
  async sendSentryAlert(alert) {
    try {
      if (alert.level === 'critical') {
        captureException(new Error(alert.message), {
          tags: { alertType: 'system', level: alert.level },
          extra: { title: alert.title, metadata: alert.metadata }
        });
      }
    } catch (error) {
      console.error('Failed to send Sentry alert', { error: error.message });
    }
  }

  // Cooldown management
  async isInCooldown(alertKey, level) {
    try {
      const lastSent = await redisClient().get(alertKey);
      if (!lastSent) return false;
      
      const cooldownPeriod = this.cooldowns[level] || this.cooldowns.info;
      const timeSince = (Date.now() - parseInt(lastSent)) / 1000;
      
      return timeSince < cooldownPeriod;
    } catch (error) {
      return false; // If Redis fails, don't block alerts
    }
  }

  async setCooldown(alertKey, level) {
    try {
      const cooldownPeriod = this.cooldowns[level] || this.cooldowns.info;
      await redisClient().setEx(alertKey, cooldownPeriod, Date.now().toString());
    } catch (error) {
      console.error('Failed to set alert cooldown', { error: error.message });
    }
  }

  // Gather system metrics
  async gatherMetrics() {
    const metrics = {
      timestamp: Date.now(),
      errorRate: 0,
      avgResponseTime: 0,
      memoryUsage: 0,
      redisConnections: 0
    };

    try {
      // Get memory usage
      const memUsage = process.memoryUsage();
      metrics.memoryUsage = memUsage.heapUsed / memUsage.heapTotal;

      // Get metrics from Redis if available
      try {
        const errorCount = await redisClient().get('metrics:errors:count') || 0;
        const requestCount = await redisClient().get('metrics:requests:count') || 1;
        const totalResponseTime = await redisClient().get('metrics:response:total') || 0;
        
        metrics.errorRate = parseInt(errorCount) / parseInt(requestCount);
        metrics.avgResponseTime = parseInt(totalResponseTime) / parseInt(requestCount);
      } catch (redisError) {
        // Redis metrics not available
      }

    } catch (error) {
      console.error('Failed to gather metrics', { error: error.message });
    }

    return metrics;
  }

  // Utility method
  hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Health check for alerting system
  async healthCheck() {
    const health = {
      emailTransporter: !!this.emailTransporter,
      redisConnection: false,
      lastCheck: new Date().toISOString()
    };

    try {
      await redisClient().ping();
      health.redisConnection = true;
    } catch (error) {
      health.redisConnection = false;
    }

    return health;
  }
}

module.exports = new AlertingService();