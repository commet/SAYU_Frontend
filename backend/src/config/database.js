const { Pool } = require('pg');

// SSL configuration for Railway PostgreSQL
const sslConfig = process.env.DATABASE_URL?.includes('railway') 
  ? {
      rejectUnauthorized: false, // Railway uses self-signed certificates
    }
  : process.env.NODE_ENV === 'production' 
    ? {
        rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
      }
    : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
  // Production-optimized settings for Railway deployment
  max: 30,                    // Optimized for Railway's memory limits
  idleTimeoutMillis: 120000,  // 2 minutes - balanced for performance
  connectionTimeoutMillis: 8000, // 8 seconds - faster timeout for production
  // Production-optimized additional settings
  min: 3,                     // Reduced minimum for memory efficiency
  acquireTimeoutMillis: 15000, // 15 seconds - faster acquisition
  createTimeoutMillis: 8000,  // 8 seconds - faster creation
  destroyTimeoutMillis: 3000, // 3 seconds - faster cleanup
  reapIntervalMillis: 30000,  // 30 seconds - less frequent reaping
  createRetryIntervalMillis: 100, // 100ms - faster retry cycles
});

async function connectDatabase() {
  try {
    const client = await pool.connect();
    // Test connection
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Connected to PostgreSQL');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Connection pool monitoring functions
function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    maxConnections: pool.options.max,
    minConnections: pool.options.min,
    utilization: ((pool.totalCount - pool.idleCount) / pool.options.max * 100).toFixed(2) + '%'
  };
}

function logPoolStats() {
  const stats = getPoolStats();
  console.log('📊 Database Pool Stats:', {
    active: stats.totalCount - stats.idleCount,
    idle: stats.idleCount,
    waiting: stats.waitingCount,
    utilization: stats.utilization,
    max: stats.maxConnections
  });
  return stats;
}

// Periodic pool monitoring (every 5 minutes)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const stats = getPoolStats();
    if (parseFloat(stats.utilization) > 80) {
      console.warn('⚠️ High database pool utilization:', stats.utilization);
    }
    logPoolStats();
  }, 5 * 60 * 1000); // 5 minutes
}

module.exports = { 
  pool, 
  connectDatabase, 
  withTransaction, 
  getPoolStats, 
  logPoolStats 
};
