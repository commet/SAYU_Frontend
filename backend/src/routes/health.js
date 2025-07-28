const express = require('express');
const { hybridDB } = require('../config/hybridDatabase');
const { getRedisClient } = require('../config/redis');
const { log } = require('../config/logger');

// Import OpenAI safely
let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = require('../config/openai').openai;
  }
} catch (error) {
  log.warn('OpenAI not configured:', error.message);
}

const router = express.Router();

/**
 * Comprehensive health check endpoint
 * Returns detailed status of all system components
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Initialize health status
  const health = {
    status: 'ok',
    timestamp,
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  // Track failed checks
  const failedChecks = [];

  try {
    // 1. Database Health Check (Supabase/Railway)
    log.info('Starting database health check');
    health.checks.database = await checkDatabase();
    if (!health.checks.database.healthy) {
      failedChecks.push('database');
    }

    // 2. Redis Health Check
    log.info('Starting Redis health check');
    health.checks.redis = await checkRedis();
    // Redis is optional, so don't fail on Redis errors in development
    if (!health.checks.redis.healthy && process.env.NODE_ENV === 'production') {
      failedChecks.push('redis');
    }

    // 3. OpenAI API Health Check
    log.info('Starting OpenAI health check');
    health.checks.openai = await checkOpenAI();
    if (!health.checks.openai.healthy) {
      failedChecks.push('openai');
    }

    // 4. Memory Usage Check
    log.info('Starting memory health check');
    health.checks.memory = checkMemoryUsage();
    if (!health.checks.memory.healthy) {
      failedChecks.push('memory');
    }

    // 5. Process Health Check
    health.checks.process = checkProcessHealth();
    if (!health.checks.process.healthy) {
      failedChecks.push('process');
    }

    // 6. System Dependencies Check
    health.checks.dependencies = await checkDependencies();
    if (!health.checks.dependencies.healthy) {
      failedChecks.push('dependencies');
    }

  } catch (error) {
    log.error('Health check error:', error);
    health.checks.error = {
      healthy: false,
      message: error.message,
      timestamp
    };
    failedChecks.push('error');
  }

  // Overall health status
  health.healthy = failedChecks.length === 0;
  health.status = health.healthy ? 'ok' : 'error';
  health.failedChecks = failedChecks;
  health.responseTime = Date.now() - startTime;

  // Log health check result
  log.info('Health check completed', {
    healthy: health.healthy,
    responseTime: health.responseTime,
    failedChecks: failedChecks.length > 0 ? failedChecks : null
  });

  // Return appropriate HTTP status
  const statusCode = health.healthy ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * Database connection health check
 */
