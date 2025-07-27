// Pioneer 및 Journey API 테스트
require('dotenv').config();
const { Client } = require('pg');
const express = require('express');

const app = express();
app.use(express.json());

// 데이터베이스 연결
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') 
    ? { rejectUnauthorized: false }
    : false
});

async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Pioneer 통계 API
app.get('/api/pioneer/stats', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_pioneers,
        MAX(pioneer_number) as latest_pioneer_number,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as new_today,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week
      FROM users 
      WHERE pioneer_number IS NOT NULL
    `);

    if (result.rows.length === 0) {
      return res.json({
        total_pioneers: 0,
        latest_pioneer_number: 0,
        new_today: 0,
        new_this_week: 0
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Pioneer stats error:', error);
    res.status(500).json({ error: 'Failed to fetch pioneer statistics' });
  }
});

// 테스트 사용자 생성 API
app.post('/api/test/create-pioneer', async (req, res) => {
  try {
    const testEmail = `pioneer_test_${Date.now()}@test.com`;
    
    const result = await client.query(`
      INSERT INTO users (email, password_hash, nickname, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, pioneer_number, email, nickname, created_at
    `, [testEmail, 'test_hash', 'Test Pioneer']);

    console.log('✅ Test Pioneer created:', result.rows[0]);
    res.json({
      message: 'Test Pioneer created',
      pioneer: result.rows[0]
    });
  } catch (error) {
    console.error('Create test pioneer error:', error);
    res.status(500).json({ error: 'Failed to create test pioneer' });
  }
});

// Journey 템플릿 조회 API
app.get('/api/journey/templates', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT day_number, nudge_type, title_ko, title_en, message_ko, message_en
      FROM journey_templates
      WHERE is_active = true
      ORDER BY day_number
    `);

    res.json({
      templates: result.rows,
      total_days: result.rows.length
    });
  } catch (error) {
    console.error('Journey templates error:', error);
    res.status(500).json({ error: 'Failed to fetch journey templates' });
  }
});

// 홈 엔드포인트
app.get('/', (req, res) => {
  res.json({
    service: 'SAYU Pioneer & Journey Test Server',
    version: '1.0.0',
    endpoints: [
      'GET /api/pioneer/stats - Pioneer 통계',
      'POST /api/test/create-pioneer - 테스트 Pioneer 생성',
      'GET /api/journey/templates - 여정 템플릿 조회'
    ]
  });
});

const PORT = 3006;

async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 SAYU Test Server running on http://localhost:${PORT}`);
    console.log('📊 Available endpoints:');
    console.log(`   GET  http://localhost:${PORT}/api/pioneer/stats`);
    console.log(`   POST http://localhost:${PORT}/api/test/create-pioneer`);
    console.log(`   GET  http://localhost:${PORT}/api/journey/templates`);
  });
}

startServer();