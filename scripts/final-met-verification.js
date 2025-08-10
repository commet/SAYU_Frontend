const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function finalMETVerification() {
  console.log('🏁 MET 전시 데이터 최종 검증 및 요약\n');
  
  try {
    // 1. JSON 파일 정보
    const jsonPath = path.join(__dirname, 'met_exhibitions_2025.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const jsonExhibitions = jsonData.exhibitions;
    
    // 2. DB에서 모든 MET 전시 조회
    const { data: allMETExhibitions, count: totalMETCount, error } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact' })
      .or('venue_name.ilike.%Metropolitan Museum%,venue_name.ilike.%Met Cloisters%')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log('📊 최종 통계:');
    console.log(`   📁 JSON 파일의 전시 수: ${jsonExhibitions.length}개`);
    console.log(`   💾 데이터베이스의 MET 전시 수: ${totalMETCount}개\n`);
    
    // 3. venue별 분포
    const venueStats = {};
    allMETExhibitions.forEach(ex => {
      const venue = ex.venue_name;
      venueStats[venue] = (venueStats[venue] || 0) + 1;
    });
    
    console.log('🏛️  Venue별 분포:');
    Object.entries(venueStats).forEach(([venue, count]) => {
      console.log(`   - ${venue}: ${count}개`);
    });
    
    // 4. 필수 필드 검증
    console.log('\n✅ 필수 필드 완성도:');
    const fieldCheck = {
      title_en: allMETExhibitions.filter(ex => ex.title_en).length,
      start_date: allMETExhibitions.filter(ex => ex.start_date).length,
      end_date: allMETExhibitions.filter(ex => ex.end_date).length,
      venue_country: allMETExhibitions.filter(ex => ex.venue_country === 'US').length,
      description: allMETExhibitions.filter(ex => ex.description).length
    };
    
    Object.entries(fieldCheck).forEach(([field, count]) => {
      const percentage = Math.round(count / totalMETCount * 100);
      console.log(`   - ${field}: ${count}/${totalMETCount}개 (${percentage}%)`);
    });
    
    // 5. 전시 상태 분포
    console.log('\n📈 전시 상태별 분포:');
    const statusStats = {};
    allMETExhibitions.forEach(ex => {
      statusStats[ex.status] = (statusStats[ex.status] || 0) + 1;
    });
    
    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}개`);
    });
    
    // 6. 전시 유형별 분포  
    console.log('\n🎭 전시 유형별 분포:');
    const typeStats = {};
    allMETExhibitions.forEach(ex => {
      const type = ex.exhibition_type || 'unknown';
      typeStats[type] = (typeStats[type] || 0) + 1;
    });
    
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}개`);
    });
    
    // 7. 데이터 품질 점수
    console.log('\n📊 데이터 품질 점수:');
    const qualityMetrics = {
      '공식 URL': allMETExhibitions.filter(ex => ex.official_url).length,
      '아티스트 정보': allMETExhibitions.filter(ex => ex.artists && ex.artists.length > 0).length,
      '작품 수': allMETExhibitions.filter(ex => ex.artworks_count).length,
      '티켓 가격': allMETExhibitions.filter(ex => ex.ticket_price).length,
      '태그/테마': allMETExhibitions.filter(ex => ex.tags && ex.tags.length > 0).length,
      '입장료 정보': allMETExhibitions.filter(ex => ex.admission_fee !== null).length,
      '큐레이터': allMETExhibitions.filter(ex => ex.curator).length,
      '연락처': allMETExhibitions.filter(ex => ex.contact_info).length
    };
    
    Object.entries(qualityMetrics).forEach(([metric, count]) => {
      const percentage = Math.round(count / totalMETCount * 100);
      const status = percentage >= 80 ? '✅' : percentage >= 50 ? '⚠️' : '❌';
      console.log(`   ${status} ${metric}: ${count}/${totalMETCount}개 (${percentage}%)`);
    });
    
    // 8. 최근 추가된 전시 5개
    console.log('\n🆕 최근 추가된 MET 전시 5개:');
    const recentExhibitions = allMETExhibitions.slice(0, 5);
    recentExhibitions.forEach((ex, index) => {
      console.log(`${index + 1}. ${ex.title_en || ex.title}`);
      console.log(`   📅 ${ex.start_date} ~ ${ex.end_date || 'ongoing'}`);
      console.log(`   🏛️  ${ex.venue_name}`);
      console.log(`   📊 상태: ${ex.status}, 유형: ${ex.exhibition_type}`);
      console.log(`   🕐 추가일: ${ex.created_at}`);
      if (index < 4) console.log('');
    });
    
    // 9. 데이터 무결성 최종 확인
    console.log('\n🔍 데이터 무결성 최종 확인:');
    const integrityIssues = [];
    
    allMETExhibitions.forEach(ex => {
      // 날짜 검증
      if (ex.start_date && ex.end_date) {
        const startDate = new Date(ex.start_date);
        const endDate = new Date(ex.end_date);
        if (startDate > endDate) {
          integrityIssues.push(`${ex.title_en}: 시작일이 종료일보다 늦음`);
        }
      }
      
      // venue_country 검증
      if (ex.venue_country !== 'US') {
        integrityIssues.push(`${ex.title_en}: venue_country가 'US'가 아님`);
      }
      
      // 필수 필드 누락 검증
      if (!ex.title_en) {
        integrityIssues.push(`${ex.id}: title_en 누락`);
      }
    });
    
    if (integrityIssues.length > 0) {
      console.log('   ❌ 발견된 무결성 문제:');
      integrityIssues.forEach(issue => console.log(`      - ${issue}`));
    } else {
      console.log('   ✅ 데이터 무결성 문제 없음');
    }
    
    // 10. 전체 요약
    console.log('\n📋 전체 요약:');
    console.log(`   📊 총 MET 전시 수: ${totalMETCount}개`);
    console.log(`   📁 JSON 파일 대비: ${totalMETCount >= jsonExhibitions.length ? '✅' : '❌'} (${totalMETCount - jsonExhibitions.length > 0 ? '+' : ''}${totalMETCount - jsonExhibitions.length}개)`);
    
    const overallQuality = Math.round(
      Object.values(qualityMetrics).reduce((sum, count) => sum + count, 0) / 
      (Object.keys(qualityMetrics).length * totalMETCount) * 100
    );
    
    console.log(`   📈 전체 데이터 품질: ${overallQuality}%`);
    console.log(`   🏛️  주요 장소: Metropolitan Museum of Art (${venueStats['Metropolitan Museum of Art'] || 0}개), Met Cloisters (${venueStats['The Met Cloisters'] || 0}개)`);
    console.log(`   ✅ 필수 필드 완성도: ${Math.round(Object.values(fieldCheck).reduce((sum, count) => sum + count, 0) / (Object.keys(fieldCheck).length * totalMETCount) * 100)}%`);
    
  } catch (error) {
    console.error('❌ 검증 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
    if (error.hint) console.error('힌트:', error.hint);
  }
}

// 실행
finalMETVerification();