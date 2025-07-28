// 🎨 SAYU Minimal Server
// 최소한의 기능만으로 서버 시작

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Initialize hybrid database
const { hybridDB } = require('./config/hybridDatabase');

// Import only essential routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const artworkRoutes = require('./routes/artworks');
const profileRoutes = require('./routes/profile');
const achievementsRoutes = require('./routes/achievements');
const gamificationRoutes = require('./routes/gamification');

const app = express();

// Middleware
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Attach hybridDB to all requests
app.use((req, res, next) => {
  req.hybridDB = hybridDB;
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {
      supabase: hybridDB.supabase ? 'connected' : 'disconnected',
      railway: 'connected'
    }
  });
});

// Mount essential routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/gamification', gamificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
