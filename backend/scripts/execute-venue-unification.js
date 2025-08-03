#!/usr/bin/env node

/**
 * SAYU Venue & Exhibition Unification Script
 * 모든 venue/exhibition 데이터를 통합 시스템으로 마이그레이션
 */

const fs = require('fs');
const path = require('path');
// 기존 데이터베이스 설정 사용
const { pool } = require('../src/config/database');

async function executeSQL(sqlContent, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    await pool.query(sqlContent);
    console.log(`✅ ${description} 완료`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} 실패:`, error.message);
    return false;
  }
}

async function checkDataConsistency() {
  console.log('\n📊 데이터 정합성 검증 중...');
  
  try {
    // 통합 전후 데이터 개수 비교
    const oldVenuesCount = await pool.query('SELECT COUNT(*) FROM venues');
    const oldExhibitionsCount = await pool.query('SELECT COUNT(*) FROM exhibitions');
    const globalVenuesCount = await pool.query('SELECT COUNT(*) FROM global_venues');
    const globalExhibitionsCount = await pool.query('SELECT COUNT(*) FROM global_exhibitions');
    
    const newVenuesCount = await pool.query('SELECT COUNT(*) FROM venues_unified');
    const newExhibitionsCount = await pool.query('SELECT COUNT(*) FROM exhibitions_unified');
    
    console.log('\n📈 데이터 마이그레이션 결과:');
    console.log(`  기존 venues: ${oldVenuesCount.rows[0].count}`);
    console.log(`  기존 global_venues: ${globalVenuesCount.rows[0].count}`);
    console.log(`  ➡️  통합 venues_unified: ${newVenuesCount.rows[0].count}`);
    console.log('');
    console.log(`  기존 exhibitions: ${oldExhibitionsCount.rows[0].count}`);
    console.log(`  기존 global_exhibitions: ${globalExhibitionsCount.rows[0].count}`);
    console.log(`  ➡️  통합 exhibitions_unified: ${newExhibitionsCount.rows[0].count}`);
    
    // 고아 레코드 확인
    const orphanedExhibitions = await pool.query(`
      SELECT COUNT(*) FROM exhibitions_unified e 
      WHERE NOT EXISTS (SELECT 1 FROM venues_unified v WHERE v.id = e.venue_id)
    `);
    
    if (parseInt(orphanedExhibitions.rows[0].count) > 0) {
      console.warn(`⚠️  고아 전시 레코드 ${orphanedExhibitions.rows[0].count}개 발견`);
    }
    
    // 도시별 통계
    const cityStats = await pool.query(`
      SELECT venue_city, COUNT(*) as count 
      FROM exhibitions_unified 
      GROUP BY venue_city 
      ORDER BY count DESC 
      LIMIT 5
    `);
    
    console.log('\n🏙️  상위 5개 도시별 전시 수:');
    cityStats.rows.forEach(row => {
      console.log(`  ${row.venue_city}: ${row.count}개`);
    });
    
    return true;
  } catch (error) {
    console.error('데이터 정합성 검증 실패:', error.message);
    return false;
  }
}

async function cleanupOldTables() {
  console.log('\n🧹 기존 테이블 정리 작업...');
  
  const cleanupQueries = [
    {
      sql: 'DROP TABLE IF EXISTS "Venues" CASCADE',
      description: 'Sequelize Venues 테이블 삭제'
    },
    {
      sql: 'DROP TABLE IF EXISTS "Exhibitions" CASCADE',
      description: 'Sequelize Exhibitions 테이블 삭제'
    },
    {
      sql: 'ALTER TABLE global_venues RENAME TO global_venues_legacy',
      description: 'global_venues를 legacy로 이름 변경'
    },
    {
      sql: 'ALTER TABLE global_exhibitions RENAME TO global_exhibitions_legacy',
      description: 'global_exhibitions를 legacy로 이름 변경'
    }
  ];
  
  for (const query of cleanupQueries) {
    try {
      await pool.query(query.sql);
      console.log(`✅ ${query.description}`);
    } catch (error) {
      console.warn(`⚠️  ${query.description} 건너뛰기: ${error.message}`);
    }
  }
}

async function createIndexesAndOptimizations() {
  console.log('\n⚡ 성능 최적화 인덱스 생성...');
  
  const optimizationQueries = [
    // 추가 성능 인덱스
    'CREATE INDEX IF NOT EXISTS idx_venues_unified_name_search ON venues_unified USING gin(to_tsvector(\'korean\', name));',
    'CREATE INDEX IF NOT EXISTS idx_venues_unified_location ON venues_unified(country, city, district);',
    'CREATE INDEX IF NOT EXISTS idx_venues_unified_rating_tier ON venues_unified(rating DESC, tier ASC);',
    
    'CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_title_search ON exhibitions_unified USING gin(to_tsvector(\'korean\', title));',
    'CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_dates ON exhibitions_unified(start_date, end_date);',
    'CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_status_dates ON exhibitions_unified(status, start_date);',
    'CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_personality ON exhibitions_unified USING gin(personality_matches);',
    'CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_recommendation ON exhibitions_unified(recommendation_score DESC, featured DESC);',
    
    // 통계용 인덱스
    'CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_stats ON exhibitions_unified(venue_city, venue_country, status);'
  ];
  
  for (const query of optimizationQueries) {
    try {
      await pool.query(query);
      console.log('✅ 인덱스 생성 완료');
    } catch (error) {
      console.warn(`⚠️  인덱스 생성 건너뛰기: ${error.message.substring(0, 100)}...`);
    }
  }
}

async function updateSystemStatus() {
  console.log('\n📝 시스템 상태 업데이트...');
  
  try {
    // 전시 상태 업데이트
    const UnifiedExhibitionModel = require('../src/models/unifiedExhibitionModel');
    const statusUpdateResults = await UnifiedExhibitionModel.updateStatuses();
    
    console.log('📅 전시 상태 업데이트 결과:');
    console.log(`  종료로 변경: ${statusUpdateResults.ended}개`);
    console.log(`  진행중으로 변경: ${statusUpdateResults.ongoing}개`);
    console.log(`  예정으로 변경: ${statusUpdateResults.upcoming}개`);
    
    // venue 전시 수 업데이트
    await pool.query(`
      UPDATE venues_unified SET exhibition_count = (
        SELECT COUNT(*) FROM exhibitions_unified 
        WHERE venue_id = venues_unified.id 
        AND verification_status = 'verified'
        AND visibility = 'public'
      )
    `);
    
    console.log('✅ Venue 전시 개수 업데이트 완료');
    
    return true;
  } catch (error) {
    console.error('시스템 상태 업데이트 실패:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 SAYU 통합 Venue & Exhibition 시스템 마이그레이션 시작');
  console.log('=' * 60);
  
  try {
    // 1. SQL 마이그레이션 스크립트 실행
    const migrationPath = path.join(__dirname, '../migrations/99-unified-venue-exhibition-system.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ 마이그레이션 SQL 파일을 찾을 수 없습니다:', migrationPath);
      process.exit(1);
    }
    
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    const success = await executeSQL(sqlContent, '통합 테이블 생성 및 데이터 마이그레이션');
    
    if (!success) {
      console.error('❌ 마이그레이션 실패로 중단');
      process.exit(1);
    }
    
    // 2. 데이터 정합성 검증
    await checkDataConsistency();
    
    // 3. 성능 최적화
    await createIndexesAndOptimizations();
    
    // 4. 시스템 상태 업데이트
    await updateSystemStatus();
    
    // 5. 기존 테이블 정리 (선택사항)
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('\n❓ 기존 테이블들을 정리하시겠습니까? (y/N): ', resolve);
    });
    
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      await cleanupOldTables();
    } else {
      console.log('ℹ️  기존 테이블은 백업용으로 유지됩니다.');
    }
    
    rl.close();
    
    // 6. 최종 통계
    const finalStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM venues_unified) as venues_count,
        (SELECT COUNT(*) FROM exhibitions_unified) as exhibitions_count,
        (SELECT COUNT(*) FROM exhibitions_unified WHERE status = 'ongoing') as ongoing_count,
        (SELECT COUNT(DISTINCT venue_city) FROM exhibitions_unified) as cities_count
    `);
    
    const stats = finalStats.rows[0];
    
    console.log('\n🎉 마이그레이션 완료!');
    console.log('=' * 60);
    console.log(`📍 총 베뉴: ${stats.venues_count}개`);
    console.log(`🎨 총 전시: ${stats.exhibitions_count}개`);
    console.log(`🔴 진행중 전시: ${stats.ongoing_count}개`);
    console.log(`🏙️  전시 도시: ${stats.cities_count}개`);
    console.log('');
    console.log('✨ 새로운 API 엔드포인트:');
    console.log('  GET /api/exhibitions/ongoing - 진행중인 전시');
    console.log('  GET /api/exhibitions/upcoming - 다가오는 전시');
    console.log('  GET /api/exhibitions/trending - 트렌딩 전시');
    console.log('  GET /api/exhibitions/personality-recommendations - SAYU 개성별 추천');
    console.log('  GET /api/venues - 통합 베뉴 목록 (필터링 강화)');
    
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 스크립트가 직접 실행될 때만 main() 함수 호출
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeSQL, checkDataConsistency, cleanupOldTables };