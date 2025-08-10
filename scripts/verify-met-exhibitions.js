const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verifyMETExhibitions() {
  console.log('🔍 MET 전시 데이터 검증 시작...\n');
  
  try {
    // 1. MET 전시 총 개수 확인
    const { data: metExhibitions, count, error: countError } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact' })
      .or('venue_name.ilike.%Metropolitan Museum%,venue_name.ilike.%Met Cloisters%');
    
    if (countError) throw countError;
    
    console.log(`📊 데이터베이스의 MET 전시 총 개수: ${count}개`);
    console.log(`📁 JSON 파일의 전시 개수: 17개`);
    
    if (metExhibitions && metExhibitions.length > 0) {
      // 2. venue 정보 확인
      console.log('\n🏛️  Venue 정보 분석:');
      const venueStats = {};
      metExhibitions.forEach(ex => {
        const venue = ex.venue_name;
        venueStats[venue] = (venueStats[venue] || 0) + 1;
      });
      
      Object.entries(venueStats).forEach(([venue, count]) => {
        console.log(`   - ${venue}: ${count}개`);
      });
      
      // 3. 필수 필드 검증
      console.log('\n✅ 필수 필드 검증:');
      let missingFields = {
        title_en: 0,
        start_date: 0,
        end_date: 0,
        venue_country: 0
      };
      
      metExhibitions.forEach(ex => {
        if (!ex.title_en) missingFields.title_en++;
        if (!ex.start_date) missingFields.start_date++;
        if (!ex.end_date && ex.status !== 'ongoing') missingFields.end_date++;
        if (!ex.venue_country) missingFields.venue_country++;
      });
      
      console.log(`   - title_en 누락: ${missingFields.title_en}개`);
      console.log(`   - start_date 누락: ${missingFields.start_date}개`);
      console.log(`   - end_date 누락 (ongoing 제외): ${missingFields.end_date}개`);
      console.log(`   - venue_country 누락: ${missingFields.venue_country}개`);
      
      // 4. 최근 추가된 MET 전시 5개 상세 정보
      console.log('\n🎨 최근 추가된 MET 전시 5개:');
      const recentExhibitions = metExhibitions
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      recentExhibitions.forEach((ex, index) => {
        console.log(`\n${index + 1}. ${ex.title || ex.title_en}`);
        console.log(`   - ID: ${ex.id}`);
        console.log(`   - 장소: ${ex.venue_name}`);
        console.log(`   - 기간: ${ex.start_date} ~ ${ex.end_date || 'ongoing'}`);
        console.log(`   - 상태: ${ex.status}`);
        console.log(`   - 유형: ${ex.exhibition_type}`);
        console.log(`   - 작품 수: ${ex.artworks_count || 'N/A'}`);
        console.log(`   - 생성일: ${ex.created_at}`);
      });
      
      // 5. 데이터 무결성 체크
      console.log('\n🔍 데이터 무결성 체크:');
      const integrityIssues = [];
      
      metExhibitions.forEach(ex => {
        // 날짜 검증
        if (ex.start_date && ex.end_date) {
          const startDate = new Date(ex.start_date);
          const endDate = new Date(ex.end_date);
          if (startDate > endDate) {
            integrityIssues.push(`${ex.id}: 시작일이 종료일보다 늦음`);
          }
        }
        
        // venue_country가 'US'가 아닌 경우
        if (ex.venue_country !== 'US') {
          integrityIssues.push(`${ex.id}: venue_country가 'US'가 아님 (${ex.venue_country})`);
        }
        
        // 중복 ID 검사를 위한 저장
        if (!ex.id) {
          integrityIssues.push(`전시 ID 누락`);
        }
      });
      
      if (integrityIssues.length > 0) {
        console.log('   ❌ 발견된 문제:');
        integrityIssues.forEach(issue => console.log(`      - ${issue}`));
      } else {
        console.log('   ✅ 데이터 무결성 문제 없음');
      }
      
      // 6. 상태별 분포
      console.log('\n📈 전시 상태 분포:');
      const statusStats = {};
      metExhibitions.forEach(ex => {
        statusStats[ex.status] = (statusStats[ex.status] || 0) + 1;
      });
      
      Object.entries(statusStats).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}개`);
      });
      
      // 7. JSON vs DB 비교
      console.log('\n🔄 JSON 파일과 DB 비교:');
      const jsonCount = 17;
      const dbCount = count;
      
      if (jsonCount === dbCount) {
        console.log('   ✅ JSON 파일과 DB의 전시 개수가 일치합니다.');
      } else {
        console.log(`   ⚠️  개수 불일치: JSON ${jsonCount}개 vs DB ${dbCount}개`);
        console.log(`   차이: ${Math.abs(jsonCount - dbCount)}개`);
      }
      
    } else {
      console.log('❌ MET 전시 데이터를 찾을 수 없습니다.');
    }
    
  } catch (error) {
    console.error('❌ 검증 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
    if (error.hint) console.error('힌트:', error.hint);
  }
}

// 실행
verifyMETExhibitions();