async function checkDatabase() {
  const startTime = Date.now();
  
  try {
    // Check hybrid database status
    const status = await hybridDB.getStatus();
    
    const railwayHealthy = status.railway.connected;
    const supabaseHealthy = status.supabase.connected;
    
    // At least one database should be healthy
    const healthy = railwayHealthy || supabaseHealthy;
    
    return {
      healthy,
      responseTime: Date.now() - startTime,
      details: {
        railway: {
          connected: railwayHealthy,
          latency: status.railway.latency
        },
        supabase: {
          connected: supabaseHealthy,
          latency: status.supabase.latency
        }
      },
      message: healthy ? 'Database connections operational' : 'All database connections failed',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    log.error('Database health check failed:', error);
    return {
      healthy: false,
      responseTime: Date.now() - startTime,
      error: error.message,
      message: 'Database health check failed',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Redis connection health check
 */
async function checkRedis() {
  const startTime = Date.now();
  
  try {
    const redisClient = getRedisClient();
    
    if (!redisClient) {
      return {
        healthy: true, // Redis is optional in development
        available: false,
        responseTime: Date.now() - startTime,
        message: 'Redis not configured (optional)',
        timestamp: new Date().toISOString()
      };
    }

    // Test Redis connection with a simple ping
    const pong = await redisClient.ping();
    const healthy = pong === 'PONG';

    // Get Redis info
    const info = await redisClient.info('memory');
    const memoryUsage = parseRedisMemoryInfo(info);

    return {
      healthy,
      available: true,
      responseTime: Date.now() - startTime,
      details: {
        ping: pong,
        memoryUsage,
        status: redisClient.status
      },
      message: healthy ? 'Redis connection operational' : 'Redis connection failed',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    log.error('Redis health check failed:', error);
    return {
      healthy: process.env.NODE_ENV !== 'production', // Allow failure in development
      available: false,
      responseTime: Date.now() - startTime,
      error: error.message,
      message: 'Redis health check failed',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * OpenAI API health check
 */
async function checkOpenAI() {
  const startTime = Date.now();
  
  try {
    if (!process.env.OPENAI_API_KEY || !openai) {
      return {
        healthy: false,
        available: false,
        responseTime: Date.now() - startTime,
        message: 'OpenAI API key not configured',
        timestamp: new Date().toISOString()
      };
    }

    // Test OpenAI API with a minimal request
    const response = await openai.models.list();
    const healthy = response && response.data && response.data.length > 0;

    // Get available models count
    const modelCount = response.data ? response.data.length : 0;

    return {
      healthy,
      available: true,
      responseTime: Date.now() - startTime,
      details: {
        modelCount,
        apiKeyConfigured: !!process.env.OPENAI_API_KEY
      },
      message: healthy ? 'OpenAI API operational' : 'OpenAI API check failed',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    log.error('OpenAI health check failed:', error);
    
    // Check if it's a rate limit or quota error
    const isRateLimit = error.status === 429;
    const isQuotaError = error.code === 'insufficient_quota';
    
    return {
      healthy: false,
      available: true,
      responseTime: Date.now() - startTime,
      error: error.message,
      details: {
        statusCode: error.status,
        errorCode: error.code,
        isRateLimit,
        isQuotaError
      },
      message: isRateLimit ? 'OpenAI API rate limited' : 
               isQuotaError ? 'OpenAI API quota exceeded' : 
               'OpenAI API health check failed',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Memory usage health check
 */
function checkMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  const totalMemoryMB = Math.round(memoryUsage.rss / 1024 / 1024);
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const externalMB = Math.round(memoryUsage.external / 1024 / 1024);

  // Memory thresholds (Railway has 8GB limit, but we want to alert earlier)
  const memoryLimitMB = parseInt(process.env.MEMORY_LIMIT_MB) || 2048; // 2GB default
  const warningThresholdMB = memoryLimitMB * 0.8; // 80% warning
  const criticalThresholdMB = memoryLimitMB * 0.9; // 90% critical

  const memoryPercentage = (totalMemoryMB / memoryLimitMB) * 100;
  const healthy = totalMemoryMB < criticalThresholdMB;
  const warning = totalMemoryMB > warningThresholdMB;

  return {
    healthy,
    warning,
    details: {
      rss: totalMemoryMB,
      heapUsed: heapUsedMB,
      heapTotal: heapTotalMB,
      external: externalMB,
      memoryPercentage: Math.round(memoryPercentage),
      memoryLimitMB,
      warningThresholdMB,
      criticalThresholdMB
    },
    message: healthy ? 
      (warning ? `Memory usage at ${Math.round(memoryPercentage)}% (warning level)` : 'Memory usage healthy') :
      `Memory usage critical: ${totalMemoryMB}MB (${Math.round(memoryPercentage)}%)`,
    timestamp: new Date().toISOString()
  };
}

/**
 * Process health check
 */
function checkProcessHealth() {
  const uptime = process.uptime();
  const uptimeHours = Math.round(uptime / 3600 * 100) / 100;
  
  // Process health indicators
  const pid = process.pid;
  const nodeVersion = process.version;
  const platform = process.platform;
  const arch = process.arch;
  
  // CPU usage (if available)
  const cpuUsage = process.cpuUsage();
  
  // Check if process has been running for a reasonable time
  const minimumUptimeSeconds = 10;
  const healthy = uptime > minimumUptimeSeconds;

  return {
    healthy,
    details: {
      pid,
      uptime: Math.round(uptime),
      uptimeHours,
      nodeVersion,
      platform,
      arch,
      cpuUsage: {
        user: cpuUsage.user,
        system: cpuUsage.system
      }
    },
    message: healthy ? 
      `Process healthy, uptime: ${uptimeHours}h` : 
      `Process just started, uptime: ${Math.round(uptime)}s`,
    timestamp: new Date().toISOString()
  };
}

/**
 * System dependencies health check
 */
async function checkDependencies() {
  const startTime = Date.now();
  
  try {
    const dependencies = {
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        jwtSecret: !!process.env.JWT_SECRET,
        databaseUrl: !!process.env.DATABASE_URL,
        openaiApiKey: !!process.env.OPENAI_API_KEY
      },
      required: {
        jwtSecret: !!process.env.JWT_SECRET,
        databaseUrl: !!process.env.DATABASE_URL || !!process.env.SUPABASE_URL,
        openaiApiKey: !!process.env.OPENAI_API_KEY
      }
    };

    // Check required environment variables
    const missingRequired = Object.entries(dependencies.required)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    const healthy = missingRequired.length === 0;

    return {
      healthy,
      responseTime: Date.now() - startTime,
      details: dependencies,
      missingRequired: missingRequired.length > 0 ? missingRequired : null,
      message: healthy ? 
        'All required dependencies configured' : 
        `Missing required dependencies: ${missingRequired.join(', ')}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      responseTime: Date.now() - startTime,
      error: error.message,
      message: 'Dependencies check failed',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Parse Redis memory info
 */
function parseRedisMemoryInfo(info) {
  const lines = info.split('\r\n');
  const memoryInfo = {};
  
  lines.forEach(line => {
    if (line.includes(':')) {
      const [key, value] = line.split(':');
      if (key.includes('memory')) {
        memoryInfo[key] = value;
      }
    }
  });
  
  return memoryInfo;
}

/**
 * Simple health check endpoint for load balancers
 */
router.get('/simple', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Readiness probe - check if service is ready to accept traffic
 */
router.get('/ready', async (req, res) => {
  try {
    // Quick check of essential services
    const dbStatus = await hybridDB.getStatus();
    const ready = dbStatus.railway.connected || dbStatus.supabase.connected;
    
    if (ready) {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        message: 'Database not available',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Liveness probe - check if service is alive
 */
router.get('/live', (req, res) => {
  // Simple liveness check - if this endpoint responds, the service is alive
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: process.uptime()
  });
});

module.exports = router;