const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importKukjeExhibitions() {
  try {
    console.log('Starting Kukje Gallery exhibitions import...');
    
    // 테이블 존재 확인
    const { data: tables, error: tableError } = await supabase
      .from('exhibitions_unified')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('Table check error:', tableError);
      console.log('exhibitions_unified 테이블이 존재하지 않을 수 있습니다.');
    }
    
    // scripts 폴더의 모든 kukje_detailed_*.json 파일 찾기
    const scriptsDir = path.join(__dirname);
    const files = fs.readdirSync(scriptsDir).filter(file => 
      file.startsWith('kukje_detailed_') && file.endsWith('.json')
    );
    
    console.log(`Found ${files.length} Kukje exhibition files to import`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        console.log(`\nProcessing ${file}...`);
        const filePath = path.join(scriptsDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const exhibition = data.exhibition;
        
        // 기존 전시 확인
        const { data: existing, error: checkError } = await supabase
          .from('exhibitions_unified')
          .select('id')
          .eq('id', exhibition.id)
          .single();
        
        if (existing) {
          console.log(`Exhibition ${exhibition.id} already exists, updating...`);
        }
        
        // 전시 데이터 준비 (exhibitions_unified 테이블 스키마에 맞게)
        const exhibitionData = {
          id: exhibition.id,
          title_en: exhibition.title_en,
          title_local: exhibition.title_ko || exhibition.title_local,
          subtitle: exhibition.subtitle,
          description: exhibition.description,
          description_en: exhibition.description_en,
          venue_name: exhibition.venue_name,
          venue_city: exhibition.venue_city,
          venue_country: exhibition.venue_country,
          start_date: exhibition.start_date,
          end_date: exhibition.end_date || '2026-12-31', // 종료일 없으면 기본값
          status: exhibition.status || 'ended',
          exhibition_type: exhibition.exhibition_type,
          // art_medium 제거 - exhibitions_unified에는 없음
          artworks_count: exhibition.artworks_count,
          artists: exhibition.artists,
          curator: exhibition.curator,
          curatorial_statement: exhibition.curatorial_statement,
          themes: exhibition.themes,
          tags: exhibition.tags,
          admission_fee: exhibition.admission_fee || 0,
          ticket_required: exhibition.ticket_required || false,
          booking_required: exhibition.booking_required || false,
          official_url: exhibition.official_url,
          personality_matches: exhibition.personality_matches,
          recommendation_score: exhibition.recommendation_score,
          data_source: exhibition.data_source,
          data_quality_score: exhibition.data_quality_score,
          created_at: exhibition.created_at,
          updated_at: exhibition.updated_at
        };
        
        // Upsert to exhibitions_unified table
        const { error: upsertError } = await supabase
          .from('exhibitions_unified')
          .upsert(exhibitionData, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });
        
        if (upsertError) {
          console.error(`Error upserting ${exhibition.id}:`, JSON.stringify(upsertError, null, 2));
          errorCount++;
          continue;
        }
        
        // 새로운 테이블들에 추가 데이터 저장 (테이블이 있는 경우)
        
        // exhibition_artworks 테이블에 작품 정보 저장
        if (exhibition.featured_works || exhibition.signature_works) {
          const artworks = exhibition.featured_works || exhibition.signature_works;
          for (const artwork of artworks) {
            const artworkData = {
              exhibition_id: exhibition.id,
              title: artwork.title,
              artist_name: exhibition.artists[0]?.name,
              medium: artwork.medium,
              year: artwork.year || null,
              description: artwork.concept || artwork.significance || null,
              image_url: artwork.image_url || null
            };
            
            const { error: artworkError } = await supabase
              .from('exhibition_artworks')
              .upsert(artworkData);
            
            if (artworkError) {
              console.warn(`Could not save artwork data:`, artworkError.message);
            }
          }
        }
        
        // exhibition_press 테이블에 언론 정보 저장
        if (exhibition.artist_quote || exhibition.curatorial_statement) {
          const pressData = {
            exhibition_id: exhibition.id,
            title: 'Artist Statement',
            content: exhibition.artist_quote || exhibition.curatorial_statement,
            press_type: 'statement',
            language: 'en'
          };
          
          const { error: pressError } = await supabase
            .from('exhibition_press')
            .upsert(pressData);
          
          if (pressError) {
            console.warn(`Could not save press data:`, pressError.message);
          }
        }
        
        console.log(`✓ Successfully imported ${exhibition.title_en}`);
        successCount++;
        
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n=== Import Summary ===');
    console.log(`Total files processed: ${files.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// 실행
importKukjeExhibitions();