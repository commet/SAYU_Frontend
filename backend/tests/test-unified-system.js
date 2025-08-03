#!/usr/bin/env node

/**
 * SAYU 통합 시스템 테스트
 * 마이그레이션 후 API와 모델들이 정상 작동하는지 확인
 */

const UnifiedVenueModel = require('../src/models/unifiedVenueModel');
const UnifiedExhibitionModel = require('../src/models/unifiedExhibitionModel');

// 색상 출력을 위한 헬퍼
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testVenueModel() {
  log('blue', '\n=== Venue Model 테스트 ===');
  
  try {
    // 1. 전체 베뉴 수 확인
    const allVenues = await UnifiedVenueModel.find({}, { limit: 5 });
    log('green', `✅ 베뉴 목록 조회: ${allVenues.venues.length}개 (총 ${allVenues.pagination.total}개)`);
    
    // 2. 서울 베뉴 검색
    const seoulVenues = await UnifiedVenueModel.find({ city: 'Seoul' }, { limit: 3 });
    log('green', `✅ 서울 베뉴 검색: ${seoulVenues.venues.length}개`);
    
    // 3. 갤러리 타입 필터링
    const galleries = await UnifiedVenueModel.find({ type: 'gallery' }, { limit: 3 });
    log('green', `✅ 갤러리 필터링: ${galleries.venues.length}개`);
    
    // 4. 텍스트 검색
    const searchResults = await UnifiedVenueModel.find({ search: '미술관' }, { limit: 3 });
    log('green', `✅ 텍스트 검색: ${searchResults.venues.length}개`);
    
    // 5. 첫 번째 베뉴 상세 조회
    if (allVenues.venues.length > 0) {
      const venueDetail = await UnifiedVenueModel.findById(allVenues.venues[0].id);
      log('green', `✅ 베뉴 상세 조회: ${venueDetail?.name || 'N/A'}`);
    }
    
    // 6. 통계 조회
    const stats = await UnifiedVenueModel.getStatistics();
    log('green', `✅ 베뉴 통계: 총 ${stats.total_count}개, 평균 평점 ${stats.avg_rating || 'N/A'}`);
    
    return true;
  } catch (error) {
    log('red', `❌ Venue Model 테스트 실패: ${error.message}`);
    return false;
  }
}

async function testExhibitionModel() {
  log('blue', '\n=== Exhibition Model 테스트 ===');
  
  try {
    // 1. 전체 전시 수 확인
    const allExhibitions = await UnifiedExhibitionModel.find({}, { limit: 5 });
    log('green', `✅ 전시 목록 조회: ${allExhibitions.exhibitions.length}개 (총 ${allExhibitions.pagination.total}개)`);
    
    // 2. 진행중인 전시
    const ongoingExhibitions = await UnifiedExhibitionModel.getOngoing(5);
    log('green', `✅ 진행중인 전시: ${ongoingExhibitions.length}개`);
    
    // 3. 다가오는 전시
    const upcomingExhibitions = await UnifiedExhibitionModel.getUpcoming(7, 5);
    log('green', `✅ 다가오는 전시 (7일): ${upcomingExhibitions.length}개`);
    
    // 4. 트렌딩 전시
    const trendingExhibitions = await UnifiedExhibitionModel.getTrending(5);
    log('green', `✅ 트렌딩 전시: ${trendingExhibitions.length}개`);
    
    // 5. 서울 전시 검색
    const seoulExhibitions = await UnifiedExhibitionModel.find({ city: 'Seoul' }, { limit: 3 });
    log('green', `✅ 서울 전시 검색: ${seoulExhibitions.exhibitions.length}개`);
    
    // 6. 상태별 필터링
    const ongoingFilter = await UnifiedExhibitionModel.find({ status: 'ongoing' }, { limit: 3 });
    log('green', `✅ 진행중 상태 필터링: ${ongoingFilter.exhibitions.length}개`);
    
    // 7. 첫 번째 전시 상세 조회
    if (allExhibitions.exhibitions.length > 0) {
      const exhibitionDetail = await UnifiedExhibitionModel.findById(allExhibitions.exhibitions[0].id);
      log('green', `✅ 전시 상세 조회: ${exhibitionDetail?.title || 'N/A'}`);
    }
    
    // 8. 개성별 추천 (SAYU 특화)
    const personalityRecs = await UnifiedExhibitionModel.findByPersonality(['LAEF', 'SAMC'], 3);
    log('green', `✅ 개성별 추천: ${personalityRecs.length}개`);
    
    // 9. 통계 조회
    const stats = await UnifiedExhibitionModel.getStatistics();
    log('green', `✅ 전시 통계: 총 ${stats.total_count}개, 진행중 ${stats.ongoing_count}개`);
    
    // 10. 상태 업데이트 테스트
    const statusUpdate = await UnifiedExhibitionModel.updateStatuses();
    log('green', `✅ 상태 업데이트: 종료 ${statusUpdate.ended}개, 진행중 ${statusUpdate.ongoing}개, 예정 ${statusUpdate.upcoming}개`);
    
    return true;
  } catch (error) {
    log('red', `❌ Exhibition Model 테스트 실패: ${error.message}`);
    return false;
  }
}

