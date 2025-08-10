const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixArtistsFormat() {
  try {
    console.log('=== artists 필드 형식 수정 시작 ===\n');
    
    // 모든 국제갤러리 전시 가져오기
    const { data: exhibitions } = await supabase
      .from('exhibitions')
      .select('id, title_en, artists')
      .eq('venue_name', '국제갤러리');
    
    console.log(`총 ${exhibitions.length}개 전시의 artists 필드 점검...\n`);
    
    let fixedCount = 0;
    
    for (const exhibition of exhibitions) {
      console.log(`처리 중: "${exhibition.title_en}"`);
      
      let needsUpdate = false;
      let fixedArtists = null;
      
      try {
        // artists가 배열인지 확인
        if (Array.isArray(exhibition.artists)) {
          // 배열의 첫 번째 요소가 문자열이고 JSON 같이 보이는 경우
          if (exhibition.artists.length > 0 && typeof exhibition.artists[0] === 'string') {
            const firstElement = exhibition.artists[0];
            
            // JSON 문자열인지 확인 (중괄호로 시작하는 경우)
            if (firstElement.trim().startsWith('{') && firstElement.trim().endsWith('}')) {
              try {
                const parsedArtist = JSON.parse(firstElement);
                fixedArtists = [parsedArtist];
                needsUpdate = true;
                console.log(`  ✓ JSON 문자열을 객체로 변환`);
              } catch (parseError) {
                console.log(`  ⚠️  JSON 파싱 실패, 문자열 그대로 유지`);
                fixedArtists = [{ name: firstElement, role: 'artist' }];
                needsUpdate = true;
              }
            } else {
              // 일반 문자열인 경우 객체로 변환
              fixedArtists = [{ name: firstElement, role: 'artist' }];
              needsUpdate = true;
              console.log(`  ✓ 문자열을 객체로 변환`);
            }
          } else if (exhibition.artists.length > 0 && typeof exhibition.artists[0] === 'object') {
            console.log(`  ✓ 이미 올바른 객체 배열 형태`);
          } else {
            console.log(`  ⚠️  빈 배열 또는 알 수 없는 형태`);
          }
        } else if (typeof exhibition.artists === 'object' && exhibition.artists !== null) {
          // 객체인 경우 배열로 감싸기
          fixedArtists = [exhibition.artists];
          needsUpdate = true;
          console.log(`  ✓ 객체를 배열로 변환`);
        } else if (typeof exhibition.artists === 'string') {
          // 문자열인 경우
          if (exhibition.artists.trim().startsWith('{') && exhibition.artists.trim().endsWith('}')) {
            try {
              const parsedArtist = JSON.parse(exhibition.artists);
              fixedArtists = [parsedArtist];
              needsUpdate = true;
              console.log(`  ✓ JSON 문자열을 배열로 변환`);
            } catch (parseError) {
              fixedArtists = [{ name: exhibition.artists, role: 'artist' }];
              needsUpdate = true;
              console.log(`  ✓ 일반 문자열을 객체 배열로 변환`);
            }
          } else {
            fixedArtists = [{ name: exhibition.artists, role: 'artist' }];
            needsUpdate = true;
            console.log(`  ✓ 일반 문자열을 객체 배열로 변환`);
          }
        }
        
        // 업데이트 필요한 경우 실행
        if (needsUpdate && fixedArtists) {
          const { error: updateError } = await supabase
            .from('exhibitions')
            .update({ artists: fixedArtists })
            .eq('id', exhibition.id);
            
          if (updateError) {
            console.error(`  ❌ 업데이트 실패: ${updateError.message}`);
          } else {
            fixedCount++;
            console.log(`  ✅ 수정 완료`);
          }
        }
        
      } catch (error) {
        console.error(`  ❌ 처리 중 오류: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log(`=== 수정 완료 ===`);
    console.log(`수정된 전시: ${fixedCount}개`);
    
    // 수정 후 검증
    console.log('\n=== 수정 후 검증 ===');
    const { data: updatedExhibitions } = await supabase
      .from('exhibitions')
      .select('id, title_en, artists')
      .eq('venue_name', '국제갤러리')
      .limit(3);
    
    updatedExhibitions?.forEach(ex => {
      console.log(`"${ex.title_en}":`);
      console.log(`  Type: ${Array.isArray(ex.artists) ? 'Array' : typeof ex.artists}`);
      if (Array.isArray(ex.artists) && ex.artists.length > 0) {
        console.log(`  First artist: ${ex.artists[0].name || JSON.stringify(ex.artists[0]).substring(0, 100)}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ 수정 실패:', error);
  }
}

// 실행
fixArtistsFormat();