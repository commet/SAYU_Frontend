#!/usr/bin/env node

// 최소한의 SAYU 서버 - Public API만 제공
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// 기본 미들웨어
app.use(express.json({ limit: '1mb' }));
app.use(cors());

// 전역 rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 1000, // 전체 1000회
  message: { error: 'Too many requests from this IP' }
});
app.use(globalLimiter);

// 홈 페이지
app.get('/', (req, res) => {
  res.json({
    service: 'SAYU API Server',
    version: '1.0.0',
    status: 'running',
    lastUpdated: '2024-06-18T21:30:00Z', // 🔥 디버깅용 타임스탬프
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    commit: '1afa006', // 🔥 최신 커밋 해시
    endpoints: {
      public: '/api/public/*',
      docs: '/api-docs', 
      health: '/api/health'
    },
    railway: {
      deployed: true,
      simpleServer: true // 🔥 simple-server.js 사용중임을 확인
    },
    message: 'Welcome to SAYU - Art Personality Analysis API'
  });
});

// 기본 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// Public API 라우트 추가
try {
  const publicApiRoutes = require('./src/routes/public-api');
  app.use('/api/public', publicApiRoutes);
  console.log('✅ Public API routes loaded');
} catch (error) {
  console.warn('⚠️ Public API routes failed to load:', error.message);
  
  // 폴백 API
  app.get('/api/public/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Fallback API active',
      timestamp: new Date().toISOString(),
      server: 'simple-server.js'
    });
  });
  
  app.get('/api/public/personality-types', (req, res) => {
    res.json({
      success: true,
      data: {
        "VISIONARY": { description: "Big picture thinker" },
        "EXPLORER": { description: "Adventurous spirit" },
        "CURATOR": { description: "Thoughtful collector" },
        "SOCIAL": { description: "Community-minded enthusiast" }
      },
      fallback: true
    });
  });
}

// API 문서 (단순한 버전)
app.get('/api-docs', (req, res) => {
  res.json({
    title: 'SAYU Public API Documentation',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}`,
    endpoints: [
      {
        method: 'GET',
        path: '/api/public/health',
        description: 'API health check',
        auth: 'none',
        example: `curl ${req.protocol}://${req.get('host')}/api/public/health`
      },
      {
        method: 'GET', 
        path: '/api/public/personality-types',
        description: 'Get all personality types',
        auth: 'none',
        rateLimit: '100 requests per 15 minutes'
      },
      {
        method: 'POST',
        path: '/api/public/analyze-basic',
        description: 'Basic personality analysis',
        auth: 'none',
        body: { responses: ['array of strings'] }
      },
      {
        method: 'POST',
        path: '/api/public/analyze',
        description: 'Full personality analysis',
        auth: 'API key required',
        headers: { 'x-api-key': 'your-api-key' },
        body: { responses: ['array of strings'], userId: 'optional' }
      }
    ],
    testApiKey: 'sayu_test_key_123',
    contact: 'contact@sayu.art'
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    availableEndpoints: [
      '/',
      '/api/health', 
      '/api/public/health',
      '/api/public/personality-types',
      '/api-docs'
    ]
  });
});

// 서버 시작
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SAYU Simple Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🎨 Public API: http://localhost:${PORT}/api/public/health`);
  console.log(`🌍 Open to external connections on 0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;