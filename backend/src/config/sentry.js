const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

function initSentry() {
  // Only initialize Sentry in production or if DSN is provided
  if (process.env.NODE_ENV === 'production' || process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      
      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      integrations: [
        nodeProfilingIntegration()
      ],
      
      // Release tracking
      release: process.env.npm_package_version || '1.0.0',
      
      // Sample rate for error events
      sampleRate: 1.0,
      
      // Filter sensitive data
      beforeSend(event) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['x-api-key'];
        }
        
        // Remove sensitive form data
        if (event.request?.data) {
          if (typeof event.request.data === 'object') {
            delete event.request.data.password;
            delete event.request.data.token;
            delete event.request.data.refreshToken;
          }
        }
        
        return event;
      },
      
      // Custom tags
      initialScope: {
        tags: {
          component: 'sayu-backend',
          version: process.env.npm_package_version || '1.0.0'
        }
      }
    });

    console.log('🔍 Sentry error tracking initialized');
  } else {
    console.log('⚠️  Sentry not initialized - missing SENTRY_DSN or not in production');
  }
}

// Helper function to capture exceptions with context
function captureException(error, context = {}) {
  if (process.env.NODE_ENV === 'test') {
    // Don't send to Sentry during tests
    console.error('Test Error:', error.message);
    return;
  }

  Sentry.withScope((scope) => {
    // Add user context if available
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }
    
    // Add custom tags
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    // Add extra context
    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    // Set transaction name if available
    if (context.transaction) {
      scope.setTransactionName(context.transaction);
    }
    
    Sentry.captureException(error);
  });
}

// Helper function to capture messages with context
function captureMessage(message, level = 'info', context = {}) {
  if (process.env.NODE_ENV === 'test') {
    console.log(`Test ${level.toUpperCase()}:`, message);
    return;
  }

  Sentry.withScope((scope) => {
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }
    
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    Sentry.captureMessage(message, level);
  });
}

// Add user context to current scope
function addUserContext(userId, userInfo = {}) {
  Sentry.getCurrentScope().setUser({
    id: userId,
    ...userInfo
  });
}

// Add request context
function addRequestContext(req) {
  Sentry.getCurrentScope().setTag('endpoint', `${req.method} ${req.route?.path || req.path}`);
  Sentry.getCurrentScope().setExtra('requestId', req.id);
  
  if (req.userId) {
    addUserContext(req.userId, {
      role: req.userRole
    });
  }
}

// Performance monitoring helpers
function startTransaction(name, operation = 'http') {
  return Sentry.startTransaction({
    name,
    op: operation
  });
}

module.exports = {
  initSentry,
  captureException,
  captureMessage,
  addUserContext,
  addRequestContext,
  startTransaction,
  Sentry
};
