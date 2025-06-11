const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Initialize Sentry FIRST, before any other imports
// Sentry completely disabled for deployment
// const { initSentry } = require('./config/sentry');
// initSentry();

// Import other modules after Sentry
const { securityAudit } = require('./middleware/securityAudit');
const { log } = require('./config/logger');
const { 
  errorHandler, 
  notFoundHandler 
} = require('./middleware/errorHandler');
const {
  requestContext,
  enhancedRequestLogger,
  userContext,
  performanceMonitor,
  securityContext
} = require('./middleware/requestContext');

const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');

// Initialize Passport
require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const oauthRoutes = require('./routes/oauth');
const emailRoutes = require('./routes/email');
const quizRoutes = require('./routes/quiz');
const sayuQuizRoutes = require('./routes/sayuQuizRoutes');
const profileRoutes = require('./routes/profile');
const recommendationRoutes = require('./routes/recommendations');
const agentRoutes = require('./routes/agent');
const reflectionRoutes = require('./routes/reflections');
const artworkRoutes = require('./routes/artworks');
const analyticsRoutes = require('./routes/analytics');
const imageGenerationRoutes = require('./routes/imageGeneration');
const adminRoutes = require('./routes/admin');
const achievementRoutes = require('./routes/achievements');
const archiveRoutes = require('./routes/archive');
const reportsRoutes = require('./routes/reports');
const communityRoutes = require('./routes/community');
const socialShareRoutes = require('./routes/socialShare');
const artistPortalRoutes = require('./routes/artistPortal');
const museumsRoutes = require('./routes/museums');
const reservationsRoutes = require('./routes/reservations');

const app = express();

// Trust proxy for production
app.set('trust proxy', 1);

// Middleware
app.use(compression()); // Add gzip compression
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://collectionapi.metmuseum.org"]
    }
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || (() => { 
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET environment variable is required in production');
    }
    return 'sayu-dev-secret-only-for-development';
  })(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Request context and logging middleware (early in chain)
app.use(requestContext);
app.use(enhancedRequestLogger);
app.use(performanceMonitor);
app.use(securityContext);

// Body parsing with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Verify JSON payload integrity
    try {
      JSON.parse(buf);
    } catch (e) {
      log.warn('Invalid JSON payload received', {
        requestId: req.id,
        ip: req.ip,
        contentLength: req.headers['content-length']
      });
      res.status(400).json({ error: 'Invalid JSON payload' });
      return;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security audit middleware (before rate limiting)
app.use('/api/', securityAudit);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased for better UX
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.url === '/api/health';
  }
});
app.use('/api/', limiter);

// User context middleware (after auth middleware in routes)
app.use(userContext);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes); // OAuth routes under auth path
app.use('/api/email', emailRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/sayu-quiz', sayuQuizRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/reflections', reflectionRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/image-generation', imageGenerationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/social-share', socialShareRoutes);
app.use('/api/artist-portal', artistPortalRoutes);
app.use('/api/museums', museumsRoutes);
app.use('/api/reservations', reservationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const healthStatus = {
    status: 'healthy', 
    timestamp: new Date(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };
  
  log.debug('Health check performed', {
    requestId: req.id,
    ip: req.ip
  });
  
  res.json(healthStatus);
});

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    log.info('Starting SAYU server...', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    });

    // Connect to databases
    log.info('Connecting to databases...');
    await connectDatabase();
    await connectRedis();
    log.info('Database connections established');
    
    // Initialize email automation (only in production or when explicitly enabled)
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_EMAIL_AUTOMATION === 'true') {
      require('./services/emailAutomation');
      log.info('Email automation initialized');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      log.info('SAYU server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid,
        memoryUsage: process.memoryUsage()
      });
      
      console.log(`🎨 SAYU Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    log.error('Failed to start server', error, {
      port: PORT,
      environment: process.env.NODE_ENV
    });
    
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  log.info('SIGTERM received, starting graceful shutdown...');
  process.exit(0);
});

process.on('SIGINT', () => {
  log.info('SIGINT received, starting graceful shutdown...');
  process.exit(0);
});

startServer();
