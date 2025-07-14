// SAYU Living Identity Server Mode - Railway 배포용
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3004;

// 기본 미들웨어
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://*.railway.app', 'https://*.vercel.app'],
  credentials: true
}));

// 전역 rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 2000, // 더 많은 요청 허용
  message: { error: 'Too many requests from this IP' }
});
app.use(globalLimiter);

// ===========================================
// SAYU LIVING IDENTITY API ENDPOINTS
// ===========================================

// 홈 페이지 - 새로운 기능 소개
app.get('/', (req, res) => {
  res.json({
    service: 'SAYU Living Identity API',
    version: '2.0.0',
    status: 'running',
    lastUpdated: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    features: {
      immersiveQuiz: 'Visual A/B choice quiz with gradients',
      livingIdentityCard: 'Evolving identity cards with progression',
      villageSystem: '4 art viewing style clusters',
      tokenEconomy: 'Quiz retake tokens and daily rewards',
      cardExchange: 'Social identity card trading',
      evolutionTracking: 'Identity growth and change monitoring'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'living',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Basic API endpoints for living mode
app.get('/api/personality-types', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, code: 'LAEF', name: 'Fox', description: 'Creative Explorer' },
      { id: 2, code: 'LAEC', name: 'Cat', description: 'Analytical Observer' }
      // Add more personality types as needed
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Living server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found in living mode' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎨 SAYU Living Identity Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🏘️ Village System: Active`);
  console.log(`🪙 Token Economy: Active`);
  console.log(`🔄 Evolution Tracking: Active`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});