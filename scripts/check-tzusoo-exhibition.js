const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTzusooExhibition() {
  console.log('=== 추수(TZUSOO) 작가 전시 상세 정보 ===\n');
  
  // 모든 전시 가져오기
  const { data, error } = await supabase
    .from('exhibitions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('조회 오류:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log(`총 ${data.length}개의 전시 데이터\n`);
    
    // 추수 관련 전시 찾기
    const tzusooExhibitions = [];
    
    data.forEach(ex => {
      const searchText = JSON.stringify(ex).toLowerCase();
      if (searchText.includes('추수') || searchText.includes('tzusoo')) {
        tzusooExhibitions.push(ex);
      }
    });
    
    if (tzusooExhibitions.length > 0) {
      console.log(`\n🎯 추수 관련 전시 ${tzusooExhibitions.length}개 발견!\n`);
      
      tzusooExhibitions.forEach((exhibition, idx) => {
        console.log('='.repeat(80));
        console.log(`\n전시 #${idx + 1}\n`);
        console.log('📋 기본 정보');
        console.log('  - DB ID:', exhibition.id);
        console.log('  - 영문 제목:', exhibition.title_en || '없음');
        console.log('  - 한글 제목:', exhibition.title_local || '없음');
        console.log('  - 부제목:', exhibition.subtitle || '없음');
        
        console.log('\n👤 작가 정보');
        if (Array.isArray(exhibition.artists)) {
          console.log('  - 작가들 (배열):', exhibition.artists.join(', '));
        } else if (exhibition.artists) {
          console.log('  - 작가 (문자열):', exhibition.artists);
        } else {
          console.log('  - 작가: 없음');
        }
        
        console.log('\n📅 전시 기간');
        console.log('  - 시작일:', exhibition.start_date || '없음');
        console.log('  - 종료일:', exhibition.end_date || '없음');
        console.log('  - 상태:', exhibition.status || '없음');
        
        console.log('\n📍 장소');
        console.log('  - 장소명:', exhibition.venue_name || '없음');
        console.log('  - 도시:', exhibition.venue_city || '없음');
        console.log('  - 국가:', exhibition.venue_country || '없음');
        
        console.log('\n📝 전시 설명');
        if (exhibition.description) {
          const desc = exhibition.description;
          console.log('  길이:', desc.length + '자');
          console.log('  처음 500자:');
          console.log('  ', desc.substring(0, 500));
          if (desc.length > 500) {
            console.log('  ...(생략)');
          }
          
          // 추수 관련 내용 하이라이트
          if (desc.includes('추수') || desc.includes('TZUSOO')) {
            console.log('\n  💡 추수 관련 언급 부분:');
            const lines = desc.split('\n');
            lines.forEach(line => {
              if (line.includes('추수') || line.includes('TZUSOO')) {
                console.log('    - ' + line.trim());
              }
            });
          }
        } else {
          console.log('  설명 없음');
        }
        
        console.log('\n🔗 링크 정보');
        console.log('  - 공식 URL:', exhibition.official_url || '없음');
        console.log('  - 소스 URL:', exhibition.source_url || '없음');
        
        console.log('\n📊 추가 정보');
        console.log('  - 작품수:', exhibition.artworks_count || '없음');
        console.log('  - 입장료:', exhibition.admission_fee || '없음');
        console.log('  - 운영시간:', exhibition.operating_hours || '없음');
        console.log('  - 큐레이터:', exhibition.curator || '없음');
        console.log('  - 수집일:', exhibition.collected_at || '없음');
        console.log('  - 생성일:', exhibition.created_at);
        console.log('  - 업데이트:', exhibition.updated_at);
      });
    } else {
      console.log('추수 관련 전시를 찾을 수 없습니다.');
    }
    
    // 장소별 통계
    console.log('\n\n=== 장소별 전시 통계 ===');
    const byVenue = {};
    data.forEach(ex => {
      const venue = ex.venue_name || '장소 미정';
      if (!byVenue[venue]) {
        byVenue[venue] = 0;
      }
      byVenue[venue]++;
    });
    
    Object.entries(byVenue).forEach(([venue, count]) => {
      console.log(`  - ${venue}: ${count}개`);
    });
  } else {
    console.log('전시 데이터가 없습니다.');
  }
}

checkTzusooExhibition().catch(console.error);