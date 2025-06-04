const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize Sentry FIRST, before any other imports
const { initSentry } = require('./config/sentry');
initSentry();

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

// Import routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
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

const app = express();

// Trust proxy for production
app.set('trust proxy', 1);

// Middleware
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
app.use('/api/quiz', quizRoutes);
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
const PORT = process.env.PORT || 3001;

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
    
    app.listen(PORT, () => {
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