async function testDataIntegrity() {
  log('blue', '\n=== 데이터 정합성 테스트 ===');
  
  try {
    const { pool } = require('../src/config/database');
    
    // 1. 고아 전시 레코드 확인
    const orphanedResult = await pool.query(`
      SELECT COUNT(*) FROM exhibitions_unified e 
      WHERE NOT EXISTS (SELECT 1 FROM venues_unified v WHERE v.id = e.venue_id)
    `);
    const orphanedCount = parseInt(orphanedResult.rows[0].count);
    
    if (orphanedCount === 0) {
      log('green', '✅ 고아 전시 레코드: 없음');
    } else {
      log('yellow', `⚠️  고아 전시 레코드: ${orphanedCount}개 발견`);
    }
    
    // 2. 날짜 유효성 확인
    const invalidDatesResult = await pool.query(`
      SELECT COUNT(*) FROM exhibitions_unified WHERE start_date > end_date
    `);
    const invalidDatesCount = parseInt(invalidDatesResult.rows[0].count);
    
    if (invalidDatesCount === 0) {
      log('green', '✅ 전시 날짜 유효성: 정상');
    } else {
      log('red', `❌ 잘못된 전시 날짜: ${invalidDatesCount}개`);
    }
    
    // 3. 중복 베뉴 확인
    const duplicateVenuesResult = await pool.query(`
      SELECT COUNT(*) FROM (
        SELECT name, city FROM venues_unified 
        GROUP BY name, city 
        HAVING COUNT(*) > 1
      ) duplicates
    `);
    const duplicateVenuesCount = parseInt(duplicateVenuesResult.rows[0].count);
    
    if (duplicateVenuesCount === 0) {
      log('green', '✅ 베뉴 중복: 없음');
    } else {
      log('yellow', `⚠️  중복 가능성이 있는 베뉴: ${duplicateVenuesCount}쌍`);
    }
    
    // 4. 인덱스 사용률 확인
    const indexUsageResult = await pool.query(`
      SELECT tablename, indexname, idx_scan 
      FROM pg_stat_user_indexes 
      WHERE tablename IN ('venues_unified', 'exhibitions_unified')
      AND idx_scan > 0
      ORDER BY idx_scan DESC
      LIMIT 5
    `);
    
    log('green', `✅ 활성 인덱스: ${indexUsageResult.rows.length}개`);
    indexUsageResult.rows.forEach(row => {
      log('green', `   ${row.tablename}.${row.indexname}: ${row.idx_scan}회 사용`);
    });
    
    return orphanedCount === 0 && invalidDatesCount === 0;
  } catch (error) {
    log('red', `❌ 데이터 정합성 테스트 실패: ${error.message}`);
    return false;
  }
}

