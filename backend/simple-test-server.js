#!/usr/bin/env node

// Simple test server for API connection testing
const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🧪 Starting Simple Test Server...');

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Simple test server is running'
  });
});

// Quiz routes (simplified)
app.post('/api/quiz/start', (req, res) => {
  res.json({
    success: true,
    sessionId: 'test-session-' + Date.now(),
    message: 'Quiz session started (test mode)'
  });
});

app.post('/api/quiz/answer', (req, res) => {
  const { questionId, answer, sessionId } = req.body;
  res.json({
    success: true,
    message: `Answer ${answer} for question ${questionId} received`,
    sessionId
  });
});

app.post('/api/quiz/complete', (req, res) => {
  res.json({
    success: true,
    result: {
      aptType: 'INFP_호랑이',
      personalityDescription: '창의적이고 감성적인 예술 감상가',
      recommendation: '추상 표현주의와 인상주의 작품을 추천합니다'
    },
    message: 'Quiz completed (test mode)'
  });
});

// Exhibition routes (simplified)
app.get('/api/exhibitions', (req, res) => {
  res.json({
    success: true,
    exhibitions: [
      {
        id: 'test-1',
        title: '테스트 전시 1',
        artist: '테스트 아티스트',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        venue: '테스트 갤러리',
        imageUrl: 'https://via.placeholder.com/400x300'
      },
      {
        id: 'test-2',
        title: '테스트 전시 2',
        artist: '테스트 아티스트 2',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        venue: '테스트 뮤지엄',
        imageUrl: 'https://via.placeholder.com/400x300'
      }
    ],
    total: 2,
    message: 'Exhibition data (test mode)'
  });
});

app.get('/api/exhibitions/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    exhibition: {
      id,
      title: `테스트 전시 ${id}`,
      artist: '테스트 아티스트',
      description: '이것은 테스트용 전시입니다.',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      venue: '테스트 갤러리',
      imageUrl: 'https://via.placeholder.com/400x300'
    },
    message: 'Exhibition detail (test mode)'
  });
});

// Catch all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found in test server`,
    availableRoutes: [
      'GET /health',
      'POST /api/quiz/start',
      'POST /api/quiz/answer', 
      'POST /api/quiz/complete',
      'GET /api/exhibitions',
      'GET /api/exhibitions/:id'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🟢 Simple test server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Quiz API: http://localhost:${PORT}/api/quiz/*`);
  console.log(`🎨 Exhibition API: http://localhost:${PORT}/api/exhibitions`);
});