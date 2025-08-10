const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeDatabase() {
  console.log('=== SAYU 데이터베이스 구조 분석 ===\n');
  
  // 1. exhibitions 테이블 분석
  console.log('1. exhibitions 테이블 분석');
  const { data: exhibitions, error: exError } = await supabase
    .from('exhibitions')
    .select('*')
    .limit(5);
    
  if (!exError) {
    console.log(`- 레코드 수: ${exhibitions.length}`);
    console.log('- 주요 컬럼:', Object.keys(exhibitions[0] || {}));
    
    // 데이터 품질 체크
    const { count: totalEx } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact', head: true });
    
    const { count: noVenueId } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact', head: true })
      .is('venue_id', null);
      
    const { count: koreanEx } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact', head: true })
      .eq('venue_country', 'KR');
    
    console.log(`- 전체 전시 수: ${totalEx}`);
    console.log(`- venue_id 없는 전시: ${noVenueId}`);
    console.log(`- 한국 전시: ${koreanEx}`);
  } else {
    console.log('- 오류:', exError.message);
  }
  
  // 2. venues 테이블 분석
  console.log('\n2. venues 테이블 분석');
  const { data: venues, error: vError } = await supabase
    .from('venues')
    .select('*')
    .limit(5);
    
  if (!vError) {
    console.log(`- 레코드 수: ${venues.length}`);
    console.log('- 주요 컬럼:', Object.keys(venues[0] || {}));
    
    const { count: totalVenues } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true });
      
    const { count: koreanVenues } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true })
      .eq('country', 'KR');
    
    console.log(`- 전체 베뉴 수: ${totalVenues}`);
    console.log(`- 한국 베뉴: ${koreanVenues}`);
  }
  
  // 3. global_exhibitions 확인
  console.log('\n3. global_exhibitions 테이블 확인');
  const { data: globalEx, error: gExError } = await supabase
    .from('global_exhibitions')
    .select('*')
    .limit(1);
    
  if (!gExError) {
    console.log('- 테이블 존재함');
    const { count } = await supabase
      .from('global_exhibitions')
      .select('*', { count: 'exact', head: true });
    console.log(`- 레코드 수: ${count}`);
  } else {
    console.log('- 테이블 없음:', gExError.message);
  }
  
  // 4. global_venues 확인
  console.log('\n4. global_venues 테이블 확인');
  const { data: globalV, error: gVError } = await supabase
    .from('global_venues')
    .select('*')
    .limit(1);
    
  if (!gVError) {
    console.log('- 테이블 존재함');
    const { count } = await supabase
      .from('global_venues')
      .select('*', { count: 'exact', head: true });
    console.log(`- 레코드 수: ${count}`);
  } else {
    console.log('- 테이블 없음:', gVError.message);
  }
  
  // 5. 관계 분석
  console.log('\n5. 데이터 관계 분석');
  
  // venue_id로 연결된 전시 확인
  const { data: linkedEx, error: linkError } = await supabase
    .from('exhibitions')
    .select(`
      id,
      title,
      venue_id,
      venues!inner(
        id,
        name
      )
    `)
    .limit(5);
    
  if (!linkError && linkedEx) {
    console.log(`- venue와 연결된 전시 예시: ${linkedEx.length}개`);
    linkedEx.forEach(ex => {
      console.log(`  * ${ex.title} → ${ex.venues?.name || 'No venue'}`);
    });
  }
  
  // 6. 중복 데이터 체크
  console.log('\n6. 중복 가능성 체크');
  
  // 같은 제목의 전시가 여러 개 있는지
  const { data: dupTitles } = await supabase
    .rpc('get_duplicate_exhibitions', {});
    
  if (dupTitles) {
    console.log('- 중복 제목 전시:', dupTitles);
  }
  
  console.log('\n=== 분석 완료 ===');
}

analyzeDatabase();