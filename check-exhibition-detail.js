// 현재 진행중인 전시의 상세 정보 확인
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentExhibitions() {
  const today = new Date().toISOString().split('T')[0];
  console.log('오늘 날짜:', today);
  
  // 챗봇이 로드하는 것과 동일한 쿼리
  console.log('\n=== 챗봇이 로드하는 현재 진행중인 전시 (limit 10) ===');
  const { data: currentExhibitions } = await supabase
    .from('exhibitions')
    .select('id, title_local, venue_name, start_date, end_date, admission_fee, tags, popularity_score')
    .lte('start_date', today)
    .gte('end_date', today)
    .limit(10);
    
  console.log('\n첫 10개 전시 (정렬 없음):');
  currentExhibitions?.forEach((ex, idx) => {
    console.log(`${idx + 1}. ${ex.title_local || ex.venue_name}`);
    console.log(`   - 장소: ${ex.venue_name}`);
    console.log(`   - 기간: ${ex.start_date} ~ ${ex.end_date}`);
    console.log(`   - 입장료: ${ex.admission_fee || '무료'}`);
    console.log(`   - 인기도: ${ex.popularity_score || 'N/A'}`);
  });
  
  // 인기 전시 쿼리
  console.log('\n=== 인기 전시 (popularity_score 기준) ===');
  const { data: popularExhibitions } = await supabase
    .from('exhibitions')
    .select('id, title_local, venue_name, popularity_score')
    .lte('start_date', today)
    .gte('end_date', today)
    .order('popularity_score', { ascending: false, nullsFirst: false })
    .limit(5);
    
  console.log('\n인기 순위:');
  popularExhibitions?.forEach((ex, idx) => {
    console.log(`${idx + 1}. ${ex.title_local || ex.venue_name} (인기도: ${ex.popularity_score || 0})`);
  });
  
  // 정렬 기준 없이 가져온 데이터 확인
  console.log('\n=== 정렬 없이 가져온 첫 3개 (챗봇이 추천하는 것) ===');
  if (currentExhibitions && currentExhibitions.length >= 3) {
    for (let i = 0; i < 3; i++) {
      console.log(`${i + 1}. ${currentExhibitions[i].venue_name || currentExhibitions[i].title_local}`);
    }
  }
  
  // 실제로 popularity_score가 있는지 확인
  console.log('\n=== popularity_score 값 분포 ===');
  const { data: scoreCheck } = await supabase
    .from('exhibitions')
    .select('popularity_score')
    .lte('start_date', today)
    .gte('end_date', today)
    .not('popularity_score', 'is', null)
    .limit(20);
    
  const scores = scoreCheck?.map(ex => ex.popularity_score) || [];
  console.log('popularity_score가 있는 전시 수:', scores.length);
  if (scores.length > 0) {
    console.log('점수 범위:', Math.min(...scores), '~', Math.max(...scores));
    console.log('샘플 점수들:', scores.slice(0, 10));
  }
}

checkCurrentExhibitions().catch(console.error);