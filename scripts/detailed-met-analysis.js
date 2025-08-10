const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function detailedMETAnalysis() {
  console.log('🔬 MET 전시 데이터 상세 분석 시작...\n');
  
  try {
    // 1. DB에서 모든 MET 전시 조회
    const { data: dbExhibitions, error } = await supabase
      .from('exhibitions')
      .select('*')
      .or('venue_name.ilike.%Metropolitan Museum%,venue_name.ilike.%Met Cloisters%')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // 2. JSON 파일 읽기
    const jsonPath = path.join(__dirname, 'met_exhibitions_2025.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const jsonExhibitions = jsonData.exhibitions;
    
    console.log('📊 전체 비교:');
    console.log(`   - DB 전시 수: ${dbExhibitions.length}개`);
    console.log(`   - JSON 전시 수: ${jsonExhibitions.length}개\n`);
    
    // 3. JSON에 있는 전시 ID들
    const jsonIds = new Set(jsonExhibitions.map(ex => ex.id));
    const dbIds = new Set(dbExhibitions.map(ex => ex.original_id || ex.id));
    
    console.log('🔍 ID 매칭 분석:');
    console.log(`   - JSON의 고유 ID: ${jsonIds.size}개`);
    console.log(`   - DB의 고유 ID: ${dbIds.size}개\n`);
    
    // 4. DB에만 있는 전시 찾기
    const onlyInDb = dbExhibitions.filter(ex => 
      !jsonIds.has(ex.original_id) && !jsonIds.has(ex.id)
    );
    
    // 5. JSON에만 있는 전시 찾기  
    const onlyInJson = jsonExhibitions.filter(ex => 
      !dbExhibitions.some(dbEx => 
        dbEx.original_id === ex.id || 
        dbEx.id === ex.id ||
        (dbEx.title_en === ex.title_en && dbEx.venue_name === ex.venue_name)
      )
    );
    
    console.log('📈 차이 분석:');
    console.log(`   - DB에만 있는 전시: ${onlyInDb.length}개`);
    console.log(`   - JSON에만 있는 전시: ${onlyInJson.length}개\n`);
    
    if (onlyInDb.length > 0) {
      console.log('🔎 DB에만 있는 전시:');
      onlyInDb.forEach((ex, index) => {
        console.log(`${index + 1}. ${ex.title_en || ex.title}`);
        console.log(`   - DB ID: ${ex.id}`);
        console.log(`   - Original ID: ${ex.original_id || 'N/A'}`);
        console.log(`   - 장소: ${ex.venue_name}`);
        console.log(`   - 기간: ${ex.start_date} ~ ${ex.end_date || 'ongoing'}`);
        console.log(`   - 상태: ${ex.status}`);
        console.log(`   - 생성일: ${ex.created_at}\n`);
      });
    }
    
    if (onlyInJson.length > 0) {
      console.log('📝 JSON에만 있는 전시:');
      onlyInJson.forEach((ex, index) => {
        console.log(`${index + 1}. ${ex.title_en || ex.title}`);
        console.log(`   - JSON ID: ${ex.id}`);
        console.log(`   - 장소: ${ex.venue_name}`);
        console.log(`   - 기간: ${ex.start_date} ~ ${ex.end_date || 'ongoing'}`);
        console.log(`   - 상태: ${ex.status}\n`);
      });
    }
    
    // 6. 매칭된 전시들의 데이터 일관성 확인
    console.log('🔗 매칭된 전시 데이터 일관성 확인:');
    let inconsistencies = [];
    
    jsonExhibitions.forEach(jsonEx => {
      const dbEx = dbExhibitions.find(db => 
        db.original_id === jsonEx.id || 
        db.id === jsonEx.id ||
        (db.title_en === jsonEx.title_en && db.venue_name === jsonEx.venue_name)
      );
      
      if (dbEx) {
        // 제목 비교
        if (dbEx.title_en !== jsonEx.title_en) {
          inconsistencies.push(`제목 불일치: ${jsonEx.id} - DB: "${dbEx.title_en}" vs JSON: "${jsonEx.title_en}"`);
        }
        
        // 날짜 비교
        if (dbEx.start_date !== jsonEx.start_date) {
          inconsistencies.push(`시작일 불일치: ${jsonEx.id} - DB: ${dbEx.start_date} vs JSON: ${jsonEx.start_date}`);
        }
        
        if (dbEx.end_date !== jsonEx.end_date) {
          inconsistencies.push(`종료일 불일치: ${jsonEx.id} - DB: ${dbEx.end_date} vs JSON: ${jsonEx.end_date}`);
        }
      }
    });
    
    if (inconsistencies.length > 0) {
      console.log(`   ❌ ${inconsistencies.length}개의 불일치 발견:`);
      inconsistencies.forEach(issue => console.log(`      - ${issue}`));
    } else {
      console.log('   ✅ 매칭된 전시들의 데이터 일관성 확인');
    }
    
    // 7. 데이터 품질 점수 분석
    console.log('\n📊 데이터 품질 분석:');
    const qualityStats = {
      hasImages: dbExhibitions.filter(ex => ex.poster_image_url).length,
      hasDescription: dbExhibitions.filter(ex => ex.description_en || ex.description).length,
      hasArtistInfo: dbExhibitions.filter(ex => ex.artists && ex.artists.length > 0).length,
      hasPrice: dbExhibitions.filter(ex => ex.admission_fee !== null).length,
      hasLocation: dbExhibitions.filter(ex => ex.gallery_location).length
    };
    
    console.log(`   - 포스터 이미지 있음: ${qualityStats.hasImages}/${dbExhibitions.length}개 (${Math.round(qualityStats.hasImages/dbExhibitions.length*100)}%)`);
    console.log(`   - 설명 있음: ${qualityStats.hasDescription}/${dbExhibitions.length}개 (${Math.round(qualityStats.hasDescription/dbExhibitions.length*100)}%)`);
    console.log(`   - 아티스트 정보 있음: ${qualityStats.hasArtistInfo}/${dbExhibitions.length}개 (${Math.round(qualityStats.hasArtistInfo/dbExhibitions.length*100)}%)`);
    console.log(`   - 가격 정보 있음: ${qualityStats.hasPrice}/${dbExhibitions.length}개 (${Math.round(qualityStats.hasPrice/dbExhibitions.length*100)}%)`);
    console.log(`   - 갤러리 위치 있음: ${qualityStats.hasLocation}/${dbExhibitions.length}개 (${Math.round(qualityStats.hasLocation/dbExhibitions.length*100)}%)`);
    
  } catch (error) {
    console.error('❌ 분석 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
detailedMETAnalysis();