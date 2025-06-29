#!/usr/bin/env node

/**
 * SAYU Monitoring & Alerting Setup Script
 * Sets up performance monitoring, error tracking, and alerting system
 */

const cron = require('node-cron');
const { log } = require('../config/logger');
const alertingService = require('../services/alertingService');
const { redisClient } = require('../config/redis');

class MonitoringSetup {
  constructor() {
    this.isRunning = false;
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTimeTotal: 0,
      lastReset: Date.now()
    };
  }

  async initialize() {
    try {
      log('info', 'Initializing SAYU monitoring system...');

      // Initialize components
      await this.setupMetricsCollection();
      await this.setupPerformanceMonitoring();
      await this.setupHealthChecks();
      await this.setupAlertingSchedules();

      this.isRunning = true;
      log('info', '✅ SAYU monitoring system initialized successfully');

      // Send startup notification
      await alertingService.sendAlert(
        'info',
        'SAYU Monitoring System Started',
        `Monitoring system has been initialized successfully on ${process.env.NODE_ENV || 'development'} environment`,
        {
          version: process.env.npm_package_version || '1.0.0',
          nodeVersion: process.version,
          startTime: new Date().toISOString()
        }
      );

    } catch (error) {
      log('error', 'Failed to initialize monitoring system', { error: error.message });
      throw error;
    }
  }

  // Setup metrics collection
  async setupMetricsCollection() {
    try {
      // Initialize Redis metrics keys
      await redisClient().set('metrics:requests:count', '0');
      await redisClient().set('metrics:errors:count', '0');
      await redisClient().set('metrics:response:total', '0');
      await redisClient().set('metrics:uptime:start', Date.now().toString());

      log('info', 'Metrics collection initialized');
    } catch (error) {
      log('error', 'Failed to setup metrics collection', { error: error.message });
    }
  }

  // Setup performance monitoring schedules
  async setupPerformanceMonitoring() {
    // Performance check every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      if (!this.isRunning) return;
      
      try {
        await alertingService.checkPerformanceMetrics();
        log('debug', 'Performance metrics check completed');
      } catch (error) {
        log('error', 'Performance monitoring failed', { error: error.message });
      }
    });

    // Metrics reset every hour
    cron.schedule('0 * * * *', async () => {
      await this.resetHourlyMetrics();
    });

    log('info', 'Performance monitoring schedules configured');
  }

  // Setup health checks
  async setupHealthChecks() {
    // Health check every minute
    cron.schedule('* * * * *', async () => {
      if (!this.isRunning) return;
      
      try {
        await this.performHealthCheck();
      } catch (error) {
        log('error', 'Health check failed', { error: error.message });
      }
    });

    log('info', 'Health check monitoring configured');
  }

  // Setup alerting schedules
  async setupAlertingSchedules() {
    // Daily system health report
    cron.schedule('0 9 * * *', async () => {
      if (!this.isRunning) return;
      
      try {
        await this.sendDailyHealthReport();
      } catch (error) {
        log('error', 'Failed to send daily health report', { error: error.message });
      }
    });

    // Weekly metrics summary
    cron.schedule('0 9 * * 1', async () => {
      if (!this.isRunning) return;
      
      try {
        await this.sendWeeklyMetricsSummary();
      } catch (error) {
        log('error', 'Failed to send weekly metrics summary', { error: error.message });
      }
    });

    log('info', 'Alerting schedules configured');
  }

  // Perform comprehensive health check
  async performHealthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {}
    };

    try {
      // Check Redis connectivity
      health.checks.redis = await this.checkRedis();
      
      // Check alerting system
      health.checks.alerting = await alertingService.healthCheck();
      
      // Check memory usage
      health.checks.memory = this.checkMemoryUsage();
      
      // Check disk space (basic)
      health.checks.disk = this.checkDiskUsage();

      // Determine overall health status
      const failedChecks = Object.values(health.checks).filter(check => !check.healthy);
      if (failedChecks.length > 0) {
        health.status = failedChecks.length === Object.keys(health.checks).length ? 'critical' : 'degraded';
        
        // Send alert for failed health checks
        await alertingService.sendAlert(
          health.status === 'critical' ? 'critical' : 'warning',
          'Health Check Failed',
          `System health check failed: ${failedChecks.length} checks failed`,
          { health, failedChecks: failedChecks.length }
        );
      }

      // Store health status in Redis
      await redisClient().setEx('system:health', 300, JSON.stringify(health));

    } catch (error) {
      log('error', 'Health check execution failed', { error: error.message });
      health.status = 'critical';
      health.error = error.message;
    }

    return health;
  }

  // Check Redis connectivity
  async checkRedis() {
    try {
      await redisClient().ping();
      return { healthy: true, responseTime: Date.now() };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }

  // Check memory usage
  checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal;
    const usedMemory = memUsage.heapUsed;
    const memoryPercent = usedMemory / totalMemory;

    return {
      healthy: memoryPercent < 0.85,
      usedMemory,
      totalMemory,
      percentage: memoryPercent,
      rss: memUsage.rss,
      external: memUsage.external
    };
  }

  // Basic disk usage check
  checkDiskUsage() {
    // This is a basic implementation - in production, you'd want more sophisticated disk monitoring
    return {
      healthy: true,
      note: 'Disk monitoring requires additional setup for comprehensive checks'
    };
  }

  // Send daily health report
  async sendDailyHealthReport() {
    try {
      const health = await this.performHealthCheck();
      const metrics = await this.getDailyMetrics();

      await alertingService.sendAlert(
        'info',
        'Daily System Health Report',
        `Daily health report for SAYU platform`,
        {
          health,
          metrics,
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development'
        }
      );

      log('info', 'Daily health report sent successfully');
    } catch (error) {
      log('error', 'Failed to send daily health report', { error: error.message });
    }
  }

  // Send weekly metrics summary
  async sendWeeklyMetricsSummary() {
    try {
      const weeklyMetrics = await this.getWeeklyMetrics();

      await alertingService.sendAlert(
        'info',
        'Weekly Metrics Summary',
        `Weekly performance summary for SAYU platform`,
        weeklyMetrics
      );

      log('info', 'Weekly metrics summary sent successfully');
    } catch (error) {
      log('error', 'Failed to send weekly metrics summary', { error: error.message });
    }
  }

  // Get daily metrics
  async getDailyMetrics() {
    try {
      const requests = await redisClient().get('metrics:requests:count') || 0;
      const errors = await redisClient().get('metrics:errors:count') || 0;
      const responseTotal = await redisClient().get('metrics:response:total') || 0;

      return {
        requests: parseInt(requests),
        errors: parseInt(errors),
        errorRate: parseInt(requests) > 0 ? parseInt(errors) / parseInt(requests) : 0,
        avgResponseTime: parseInt(requests) > 0 ? parseInt(responseTotal) / parseInt(requests) : 0,
        uptime: process.uptime()
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Get weekly metrics (placeholder for more sophisticated metrics)
  async getWeeklyMetrics() {
    const dailyMetrics = await this.getDailyMetrics();
    
    return {
      period: 'week',
      ...dailyMetrics,
      note: 'Weekly aggregation requires historical data storage for comprehensive reporting'
    };
  }

  // Reset hourly metrics
  async resetHourlyMetrics() {
    try {
      await redisClient().set('metrics:requests:count', '0');
      await redisClient().set('metrics:errors:count', '0');
      await redisClient().set('metrics:response:total', '0');
      
      log('debug', 'Hourly metrics reset completed');
    } catch (error) {
      log('error', 'Failed to reset hourly metrics', { error: error.message });
    }
  }

  // Increment request counter
  async incrementRequest(responseTime = 0) {
    try {
      await redisClient().incr('metrics:requests:count');
      if (responseTime > 0) {
        await redisClient().incrBy('metrics:response:total', responseTime);
      }
    } catch (error) {
      // Don't log this as it would be too noisy
    }
  }

  // Increment error counter
  async incrementError() {
    try {
      await redisClient().incr('metrics:errors:count');
    } catch (error) {
      // Don't log this as it would be too noisy
    }
  }

  // Graceful shutdown
  async shutdown() {
    log('info', 'Shutting down monitoring system...');
    this.isRunning = false;
    
    await alertingService.sendAlert(
      'info',
      'SAYU Monitoring System Stopped',
      `Monitoring system has been shut down on ${process.env.NODE_ENV || 'development'} environment`,
      {
        shutdownTime: new Date().toISOString(),
        uptime: process.uptime()
      }
    );
    
    log('info', 'Monitoring system shutdown complete');
  }
}

// Export singleton instance
const monitoringSetup = new MonitoringSetup();

// Auto-initialize if this script is run directly
if (require.main === module) {
  monitoringSetup.initialize()
    .then(() => {
      console.log('✅ SAYU monitoring system started successfully');
      
      // Keep the process alive
      process.on('SIGINT', async () => {
        console.log('\\n🛑 Received SIGINT, shutting down gracefully...');
        await monitoringSetup.shutdown();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        console.log('\\n🛑 Received SIGTERM, shutting down gracefully...');
        await monitoringSetup.shutdown();
        process.exit(0);
      });
    })
    .catch((error) => {
      console.error('❌ Failed to start monitoring system:', error.message);
      process.exit(1);
    });
}

module.exports = monitoringSetup;