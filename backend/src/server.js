const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Check for SAYU_MODE to determine server configuration
const SAYU_MODE = process.env.SAYU_MODE || 'full';
console.log(`🔧 Server Mode: ${SAYU_MODE}`);

// Simple living server mode for Railway deployment
if (SAYU_MODE === 'living') {
  console.log('🏃 Starting in Living Server Mode...');
  require('./living-server-mode');
  return;
}

// Demo mode - simplified setup (only when explicitly set)
if (SAYU_MODE === 'demo') {
  console.log('🎯 Starting in Demo Mode...');
  const demoServer = require('./demo-server');
  return;
}

// Validate environment variables for full server mode
const { validateEnv } = require('./utils/validateEnv');
validateEnv();

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
const { optimizeResponses } = require('./middleware/responseOptimization');
const {
  requestContext,
  enhancedRequestLogger,
  userContext,
  performanceMonitor,
  securityContext
} = require('./middleware/requestContext');

const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { hybridDatabaseMiddleware } = require('./middleware/hybridDatabase');

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
const gamificationRoutes = require('./routes/gamification');
const evaluationRoutes = require('./routes/evaluation');
const insightsRoutes = require('./routes/insights');
const publicApiRoutes = require('./routes/public-api');
const archiveRoutes = require('./routes/archive');
const reportsRoutes = require('./routes/reports');
const communityRoutes = require('./routes/community');
const socialShareRoutes = require('./routes/socialShare');
const artistPortalRoutes = require('./routes/artistPortal');
const museumsRoutes = require('./routes/museums');
const reservationsRoutes = require('./routes/reservations');
const artProfileRoutes = require('./routes/artProfileRoutes');
const aiRecommendationRoutes = require('./routes/aiRecommendationRoutes');
const exhibitionCalendarRoutes = require('./routes/exhibitionCalendarRoutes');
const artveeRoutes = require('./routes/artveeRoutes');
const artveeImageServer = require('./routes/artveeImageServer');
const exhibitionRoutes = require('./routes/exhibitionRoutes');
// const emotionTranslationRoutes = require('./routes/emotionTranslationRoutes'); // Temporarily disabled for debugging
const chatbotRoutes = require('./routes/chatbot');
// const contemplativeRoutes = require('./routes/contemplativeRoutes'); // Temporarily disabled for debugging
const aptRecommendationRoutes = require('./routes/aptRecommendationRoutes');
const artistRoutes = require('./routes/artistRoutes');
const databaseRecommendationRoutes = require('./routes/databaseRecommendationRoutes');
const exhibitionCollectionRoutes = require('./routes/exhibitionCollectionRoutes');
const easterEggRoutes = require('./routes/easterEggRoutes');
const dailyHabitRoutes = require('./routes/dailyHabitRoutes');
const artistDataRoutes = require('./routes/artistDataRoutes');
const venueRoutes = require('./routes/venueRoutes');
const artveeArtworkRoutes = require('./routes/artveeArtworkRoutes');
const artistAPTRoutes = require('./routes/artistAPT');

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
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://sayu.vercel.app',
      'https://sayu-git-main-samsungs-projects.vercel.app'
    ];
    
    // Check if the origin is in the allowed list or matches Railway/Vercel patterns
    const isAllowed = allowedOrigins.includes(origin) ||
                      origin.match(/^https:\/\/.*\.railway\.app$/) ||
                      origin.match(/^https:\/\/.*\.vercel\.app$/);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Cookie parser (required for CSRF)
app.use(cookieParser());

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

// Add hybrid database middleware
app.use(hybridDatabaseMiddleware);

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

// CSRF Protection (after session and before routes)
const { csrfMiddleware } = require('./middleware/csrfProtection');
app.use(csrfMiddleware({
  excludePaths: ['/api/auth/login', '/api/auth/register', '/api/health', '/api/webhook'],
  secure: process.env.NODE_ENV === 'production'
}));

// XSS Protection (after CSRF and before routes)
const { xssProtection, fileUploadXSSProtection } = require('./middleware/xssProtection');
app.use(xssProtection({
  enableLogging: true,
  blockHighRisk: true,
  riskThreshold: 50
}));

// Security audit middleware (before rate limiting)
app.use('/api/', securityAudit);

// Enhanced security middleware
const { 
  apiLimiter, 
  securityHeaders,
  requestSizeValidator,
  csrfProtection,
  securityAuditLogger
} = require('./middleware/securityEnhancements');

// Apply enhanced security headers
app.use(securityHeaders);

// Request size validation (early in chain)
app.use(requestSizeValidator);

