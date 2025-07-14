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
  // Optimized settings for high-load performance
  max: 50,                    // Increased from 20 to support more concurrent users
  idleTimeoutMillis: 300000,  // 5 minutes - increased from 30s for better reuse
  connectionTimeoutMillis: 10000, // 10 seconds - increased from 2s for complex queries
  // Additional performance optimizations
  min: 5,                     // Minimum idle connections
  acquireTimeoutMillis: 20000, // 20 seconds to acquire connection
  createTimeoutMillis: 10000, // 10 seconds to create new connection
  destroyTimeoutMillis: 5000, // 5 seconds to destroy connection
  reapIntervalMillis: 10000,  // 10 seconds between reaping stale connections
  createRetryIntervalMillis: 200, // 200ms between connection retry attempts
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
