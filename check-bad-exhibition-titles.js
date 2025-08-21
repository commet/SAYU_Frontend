const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkBadExhibitionTitles() {
  console.log('🔍 잘못된 전시 제목 데이터 확인\n');
  console.log('=' .repeat(60));
  
  try {
    // 문제가 있는 제목들 확인
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, description, source')
      .or('title_local.like.%기원전%,title_local.like.%선정해야%,title_local.like.%여 년%,title_local.like.%작품%점%')
      .limit(20);
    
    if (error) {
      console.error('❌ 에러:', error);
      return;
    }
    
    console.log(`\n🚨 문제가 있는 제목들 (${exhibitions?.length || 0}개):\n`);
    
    exhibitions?.forEach((ex, idx) => {
      console.log(`${idx + 1}. [${ex.source}] ${ex.venue_name}`);
      console.log(`   제목: "${ex.title_local}"`);
      if (ex.description) {
        console.log(`   설명 시작: "${ex.description.substring(0, 100)}..."`);
      }
      console.log('');
    });
    
    // 서울 주요 미술관 전시 중 제목이 너무 긴 것들
    console.log('\n📏 제목이 너무 긴 전시들:');
    const { data: longTitles } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name')
      .eq('venue_city', '서울')
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('title_local', { ascending: false })
      .limit(10);
    
    longTitles?.forEach(ex => {
      if (ex.title_local && ex.title_local.length > 50) {
        console.log(`- [${ex.title_local.length}자] ${ex.venue_name}: "${ex.title_local.substring(0, 50)}..."`);
      }
    });
    
    // 제목에 마침표나 줄임표가 있는 경우
    console.log('\n⚠️ 제목에 마침표/줄임표가 있는 전시:');
    const { data: punctuationTitles } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name')
      .or('title_local.like.%...%,title_local.like.%.%')
      .limit(10);
    
    punctuationTitles?.forEach(ex => {
      console.log(`- ${ex.venue_name}: "${ex.title_local}"`);
    });
    
    // 정상적인 전시 제목 예시
    console.log('\n✅ 정상적인 전시 제목 예시:');
    const { data: goodTitles } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name')
      .in('venue_name', ['리움미술관', '국립현대미술관 서울', '아모레퍼시픽미술관'])
      .gte('start_date', '2025-08-01')
      .limit(10);
    
    goodTitles?.forEach(ex => {
      console.log(`- ${ex.venue_name}: "${ex.title_local}"`);
    });
    
  } catch (error) {
    console.error('❌ 실행 중 오류:', error);
  }
}

checkBadExhibitionTitles();