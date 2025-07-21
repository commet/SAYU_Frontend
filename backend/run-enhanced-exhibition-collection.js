#!/usr/bin/env node
require('dotenv').config();

const enhancedExhibitionCollectorService = require('./src/services/enhancedExhibitionCollectorService');
const { pool } = require('./src/config/database');
const { log } = require('./src/config/logger');

async function main() {
  console.log('🎨 SAYU 전시 정보 수집 시스템 v2.0');
  console.log('=====================================');
  console.log('법적 고지: 공개된 정보만을 수집하며, 저작권을 준수합니다.');
  console.log('이미지는 직접 저장하지 않고 원본 링크만 보관합니다.\n');

  try {
    // 1. 네이버 API 자격증명 확인
    const hasNaverCredentials = process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET;
    if (!hasNaverCredentials) {
      console.log('⚠️  경고: 네이버 API 자격증명이 없습니다. 웹 크롤링만 진행합니다.');
    }

    // 2. 현재 venue 통계 확인
    const venueStats = await pool.query(`
      SELECT 
        COUNT(*) as total_venues,
        COUNT(CASE WHEN country = 'KR' THEN 1 END) as korean_venues,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_venues
      FROM venues
    `);

    console.log('📊 현재 등록된 미술관/갤러리:');
    console.log(`   총 ${venueStats.rows[0].total_venues}개`);
    console.log(`   국내: ${venueStats.rows[0].korean_venues}개`);
    console.log(`   활성: ${venueStats.rows[0].active_venues}개\n`);

    // 3. 전시 수집 옵션 설정
    const collectionOptions = {
      useNaverAPI: hasNaverCredentials,
      useWebCrawling: true,
      usePublicAPIs: !!process.env.CULTURE_API_KEY,
      respectRobotsTxt: true,
      downloadImages: false, // 저작권 보호를 위해 이미지 다운로드 비활성화
      saveLinksOnly: true
    };

    console.log('🔧 수집 설정:');
    console.log(`   네이버 API: ${collectionOptions.useNaverAPI ? '✅' : '❌'}`);
    console.log(`   웹 크롤링: ${collectionOptions.useWebCrawling ? '✅' : '❌'}`);
    console.log(`   공공 API: ${collectionOptions.usePublicAPIs ? '✅' : '❌'}`);
    console.log(`   이미지 다운로드: ${collectionOptions.downloadImages ? '✅' : '❌ (링크만 저장)'}`);
    console.log(`   robots.txt 준수: ${collectionOptions.respectRobotsTxt ? '✅' : '❌'}\n`);

    // 4. 전시 정보 수집 시작
    console.log('🚀 전시 정보 수집을 시작합니다...\n');
    
    const startTime = Date.now();
    const results = await enhancedExhibitionCollectorService.collectAllExhibitions(collectionOptions);
    const duration = Date.now() - startTime;

    // 5. 결과 요약
    console.log('\n📋 수집 결과 요약:');
    console.log('=================');
    console.log(`⏱️  소요 시간: ${(duration / 1000).toFixed(1)}초`);
    console.log(`📥 수집된 전시: ${results.total}개`);
    console.log(`✅ 저장 성공: ${results.saved}개`);
    console.log(`⏭️  중복 건너뜀: ${results.duplicates}개`);
    console.log(`❌ 실패: ${results.failed}개`);

    // 6. 소스별 상세 결과
    console.log('\n📊 소스별 상세:');
    for (const [source, data] of Object.entries(results.sources)) {
      console.log(`\n   [${source}]`);
      console.log(`   - 수집: ${data.count || 0}개`);
      console.log(`   - 성공: ${data.success || 0}개`);
      if (data.exhibitions) {
        console.log(`   - 샘플: ${data.exhibitions[0]?.title || 'N/A'}`);
      }
    }

    // 7. 현재 전시 통계
    const exhibitionStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
        COUNT(CASE WHEN status = 'ended' THEN 1 END) as ended,
        COUNT(DISTINCT venue_name) as unique_venues,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as recent_24h
      FROM exhibitions
    `);

    const stats = exhibitionStats.rows[0];
    console.log('\n📈 전체 전시 현황:');
    console.log(`   총 전시: ${stats.total}개`);
    console.log(`   진행중: ${stats.ongoing}개`);
    console.log(`   예정: ${stats.upcoming}개`);
    console.log(`   종료: ${stats.ended}개`);
    console.log(`   참여 미술관: ${stats.unique_venues}개`);
    console.log(`   24시간 내 추가: ${stats.recent_24h}개`);

    // 8. 지역별 분포
    const cityStats = await pool.query(`
      SELECT venue_city, COUNT(*) as count
      FROM exhibitions
      WHERE venue_country = 'KR'
      GROUP BY venue_city
      ORDER BY count DESC
      LIMIT 10
    `);

    console.log('\n🗺️  지역별 전시 분포:');
    cityStats.rows.forEach((city, index) => {
      console.log(`   ${index + 1}. ${city.venue_city}: ${city.count}개`);
    });

    // 9. 다음 수집 일정
    const nextCollectionTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    console.log(`\n⏰ 다음 자동 수집: ${nextCollectionTime.toLocaleString('ko-KR')}`);

    console.log('\n✨ 전시 정보 수집이 완료되었습니다!');
    console.log('📱 수집된 정보는 SAYU 앱에서 확인하실 수 있습니다.');

  } catch (error) {
    console.error('\n❌ 수집 중 오류 발생:', error);
    log.error('Exhibition collection error:', error);
  } finally {
    await pool.end();
  }
}

// 명령행 인자 처리
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
사용법: node run-enhanced-exhibition-collection.js [옵션]

옵션:
  --help, -h        도움말 표시
  --test            테스트 모드 (실제 저장하지 않음)
  --source [name]   특정 소스만 수집
  --limit [n]       최대 수집 개수 제한

예시:
  node run-enhanced-exhibition-collection.js
  node run-enhanced-exhibition-collection.js --test
  node run-enhanced-exhibition-collection.js --source naver --limit 10
  `);
  process.exit(0);
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };