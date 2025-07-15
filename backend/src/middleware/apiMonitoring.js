const { log } = require('../config/logger');
const { redisClient } = require('../config/redis');

/**
 * API Monitoring and Performance Tracking Middleware
 * Tracks API usage, performance metrics, and error rates
 */

class APIMonitor {
  constructor() {
    this.metrics = new Map();
    this.errorCounts = new Map();
    this.performanceData = new Map();
    
    // Cleanup old metrics every 5 minutes
    setInterval(() => this.cleanupMetrics(), 5 * 60 * 1000);
  }

  // Track API request metrics
  trackRequest(req, res, responseTime) {
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    const statusCode = res.statusCode;
    const timestamp = new Date().toISOString();
    
    // Track basic metrics
    const key = `${endpoint}:${statusCode}`;
    const current = this.metrics.get(key) || { count: 0, totalTime: 0 };
    
    this.metrics.set(key, {
      count: current.count + 1,
      totalTime: current.totalTime + responseTime,
      avgTime: (current.totalTime + responseTime) / (current.count + 1),
      lastRequest: timestamp
    });

    // Track errors separately
    if (statusCode >= 400) {
      const errorKey = `${endpoint}:error`;
      const errorCount = this.errorCounts.get(errorKey) || 0;
      this.errorCounts.set(errorKey, errorCount + 1);
    }

    // Track performance data
    this.performanceData.set(`${endpoint}:latest`, {
      responseTime,
      statusCode,
      timestamp,
      userId: req.userId || null,
      userAgent: req.headers['user-agent']
    });

    // Log slow requests
    if (responseTime > 1000) {
      log.warn('Slow API request detected', {
        endpoint,
        responseTime,
        statusCode,
        userId: req.userId,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    // Log error requests
    if (statusCode >= 500) {
      log.error('Server error in API request', {
        endpoint,
        statusCode,
        responseTime,
        userId: req.userId,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
    }
  }

  // Get API statistics
  getStats() {
    const stats = {
      totalRequests: 0,
      totalErrors: 0,
      averageResponseTime: 0,
      endpoints: {},
      errorRates: {},
      slowRequests: []
    };

    let totalResponseTime = 0;
    let totalRequests = 0;

    // Process metrics
    for (const [key, data] of this.metrics) {
      const [endpoint, statusCode] = key.split(':');
      
      if (!stats.endpoints[endpoint]) {
        stats.endpoints[endpoint] = {
          totalRequests: 0,
          totalErrors: 0,
          averageResponseTime: 0,
          statusCodes: {}
        };
      }

      stats.endpoints[endpoint].totalRequests += data.count;
      stats.endpoints[endpoint].statusCodes[statusCode] = data.count;
      stats.endpoints[endpoint].averageResponseTime = 
        (stats.endpoints[endpoint].averageResponseTime + data.avgTime) / 2;

      totalRequests += data.count;
      totalResponseTime += data.totalTime;

      if (parseInt(statusCode) >= 400) {
        stats.endpoints[endpoint].totalErrors += data.count;
        stats.totalErrors += data.count;
      }
    }

    // Calculate overall averages
    stats.totalRequests = totalRequests;
    stats.averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;

    // Calculate error rates
    for (const [endpoint, data] of Object.entries(stats.endpoints)) {
      stats.errorRates[endpoint] = data.totalRequests > 0 
        ? (data.totalErrors / data.totalRequests) * 100 
        : 0;
    }

    // Get slow requests
    for (const [key, data] of this.performanceData) {
      if (data.responseTime > 1000) {
        stats.slowRequests.push({
          endpoint: key.replace(':latest', ''),
          responseTime: data.responseTime,
          timestamp: data.timestamp
        });
      }
    }

    return stats;
  }

  // Clean up old metrics
  cleanupMetrics() {
    const cutoff = Date.now() - (60 * 60 * 1000); // 1 hour ago
    
    for (const [key, data] of this.performanceData) {
      if (new Date(data.timestamp).getTime() < cutoff) {
        this.performanceData.delete(key);
      }
    }
  }

  // Get health check data
  getHealthData() {
    const stats = this.getStats();
    const now = Date.now();
    
    return {
      status: this.determineHealthStatus(stats),
      timestamp: new Date().toISOString(),
      metrics: {
        totalRequests: stats.totalRequests,
        totalErrors: stats.totalErrors,
        averageResponseTime: Math.round(stats.averageResponseTime),
        errorRate: stats.totalRequests > 0 ? 
          (stats.totalErrors / stats.totalRequests) * 100 : 0
      },
      alerts: this.generateAlerts(stats)
    };
  }

  // Determine overall health status
  determineHealthStatus(stats) {
    const errorRate = stats.totalRequests > 0 ? 
      (stats.totalErrors / stats.totalRequests) * 100 : 0;
    
    if (errorRate > 10 || stats.averageResponseTime > 2000) {
      return 'critical';
    } else if (errorRate > 5 || stats.averageResponseTime > 1000) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  // Generate alerts based on metrics
  generateAlerts(stats) {
    const alerts = [];
    
    // Error rate alerts
    const errorRate = stats.totalRequests > 0 ? 
      (stats.totalErrors / stats.totalRequests) * 100 : 0;
    
    if (errorRate > 10) {
      alerts.push({
        type: 'error_rate',
        level: 'critical',
        message: `High error rate: ${errorRate.toFixed(2)}%`,
        threshold: '10%'
      });
    } else if (errorRate > 5) {
      alerts.push({
        type: 'error_rate',
        level: 'warning',
        message: `Elevated error rate: ${errorRate.toFixed(2)}%`,
        threshold: '5%'
      });
    }

    // Response time alerts
    if (stats.averageResponseTime > 2000) {
      alerts.push({
        type: 'response_time',
        level: 'critical',
        message: `Very slow response time: ${stats.averageResponseTime.toFixed(0)}ms`,
        threshold: '2000ms'
      });
    } else if (stats.averageResponseTime > 1000) {
      alerts.push({
        type: 'response_time',
        level: 'warning',
        message: `Slow response time: ${stats.averageResponseTime.toFixed(0)}ms`,
        threshold: '1000ms'
      });
    }

    // Endpoint-specific alerts
    for (const [endpoint, data] of Object.entries(stats.endpoints)) {
      const endpointErrorRate = data.totalRequests > 0 ? 
        (data.totalErrors / data.totalRequests) * 100 : 0;
      
      if (endpointErrorRate > 20) {
        alerts.push({
          type: 'endpoint_error',
          level: 'critical',
          message: `High error rate on ${endpoint}: ${endpointErrorRate.toFixed(2)}%`,
          endpoint,
          threshold: '20%'
        });
      }
    }

    return alerts;
  }
}

// Global monitor instance
const apiMonitor = new APIMonitor();

// Performance tracking middleware
const performanceTracker = (req, res, next) => {
  const startTime = Date.now();
  
  // Track request start
  req.startTime = startTime;
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Track the request
    apiMonitor.trackRequest(req, res, responseTime);
    
    // Call original end
    originalEnd.call(res, chunk, encoding);
  };
  
  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  log.info('API Request', {
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    userId: req.userId || null,
    timestamp: new Date().toISOString()
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    log.info('API Response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      userId: req.userId || null,
      timestamp: new Date().toISOString()
    });
    
    originalEnd.call(res, chunk, encoding);
  };
  
  next();
};

// Usage analytics middleware
const usageAnalytics = (req, res, next) => {
  // Track API usage patterns
  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  const timestamp = new Date().toISOString();
  
  // Store usage data in Redis if available
  if (redisClient) {
    const usageKey = `api_usage:${endpoint}:${new Date().toISOString().slice(0, 10)}`;
    redisClient().incr(usageKey).catch(err => {
      log.warn('Failed to track API usage', { error: err.message });
    });
  }
  
  next();
};

// Metrics endpoint handler
const getMetrics = (req, res) => {
  try {
    const stats = apiMonitor.getStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log.error('Failed to get API metrics', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics'
    });
  }
};

// Health check endpoint handler
const getHealthCheck = (req, res) => {
  try {
    const health = apiMonitor.getHealthData();
    const statusCode = health.status === 'critical' ? 503 : 200;
    
    res.status(statusCode).json({
      success: true,
      data: health
    });
  } catch (error) {
    log.error('Failed to get health check', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve health status'
    });
  }
};

module.exports = {
  apiMonitor,
  performanceTracker,
  requestLogger,
  usageAnalytics,
  getMetrics,
  getHealthCheck
};