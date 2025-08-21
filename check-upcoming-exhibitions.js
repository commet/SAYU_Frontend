const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkUpcomingExhibitions() {
  console.log('🔍 현재 및 예정 전시 데이터 확인\n');
  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 6);
  const futureDateStr = futureDate.toISOString().split('T')[0];
  
  console.log('오늘 날짜:', today);
  console.log('검색 범위: 오늘 ~ ', futureDateStr);
  console.log('=' .repeat(60));
  
  try {
    // 현재 진행 중이거나 곧 시작할 전시 가져오기
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, start_date, end_date, admission_fee, tags, artists')
      .gte('end_date', today)    // 종료일이 오늘 이후
      .lte('start_date', futureDateStr) // 6개월 이내 시작
      .order('start_date', { ascending: true })
      .limit(100);
    
    if (error) {
      console.error('❌ 에러:', error);
      return;
    }
    
    console.log(`\n✅ 전시 총 ${exhibitions?.length || 0}개\n`);
    
    // 진행 상태별 분류
    const ongoing = [];
    const upcoming = [];
    
    exhibitions?.forEach(ex => {
      if (ex.start_date <= today) {
        ongoing.push(ex);
      } else {
        upcoming.push(ex);
      }
    });
    
    console.log(`📌 현재 진행 중: ${ongoing.length}개`);
    console.log(`📅 예정된 전시: ${upcoming.length}개\n`);
    
    // 중요 전시 체크
    const importantExhibitions = exhibitions?.filter(ex => {
      const title = (ex.title_local || '').toLowerCase();
      const venue = (ex.venue_name || '').toLowerCase();
      const artists = (ex.artists || []).join(' ').toLowerCase();
      
      return (
        title.includes('이불') || 
        title.includes('lee bul') ||
        title.includes('김창열') || 
        title.includes('kim tschang') ||
        title.includes('오랑주리') || 
        title.includes('orangerie') ||
        title.includes('세잔') || 
        title.includes('cezanne') ||
        title.includes('르누아르') || 
        title.includes('renoir') ||
        venue.includes('리움') ||
        venue.includes('leeum') ||
        artists.includes('이불') ||
        artists.includes('김창열') ||
        artists.includes('세잔') ||
        artists.includes('르누아르')
      );
    });
    
    if (importantExhibitions?.length > 0) {
      console.log('⭐ 주요 전시 (이불, 김창열, 오랑주리 등):');
      console.log('=' .repeat(60));
      importantExhibitions.forEach(ex => {
        const status = ex.start_date <= today ? '🟢 진행중' : '🔵 예정';
        console.log(`\n${status} ${ex.title_local}`);
        console.log(`   장소: ${ex.venue_name}`);
        console.log(`   기간: ${ex.start_date} ~ ${ex.end_date}`);
        console.log(`   가격: ${ex.admission_fee || '정보 없음'}`);
        if (ex.artists?.length > 0) {
          console.log(`   작가: ${ex.artists.join(', ')}`);
        }
      });
      console.log('\n' + '=' .repeat(60));
    }
    
    // 전체 목록 (처음 30개만)
    console.log('\n📋 전체 전시 목록 (날짜순):');
    exhibitions?.slice(0, 30).forEach((ex, idx) => {
      const status = ex.start_date <= today ? '진행중' : '예정';
      console.log(`\n${idx + 1}. [${status}] ${ex.title_local || '제목 없음'}`);
      console.log(`   장소: ${ex.venue_name || '장소 미정'}`);
      console.log(`   기간: ${ex.start_date} ~ ${ex.end_date}`);
    });
    
    // 주요 미술관별 통계
    console.log('\n\n📍 주요 미술관별 전시:');
    const majorVenues = {};
    exhibitions?.forEach(ex => {
      const venue = ex.venue_name || '';
      if (venue.includes('국립현대') || venue.includes('MMCA') ||
          venue.includes('리움') || venue.includes('Leeum') ||
          venue.includes('서울시립') || venue.includes('SeMA') ||
          venue.includes('예술의전당') || venue.includes('한가람') ||
          venue.includes('아모레') || venue.includes('DDP') ||
          venue.includes('국립중앙박물관')) {
        majorVenues[venue] = (majorVenues[venue] || 0) + 1;
      }
    });
    
    Object.entries(majorVenues)
      .sort((a, b) => b[1] - a[1])
      .forEach(([venue, count]) => {
        console.log(`   ${venue}: ${count}개`);
      });
    
  } catch (error) {
    console.error('❌ 실행 중 오류:', error);
  }
}

checkUpcomingExhibitions();