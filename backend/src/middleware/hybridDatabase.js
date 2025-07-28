const { hybridDB } = require('../config/hybridDatabase');
const { isSupabaseConfigured } = require('../config/supabase');
const { log } = require('../config/logger');

/**
 * Middleware to attach hybrid database to request
 */
const hybridDatabaseMiddleware = async (req, res, next) => {
  try {
    req.hybridDB = hybridDB;
    req.isHybridMode = isSupabaseConfigured();
    next();
  } catch (error) {
    log.error('Hybrid database middleware error', error);
    next(error);
  }
};

/**
 * Middleware for Supabase-specific routes
 */
const supabaseMiddleware = async (req, res, next) => {
  try {
    if (!isSupabaseConfigured()) {
      log.warn('Supabase route accessed but Supabase not configured', {
        path: req.path,
        method: req.method
      });

      // Fallback to Railway
      req.useRailwayFallback = true;
    }

    req.hybridDB = hybridDB;
    next();
  } catch (error) {
    log.error('Supabase middleware error', error);
    next(error);
  }
};

/**
 * Middleware for Railway-specific routes
 */
const railwayMiddleware = async (req, res, next) => {
  try {
    req.hybridDB = hybridDB;
    req.forceRailway = true;
    next();
  } catch (error) {
    log.error('Railway middleware error', error);
    next(error);
  }
};

/**
 * Middleware for Supabase Realtime features
 */
const supabaseRealtimeMiddleware = async (req, res, next) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Realtime features require Supabase configuration'
      });
    }

    req.hybridDB = hybridDB;
    req.requiresRealtime = true;
    next();
  } catch (error) {
    log.error('Supabase realtime middleware error', error);
    next(error);
  }
};

/**
 * Database selection helper
 */
const selectDatabase = (tableName, operation) => {
  return (req, res, next) => {
    req.dbTable = tableName;
    req.dbOperation = operation;
    req.hybridDB = hybridDB;
    next();
  };
};

/**
 * Transaction wrapper for hybrid operations
 */
const hybridTransaction = async (req, res, next) => {
  req.beginTransaction = async () => {
    return await hybridDB.transaction(async (client) => {
      req.transactionClient = client;
      return client;
    });
  };

  next();
};

/**
 * Database health check middleware
 */
const databaseHealthCheck = async (req, res, next) => {
  try {
    const health = await hybridDB.healthCheck();

    if (!health.hybrid) {
      return res.status(503).json({
        success: false,
        error: 'Database services unavailable',
        health
      });
    }

    req.databaseHealth = health;
    next();
  } catch (error) {
    log.error('Database health check failed', error);
    res.status(503).json({
      success: false,
      error: 'Database health check failed'
    });
  }
};

module.exports = {
  hybridDatabaseMiddleware,
  supabaseMiddleware,
  railwayMiddleware,
  supabaseRealtimeMiddleware,
  selectDatabase,
  hybridTransaction,
  databaseHealthCheck
};
