#!/usr/bin/env node
/**
 * SAYU Exhibition Data Monitoring System
 * 
 * Real-time monitoring of exhibition data collection with automated alerts
 * and health checks for all data sources.
 */

require('dotenv').config();
const { Pool } = require('pg');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class ExhibitionMonitoringSystem {
  constructor() {
    this.monitoringConfig = {
      // Check intervals (in milliseconds)
      healthCheckInterval: 5 * 60 * 1000,    // 5 minutes
      dataFreshnessCheck: 15 * 60 * 1000,    // 15 minutes
      alertCheckInterval: 60 * 60 * 1000,     // 1 hour
      
      // Thresholds for alerts
      thresholds: {
        dataFreshness: 24 * 60 * 60 * 1000,  // 24 hours
        minimumDailyExhibitions: 50,          // Minimum new exhibitions per day
        errorRateThreshold: 10,               // Percentage
        duplicateRateThreshold: 5,            // Percentage
        apiResponseTime: 30000,               // 30 seconds
        databaseQueryTime: 5000               // 5 seconds
      },
      
      // Data sources to monitor
      sources: [
        {
          name: 'Culture Portal API',
          key: 'culture_portal',
          type: 'api',
          endpoint: 'https://www.culture.go.kr/openapi/rest/publicperformancedisplays/period',
          requiresApiKey: true,
          expectedFrequency: 'daily',
          priority: 'high'
        },
        {
          name: 'Seoul Open Data',
          key: 'seoul_open_data',
          type: 'api',
          endpoint: 'http://openapi.seoul.go.kr:8088/API_KEY/json/SebcExhibitInfo/1/1/',
          requiresApiKey: true,
          expectedFrequency: 'daily',
          priority: 'high'
        },
        {
          name: 'Naver API',
          key: 'naver_api',
          type: 'api',
          endpoint: 'https://openapi.naver.com/v1/search/blog.json',
          requiresApiKey: true,
          expectedFrequency: 'daily',
          priority: 'medium'
        },
        {
          name: 'MMCA Website',
          key: 'mmca_crawler',
          type: 'crawler',
          endpoint: 'https://www.mmca.go.kr',
          requiresApiKey: false,
          expectedFrequency: 'daily',
          priority: 'medium'
        },
        {
          name: 'SEMA Website',
          key: 'sema_crawler',
          type: 'crawler',
          endpoint: 'https://sema.seoul.go.kr',
          requiresApiKey: false,
          expectedFrequency: 'daily',
          priority: 'medium'
        }
      ]
    };
    
    this.alerts = {
      active: [],
      history: [],
      suppressedUntil: {}
    };
    
    this.isRunning = false;
    this.intervals = {};
  }

  /**
   * Start the monitoring system
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Monitoring system is already running');
      return;
    }

    console.log('🔍 Starting SAYU Exhibition Data Monitoring System\n');
    
    // Initial health check
    await this.runFullHealthCheck();
    
    // Set up monitoring intervals
    this.intervals.healthCheck = setInterval(
      () => this.runHealthCheck(),
      this.monitoringConfig.healthCheckInterval
    );
    
    this.intervals.dataFreshness = setInterval(
      () => this.checkDataFreshness(),
      this.monitoringConfig.dataFreshnessCheck
    );
    
    this.intervals.alerts = setInterval(
      () => this.processAlerts(),
      this.monitoringConfig.alertCheckInterval
    );
    
    this.isRunning = true;
    
    console.log('✅ Monitoring system started successfully');
    console.log(`   Health checks every ${this.monitoringConfig.healthCheckInterval / 60000} minutes`);
    console.log(`   Data freshness checks every ${this.monitoringConfig.dataFreshnessCheck / 60000} minutes`);
    console.log(`   Alert processing every ${this.monitoringConfig.alertCheckInterval / 60000} minutes`);
  }

  /**
   * Stop the monitoring system
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Monitoring system is not running');
      return;
    }

    console.log('⏹️  Stopping monitoring system...');
    
    Object.values(this.intervals).forEach(interval => {
      clearInterval(interval);
    });
    
    this.isRunning = false;
    console.log('✅ Monitoring system stopped');
  }

  /**
   * Run comprehensive health check
   */
  async runFullHealthCheck() {
    console.log('🏥 Running full health check...\n');
    
    const results = {
      timestamp: new Date(),
      database: await this.checkDatabaseHealth(),
      sources: {},
      dataQuality: await this.checkDataQuality(),
      performance: await this.checkPerformance(),
      overall: 'healthy'
    };

    // Check each data source
    for (const source of this.monitoringConfig.sources) {
      console.log(`   Checking ${source.name}...`);
      results.sources[source.key] = await this.checkSourceHealth(source);
    }

    // Determine overall health
    const unhealthySources = Object.values(results.sources)
      .filter(source => source.status !== 'healthy').length;
    
    if (!results.database.healthy || unhealthySources > 2) {
      results.overall = 'critical';
    } else if (unhealthySources > 0 || results.performance.issues > 0) {
      results.overall = 'warning';
    }

    // Generate alerts based on results
    await this.generateAlertsFromHealthCheck(results);
    
    // Save health check results
    await this.saveHealthCheckResults(results);
    
    this.displayHealthCheckSummary(results);
    
    return results;
  }

  /**
   * Quick health check (runs on interval)
   */
  async runHealthCheck() {
    try {
      const results = {
        timestamp: new Date(),
        database: await this.checkDatabaseHealth(),
        criticalSources: await this.checkCriticalSources()
      };

      // Only generate alerts for critical issues
      if (!results.database.healthy) {
        await this.createAlert('database', 'critical', 'Database health check failed', results.database);
      }

      const failedCritical = results.criticalSources.filter(s => s.status === 'failed');
      if (failedCritical.length > 0) {
        await this.createAlert('sources', 'high', `${failedCritical.length} critical sources failing`, failedCritical);
      }

    } catch (error) {
      console.error('❌ Health check failed:', error);
      await this.createAlert('system', 'critical', 'Health check system failure', error.message);
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    const start = Date.now();
    
    try {
      // Basic connection test
      await pool.query('SELECT 1');
      const connectionTime = Date.now() - start;

      // Check table existence and row counts
      const tableCheck = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM exhibitions) as exhibitions_count,
          (SELECT COUNT(*) FROM venues) as venues_count,
          (SELECT COUNT(*) FROM exhibitions WHERE DATE(created_at) = CURRENT_DATE) as today_exhibitions,
          (SELECT COUNT(*) FROM exhibitions WHERE created_at >= NOW() - INTERVAL '7 days') as week_exhibitions
      `);

      const stats = tableCheck.rows[0];

      // Check for recent activity
      const recentActivity = await pool.query(`
        SELECT source, COUNT(*) as count, MAX(created_at) as last_activity
        FROM exhibitions
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY source
      `);

      return {
        healthy: true,
        connectionTime,
        stats: {
          totalExhibitions: parseInt(stats.exhibitions_count),
          totalVenues: parseInt(stats.venues_count),
          todayExhibitions: parseInt(stats.today_exhibitions),
          weekExhibitions: parseInt(stats.week_exhibitions)
        },
        recentActivity: recentActivity.rows,
        lastCheck: new Date()
      };

    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        connectionTime: Date.now() - start,
        lastCheck: new Date()
      };
    }
  }

  /**
   * Check individual source health
   */
  async checkSourceHealth(source) {
    const result = {
      name: source.name,
      type: source.type,
      status: 'unknown',
      lastRun: null,
      lastSuccess: null,
      errorRate: 0,
      responseTime: null,
      issues: []
    };

    try {
      // Check last run from database logs
      const lastRunQuery = await pool.query(`
        SELECT status, created_at, records_collected, error_message
        FROM collection_logs
        WHERE source = $1
        ORDER BY created_at DESC
        LIMIT 10
      `, [source.key]);

      if (lastRunQuery.rows.length > 0) {
        const runs = lastRunQuery.rows;
        result.lastRun = runs[0].created_at;
        
        const successfulRuns = runs.filter(r => r.status === 'success');
        if (successfulRuns.length > 0) {
          result.lastSuccess = successfulRuns[0].created_at;
        }
        
        result.errorRate = ((runs.length - successfulRuns.length) / runs.length) * 100;
      }

      // Check endpoint availability (for APIs)
      if (source.type === 'api' && source.endpoint) {
        const start = Date.now();
        
        try {
          const response = await axios.head(source.endpoint.replace('API_KEY', 'test'), {
            timeout: this.monitoringConfig.thresholds.apiResponseTime,
            validateStatus: (status) => status < 500
          });
          
          result.responseTime = Date.now() - start;
          
          if (response.status >= 400) {
            result.issues.push(`HTTP ${response.status} response`);
          }
        } catch (error) {
          result.issues.push(`Endpoint not accessible: ${error.message}`);
          result.responseTime = Date.now() - start;
        }
      }

      // Determine status
      const now = new Date();
      const timeSinceLastRun = result.lastRun ? (now - new Date(result.lastRun)) : null;
      
      if (timeSinceLastRun && timeSinceLastRun > 2 * 24 * 60 * 60 * 1000) { // 2 days
        result.status = 'stale';
        result.issues.push('No recent activity (>2 days)');
      } else if (result.errorRate > this.monitoringConfig.thresholds.errorRateThreshold) {
        result.status = 'failing';
        result.issues.push(`High error rate: ${result.errorRate.toFixed(1)}%`);
      } else if (result.issues.length > 0) {
        result.status = 'warning';
      } else if (result.lastSuccess) {
        result.status = 'healthy';
      }

    } catch (error) {
      result.status = 'error';
      result.issues.push(`Health check failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Check data freshness
   */
  async checkDataFreshness() {
    try {
      const freshnessQuery = await pool.query(`
        SELECT 
          source,
          COUNT(*) as total_records,
          MAX(created_at) as last_update,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as recent_records,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as week_records
        FROM exhibitions
        GROUP BY source
      `);

      const now = new Date();
      const staleThreshold = new Date(now.getTime() - this.monitoringConfig.thresholds.dataFreshness);

      for (const row of freshnessQuery.rows) {
        const lastUpdate = new Date(row.last_update);
        
        if (lastUpdate < staleThreshold) {
          await this.createAlert(
            'data_freshness',
            'medium',
            `Stale data from ${row.source}`,
            {
              source: row.source,
              lastUpdate: lastUpdate,
              hoursAgo: Math.round((now - lastUpdate) / (1000 * 60 * 60))
            }
          );
        }
      }

      return freshnessQuery.rows;

    } catch (error) {
      console.error('❌ Data freshness check failed:', error);
      await this.createAlert('system', 'medium', 'Data freshness check failed', error.message);
      return [];
    }
  }

  /**
   * Check data quality metrics
   */
  async checkDataQuality() {
    try {
      const qualityQuery = await pool.query(`
        SELECT 
          COUNT(*) as total_exhibitions,
          COUNT(CASE WHEN description IS NULL OR description = '' THEN 1 END) as missing_description,
          COUNT(CASE WHEN official_url IS NULL OR official_url = '' THEN 1 END) as missing_url,
          COUNT(CASE WHEN admission_fee IS NULL THEN 1 END) as missing_admission,
          COUNT(CASE WHEN start_date > end_date THEN 1 END) as invalid_dates,
          COUNT(DISTINCT title || venue_name || start_date) as unique_combinations,
          AVG(CASE WHEN title IS NOT NULL THEN length(title) END) as avg_title_length
        FROM exhibitions
        WHERE created_at >= NOW() - INTERVAL '7 days'
      `);

      const stats = qualityQuery.rows[0];
      const total = parseInt(stats.total_exhibitions);
      
      if (total > 0) {
        const duplicateRate = ((total - parseInt(stats.unique_combinations)) / total) * 100;
        
        if (duplicateRate > this.monitoringConfig.thresholds.duplicateRateThreshold) {
          await this.createAlert(
            'data_quality',
            'medium',
            `High duplicate rate detected`,
            { duplicateRate: duplicateRate.toFixed(1) }
          );
        }
      }

      return {
        totalExhibitions: total,
        missingDescription: parseInt(stats.missing_description),
        missingUrl: parseInt(stats.missing_url),
        missingAdmission: parseInt(stats.missing_admission),
        invalidDates: parseInt(stats.invalid_dates),
        duplicateRate: total > 0 ? ((total - parseInt(stats.unique_combinations)) / total) * 100 : 0,
        avgTitleLength: parseFloat(stats.avg_title_length) || 0
      };

    } catch (error) {
      console.error('❌ Data quality check failed:', error);
      return {
        error: error.message
      };
    }
  }

  /**
   * Check performance metrics
   */
  async checkPerformance() {
    const issues = [];
    
    try {
      // Test database query performance
      const start = Date.now();
      await pool.query(`
        SELECT COUNT(*) FROM exhibitions 
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 month'
      `);
      const queryTime = Date.now() - start;

      if (queryTime > this.monitoringConfig.thresholds.databaseQueryTime) {
        issues.push(`Slow database queries: ${queryTime}ms`);
      }

      // Check database size
      const sizeQuery = await pool.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size,
               pg_database_size(current_database()) as size_bytes
      `);

      const dbSize = parseInt(sizeQuery.rows[0].size_bytes);
      const dbSizeGB = dbSize / (1024 * 1024 * 1024);

      return {
        queryTime,
        databaseSize: sizeQuery.rows[0].size,
        databaseSizeGB: dbSizeGB.toFixed(2),
        issues
      };

    } catch (error) {
      issues.push(`Performance check failed: ${error.message}`);
      return { issues };
    }
  }

  /**
   * Check only critical sources quickly
   */
  async checkCriticalSources() {
    const criticalSources = this.monitoringConfig.sources
      .filter(s => s.priority === 'high');
    
    const results = [];
    
    for (const source of criticalSources) {
      const health = await this.checkSourceHealth(source);
      results.push(health);
    }
    
    return results;
  }

  /**
   * Create and manage alerts
   */
  async createAlert(category, severity, message, details = null) {
    const alertKey = `${category}_${severity}`;
    const suppressUntil = this.alerts.suppressedUntil[alertKey];
    
    // Check if this alert is currently suppressed
    if (suppressUntil && new Date() < suppressUntil) {
      return;
    }

    const alert = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category,
      severity,
      message,
      details,
      timestamp: new Date(),
      status: 'active'
    };

    this.alerts.active.push(alert);
    this.alerts.history.push(alert);

    // Log to console
    const severityEmoji = {
      'critical': '🚨',
      'high': '⚠️',
      'medium': '💛',
      'low': 'ℹ️'
    };

    console.log(`${severityEmoji[severity]} ALERT [${severity.toUpperCase()}]: ${message}`);
    if (details) {
      console.log(`   Details:`, typeof details === 'string' ? details : JSON.stringify(details, null, 2));
    }

    // Save to database
    try {
      await pool.query(`
        INSERT INTO monitoring_alerts (category, severity, message, details, created_at)
        VALUES ($1, $2, $3, $4, NOW())
      `, [category, severity, message, details ? JSON.stringify(details) : null]);
    } catch (error) {
      console.error('Failed to save alert to database:', error);
    }

    // Auto-suppress similar alerts for a period
    const suppressDuration = {
      'critical': 30 * 60 * 1000, // 30 minutes
      'high': 60 * 60 * 1000,     // 1 hour
      'medium': 2 * 60 * 60 * 1000, // 2 hours
      'low': 4 * 60 * 60 * 1000    // 4 hours
    };

    this.alerts.suppressedUntil[alertKey] = new Date(Date.now() + suppressDuration[severity]);

    return alert;
  }

  /**
   * Process and potentially resolve alerts
   */
  async processAlerts() {
    // Remove resolved alerts (basic implementation)
    const activeAlerts = this.alerts.active.length;
    
    if (activeAlerts > 0) {
      console.log(`📊 Processing ${activeAlerts} active alerts...`);
      
      // In a real implementation, you would:
      // 1. Check if issues are resolved
      // 2. Send notifications (email, Slack, etc.)
      // 3. Update alert statuses
      
      // For now, just age out old alerts
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      this.alerts.active = this.alerts.active.filter(alert => 
        alert.timestamp > oneHourAgo && alert.severity === 'critical'
      );
    }
  }

  /**
   * Generate alerts from full health check
   */
  async generateAlertsFromHealthCheck(results) {
    // Database issues
    if (!results.database.healthy) {
      await this.createAlert('database', 'critical', 'Database is unhealthy', results.database);
    }

    // Source issues
    Object.values(results.sources).forEach(async source => {
      if (source.status === 'failing' || source.status === 'error') {
        await this.createAlert('source', 'high', `${source.name} is ${source.status}`, source);
      } else if (source.status === 'stale' || source.status === 'warning') {
        await this.createAlert('source', 'medium', `${source.name} has issues`, source);
      }
    });

    // Data quality issues
    if (results.dataQuality.invalidDates > 0) {
      await this.createAlert('data_quality', 'high', `${results.dataQuality.invalidDates} exhibitions with invalid dates`);
    }

    // Performance issues
    if (results.performance.issues.length > 0) {
      await this.createAlert('performance', 'medium', 'Performance issues detected', results.performance.issues);
    }
  }

  /**
   * Save health check results
   */
  async saveHealthCheckResults(results) {
    try {
      const logDir = path.join(__dirname, 'monitoring_logs');
      await fs.mkdir(logDir, { recursive: true });
      
      const filename = `health_check_${new Date().toISOString().split('T')[0]}.json`;
      const filepath = path.join(logDir, filename);
      
      // Read existing log if it exists
      let logs = [];
      try {
        const existing = await fs.readFile(filepath, 'utf8');
        logs = JSON.parse(existing);
      } catch (error) {
        // File doesn't exist, start fresh
      }
      
      logs.push(results);
      
      // Keep only last 24 hours of logs
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      logs = logs.filter(log => new Date(log.timestamp) > oneDayAgo);
      
      await fs.writeFile(filepath, JSON.stringify(logs, null, 2));
      
    } catch (error) {
      console.error('Failed to save health check results:', error);
    }
  }

  /**
   * Display health check summary
   */
  displayHealthCheckSummary(results) {
    console.log(`\n📊 Health Check Summary (${results.timestamp.toLocaleString()})`);
    console.log('=' .repeat(60));
    
    // Overall status
    const statusEmoji = {
      'healthy': '✅',
      'warning': '⚠️',
      'critical': '🚨'
    };
    console.log(`Overall Status: ${statusEmoji[results.overall]} ${results.overall.toUpperCase()}`);
    
    // Database
    console.log(`\n💾 Database: ${results.database.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    if (results.database.healthy) {
      console.log(`   Connection time: ${results.database.connectionTime}ms`);
      console.log(`   Total exhibitions: ${results.database.stats.totalExhibitions}`);
      console.log(`   Added today: ${results.database.stats.todayExhibitions}`);
    } else {
      console.log(`   Error: ${results.database.error}`);
    }
    
    // Sources
    console.log(`\n📡 Data Sources:`);
    Object.values(results.sources).forEach(source => {
      const statusEmoji = {
        'healthy': '✅',
        'warning': '⚠️',
        'failing': '❌',
        'stale': '🕒',
        'error': '💥',
        'unknown': '❓'
      };
      
      console.log(`   ${statusEmoji[source.status]} ${source.name}: ${source.status}`);
      if (source.issues.length > 0) {
        source.issues.forEach(issue => {
          console.log(`      → ${issue}`);
        });
      }
      if (source.responseTime !== null) {
        console.log(`      Response time: ${source.responseTime}ms`);
      }
    });
    
    // Data quality
    console.log(`\n📊 Data Quality:`);
    if (results.dataQuality.error) {
      console.log(`   ❌ Check failed: ${results.dataQuality.error}`);
    } else {
      console.log(`   Total exhibitions (7 days): ${results.dataQuality.totalExhibitions}`);
      console.log(`   Duplicate rate: ${results.dataQuality.duplicateRate.toFixed(1)}%`);
      console.log(`   Missing descriptions: ${results.dataQuality.missingDescription}`);
      console.log(`   Invalid dates: ${results.dataQuality.invalidDates}`);
    }
    
    // Alerts
    if (this.alerts.active.length > 0) {
      console.log(`\n🚨 Active Alerts: ${this.alerts.active.length}`);
      this.alerts.active.slice(0, 5).forEach(alert => {
        console.log(`   ${alert.severity.toUpperCase()}: ${alert.message}`);
      });
    } else {
      console.log(`\n✅ No Active Alerts`);
    }
    
    console.log('\n' + '=' .repeat(60));
  }

  /**
   * Get current system status
   */
  async getStatus() {
    return {
      isRunning: this.isRunning,
      activeAlerts: this.alerts.active.length,
      lastHealthCheck: this.lastFullHealthCheck,
      monitoredSources: this.monitoringConfig.sources.length,
      config: this.monitoringConfig
    };
  }
}

// Export for use as module
module.exports = ExhibitionMonitoringSystem;

// Run if called directly
if (require.main === module) {
  const monitor = new ExhibitionMonitoringSystem();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down monitoring system...');
    monitor.stop();
    pool.end().then(() => {
      console.log('✅ Monitoring system stopped gracefully');
      process.exit(0);
    });
  });
  
  // Start monitoring
  monitor.start().catch(error => {
    console.error('💥 Failed to start monitoring system:', error);
    process.exit(1);
  });
}