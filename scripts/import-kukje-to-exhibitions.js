const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

// 국제갤러리 venue 정보
const KUKJE_VENUE_INFO = {
  name: '국제갤러리',
  name_en: 'Kukje Gallery',
  city: '서울',
  city_en: 'Seoul',
  country: 'KR',
  address: '서울특별시 종로구 삼청로 54'
};

async function importKukjeExhibitions() {
  try {
    console.log('=== 국제갤러리 전시 데이터 Import 시작 ===\n');
    
    // 1. 국제갤러리 venue 확인
    console.log('1. 국제갤러리 venue 확인...');
    const { data: venues, error: venueError } = await supabase
      .from('venues')
      .select('id, name, city')
      .or('name.eq.국제갤러리,name.eq.Kukje Gallery,name.ilike.%국제갤러리%')
      .limit(5);
      
    if (venues && venues.length > 0) {
      console.log('국제갤러리 venue 후보:');
      venues.forEach(v => console.log(`  - ${v.name} (${v.city}): ${v.id}`));
    } else {
      console.log('국제갤러리 venue를 찾을 수 없음 - venue_id 없이 진행');
    }
    
    // 2. kukje_detailed_*.json 파일들 찾기
    const scriptsDir = path.join(__dirname);
    const files = fs.readdirSync(scriptsDir).filter(file => 
      file.startsWith('kukje_detailed_') && file.endsWith('.json')
    );
    
    if (files.length === 0) {
      console.log('kukje_detailed_*.json 파일을 찾을 수 없습니다.');
      return;
    }
    
    console.log(`\n2. 찾은 국제갤러리 전시 파일: ${files.length}개`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        console.log(`\n처리 중: ${file}`);
        const filePath = path.join(scriptsDir, file);
        const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // exhibition 객체 추출
        const data = fileContent.exhibition || fileContent;
        
        // exhibitions 테이블 형식에 맞게 데이터 준비
        const exhibitionData = {
          title_en: data.title_en || data.title,
          title_local: data.title_ko || data.title_local || data.title_en,
          description: data.description,
          
          // Venue 정보 - 정확히 입력
          venue_name: KUKJE_VENUE_INFO.name,
          venue_city: KUKJE_VENUE_INFO.city,
          venue_country: KUKJE_VENUE_INFO.country,
          venue_address: KUKJE_VENUE_INFO.address,
          
          // 날짜 - 필수
          start_date: data.start_date,
          end_date: data.end_date,
          status: data.status || 'ended',
          
          // 아티스트 정보
          artists: data.artists || (data.artist_name ? [{
            name: data.artist_name,
            role: 'artist'
          }] : []),
          
          source: 'kukje_gallery_web',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // 중복 확인 (title_en으로)
        const { data: existing } = await supabase
          .from('exhibitions')
          .select('id')
          .eq('title_en', exhibitionData.title_en)
          .eq('venue_name', '국제갤러리')
          .single();
          
        if (existing) {
          console.log(`  - 이미 존재함, 건너뜀: ${exhibitionData.title_en}`);
          continue;
        }
        
        // Insert
        const { data: inserted, error: insertError } = await supabase
          .from('exhibitions')
          .insert([exhibitionData])
          .select();
          
        if (insertError) {
          console.error(`  ✗ 오류:`, insertError.message);
          errorCount++;
          continue;
        }
        
        console.log(`  ✓ 성공: ${exhibitionData.title_en}`)
        
        successCount++;
        
      } catch (error) {
        console.error(`처리 중 오류 (${file}):`, error.message);
        errorCount++;
      }
    }
    
    // 3. 결과 요약
    console.log('\n=== Import 완료 ===');
    console.log(`성공: ${successCount}개`);
    console.log(`실패: ${errorCount}개`);
    
    // 4. Import된 전시 확인
    const { data: imported, count } = await supabase
      .from('exhibitions')
      .select('id, title_en, venue_name, start_date', { count: 'exact' })
      .eq('venue_name', '국제갤러리')
      .order('start_date', { ascending: false })
      .limit(5);
      
    console.log(`\n국제갤러리 전체 전시: ${count}개`);
    console.log('최근 전시:');
    imported?.forEach(ex => {
      console.log(`  - ${ex.title_en} (${ex.start_date})`);
    });
    
  } catch (error) {
    console.error('Import 실패:', error);
    process.exit(1);
  }
}

// 실행
importKukjeExhibitions();