const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testFinalChatbotRange() {
  console.log('🎯 최종 챗봇 데이터 범위 테스트\n');
  console.log('=' .repeat(60));
  
  try {
    // 수정된 챗봇 로직
    const today = new Date().toISOString().split('T')[0];
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 3); // 3개월 전부터
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6); // 6개월 후까지
    const pastDateStr = pastDate.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    console.log('📅 검색 조건:');
    console.log(`   - 검색 범위: ${pastDateStr} ~ ${futureDateStr}`);
    console.log(`   - 오늘: ${today}`);
    console.log(`   - 조건: 3개월 전 ~ 6개월 후 사이 시작 & 아직 안 끝난 전시`);
    console.log(`   - 제한: 최대 150개`);
    console.log('');
    
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, start_date, end_date, admission_fee, tags, description, artists')
      .gte('end_date', today)    // 종료일이 오늘 이후
      .gte('start_date', pastDateStr)  // 3개월 전 이후에 시작
      .lte('start_date', futureDateStr) // 6개월 이내에 시작
      .order('start_date', { ascending: false })
      .limit(150);
    
    if (error) {
      console.error('❌ 에러:', error);
      return;
    }
    
    console.log(`✅ 총 ${exhibitions?.length || 0}개 전시 데이터 로드\n`);
    
    // 중요 전시들 확인
    const importantKeywords = [
      '이불', 'Lee Bul', '김창열', 'Kim', '오랑주리', 'Orangerie', 
      '세잔', 'Cezanne', '르누아르', 'Renoir'
    ];
    
    console.log('⭐ 중요 전시 확인:');
    exhibitions?.forEach(ex => {
      const text = `${ex.title_local} ${ex.venue_name} ${(ex.artists || []).join(' ')}`.toLowerCase();
      for (const keyword of importantKeywords) {
        if (text.includes(keyword.toLowerCase())) {
          const status = ex.start_date <= today ? '진행중' : '예정';
          console.log(`   [${status}] ${ex.title_local}`);
          console.log(`         ${ex.venue_name} (${ex.start_date} ~ ${ex.end_date})`);
          break;
        }
      }
    });
    
    // 시기별 분류
    const ongoing = exhibitions?.filter(ex => ex.start_date <= today) || [];
    const upcoming = exhibitions?.filter(ex => ex.start_date > today) || [];
    
    console.log('\n📊 시기별 분류:');
    console.log(`   - 현재 진행 중: ${ongoing.length}개`);
    console.log(`   - 곧 시작 예정: ${upcoming.length}개`);
    
    // 주요 미술관 전시
    console.log('\n🏛️ 주요 미술관 전시 (최근 순):');
    const majorVenues = exhibitions?.filter(ex => {
      const venue = ex.venue_name || '';
      return venue.includes('국립현대') || venue.includes('리움') || venue.includes('서울시립') ||
             venue.includes('예술의전당') || venue.includes('한가람') || venue.includes('아모레') ||
             venue.includes('DDP') || venue.includes('아르코');
    });
    
    majorVenues?.slice(0, 20).forEach((ex, idx) => {
      const status = ex.start_date <= today ? '진행중' : '🔜예정';
      console.log(`${idx + 1}. [${status}] ${ex.title_local}`);
      console.log(`   ${ex.venue_name} (${ex.start_date} ~ ${ex.end_date})`);
    });
    
    console.log('\n' + '=' .repeat(60));
    console.log('📌 최종 결론:');
    console.log(`   챗봇은 총 ${exhibitions?.length}개 전시 데이터를 로드하여`);
    console.log(`   - 현재 진행 중: ${ongoing.length}개`);
    console.log(`   - 곧 시작 예정: ${upcoming.length}개`);
    console.log(`   이 중에서 사용자 APT 유형과 키워드에 맞는 3개를 추천합니다.`);
    
    // 예정된 중요 전시 리스트
    console.log('\n🌟 곧 시작할 중요 전시:');
    const upcomingImportant = upcoming.filter(ex => {
      const text = `${ex.title_local} ${ex.venue_name}`.toLowerCase();
      return text.includes('이불') || text.includes('김창열') || text.includes('오랑주리') ||
             text.includes('세잔') || text.includes('르누아르');
    });
    
    if (upcomingImportant.length > 0) {
      upcomingImportant.forEach(ex => {
        console.log(`   - ${ex.title_local} @ ${ex.venue_name}`);
        console.log(`     ${ex.start_date} 시작 예정`);
      });
    } else {
      console.log('   (예정된 중요 전시 없음)');
    }
    
  } catch (error) {
    console.error('❌ 실행 중 오류:', error);
  }
}

testFinalChatbotRange();