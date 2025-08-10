const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyArtistsStructure() {
  try {
    console.log('=== 국제갤러리 전시의 artists 필드 구조 검증 ===\n');
    
    // 모든 국제갤러리 전시의 artists 필드 가져오기
    const { data: exhibitions } = await supabase
      .from('exhibitions')
      .select('id, title_en, artists')
      .eq('venue_name', '국제갤러리');
    
    console.log(`총 ${exhibitions.length}개 전시의 artists 필드 구조:\n`);
    
    let validArrayCount = 0;
    let validObjectCount = 0;
    let stringCount = 0;
    let otherCount = 0;
    
    exhibitions.forEach((ex, index) => {
      console.log(`${index + 1}. "${ex.title_en}"`);
      console.log(`   Type: ${typeof ex.artists}`);
      
      if (Array.isArray(ex.artists)) {
        validArrayCount++;
        console.log(`   Array length: ${ex.artists.length}`);
        if (ex.artists.length > 0) {
          console.log(`   First element type: ${typeof ex.artists[0]}`);
          if (typeof ex.artists[0] === 'object' && ex.artists[0].name) {
            console.log(`   Artist name: ${ex.artists[0].name}`);
          } else if (typeof ex.artists[0] === 'string') {
            console.log(`   Artist name: ${ex.artists[0]}`);
          }
        }
      } else if (typeof ex.artists === 'object' && ex.artists !== null) {
        validObjectCount++;
        console.log(`   Object keys: ${Object.keys(ex.artists).join(', ')}`);
        if (ex.artists.name) {
          console.log(`   Artist name: ${ex.artists.name}`);
        }
      } else if (typeof ex.artists === 'string') {
        stringCount++;
        console.log(`   String value: ${ex.artists}`);
      } else {
        otherCount++;
        console.log(`   Value: ${ex.artists}`);
      }
      console.log('');
    });
    
    // 통계 요약
    console.log('=== artists 필드 구조 통계 ===');
    console.log(`배열 형태: ${validArrayCount}개`);
    console.log(`객체 형태: ${validObjectCount}개`);
    console.log(`문자열 형태: ${stringCount}개`);
    console.log(`기타 형태: ${otherCount}개`);
    
    // 수정이 필요한지 확인
    if (validObjectCount > 0 || stringCount > 0) {
      console.log('\n⚠️  일부 artists 필드가 예상된 배열 형태가 아닙니다.');
      console.log('수정이 필요할 수 있습니다.');
      
      // 자동 수정 제안
      console.log('\n=== 자동 수정 제안 ===');
      const fixableExhibitions = exhibitions.filter(ex => 
        !Array.isArray(ex.artists) && ex.artists !== null
      );
      
      console.log(`수정 가능한 전시: ${fixableExhibitions.length}개`);
      
      for (const ex of fixableExhibitions) {
        console.log(`\n"${ex.title_en}" 수정 제안:`);
        
        if (typeof ex.artists === 'object' && ex.artists.name) {
          console.log(`  현재: ${JSON.stringify(ex.artists)}`);
          console.log(`  수정안: [${JSON.stringify(ex.artists)}]`);
        } else if (typeof ex.artists === 'string') {
          console.log(`  현재: "${ex.artists}"`);
          console.log(`  수정안: [{"name": "${ex.artists}", "role": "artist"}]`);
        }
      }
    } else {
      console.log('\n✅ 모든 artists 필드가 올바른 배열 형태입니다.');
    }
    
  } catch (error) {
    console.error('❌ 검증 실패:', error);
  }
}

// 실행
verifyArtistsStructure();