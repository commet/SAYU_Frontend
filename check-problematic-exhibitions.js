const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkProblematicExhibitions() {
  console.log('🔍 문제 있는 전시 제목 직접 확인\n');
  console.log('=' .repeat(80));
  
  try {
    // 서울서예박물관 전시 확인
    console.log('\n📍 서울서예박물관:');
    const { data: seoyeExhibitions } = await supabase
      .from('exhibitions')
      .select('id, title_local, title_en, description')
      .eq('venue_name', '서울서예박물관')
      .gte('end_date', '2025-08-01')
      .order('start_date', { ascending: false });
    
    if (seoyeExhibitions) {
      seoyeExhibitions.forEach((ex, idx) => {
        console.log(`\n${idx + 1}. ID: ${ex.id}`);
        console.log(`   DB title_local: "${ex.title_local || 'NULL'}"`);
        console.log(`   DB title_en: "${ex.title_en || 'NULL'}"`);
        if (ex.description) {
          const firstLine = ex.description.split('\n')[0].trim();
          console.log(`   Description 첫줄: "${firstLine.substring(0, 60)}..."`);
        }
      });
    }
    
    // 서울공예박물관 전시 확인
    console.log('\n\n📍 서울공예박물관:');
    const { data: gongyeExhibitions } = await supabase
      .from('exhibitions')
      .select('id, title_local, title_en, description')
      .eq('venue_name', '서울공예박물관')
      .gte('end_date', '2025-08-01')
      .order('start_date', { ascending: false });
    
    if (gongyeExhibitions) {
      gongyeExhibitions.forEach((ex, idx) => {
        console.log(`\n${idx + 1}. ID: ${ex.id}`);
        console.log(`   DB title_local: "${ex.title_local || 'NULL'}"`);
        console.log(`   DB title_en: "${ex.title_en || 'NULL'}"`);
        if (ex.description) {
          const firstLine = ex.description.split('\n')[0].trim();
          console.log(`   Description 첫줄: "${firstLine.substring(0, 60)}..."`);
        }
      });
    }
    
    // API가 실제로 무엇을 반환하는지 확인
    console.log('\n\n🌐 API 응답 확인:');
    console.log('http://localhost:3004/api/exhibitions 에서 직접 확인 필요');
    
  } catch (error) {
    console.error('❌ 실행 중 오류:', error);
  }
}

checkProblematicExhibitions();