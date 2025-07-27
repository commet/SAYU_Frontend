#!/usr/bin/env node

// SAYU MVP API 테스트 서버
// Pioneer, Journey, Calendar API만 간단하게 테스트

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 기본 미들웨어
app.use(express.json());
app.use(cors());

// Pioneer API 라우터 (실제 파일 사용)
try {
  const pioneerRoutes = require('./src/routes/pioneer');
  app.use('/api/pioneer', pioneerRoutes);
  console.log('✅ Pioneer API 라우터 연결됨');
} catch (error) {
  console.log('❌ Pioneer API 라우터 연결 실패:', error.message);
}

// Journey API 라우터 (실제 파일 사용)
try {
  const journeyRoutes = require('./src/routes/journey');
  app.use('/api/journey', journeyRoutes);
  console.log('✅ Journey API 라우터 연결됨');
} catch (error) {
  console.log('❌ Journey API 라우터 연결 실패:', error.message);
}

// 기본 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: 'test-server',
    apis: {
      pioneer: 'active',
      journey: 'active'
    }
  });
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    service: 'SAYU MVP Test Server',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'GET /api/pioneer/stats',
      'GET /api/pioneer/profile/:userId',
      'GET /api/journey/status (requires auth)',
      'GET /api/journey/todays-nudge (requires auth)'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SAYU MVP Test Server running on port ${PORT}`);
  console.log(`📍 Available at: http://localhost:${PORT}`);
});