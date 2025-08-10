const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fixMETDataIntegrity() {
  console.log('🔧 MET 전시 데이터 무결성 수정 시작...\n');
  
  try {
    // 1. JSON 파일에서 올바른 데이터 가져오기
    const jsonPath = path.join(__dirname, 'met_exhibitions_2025.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const jsonExhibitions = jsonData.exhibitions;
    
    console.log(`📁 JSON에서 ${jsonExhibitions.length}개 전시 로드됨\n`);
    
    // 2. DB에서 MET 전시들 가져오기
    const { data: dbExhibitions, error } = await supabase
      .from('exhibitions')
      .select('*')
      .or('venue_name.ilike.%Metropolitan Museum%,venue_name.ilike.%Met Cloisters%');
    
    if (error) throw error;
    
    console.log(`💾 DB에서 ${dbExhibitions.length}개 전시 로드됨\n`);
    
    // 3. 각 JSON 전시에 대해 DB 업데이트
    let updatedCount = 0;
    let addedCount = 0;
    
    for (const jsonEx of jsonExhibitions) {
      // 제목과 장소로 매칭되는 DB 전시 찾기
      const matchingDbEx = dbExhibitions.find(dbEx => 
        dbEx.title_en === jsonEx.title_en && 
        dbEx.venue_name === jsonEx.venue_name
      );
      
      if (matchingDbEx) {
        // 기존 전시 업데이트
        const updates = {};
        let needsUpdate = false;
        
        // 이미지 정보 추가
        if (jsonEx.poster_image_url && !matchingDbEx.poster_image_url) {
          updates.poster_image_url = jsonEx.poster_image_url;
          needsUpdate = true;
        }
        
        if (jsonEx.gallery_images && (!matchingDbEx.gallery_images || matchingDbEx.gallery_images.length === 0)) {
          updates.gallery_images = jsonEx.gallery_images;
          needsUpdate = true;
        }
        
        // 갤러리 위치 정보 추가
        if (jsonEx.gallery_location && !matchingDbEx.gallery_location) {
          updates.gallery_location = jsonEx.gallery_location;
          needsUpdate = true;
        }
        
        // 종료일 수정 (permanent 전시의 경우 null로 설정)
        if (jsonEx.exhibition_type === 'permanent' && matchingDbEx.end_date) {
          updates.end_date = null;
          needsUpdate = true;
        }
        
        // original_id 설정
        if (jsonEx.id && !matchingDbEx.original_id) {
          updates.original_id = jsonEx.id;
          needsUpdate = true;
        }
        
        // 아티스트 정보 업데이트
        if (jsonEx.artists && (!matchingDbEx.artists || matchingDbEx.artists.length === 0)) {
          updates.artists = jsonEx.artists;
          needsUpdate = true;
        }
        
        // 테마 정보 업데이트
        if (jsonEx.themes && (!matchingDbEx.themes || matchingDbEx.themes.length === 0)) {
          updates.themes = jsonEx.themes;
          needsUpdate = true;
        }
        
        // 공식 URL 추가
        if (jsonEx.official_url && !matchingDbEx.official_url) {
          updates.official_url = jsonEx.official_url;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('exhibitions')
            .update(updates)
            .eq('id', matchingDbEx.id);
          
          if (updateError) {
            console.error(`❌ 업데이트 실패: ${matchingDbEx.title_en}`, updateError.message);
          } else {
            console.log(`✅ 업데이트됨: ${matchingDbEx.title_en}`);
            updatedCount++;
          }
        }
      } else {
        // 새 전시 추가 (만약 매칭되지 않는 전시가 있다면)
        const newExhibition = {
          original_id: jsonEx.id,
          venue_name: jsonEx.venue_name,
          venue_city: jsonEx.venue_city,
          venue_country: jsonEx.venue_country,
          venue_type: jsonEx.venue_type,
          venue_tier: jsonEx.venue_tier,
          title: jsonEx.title,
          title_en: jsonEx.title_en,
          title_local: jsonEx.title_local,
          subtitle: jsonEx.subtitle,
          description: jsonEx.description,
          description_en: jsonEx.description_en,
          artists: jsonEx.artists,
          curator: jsonEx.curator,
          curator_en: jsonEx.curator_en,
          start_date: jsonEx.start_date,
          end_date: jsonEx.exhibition_type === 'permanent' ? null : jsonEx.end_date,
          status: jsonEx.status,
          exhibition_type: jsonEx.exhibition_type,
          art_medium: jsonEx.art_medium,
          themes: jsonEx.themes,
          artworks_count: jsonEx.artworks_count,
          admission_fee: jsonEx.admission_fee,
          ticket_required: jsonEx.ticket_required,
          ticket_price: jsonEx.ticket_price,
          booking_required: jsonEx.booking_required,
          official_url: jsonEx.official_url,
          poster_image_url: jsonEx.poster_image_url,
          gallery_images: jsonEx.gallery_images,
          gallery_location: jsonEx.gallery_location,
          special_events: jsonEx.special_events,
          sponsors: jsonEx.sponsors,
          collaborators: jsonEx.collaborators,
          data_source: jsonEx.data_source,
          data_quality_score: jsonEx.data_quality_score,
          personality_matches: jsonEx.personality_matches,
          recommendation_score: jsonEx.recommendation_score
        };
        
        const { error: insertError } = await supabase
          .from('exhibitions')
          .insert([newExhibition]);
        
        if (insertError) {
          console.error(`❌ 추가 실패: ${jsonEx.title_en}`, insertError.message);
        } else {
          console.log(`➕ 새 전시 추가됨: ${jsonEx.title_en}`);
          addedCount++;
        }
      }
    }
    
    // 4. 중복 제거 (같은 제목과 장소를 가진 전시들)
    console.log('\n🔄 중복 전시 확인 및 제거...');
    
    const duplicateGroups = new Map();
    dbExhibitions.forEach(ex => {
      const key = `${ex.title_en}-${ex.venue_name}`;
      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, []);
      }
      duplicateGroups.get(key).push(ex);
    });
    
    let duplicatesRemoved = 0;
    for (const [key, group] of duplicateGroups) {
      if (group.length > 1) {
        // 가장 최근에 생성된 것을 제외하고 나머지 삭제
        const sorted = group.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const toKeep = sorted[0];
        const toDelete = sorted.slice(1);
        
        console.log(`🗑️  중복 발견: "${key}" - ${group.length}개 중 ${toDelete.length}개 삭제`);
        
        for (const duplicate of toDelete) {
          const { error: deleteError } = await supabase
            .from('exhibitions')
            .delete()
            .eq('id', duplicate.id);
          
          if (deleteError) {
            console.error(`❌ 삭제 실패: ${duplicate.id}`, deleteError.message);
          } else {
            duplicatesRemoved++;
          }
        }
      }
    }
    
    console.log('\n📊 수정 완료 요약:');
    console.log(`   - 업데이트된 전시: ${updatedCount}개`);
    console.log(`   - 새로 추가된 전시: ${addedCount}개`);
    console.log(`   - 제거된 중복 전시: ${duplicatesRemoved}개`);
    
    // 5. 최종 검증
    const { data: finalExhibitions, count: finalCount } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact' })
      .or('venue_name.ilike.%Metropolitan Museum%,venue_name.ilike.%Met Cloisters%');
    
    console.log(`\n✅ 최종 MET 전시 수: ${finalCount}개`);
    
    // 데이터 품질 재확인
    const qualityStats = {
      hasImages: finalExhibitions.filter(ex => ex.poster_image_url).length,
      hasGalleryLocation: finalExhibitions.filter(ex => ex.gallery_location).length,
      hasOfficialUrl: finalExhibitions.filter(ex => ex.official_url).length,
      hasThemes: finalExhibitions.filter(ex => ex.themes && ex.themes.length > 0).length
    };
    
    console.log('\n📈 개선된 데이터 품질:');
    console.log(`   - 포스터 이미지: ${qualityStats.hasImages}/${finalCount}개 (${Math.round(qualityStats.hasImages/finalCount*100)}%)`);
    console.log(`   - 갤러리 위치: ${qualityStats.hasGalleryLocation}/${finalCount}개 (${Math.round(qualityStats.hasGalleryLocation/finalCount*100)}%)`);
    console.log(`   - 공식 URL: ${qualityStats.hasOfficialUrl}/${finalCount}개 (${Math.round(qualityStats.hasOfficialUrl/finalCount*100)}%)`);
    console.log(`   - 테마 정보: ${qualityStats.hasThemes}/${finalCount}개 (${Math.round(qualityStats.hasThemes/finalCount*100)}%)`);
    
  } catch (error) {
    console.error('❌ 수정 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
    if (error.hint) console.error('힌트:', error.hint);
  }
}

// 실행
fixMETDataIntegrity();