const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

// 이름 정규화 함수
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[()]/g, '')
    .replace(/gallery/g, 'gallery')
    .replace(/갤러리/g, '갤러리')
    .trim();
}

async function testVenueMatching() {
  console.log('=== Venue 매칭 가능성 테스트 ===\n');
  
  // 1. venue_id 없는 전시들 가져오기
  const { data: exhibitionsWithoutVenue, error } = await supabase
    .from('exhibitions')
    .select('id, title_en, venue_name, venue_city')
    .is('venue_id', null)
    .limit(50);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`venue_id 없는 전시 샘플: ${exhibitionsWithoutVenue.length}개\n`);
  
  // 2. 모든 venue 가져오기
  const { data: allVenues } = await supabase
    .from('venues')
    .select('id, name, name_en, city');
    
  // 3. 매칭 시도
  let matchedCount = 0;
  let partialMatchCount = 0;
  let noMatchCount = 0;
  const matchResults = [];
  
  for (const exhibition of exhibitionsWithoutVenue) {
    const exVenueName = normalizeName(exhibition.venue_name);
    
    // 정확한 매칭 찾기
    const exactMatch = allVenues.find(v => 
      normalizeName(v.name) === exVenueName ||
      normalizeName(v.name_en) === exVenueName
    );
    
    if (exactMatch) {
      matchedCount++;
      matchResults.push({
        exhibition_id: exhibition.id,
        exhibition_title: exhibition.title_en,
        venue_name: exhibition.venue_name,
        matched_venue: exactMatch.name,
        match_type: 'exact',
        confidence: 100
      });
    } else {
      // 부분 매칭 시도 (더 엄격하게)
      const partialMatch = allVenues.find(v => {
        const vName = normalizeName(v.name);
        const vNameEn = normalizeName(v.name_en);
        // 최소 3글자 이상 일치해야 함
        if (exVenueName.length < 3) return false;
        return (
          (vName.includes(exVenueName) && exVenueName.length >= 3) || 
          (exVenueName.includes(vName) && vName.length >= 3) ||
          (vNameEn.includes(exVenueName) && exVenueName.length >= 3) || 
          (exVenueName.includes(vNameEn) && vNameEn.length >= 3)
        );
      });
      
      if (partialMatch) {
        partialMatchCount++;
        matchResults.push({
          exhibition_id: exhibition.id,
          exhibition_title: exhibition.title_en,
          venue_name: exhibition.venue_name,
          matched_venue: partialMatch.name,
          match_type: 'partial',
          confidence: 70
        });
      } else {
        noMatchCount++;
        if (noMatchCount <= 5) {
          console.log(`매칭 실패: "${exhibition.venue_name}" (${exhibition.venue_city})`);
        }
      }
    }
  }
  
  // 4. 결과 요약
  console.log('\n=== 매칭 결과 요약 ===');
  console.log(`총 테스트: ${exhibitionsWithoutVenue.length}개`);
  console.log(`정확한 매칭: ${matchedCount}개 (${(matchedCount/exhibitionsWithoutVenue.length*100).toFixed(1)}%)`);
  console.log(`부분 매칭: ${partialMatchCount}개 (${(partialMatchCount/exhibitionsWithoutVenue.length*100).toFixed(1)}%)`);
  console.log(`매칭 실패: ${noMatchCount}개 (${(noMatchCount/exhibitionsWithoutVenue.length*100).toFixed(1)}%)`);
  
  // 5. 성공 사례 출력
  console.log('\n=== 매칭 성공 예시 ===');
  matchResults.slice(0, 10).forEach(result => {
    console.log(`"${result.venue_name}" → "${result.matched_venue}" (${result.match_type})`);
  });
  
  // 6. 전체 통계 추정
  const { count: totalNoVenueId } = await supabase
    .from('exhibitions')
    .select('*', { count: 'exact', head: true })
    .is('venue_id', null);
    
  const estimatedMatches = Math.round(totalNoVenueId * (matchedCount + partialMatchCount) / exhibitionsWithoutVenue.length);
  
  console.log('\n=== 전체 추정 ===');
  console.log(`venue_id 없는 전체 전시: ${totalNoVenueId}개`);
  console.log(`예상 매칭 가능: ${estimatedMatches}개 (${(estimatedMatches/totalNoVenueId*100).toFixed(1)}%)`);
  console.log(`예상 매칭 불가: ${totalNoVenueId - estimatedMatches}개`);
  
  // 7. 자주 나오는 매칭 실패 venue_name
  const { data: unmatchedVenues } = await supabase
    .from('exhibitions')
    .select('venue_name')
    .is('venue_id', null)
    .not('venue_name', 'is', null);
    
  const venueFrequency = {};
  unmatchedVenues.forEach(ex => {
    const name = ex.venue_name;
    venueFrequency[name] = (venueFrequency[name] || 0) + 1;
  });
  
  const sortedVenues = Object.entries(venueFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
    
  console.log('\n=== 자주 나오는 미매칭 venue (Top 10) ===');
  sortedVenues.forEach(([name, count]) => {
    console.log(`${name}: ${count}회`);
  });
}

testVenueMatching();