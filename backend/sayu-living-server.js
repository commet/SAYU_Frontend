#!/usr/bin/env node

// SAYU Production Server - Railway 배포용
// Full-featured backend server for production deployment

console.log('🚀 Starting SAYU Production Server...');

// 프로덕션 환경에서는 풀 서버 실행
if (process.env.NODE_ENV === 'production' || process.env.SAYU_MODE === 'full') {
  require('./src/server.js');
} else {
  // 개발 환경에서는 living mode 사용 가능
  console.log('📍 Running in Living Server mode (development)');
  require('./src/living-server-mode.js');
}