const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testChatbotDataRange() {
  console.log('🔍 챗봇이 실제로 불러오는 전시 데이터 범위 테스트\n');
  console.log('=' .repeat(60));
  
  try {
    // 챗봇 route.ts와 동일한 로직
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6); // 6개월 후까지
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    console.log('📅 검색 조건:');
    console.log(`   - 오늘 날짜: ${today}`);
    console.log(`   - 검색 범위: 오늘 ~ ${futureDateStr} (6개월)`);
    console.log(`   - 조건: 종료일 >= 오늘 AND 시작일 <= 6개월 후`);
    console.log(`   - 제한: 최대 100개`);
    console.log('');
    
    // 현재 진행 중이거나 곧 시작할 전시 가져오기 (챗봇과 동일)
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, start_date, end_date, admission_fee, tags, description')
      .gte('end_date', today)    // 종료일이 오늘 이후
      .lte('start_date', futureDateStr) // 6개월 이내에 시작
      .order('start_date', { ascending: true })
      .limit(100);
    
    if (error) {
      console.error('❌ 에러:', error);
      return;
    }
    
    console.log(`✅ 총 ${exhibitions?.length || 0}개 전시 데이터 로드\n`);
    
    // 데이터 품질 분석
    let validExhibitions = 0;
    let invalidVenues = 0;
    let missingPrices = 0;
    let hasTags = 0;
    let hasDescription = 0;
    
    const venueTypes = {
      major: [], // 주요 미술관
      normal: [], // 정상적인 장소명
      invalid: [] // 이상한 장소명 (숫자, 동네 이름만)
    };
    
    exhibitions?.forEach(ex => {
      // 유효한 전시 체크
      const venue = ex.venue_name || '';
      const title = ex.title_local || '';
      
      // 장소명 유효성 체크
      if (venue.match(/^\d+$/) || venue.match(/^\(.+\)$/) || venue.length < 3) {
        venueTypes.invalid.push(venue);
        invalidVenues++;
      } else if (venue.includes('국립') || venue.includes('시립') || venue.includes('미술관') || 
                 venue.includes('박물관') || venue.includes('갤러리') || venue.includes('리움') ||
                 venue.includes('DDP') || venue.includes('아모레')) {
        venueTypes.major.push(venue);
        validExhibitions++;
      } else {
        venueTypes.normal.push(venue);
        validExhibitions++;
      }
      
      // 기타 데이터 품질 체크
      if (!ex.admission_fee || ex.admission_fee === '정보 없음') missingPrices++;
      if (ex.tags) hasTags++;
      if (ex.description && ex.description.length > 50) hasDescription++;
    });
    
    console.log('📊 데이터 품질 분석:');
    console.log(`   - 유효한 전시: ${validExhibitions}개 (${Math.round(validExhibitions/exhibitions.length*100)}%)`);
    console.log(`   - 주요 미술관: ${venueTypes.major.length}개`);
    console.log(`   - 이상한 장소명: ${invalidVenues}개`);
    console.log(`   - 가격 정보 없음: ${missingPrices}개`);
    console.log(`   - 태그 있음: ${hasTags}개`);
    console.log(`   - 설명 있음: ${hasDescription}개`);
    console.log('');
    
    // 시기별 분석
    const currentExhibitions = exhibitions?.filter(ex => ex.start_date <= today) || [];
    const upcomingExhibitions = exhibitions?.filter(ex => ex.start_date > today) || [];
    
    console.log('📅 시기별 분류:');
    console.log(`   - 현재 진행 중: ${currentExhibitions.length}개`);
    console.log(`   - 곧 시작 예정: ${upcomingExhibitions.length}개`);
    console.log('');
    
    // 중요 전시 체크
    const importantExhibitions = exhibitions?.filter(ex => {
      const text = `${ex.title_local} ${ex.venue_name} ${ex.description || ''}`.toLowerCase();
      return text.includes('이불') || text.includes('김창열') || text.includes('오랑주리') ||
             text.includes('세잔') || text.includes('르누아르');
    });
    
    console.log('⭐ 중요 전시 포함 여부:');
    if (importantExhibitions?.length > 0) {
      importantExhibitions.forEach(ex => {
        console.log(`   - ${ex.title_local} @ ${ex.venue_name}`);
      });
    } else {
      console.log('   - 중요 전시가 검색 범위에 포함되지 않음');
    }
    console.log('');
    
    // 주요 미술관 TOP 10
    console.log('🏛️ 실제 활용 가능한 주요 전시 (TOP 20):');
    const majorVenueExhibitions = exhibitions?.filter(ex => {
      const venue = ex.venue_name || '';
      return venue.includes('국립') || venue.includes('시립') || venue.includes('미술관') || 
             venue.includes('박물관') || venue.includes('갤러리') || venue.includes('리움') ||
             venue.includes('DDP') || venue.includes('아모레') || venue.includes('아르코') ||
             venue.includes('예술의전당') || venue.includes('한가람');
    });
    
    majorVenueExhibitions?.slice(0, 20).forEach((ex, idx) => {
      const status = ex.start_date <= today ? '진행중' : '예정';
      console.log(`${idx + 1}. [${status}] ${ex.title_local}`);
      console.log(`   ${ex.venue_name} (${ex.start_date} ~ ${ex.end_date})`);
    });
    
    console.log('\n' + '=' .repeat(60));
    console.log('📌 결론:');
    console.log(`   챗봇은 최대 ${exhibitions?.length}개 전시 중에서`);
    console.log(`   실제로 활용 가능한 ${validExhibitions}개 전시를 기반으로`);
    console.log(`   사용자 APT 유형과 키워드에 맞는 3개를 추천합니다.`);
    
  } catch (error) {
    console.error('❌ 실행 중 오류:', error);
  }
}

testChatbotDataRange();