const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateMETWithExistingSchema() {
  console.log('🔧 MET 전시 데이터 업데이트 (기존 스키마 사용)...\n');
  
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
    
    // 3. 각 JSON 전시에 대해 DB 업데이트 (기존 스키마 사용)
    let updatedCount = 0;
    let addedCount = 0;
    
    for (const jsonEx of jsonExhibitions) {
      // 제목과 장소로 매칭되는 DB 전시 찾기
      const matchingDbEx = dbExhibitions.find(dbEx => 
        dbEx.title_en === jsonEx.title_en && 
        (dbEx.venue_name === jsonEx.venue_name || 
         (dbEx.venue_name === 'Metropolitan Museum of Art' && jsonEx.venue_name.includes('Metropolitan')))
      );
      
      if (matchingDbEx) {
        // 기존 전시 업데이트 (존재하는 컬럼만 사용)
        const updates = {};
        let needsUpdate = false;
        
        // 아티스트 정보 업데이트
        if (jsonEx.artists && (!matchingDbEx.artists || matchingDbEx.artists.length === 0)) {
          // artists 배열에서 name만 추출
          const artistNames = jsonEx.artists.map(artist => 
            typeof artist === 'string' ? artist : artist.name
          ).filter(name => name);
          
          if (artistNames.length > 0) {
            updates.artists = artistNames;
            needsUpdate = true;
          }
        }
        
        // 큐레이터 정보 업데이트
        if (jsonEx.curator && !matchingDbEx.curator) {
          updates.curator = jsonEx.curator;
          needsUpdate = true;
        }
        
        // 작품 수 업데이트
        if (jsonEx.artworks_count && !matchingDbEx.artworks_count) {
          updates.artworks_count = jsonEx.artworks_count;
          needsUpdate = true;
        }
        
        // 티켓 가격 정보 업데이트
        if (jsonEx.ticket_price && !matchingDbEx.ticket_price) {
          updates.ticket_price = jsonEx.ticket_price;
          needsUpdate = true;
        }
        
        // 공식 URL 추가
        if (jsonEx.official_url && !matchingDbEx.official_url) {
          updates.official_url = jsonEx.official_url;
          needsUpdate = true;
        }
        
        // 전시 유형 업데이트
        if (jsonEx.exhibition_type && matchingDbEx.exhibition_type !== jsonEx.exhibition_type) {
          updates.exhibition_type = jsonEx.exhibition_type;
          needsUpdate = true;
        }
        
        // 종료일 수정 (permanent 전시의 경우 null로 설정)
        if (jsonEx.exhibition_type === 'permanent' && matchingDbEx.end_date) {
          updates.end_date = null;
          needsUpdate = true;
        }
        
        // tags에 themes 정보 저장
        if (jsonEx.themes && (!matchingDbEx.tags || matchingDbEx.tags.length === 0)) {
          updates.tags = jsonEx.themes;
          needsUpdate = true;
        }
        
        // 상태 업데이트
        if (jsonEx.status && matchingDbEx.status !== jsonEx.status) {
          updates.status = jsonEx.status;
          needsUpdate = true;
        }
        
        // 설명 보완 (더 자세한 설명이 있는 경우)
        if (jsonEx.description_en && jsonEx.description_en.length > (matchingDbEx.description || '').length) {
          updates.description = jsonEx.description_en;
          needsUpdate = true;
        }
        
        // 입장료 정보 업데이트
        if (jsonEx.admission_fee !== undefined && matchingDbEx.admission_fee === null) {
          updates.admission_fee = jsonEx.admission_fee;
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
        } else {
          console.log(`⚪ 업데이트 불필요: ${matchingDbEx.title_en}`);
        }
      } else {
        // 새 전시 추가 (기존 스키마에 맞춰서)
        const artistNames = jsonEx.artists ? jsonEx.artists.map(artist => 
          typeof artist === 'string' ? artist : artist.name
        ).filter(name => name) : null;
        
        const newExhibition = {
          title_en: jsonEx.title_en,
          title_local: jsonEx.title_local || jsonEx.title_en,
          subtitle: jsonEx.subtitle,
          start_date: jsonEx.start_date,
          end_date: jsonEx.exhibition_type === 'permanent' ? null : jsonEx.end_date,
          status: jsonEx.status,
          description: jsonEx.description_en || jsonEx.description,
          curator: jsonEx.curator,
          artists: artistNames,
          artworks_count: jsonEx.artworks_count,
          ticket_price: jsonEx.ticket_price,
          official_url: jsonEx.official_url,
          exhibition_type: jsonEx.exhibition_type,
          tags: jsonEx.themes,
          venue_name: jsonEx.venue_name,
          venue_city: jsonEx.venue_city,
          venue_country: jsonEx.venue_country,
          admission_fee: jsonEx.admission_fee,
          source: 'met_museum_json_import',
          ai_verified: true,
          ai_confidence: jsonEx.data_quality_score || 95
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
    
    console.log('\n📊 업데이트 완료 요약:');
    console.log(`   - 업데이트된 전시: ${updatedCount}개`);
    console.log(`   - 새로 추가된 전시: ${addedCount}개`);
    
    // 4. 최종 검증
    const { data: finalExhibitions, count: finalCount } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact' })
      .or('venue_name.ilike.%Metropolitan Museum%,venue_name.ilike.%Met Cloisters%');
    
    console.log(`\n✅ 최종 MET 전시 수: ${finalCount}개`);
    
    // 데이터 품질 확인
    const qualityStats = {
      hasOfficialUrl: finalExhibitions.filter(ex => ex.official_url).length,
      hasArtists: finalExhibitions.filter(ex => ex.artists && ex.artists.length > 0).length,
      hasArtworkCount: finalExhibitions.filter(ex => ex.artworks_count).length,
      hasTicketPrice: finalExhibitions.filter(ex => ex.ticket_price).length,
      hasThemes: finalExhibitions.filter(ex => ex.tags && ex.tags.length > 0).length,
      hasAdmissionFee: finalExhibitions.filter(ex => ex.admission_fee !== null).length
    };
    
    console.log('\n📈 업데이트된 데이터 품질:');
    console.log(`   - 공식 URL: ${qualityStats.hasOfficialUrl}/${finalCount}개 (${Math.round(qualityStats.hasOfficialUrl/finalCount*100)}%)`);
    console.log(`   - 아티스트 정보: ${qualityStats.hasArtists}/${finalCount}개 (${Math.round(qualityStats.hasArtists/finalCount*100)}%)`);
    console.log(`   - 작품 수: ${qualityStats.hasArtworkCount}/${finalCount}개 (${Math.round(qualityStats.hasArtworkCount/finalCount*100)}%)`);
    console.log(`   - 티켓 가격: ${qualityStats.hasTicketPrice}/${finalCount}개 (${Math.round(qualityStats.hasTicketPrice/finalCount*100)}%)`);
    console.log(`   - 테마(태그): ${qualityStats.hasThemes}/${finalCount}개 (${Math.round(qualityStats.hasThemes/finalCount*100)}%)`);
    console.log(`   - 입장료: ${qualityStats.hasAdmissionFee}/${finalCount}개 (${Math.round(qualityStats.hasAdmissionFee/finalCount*100)}%)`);
    
  } catch (error) {
    console.error('❌ 업데이트 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
    if (error.hint) console.error('힌트:', error.hint);
  }
}

// 실행
updateMETWithExistingSchema();