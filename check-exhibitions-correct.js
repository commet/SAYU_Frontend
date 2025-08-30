// Supabase 전시 데이터 확인 스크립트 (올바른 URL 사용)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';

console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExhibitions() {
  const today = new Date().toISOString().split('T')[0];
  console.log('오늘 날짜:', today);
  
  try {
    // 전체 전시 수 확인
    const { count: totalCount, error: countError } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('전체 전시 수 조회 오류:', countError);
    } else {
      console.log('\n전체 전시 수:', totalCount);
    }
    
    // 현재 진행중인 전시 확인
    const { data: currentExhibitions, count: currentCount, error: currentError } = await supabase
      .from('exhibitions')
      .select('id, title_local, start_date, end_date', { count: 'exact' })
      .lte('start_date', today)
      .gte('end_date', today);
    
    if (currentError) {
      console.error('진행중인 전시 조회 오류:', currentError);
    } else {
      console.log('\n현재 진행중인 전시:', currentCount);
      if (currentExhibitions && currentExhibitions.length > 0) {
        currentExhibitions.forEach(ex => {
          console.log(`- ${ex.title_local} (${ex.start_date} ~ ${ex.end_date})`);
        });
      }
    }
    
    // 모든 전시 데이터 확인 (최대 10개)
    const { data: allExhibitions, error: allError } = await supabase
      .from('exhibitions')
      .select('title_local, start_date, end_date')
      .limit(10)
      .order('start_date', { ascending: false });
    
    if (allError) {
      console.error('전체 전시 조회 오류:', allError);
    } else {
      console.log('\n데이터베이스의 전시 목록 (최근 10개):');
      if (allExhibitions && allExhibitions.length > 0) {
        allExhibitions.forEach(ex => {
          const start = new Date(ex.start_date);
          const end = new Date(ex.end_date);
          const now = new Date();
          
          let status = '';
          if (now < start) {
            status = '예정';
          } else if (now > end) {
            status = '종료';
          } else {
            status = '진행중';
          }
          
          console.log(`- [${status}] ${ex.title_local} (${ex.start_date} ~ ${ex.end_date})`);
        });
      } else {
        console.log('전시 데이터가 없습니다.');
      }
    }
    
    // 곧 시작할 전시 (7일 이내)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    const { data: upcomingExhibitions, count: upcomingCount, error: upcomingError } = await supabase
      .from('exhibitions')
      .select('id, title_local, start_date', { count: 'exact' })
      .gt('start_date', today)
      .lte('start_date', futureDateStr);
    
    if (upcomingError) {
      console.error('예정 전시 조회 오류:', upcomingError);
    } else {
      console.log('\n7일 이내 시작 예정:', upcomingCount);
      if (upcomingExhibitions && upcomingExhibitions.length > 0) {
        upcomingExhibitions.forEach(ex => {
          console.log(`- ${ex.title_local} (${ex.start_date}부터)`);
        });
      }
    }
    
  } catch (error) {
    console.error('예상치 못한 오류:', error);
  }
}

checkExhibitions();