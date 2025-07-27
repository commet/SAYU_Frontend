#!/usr/bin/env node
/**
 * Complete Data Audit - Railway vs Supabase
 * 모든 테이블의 데이터 개수를 비교하여 누락된 것이 없는지 확인
 */
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function getAllRailwayTables() {
  const railwayClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await railwayClient.connect();
    
    // 모든 테이블 목록 가져오기
    const result = await railwayClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const tables = result.rows.map(row => row.table_name);
    log(`Railway에서 찾은 테이블: ${tables.length}개`, 'blue');
    
    // 각 테이블의 데이터 개수 확인
    const tableData = {};
    for (const table of tables) {
      try {
        const countResult = await railwayClient.query(`SELECT COUNT(*) as count FROM ${table}`);
        tableData[table] = parseInt(countResult.rows[0].count);
      } catch (error) {
        tableData[table] = `ERROR: ${error.message}`;
      }
    }
    
    await railwayClient.end();
    return tableData;
    
  } catch (error) {
    log(`Railway 연결 실패: ${error.message}`, 'red');
    await railwayClient.end();
    return {};
  }
}

async function getAllSupabaseTables() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    // Supabase에서 테이블 목록 가져오기 (REST API로)
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase API 접근 실패: ${response.status}`);
    }

    // 주요 테이블들의 데이터 개수 확인
    const importantTables = [
      'users', 'venues', 'exhibitions', 'quiz_sessions', 'quiz_results', 
      'art_profiles', 'artworks', 'exhibition_likes', 'exhibition_views'
    ];
    
    const tableData = {};
    
    for (const table of importantTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          tableData[table] = `ERROR: ${error.message}`;
        } else {
          tableData[table] = count;
        }
      } catch (error) {
        tableData[table] = `ERROR: ${error.message}`;
      }
    }
    
    return tableData;
    
  } catch (error) {
    log(`Supabase 연결 실패: ${error.message}`, 'red');
    return {};
  }
}

async function main() {
  log('🔍 완전한 데이터 감사 시작', 'blue');
  log('='.repeat(60), 'blue');

  try {
    // Railway 데이터 조사
    log('\n📊 Railway 데이터 조사 중...', 'yellow');
    const railwayData = await getAllRailwayTables();
    
    // Supabase 데이터 조사
    log('\n📊 Supabase 데이터 조사 중...', 'yellow');
    const supabaseData = await getAllSupabaseTables();
    
    // 비교 결과 출력
    log('\n📋 데이터 비교 결과:', 'blue');
    log('='.repeat(60), 'blue');
    
    // Railway에 있는 모든 테이블 출력
    log('\n🚄 Railway 전체 테이블 목록:', 'yellow');
    const sortedRailwayTables = Object.keys(railwayData).sort();
    for (const table of sortedRailwayTables) {
      const count = railwayData[table];
      if (typeof count === 'number' && count > 0) {
        log(`  ${table.padEnd(30)} ${count}개`, 'green');
      } else if (typeof count === 'number') {
        log(`  ${table.padEnd(30)} ${count}개`, 'blue');
      } else {
        log(`  ${table.padEnd(30)} ${count}`, 'red');
      }
    }
    
    // 주요 테이블 비교
    log('\n🔄 주요 테이블 마이그레이션 상태:', 'yellow');
    log('테이블명'.padEnd(20) + 'Railway'.padEnd(15) + 'Supabase'.padEnd(15) + '상태', 'blue');
    log('-'.repeat(60), 'blue');
    
    const importantTables = ['users', 'venues', 'exhibitions', 'quiz_sessions', 'quiz_results', 'art_profiles', 'artworks'];
    
    for (const table of importantTables) {
      const railwayCount = railwayData[table] || 0;
      const supabaseCount = supabaseData[table] || 0;
      
      let status = '';
      let color = 'green';
      
      if (typeof railwayCount === 'number' && typeof supabaseCount === 'number') {
        if (supabaseCount >= railwayCount) {
          status = '✅ 완료';
          color = 'green';
        } else if (supabaseCount > 0) {
          status = `⚠️  부분 (${Math.round(supabaseCount/railwayCount*100)}%)`;
          color = 'yellow';
        } else {
          status = '❌ 미완료';
          color = 'red';
        }
      } else {
        status = '❓ 확인불가';
        color = 'red';
      }
      
      log(
        `${table.padEnd(20)}${String(railwayCount).padEnd(15)}${String(supabaseCount).padEnd(15)}${status}`,
        color
      );
    }
    
    // 누락된 중요 테이블 찾기
    log('\n🚨 누락 가능성이 있는 테이블:', 'red');
    let hasMissing = false;
    
    for (const table of sortedRailwayTables) {
      const railwayCount = railwayData[table];
      if (typeof railwayCount === 'number' && railwayCount > 0) {
        const supabaseCount = supabaseData[table];
        if (!supabaseCount || supabaseCount === 0) {
          log(`  ❌ ${table}: Railway(${railwayCount}) → Supabase(0)`, 'red');
          hasMissing = true;
        }
      }
    }
    
    if (!hasMissing) {
      log('  ✅ 중요한 누락 없음!', 'green');
    }
    
    // 권장사항
    log('\n💡 권장사항:', 'yellow');
    log('1. status 제약 조건 제거 후 exhibitions 재마이그레이션', 'blue');
    log('2. 빈 테이블들도 스키마만 생성했는지 확인', 'blue');
    log('3. Railway 탈퇴 전 마지막 백업 생성', 'blue');
    
  } catch (error) {
    log(`\n❌ 감사 실패: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run audit
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { getAllRailwayTables, getAllSupabaseTables };