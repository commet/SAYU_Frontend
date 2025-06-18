#!/usr/bin/env node

// Public API만 테스트하는 간단한 서버
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3333;

// 기본 미들웨어
app.use(express.json());
app.use(cors());

// Public API Routes만 추가
try {
  const publicApiRoutes = require('./src/routes/public-api');
  app.use('/api/public', publicApiRoutes);
  console.log('✅ Public API routes loaded');
} catch (error) {
  console.error('❌ Failed to load public API routes:', error.message);
  process.exit(1);
}

// 기본 루트
app.get('/', (req, res) => {
  res.json({
    message: 'SAYU Public API Test Server',
    endpoints: [
      'GET /api/public/health',
      'GET /api/public/personality-types',
      'POST /api/public/analyze-basic',
      'POST /api/public/analyze (requires API key)',
      'POST /api/public/recommend (requires API key)'
    ],
    testApiKey: 'sayu_test_key_123'
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 SAYU Public API Test Server running on port ${PORT}`);
  console.log(`📖 Visit http://localhost:${PORT} for endpoint list`);
  console.log(`🔑 Test API Key: sayu_test_key_123`);
  
  // 헬스 체크 테스트
  console.log('\n🧪 Testing endpoints...');
  setTimeout(() => {
    testEndpoints();
  }, 1000);
});

// 엔드포인트 테스트 함수
async function testEndpoints() {
  const axios = require('axios').default;
  const baseURL = `http://localhost:${PORT}`;
  
  try {
    // 1. 헬스 체크
    console.log('Testing /api/public/health...');
    const healthResponse = await axios.get(`${baseURL}/api/public/health`);
    console.log('✅ Health check:', healthResponse.data.status);
    
    // 2. 성격 유형 조회
    console.log('Testing /api/public/personality-types...');
    const typesResponse = await axios.get(`${baseURL}/api/public/personality-types`);
    console.log('✅ Personality types:', Object.keys(typesResponse.data.data).length, 'types');
    
    // 3. 기본 분석
    console.log('Testing /api/public/analyze-basic...');
    const basicAnalysisResponse = await axios.post(`${baseURL}/api/public/analyze-basic`, {
      responses: ['새로운 스타일 선호', '혁신적인 작품 좋아함', '미래지향적 예술']
    });
    console.log('✅ Basic analysis:', basicAnalysisResponse.data.data.primaryType);
    
    // 4. 프리미엄 분석 (API 키 필요)
    console.log('Testing /api/public/analyze with API key...');
    const premiumAnalysisResponse = await axios.post(`${baseURL}/api/public/analyze`, {
      responses: ['혁신적', '실험적', '미래적'],
      userId: 'test-user'
    }, {
      headers: {
        'x-api-key': 'sayu_test_key_123'
      }
    });
    console.log('✅ Premium analysis:', premiumAnalysisResponse.data.data.personalityType);
    
    console.log('\n🎉 All tests passed! Public API is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}