// Security audit logging
app.use('/api/', securityAuditLogger);

// CSRF protection for state-changing operations
app.use('/api/', csrfProtection);

// Improved rate limiting
app.use('/api/', apiLimiter);

// API monitoring and performance tracking
const { 
  performanceTracker, 
  requestLogger, 
  usageAnalytics,
  getMetrics,
  getHealthCheck
} = require('./middleware/apiMonitoring');

// Apply monitoring middleware
app.use('/api/', performanceTracker);
app.use('/api/', requestLogger);
app.use('/api/', usageAnalytics);

// Response optimization middleware
app.use('/api/', optimizeResponses());

// User context middleware (after auth middleware in routes)
app.use(userContext);

// Enhanced health check endpoint with monitoring data
app.get('/api/health', getHealthCheck);

// API metrics endpoint (admin only)
app.get('/api/metrics', require('./middleware/auth').adminMiddleware, getMetrics);

// Basic health endpoint for load balancers
app.get('/api/status', (req, res) => {
  const { hybridDB } = require('./config/hybridDatabase');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'connected',
      supabase: hybridDB?.supabase ? 'connected' : 'disconnected',
      redis: 'optional'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes); // OAuth routes under auth path
app.use('/api/email', emailRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/sayu-quiz', sayuQuizRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/db-recommendations', databaseRecommendationRoutes);
app.use('/api/exhibition-collection', exhibitionCollectionRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/reflections', reflectionRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/image-generation', imageGenerationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/public', publicApiRoutes); // 🔥 공개 API 추가
app.use('/api/archive', archiveRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/social-share', socialShareRoutes);
app.use('/api/artist-portal', artistPortalRoutes);
app.use('/api/museums', museumsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/art-profile', artProfileRoutes);
app.use('/api/ai-recommendations', aiRecommendationRoutes);
app.use('/api/calendar', exhibitionCalendarRoutes);
app.use('/api/artvee', artveeRoutes);
app.use('/api/artvee', artveeImageServer);
app.use('/api', exhibitionRoutes);
// app.use('/api/emotion', emotionTranslationRoutes); // Temporarily disabled for debugging
app.use('/api/chatbot', chatbotRoutes);
// app.use('/api/contemplative', contemplativeRoutes); // Temporarily disabled for debugging
app.use('/api/apt', aptRecommendationRoutes); // APT 기반 추천 시스템
app.use('/api/easter-eggs', easterEggRoutes);
app.use('/api/daily-habit', dailyHabitRoutes); // Daily Art Habit 시스템
app.use('/api/artist-data', artistDataRoutes); // 아티스트 데이터 수집 및 관리
app.use('/api/matching', require('./routes/matchingRoutes')); // 매칭 시스템
app.use('/api/waitlist', require('./routes/waitlistRoutes')); // 베타 대기 목록
app.use('/api/art-pulse', require('./routes/artPulseRoutes')); // Art Pulse 실시간 공동 감상
app.use('/api/venues', venueRoutes); // 다국어 지원 venue API
app.use('/api/artvee-artworks', artveeArtworkRoutes); // Artvee 작품-작가 연결 API
app.use('/api/artist-apt', artistAPTRoutes); // 작가 APT 매칭 시스템

// Duplicate health check endpoint removed - using the comprehensive one above (lines 174-186)

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
    // Redis is optional - services handle their own connections
    log.info('Database connections established');
    
    // Initialize email automation (only in production or when explicitly enabled)
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_EMAIL_AUTOMATION === 'true') {
      require('./services/emailAutomation');
      log.info('Email automation initialized');
    }

    // Initialize Daily Art Habit cron jobs
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DAILY_HABIT_JOBS === 'true') {
      const { initializeDailyHabitJobs } = require('./jobs/dailyHabitNotifications');
      initializeDailyHabitJobs();
      log.info('Daily Art Habit cron jobs initialized');
    }

    // Initialize Global Museum Collection cron jobs
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_GLOBAL_MUSEUM_COLLECTION === 'true') {
      const globalMuseumCronManager = require('./cron/globalMuseumCron');
      globalMuseumCronManager.startAllJobs();
      log.info('Global Museum Collection cron jobs initialized');
    }
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      log.info('SAYU server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid,
        memoryUsage: process.memoryUsage()
      });
      
      console.log(`🎨 SAYU Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Initialize Socket.io for real-time gallery sessions
    const realtimeGalleryService = require('./services/realtimeGalleryService');
    realtimeGalleryService.initialize(server);
    log.info('Real-time gallery service initialized');
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
