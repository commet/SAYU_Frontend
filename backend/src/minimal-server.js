const express = require('express');
const cron = require('node-cron');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cron-worker' });
});

// 이메일 크론 작업들
const emailJobs = {
  // 주간 인사이트 이메일 (일요일 오전 9시)
  weeklyInsights: cron.schedule('0 9 * * 0', async () => {
    console.log('Running weekly insights email job...');
    try {
      // Supabase에서 활성 사용자 가져오기
      const { rows: users } = await pool.query(`
        SELECT id, email, personality_type 
        FROM profiles 
        WHERE email_preferences->>'weekly_insights' = 'true'
      `);
      
      // 이메일 발송 로직
      for (const user of users) {
        // TODO: 실제 이메일 발송 구현
        console.log(`Sending weekly insights to ${user.email}`);
      }
    } catch (error) {
      console.error('Weekly insights job error:', error);
    }
  }),

  // 재참여 이메일 (매일 오전 10시)
  reEngagement: cron.schedule('0 10 * * *', async () => {
    console.log('Running re-engagement email job...');
    try {
      const { rows: inactiveUsers } = await pool.query(`
        SELECT id, email 
        FROM profiles 
        WHERE last_login < NOW() - INTERVAL '30 days'
        AND email_preferences->>'re_engagement' = 'true'
      `);
      
      for (const user of inactiveUsers) {
        console.log(`Sending re-engagement email to ${user.email}`);
      }
    } catch (error) {
      console.error('Re-engagement job error:', error);
    }
  }),

  // 월간 큐레이터 추천 (매월 1일 오전 8시)
  monthlyCurator: cron.schedule('0 8 1 * *', async () => {
    console.log('Running monthly curator picks job...');
    try {
      const { rows: users } = await pool.query(`
        SELECT id, email, personality_type 
        FROM profiles 
        WHERE email_preferences->>'monthly_picks' = 'true'
      `);
      
      for (const user of users) {
        console.log(`Sending monthly picks to ${user.email}`);
      }
    } catch (error) {
      console.error('Monthly curator job error:', error);
    }
  })
};

// 박물관 데이터 동기화 (매일 새벽 3시)
const museumSyncJob = cron.schedule('0 3 * * *', async () => {
  console.log('Running museum data sync job...');
  try {
    // Met Museum API 동기화
    const metResponse = await fetch(
      'https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=11'
    );
    const metData = await metResponse.json();
    
    // 데이터 처리 및 저장
    console.log(`Synced ${metData.objectIDs?.length || 0} objects from Met Museum`);
    
    // Cleveland Museum API 동기화
    // Rijksmuseum API 동기화
    
  } catch (error) {
    console.error('Museum sync job error:', error);
  }
});

// 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Cron worker running on port ${PORT}`);
  console.log('📅 Scheduled jobs:');
  console.log('  - Weekly insights: Sundays 9 AM');
  console.log('  - Re-engagement: Daily 10 AM');
  console.log('  - Monthly curator: 1st of month 8 AM');
  console.log('  - Museum sync: Daily 3 AM');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  // 모든 크론 작업 중지
  Object.values(emailJobs).forEach(job => job.stop());
  museumSyncJob.stop();
  
  // 데이터베이스 연결 종료
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});