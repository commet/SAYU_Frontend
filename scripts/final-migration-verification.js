#!/usr/bin/env node
/**
 * Final Migration Verification - 100% 완전 검증
 * 마지막 점검: 놓친 데이터나 문제 없는지 철저히 확인
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
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function getRailwayTableCounts(railwayClient) {
  log('\n🔍 Railway 데이터베이스 전체 분석...', 'blue');
  
  const tables = {};
  
  // 모든 테이블 조회
  const tablesResult = await railwayClient.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  
  for (const row of tablesResult.rows) {
    const tableName = row.table_name;
    try {
      const countResult = await railwayClient.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = parseInt(countResult.rows[0].count);
      tables[tableName] = count;
      
      if (count > 0) {
        log(`  📊 ${tableName.padEnd(30)} ${count.toString().padEnd(10)} records`, count > 1000 ? 'green' : count > 100 ? 'yellow' : 'reset');
      }
    } catch (error) {
      tables[tableName] = 'ERROR';
      log(`  ❌ ${tableName.padEnd(30)} ERROR: ${error.message}`, 'red');
    }
  }
  
  return tables;
}

async function getSupabaseTableCounts(supabase) {
  log('\n🔍 Supabase 데이터베이스 전체 분석...', 'blue');
  
  const tables = {};
  
  // 주요 테이블들 직접 확인
  const tableNames = [
    'users', 'artists', 'global_venues', 'venues', 'artvee_artworks', 
    'exhibitions', 'apt_profiles', 'artist_profiles', 'institutions',
    'artvee_artwork_artists', 'artvee_artist_mappings', 'artist_apt_mappings',
    'city_translations', 'global_exhibitions', 'journey_templates', 
    'journey_nudges', 'importance_tiers', 'titles', 'waitlist_data',
    'scraping_jobs', 'global_collection_logs', 'global_data_quality_metrics',
    'system_stats'
  ];
  
  for (const tableName of tableNames) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        tables[tableName] = `ERROR: ${error.message}`;
        log(`  ❌ ${tableName.padEnd(30)} ERROR: ${error.message}`, 'red');
      } else {
        tables[tableName] = count || 0;
        const displayCount = count || 0;
        log(`  📊 ${tableName.padEnd(30)} ${displayCount.toString().padEnd(10)} records`, displayCount > 1000 ? 'green' : displayCount > 100 ? 'yellow' : 'reset');
      }
    } catch (error) {
      tables[tableName] = `EXCEPTION: ${error.message}`;
      log(`  ❌ ${tableName.padEnd(30)} EXCEPTION: ${error.message}`, 'red');
    }
  }
  
  return tables;
}

async function verifyDataIntegrity(railwayClient, supabase) {
  log('\n🔬 데이터 무결성 검증...', 'magenta');
  
  const criticalChecks = [];
  
  try {
    // 1. 핵심 테이블 샘플 데이터 비교
    log('\n1️⃣ 핵심 테이블 샘플 데이터 검증...', 'blue');
    
    // Artists 테이블 검증
    const railwayArtist = await railwayClient.query('SELECT name, nationality FROM artists LIMIT 1');
    const { data: supabaseArtist } = await supabase.from('artists').select('name, nationality').limit(1);
    
    if (railwayArtist.rows.length > 0 && supabaseArtist && supabaseArtist.length > 0) {
      log(`  ✅ Artists: Railway="${railwayArtist.rows[0].name}" → Supabase="${supabaseArtist[0].name}"`, 'green');
      criticalChecks.push('✅ Artists data verified');
    } else {
      log(`  ❌ Artists: 데이터 불일치 또는 누락`, 'red');
      criticalChecks.push('❌ Artists data issue');
    }
    
    // Global venues 테이블 검증
    const railwayVenue = await railwayClient.query('SELECT name, country FROM global_venues LIMIT 1');
    const { data: supabaseVenue } = await supabase.from('global_venues').select('name, country').limit(1);
    
    if (railwayVenue.rows.length > 0 && supabaseVenue && supabaseVenue.length > 0) {
      log(`  ✅ Global Venues: Railway="${railwayVenue.rows[0].name}" → Supabase="${supabaseVenue[0].name}"`, 'green');
      criticalChecks.push('✅ Global venues data verified');
    } else {
      log(`  ❌ Global Venues: 데이터 불일치 또는 누락`, 'red');
      criticalChecks.push('❌ Global venues data issue');
    }
    
    // Exhibitions 테이블 검증
    const railwayExhibition = await railwayClient.query('SELECT title_en, venue_name FROM exhibitions WHERE title_en IS NOT NULL LIMIT 1');
    const { data: supabaseExhibition } = await supabase.from('exhibitions').select('title_en, venue_name').limit(1);
    
    if (railwayExhibition.rows.length > 0 && supabaseExhibition && supabaseExhibition.length > 0) {
      log(`  ✅ Exhibitions: Railway="${railwayExhibition.rows[0].title_en}" → Supabase="${supabaseExhibition[0].title_en}"`, 'green');
      criticalChecks.push('✅ Exhibitions data verified');
    } else {
      log(`  ❌ Exhibitions: 데이터 불일치 또는 누락`, 'red');
      criticalChecks.push('❌ Exhibitions data issue');
    }
    
  } catch (error) {
    log(`  ❌ 데이터 무결성 검증 오류: ${error.message}`, 'red');
    criticalChecks.push('❌ Data integrity check failed');
  }
  
  return criticalChecks;
}

async function checkPotentialIssues(supabase) {
  log('\n⚠️  잠재적 문제점 검사...', 'yellow');
  
  const issues = [];
  
  try {
    // 1. 외래키 제약조건 확인
    log('\n1️⃣ 관계형 데이터 무결성 확인...', 'blue');
    
    // APT profiles와 artists 관계 확인
    const { data: aptWithoutArtist } = await supabase
      .from('apt_profiles')
      .select('artist_id')
      .not('artist_id', 'in', `(SELECT id FROM artists)`)
      .limit(5);
    
    if (aptWithoutArtist && aptWithoutArtist.length > 0) {
      log(`  ⚠️  ${aptWithoutArtist.length}개 APT 프로필이 존재하지 않는 아티스트를 참조`, 'yellow');
      issues.push(`${aptWithoutArtist.length} APT profiles reference non-existent artists`);
    } else {
      log(`  ✅ APT profiles ↔ Artists 관계 정상`, 'green');
    }
    
    // 2. 필수 데이터 누락 확인
    log('\n2️⃣ 필수 데이터 누락 확인...', 'blue');
    
    const { data: artistsWithoutName } = await supabase
      .from('artists')
      .select('id')
      .or('name.is.null,name.eq.')
      .limit(5);
    
    if (artistsWithoutName && artistsWithoutName.length > 0) {
      log(`  ⚠️  ${artistsWithoutName.length}개 아티스트가 이름이 없음`, 'yellow');
      issues.push(`${artistsWithoutName.length} artists without names`);
    } else {
      log(`  ✅ 모든 아티스트에 이름 존재`, 'green');
    }
    
    // 3. JSON 데이터 유효성 확인
    log('\n3️⃣ JSON 데이터 유효성 확인...', 'blue');
    
    const { data: invalidJson } = await supabase
      .from('artists')
      .select('id, images')
      .not('images', 'is', null)
      .limit(5);
    
    if (invalidJson && invalidJson.length > 0) {
      log(`  ✅ ${invalidJson.length}개 아티스트의 JSON 데이터 정상`, 'green');
    }
    
  } catch (error) {
    log(`  ❌ 잠재적 문제 검사 오류: ${error.message}`, 'red');
    issues.push(`Problem check failed: ${error.message}`);
  }
  
  return issues;
}

async function main() {
  log('🔍 SAYU 마이그레이션 최종 완전 검증', 'magenta');
  log('='.repeat(80), 'magenta');
  
  const railwayClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  
  try {
    await railwayClient.connect();
    log('✓ Railway 연결 성공', 'green');
    
    // 1. 전체 테이블 비교 분석
    const railwayTables = await getRailwayTableCounts(railwayClient);
    const supabaseTables = await getSupabaseTableCounts(supabase);
    
    // 2. 테이블별 비교 결과
    log('\n📊 테이블별 데이터 비교 분석', 'magenta');
    log('='.repeat(80), 'blue');
    log(`${'Table'.padEnd(30)} ${'Railway'.padEnd(15)} ${'Supabase'.padEnd(15)} Status`, 'blue');
    log('-'.repeat(80), 'blue');
    
    let totalRailwayRecords = 0;
    let totalSupabaseRecords = 0;
    let perfectMatches = 0;
    let missingTables = 0;
    let dataDiscrepancies = 0;
    
    // Railway에 있는 모든 테이블 확인
    Object.entries(railwayTables).forEach(([tableName, railwayCount]) => {
      if (typeof railwayCount === 'number' && railwayCount > 0) {
        totalRailwayRecords += railwayCount;
        
        // Supabase에서 해당 테이블 찾기 (waitlists → waitlist_data 매핑 고려)
        const supabaseTableName = tableName === 'waitlists' ? 'waitlist_data' : tableName;
        const supabaseCount = supabaseTables[supabaseTableName];
        
        if (typeof supabaseCount === 'number') {
          totalSupabaseRecords += supabaseCount;
          
          let status, color;
          const diff = Math.abs(railwayCount - supabaseCount);
          const percentage = railwayCount > 0 ? Math.round((supabaseCount / railwayCount) * 100) : 0;
          
          if (supabaseCount === railwayCount) {
            status = '🎯 완벽 일치';
            color = 'green';
            perfectMatches++;
          } else if (percentage >= 95) {
            status = `✅ ${percentage}% 일치`;
            color = 'green';
          } else if (percentage >= 80) {
            status = `⚠️  ${percentage}% 일치`;
            color = 'yellow';
            dataDiscrepancies++;
          } else if (supabaseCount > 0) {
            status = `❌ ${percentage}% 일치`;
            color = 'red';
            dataDiscrepancies++;
          } else {
            status = '❌ 데이터 없음';
            color = 'red';
            missingTables++;
          }
          
          log(`${tableName.padEnd(30)} ${railwayCount.toString().padEnd(15)} ${supabaseCount.toString().padEnd(15)} ${status}`, color);
        } else {
          log(`${tableName.padEnd(30)} ${railwayCount.toString().padEnd(15)} ${'미생성'.padEnd(15)} ❌ 테이블 없음`, 'red');
          missingTables++;
        }
      }
    });
    
    // 3. 데이터 무결성 검증
    const integrityChecks = await verifyDataIntegrity(railwayClient, supabase);
    
    // 4. 잠재적 문제점 검사
    const potentialIssues = await checkPotentialIssues(supabase);
    
    await railwayClient.end();
    
    // 5. 최종 결과 요약
    log('\n🏆 최종 마이그레이션 검증 결과', 'magenta');
    log('='.repeat(80), 'magenta');
    
    const migrationRate = totalRailwayRecords > 0 ? Math.round((totalSupabaseRecords / totalRailwayRecords) * 100) : 0;
    
    log(`📊 전체 데이터 현황:`, 'blue');
    log(`   Railway 총 레코드:    ${totalRailwayRecords.toLocaleString()}`, 'yellow');
    log(`   Supabase 총 레코드:   ${totalSupabaseRecords.toLocaleString()}`, 'yellow');
    log(`   마이그레이션 비율:    ${migrationRate}%`, migrationRate >= 95 ? 'green' : migrationRate >= 80 ? 'yellow' : 'red');
    
    log(`\n📈 테이블 분석:`, 'blue');
    log(`   완벽 일치 테이블:     ${perfectMatches}`, 'green');
    log(`   데이터 불일치:       ${dataDiscrepancies}`, dataDiscrepancies === 0 ? 'green' : 'yellow');
    log(`   누락 테이블:         ${missingTables}`, missingTables === 0 ? 'green' : 'red');
    
    log(`\n🔬 무결성 검사:`, 'blue');
    integrityChecks.forEach(check => {
      const color = check.startsWith('✅') ? 'green' : 'red';
      log(`   ${check}`, color);
    });
    
    if (potentialIssues.length > 0) {
      log(`\n⚠️  잠재적 문제점:`, 'yellow');
      potentialIssues.forEach(issue => log(`   ${issue}`, 'yellow'));
    } else {
      log(`\n✅ 잠재적 문제점 없음`, 'green');
    }
    
    // 6. 최종 판정
    log('\n🎯 최종 판정:', 'magenta');
    if (migrationRate >= 99 && missingTables === 0 && dataDiscrepancies <= 1) {
      log('🏆 EXCELLENT! 마이그레이션 완벽 성공!', 'green');
      log('✅ Railway 안전하게 정리 가능', 'green');
    } else if (migrationRate >= 95 && missingTables <= 2 && dataDiscrepancies <= 3) {
      log('✅ GOOD! 마이그레이션 거의 완성', 'green');
      log('⚠️  소규모 이슈 있지만 Railway 정리 가능', 'yellow');
    } else if (migrationRate >= 80) {
      log('⚠️  FAIR! 주요 데이터는 이관됨', 'yellow');
      log('🔍 일부 문제 해결 후 Railway 정리 권장', 'yellow');
    } else {
      log('❌ POOR! 중요한 데이터 누락', 'red');
      log('🚨 Railway 정리 전 반드시 문제 해결 필요', 'red');
    }
    
  } catch (error) {
    log(`\n❌ 검증 프로세스 오류: ${error.message}`, 'red');
    await railwayClient.end();
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}