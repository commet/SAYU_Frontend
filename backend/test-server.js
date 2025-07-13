require('dotenv').config();
const express = require('express');

console.log('🚀 테스트 서버 시작 중...');

const app = express();
const PORT = process.env.PORT || 3001;

// 간단한 health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다!`);
  console.log(`🔗 http://localhost:${PORT}/api/health`);
});