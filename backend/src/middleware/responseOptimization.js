/**
 * Response Optimization Middleware
 * Optimizes API responses for better performance
 */

const { log } = require('../config/logger');

// Middleware to add performance headers
function performanceHeaders(req, res, next) {
  const startTime = Date.now();
  
  // Store start time for response time calculation
  req.startTime = startTime;
  
  // Override res.json to add performance metrics
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Add performance headers
    res.set({
      'X-Response-Time': `${responseTime}ms`,
      'X-Cache-Status': res.get('X-Cache-Status') || 'MISS',
      'X-API-Version': '2.0'
    });
    
    // Log slow requests (> 1000ms)
    if (responseTime > 1000) {
      log.warn(`Slow API request: ${req.method} ${req.originalUrl} - ${responseTime}ms`);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}

// Middleware to optimize JSON responses
function jsonOptimization(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Remove null values and empty objects to reduce payload size
    const optimizedData = removeNullValues(data);
    
    // Add pagination metadata if missing
    if (Array.isArray(optimizedData) && req.query.limit) {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      
      return originalJson.call(this, {
        data: optimizedData,
        pagination: {
          limit,
          offset,
          total: optimizedData.length,
          hasMore: optimizedData.length === limit
        }
      });
    }
    
    return originalJson.call(this, optimizedData);
  };
  
  next();
}

// Middleware for API versioning
function apiVersioning(req, res, next) {
  // Check API version from header
  const apiVersion = req.headers['x-api-version'] || '2.0';
  
  // Store version in request for route handlers to use
  req.apiVersion = apiVersion;
  
  // Set version in response header
  res.set('X-API-Version', apiVersion);
  
  next();
}

// Middleware for conditional requests (ETag support)
function conditionalRequests(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Generate ETag based on data hash
    const etag = generateETag(data);
    res.set('ETag', etag);
    
    // Check if client has cached version
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}

// Middleware for CORS optimization
function corsOptimization(req, res, next) {
  // Add more efficient CORS headers
  res.set({
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    'Vary': 'Origin, Accept-Encoding'
  });
  
  next();
}

// Helper function to remove null/undefined values
function removeNullValues(obj) {
  if (obj === null || obj === undefined) {
    return undefined;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeNullValues).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeNullValues(value);
      if (cleanedValue !== undefined && cleanedValue !== null) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }
  
  return obj;
}

// Helper function to generate ETag
function generateETag(data) {
  const crypto = require('crypto');
  const content = JSON.stringify(data);
  return `"${crypto.createHash('md5').update(content).digest('hex')}"`;
}

// Middleware for request batching optimization
function batchingOptimization(req, res, next) {
  // Check if this is a batch request
  if (req.body && Array.isArray(req.body.requests)) {
    req.isBatchRequest = true;
    req.batchRequests = req.body.requests;
    
    // Override response to handle batch responses
    const originalJson = res.json;
    res.json = function(data) {
      // Wrap single response in batch format
      return originalJson.call(this, {
        responses: Array.isArray(data) ? data : [data],
        batchId: req.headers['x-batch-id'],
        processedAt: new Date().toISOString()
      });
    };
  }
  
  next();
}

// Response size optimization middleware
function responseSizeOptimization(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    const jsonString = JSON.stringify(data);
    const sizeInBytes = Buffer.byteLength(jsonString, 'utf8');
    
    // Add response size header
    res.set('Content-Length', sizeInBytes.toString());
    
    // Log large responses (> 1MB)
    if (sizeInBytes > 1024 * 1024) {
      log.warn(`Large API response: ${req.method} ${req.originalUrl} - ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // Enable compression for large responses
    if (sizeInBytes > 1024) {
      res.set('Content-Encoding', 'gzip');
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}

// Combined optimization middleware
function optimizeResponses() {
  return [
    performanceHeaders,
    apiVersioning,
    corsOptimization,
    conditionalRequests,
    batchingOptimization,
    responseSizeOptimization,
    jsonOptimization
  ];
}

module.exports = {
  performanceHeaders,
  jsonOptimization,
  apiVersioning,
  conditionalRequests,
  corsOptimization,
  batchingOptimization,
  responseSizeOptimization,
  optimizeResponses
};