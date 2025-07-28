require('dotenv').config();
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

console.log('=== Railway vs Supabase 데이터 비교 ===');

// Railway 설정
const railwayPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Supabase 설정
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function compareData() {
  try {
    console.log('\n1. 핵심 테이블 데이터 수 비교...');
    
    const tables = ['users', 'apt_profiles', 'quiz_sessions', 'art_profiles'];
    
    for (const table of tables) {
      try {
        // Railway 데이터 수
        const railwayResult = await railwayPool.query(`SELECT COUNT(*) as count FROM ${table}`);
        const railwayCount = parseInt(railwayResult.rows[0].count);
        
        // Supabase 데이터 수
        const { count: supabaseCount } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        const status = railwayCount === supabaseCount ? '✅' : '⚠️';
        console.log(`   ${status} ${table}:`);
        console.log(`      Railway: ${railwayCount}행`);
        console.log(`      Supabase: ${supabaseCount}행`);
        
        if (railwayCount !== supabaseCount) {
          console.log(`      → 차이: ${Math.abs(railwayCount - supabaseCount)}행`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${table}: 비교 실패 - ${error.message}`);
      }
    }
    
    console.log('\n2. 사용자 데이터 상세 비교...');
    
    // Railway 사용자 목록
    const railwayUsers = await railwayPool.query(
      'SELECT id, email, nickname, created_at FROM users ORDER BY created_at'
    );
    
    // Supabase 사용자 목록
    const { data: supabaseUsers } = await supabase
      .from('users')
      .select('id, email, nickname, created_at')
      .order('created_at');
    
    console.log('   Railway 사용자:');
    railwayUsers.rows.forEach((user, i) => {
      console.log(`     ${i+1}. ${user.email} (${user.nickname}) - ${user.created_at.toISOString().slice(0,10)}`);
    });
    
    console.log('\n   Supabase 사용자:');
    supabaseUsers?.forEach((user, i) => {
      console.log(`     ${i+1}. ${user.email} (${user.nickname}) - ${user.created_at.slice(0,10)}`);
    });
    
    // 데이터 일치성 확인
    const railwayEmails = railwayUsers.rows.map(u => u.email).sort();
    const supabaseEmails = supabaseUsers?.map(u => u.email).sort() || [];
    
    const isUsersSynced = JSON.stringify(railwayEmails) === JSON.stringify(supabaseEmails);
    console.log(`\n   사용자 동기화 상태: ${isUsersSynced ? '✅ 완전 동기화' : '⚠️ 동기화 필요'}`);
    
    if (!isUsersSynced) {
      const railwayOnly = railwayEmails.filter(e => !supabaseEmails.includes(e));
      const supabaseOnly = supabaseEmails.filter(e => !railwayEmails.includes(e));
      
      if (railwayOnly.length > 0) {
        console.log('   Railway에만 있는 사용자:', railwayOnly);
      }
      if (supabaseOnly.length > 0) {
        console.log('   Supabase에만 있는 사용자:', supabaseOnly);
      }
    }
    
  } catch (error) {
    console.log('❌ 비교 실패:', error.message);
  } finally {
    await railwayPool.end();
    process.exit(0);
  }
}

compareData();