const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function analyzeFakeExhibitions() {
  try {
    console.log('🔍 전시 데이터 진위 분석\n');
    console.log('=' .repeat(60));
    
    // 데이터 출처별 통계
    const sources = await pool.query(`
      SELECT source, COUNT(*) as count
      FROM exhibitions
      GROUP BY source
      ORDER BY count DESC
    `);
    
    console.log('\n📊 데이터 출처별 분석:\n');
    sources.rows.forEach(s => {
      console.log(`  ${s.source}: ${s.count}개`);
    });
    
    // 의심스러운 패턴
    const mockPatterns = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE title_local LIKE '%여름%기획전%') as summer_mock,
        COUNT(*) FILTER (WHERE title_local LIKE '%Gallery%Display%') as gallery_display,
        COUNT(*) FILTER (WHERE source LIKE '%simulation%') as simulation,
        COUNT(*) FILTER (WHERE source LIKE '%manual%') as manual,
        COUNT(*) FILTER (WHERE source = '수동 큐레이션') as manual_curation,
        COUNT(*) FILTER (WHERE source = '갤러리 큐레이션') as gallery_curation,
        COUNT(*) FILTER (WHERE source = '특별전 큐레이션') as special_curation
      FROM exhibitions
    `);
    
    const m = mockPatterns.rows[0];
    console.log('\n⚠️  의심스러운 패턴:');
    console.log(`  - "여름 기획전" 패턴: ${m.summer_mock}개`);
    console.log(`  - "Gallery Display" 패턴: ${m.gallery_display}개`);
    console.log(`  - simulation 출처: ${m.simulation}개`);
    console.log(`  - manual 관련: ${m.manual}개`);
    console.log(`  - 수동 큐레이션: ${m.manual_curation}개`);
    console.log(`  - 갤러리 큐레이션: ${m.gallery_curation}개`);
    console.log(`  - 특별전 큐레이션: ${m.special_curation}개`);
    
    const totalFake = Object.values(m).reduce((a, b) => a + parseInt(b), 0);
    console.log(`\n  총 의심 데이터: ${totalFake}개 (중복 포함)`);
    
    // 실제 API 데이터
    const realApi = await pool.query(`
      SELECT source, COUNT(*) as count
      FROM exhibitions
      WHERE 
        source LIKE '%API%' OR
        source LIKE '%chicago%' OR
        source LIKE '%met%museum%'
      GROUP BY source
    `);
    
    console.log('\n✅ API로 수집한 실제 데이터:');
    let realTotal = 0;
    realApi.rows.forEach(r => {
      console.log(`  ${r.source}: ${r.count}개`);
      realTotal += parseInt(r.count);
    });
    console.log(`  총 실제 데이터: ${realTotal}개`);
    
    // 샘플 가짜 데이터
    console.log('\n🚫 가짜 데이터 예시:');
    const fakeExamples = await pool.query(`
      SELECT title_local, venue_name, source
      FROM exhibitions
      WHERE 
        source LIKE '%manual%' OR
        source LIKE '%큐레이션%' OR
        source LIKE '%simulation%'
      LIMIT 10
    `);
    
    fakeExamples.rows.forEach((ex, i) => {
      console.log(`  ${i+1}. "${ex.title_local}" @ ${ex.venue_name} (${ex.source})`);
    });
    
    console.log('\n💡 결론:');
    console.log(`  - 전체 177개 중 실제 데이터는 약 ${realTotal}개 (${Math.round(realTotal/177*100)}%)`);
    console.log(`  - 나머지 ${177-realTotal}개는 테스트/가상 데이터`);
    console.log('\n📌 해결 방법:');
    console.log('  1. 가짜 데이터 모두 삭제');
    console.log('  2. 실제 미술관 API 연동 (국립현대미술관, 서울시립미술관 등)');
    console.log('  3. 웹 스크래핑으로 실제 전시 정보 수집');
    console.log('  4. 사용자 제보 시스템 구축');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

analyzeFakeExhibitions();