async function testAPI() {
  log('blue', '\n=== API 호환성 테스트 ===');
  
  try {
    const { pool } = require('../src/config/database');
    
    // 1. 기존 뷰가 작동하는지 확인
    const viewVenuesResult = await pool.query('SELECT COUNT(*) FROM venues LIMIT 1');
    log('green', `✅ venues 뷰: ${viewVenuesResult.rows[0].count}개`);
    
    const viewExhibitionsResult = await pool.query('SELECT COUNT(*) FROM exhibitions LIMIT 1');
    log('green', `✅ exhibitions 뷰: ${viewExhibitionsResult.rows[0].count}개`);
    
    // 2. 통계 쿼리 테스트
    const cityStatsResult = await pool.query(`
      SELECT venue_city, COUNT(*) as count 
      FROM exhibitions_unified 
      WHERE visibility = 'public'
      GROUP BY venue_city 
      ORDER BY count DESC 
      LIMIT 3
    `);
    
    log('green', '✅ 도시별 통계:');
    cityStatsResult.rows.forEach(row => {
      log('green', `   ${row.venue_city}: ${row.count}개`);
    });
    
    // 3. Materialized View 테스트 (있다면)
    try {
      const materializedViewResult = await pool.query('SELECT COUNT(*) FROM exhibition_city_stats');
      log('green', `✅ Materialized View: ${materializedViewResult.rows[0].count}개 도시`);
    } catch (error) {
      log('yellow', '⚠️  Materialized View 아직 생성되지 않음');
    }
    
    return true;
  } catch (error) {
    log('red', `❌ API 호환성 테스트 실패: ${error.message}`);
    return false;
  }
}

async function performanceTest() {
  log('blue', '\n=== 성능 테스트 ===');
  
  try {
    // 1. 전시 목록 조회 성능
    const start1 = Date.now();
    await UnifiedExhibitionModel.find({}, { limit: 20 });
    const end1 = Date.now();
    log('green', `✅ 전시 목록 조회: ${end1 - start1}ms`);
    
    // 2. 베뉴 검색 성능
    const start2 = Date.now();
    await UnifiedVenueModel.find({ search: '미술관' }, { limit: 10 });
    const end2 = Date.now();
    log('green', `✅ 베뉴 검색: ${end2 - start2}ms`);
    
    // 3. 복합 필터링 성능
    const start3 = Date.now();
    await UnifiedExhibitionModel.find({
      city: 'Seoul',
      status: 'ongoing',
      search: '현대'
    }, { limit: 10 });
    const end3 = Date.now();
    log('green', `✅ 복합 필터링: ${end3 - start3}ms`);
    
    // 성능 기준: 200ms 이하
    const maxTime = Math.max(end1 - start1, end2 - start2, end3 - start3);
    if (maxTime < 200) {
      log('green', `✅ 전체 성능: 기준 통과 (최대 ${maxTime}ms < 200ms)`);
      return true;
    } else {
      log('yellow', `⚠️  성능 주의: 최대 ${maxTime}ms (목표: <200ms)`);
      return false;
    }
  } catch (error) {
    log('red', `❌ 성능 테스트 실패: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  log('blue', '🚀 SAYU 통합 시스템 테스트 시작');
  log('blue', '='.repeat(50));
  
  const results = {
    venue: await testVenueModel(),
    exhibition: await testExhibitionModel(),
    integrity: await testDataIntegrity(),
    api: await testAPI(),
    performance: await performanceTest()
  };
  
  log('blue', '\n=== 테스트 결과 요약 ===');
  
  let passCount = 0;
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      log('green', `✅ ${test} 테스트: 통과`);
      passCount++;
    } else {
      log('red', `❌ ${test} 테스트: 실패`);
    }
  });
  
  log('blue', `\n총 ${passCount}/${Object.keys(results).length}개 테스트 통과`);
  
  if (passCount === Object.keys(results).length) {
    log('green', '\n🎉 모든 테스트 통과! 통합 시스템이 정상 작동합니다.');
    log('green', '\n✨ 새로운 API 엔드포인트들을 사용할 수 있습니다:');
    log('blue', '  GET /api/exhibitions/ongoing');
    log('blue', '  GET /api/exhibitions/upcoming'); 
    log('blue', '  GET /api/exhibitions/trending');
    log('blue', '  GET /api/exhibitions/personality-recommendations');
    log('blue', '  GET /api/venues (강화된 필터링)');
  } else {
    log('red', '\n⚠️  일부 테스트가 실패했습니다. 로그를 확인해주세요.');
  }
  
  process.exit(passCount === Object.keys(results).length ? 0 : 1);
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
  runAllTests().catch(error => {
    log('red', `💥 테스트 실행 중 오류: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testVenueModel,
  testExhibitionModel,
  testDataIntegrity,
  testAPI,
  performanceTest
};