const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateExhibitionsSchema() {
  console.log('🔄 exhibitions 테이블 스키마 업데이트 시작...\n');
  
  try {
    // 1. 새로운 컬럼들 추가
    const alterTableQueries = [
      // 이미지 관련
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS poster_image_url TEXT`,
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS gallery_images TEXT[]`,
      
      // 전시 정보
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS themes TEXT[]`,
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS sponsors TEXT[]`,
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS collaborators TEXT[]`,
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS special_events JSONB`,
      
      // 위치 정보
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS gallery_location TEXT`,
      
      // 추가 메타데이터
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS art_medium TEXT[]`,
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS curator_en TEXT`,
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS description_en TEXT`,
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS booking_required BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS ticket_required BOOLEAN DEFAULT FALSE`,
      
      // 상설 전시를 위한 is_permanent 플래그
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS is_permanent BOOLEAN DEFAULT FALSE`,
      
      // 데이터 품질 관련
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS data_source TEXT`,
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS data_quality_score NUMERIC(3,2)`,
      
      // SAYU 특화 기능
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS personality_matches JSONB`,
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS recommendation_score NUMERIC(3,2)`,
      
      // 전시 분류
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS venue_type TEXT`,
      `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS venue_tier TEXT`
    ];

    console.log('📊 컬럼 추가 중...');
    for (const query of alterTableQueries) {
      const { error } = await supabase.rpc('execute_sql', { query });
      if (error) {
        console.log(`⚠️ 쿼리 실행 중 경고 (이미 존재할 수 있음):`, error.message);
      }
    }
    console.log('✅ 컬럼 추가 완료\n');

    // 2. exhibition_type enum 업데이트 (permanent 추가)
    console.log('🔧 exhibition_type 업데이트 중...');
    
    // 먼저 현재 exhibition_type의 constraint 확인 및 업데이트
    const updateExhibitionType = `
      DO $$ 
      BEGIN
        -- exhibition_type이 TEXT 타입인지 확인
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exhibitions' 
          AND column_name = 'exhibition_type'
          AND data_type = 'text'
        ) THEN
          -- CHECK constraint 추가 (있으면 먼저 삭제)
          ALTER TABLE exhibitions 
          DROP CONSTRAINT IF EXISTS exhibitions_exhibition_type_check;
          
          ALTER TABLE exhibitions 
          ADD CONSTRAINT exhibitions_exhibition_type_check 
          CHECK (exhibition_type IN (
            'solo', 'group', 'permanent', 'collection', 
            'special', 'retrospective', 'traveling', 
            'online', 'virtual', 'popup'
          ));
        END IF;
      END $$;
    `;
    
    const { error: typeError } = await supabase.rpc('execute_sql', { 
      query: updateExhibitionType 
    });
    
    if (typeError) {
      console.log('⚠️ exhibition_type 업데이트 중 경고:', typeError.message);
    } else {
      console.log('✅ exhibition_type 업데이트 완료\n');
    }

    // 3. 상설 전시 처리를 위한 트리거 생성
    console.log('🔧 상설 전시 처리 트리거 생성 중...');
    
    const createTrigger = `
      CREATE OR REPLACE FUNCTION handle_permanent_exhibition()
      RETURNS TRIGGER AS $$
      BEGIN
        -- 상설 전시인 경우
        IF NEW.is_permanent = TRUE OR NEW.exhibition_type = 'permanent' THEN
          -- end_date를 NULL 또는 매우 먼 미래로 설정
          IF NEW.end_date IS NULL OR NEW.end_date < '2099-12-31' THEN
            NEW.end_date := '2099-12-31'::DATE;
          END IF;
          NEW.is_permanent := TRUE;
          NEW.exhibition_type := 'permanent';
          NEW.status := 'ongoing';
        END IF;
        
        -- status 자동 업데이트
        IF NEW.end_date IS NOT NULL THEN
          IF NEW.start_date > CURRENT_DATE THEN
            NEW.status := 'upcoming';
          ELSIF NEW.end_date < CURRENT_DATE AND NEW.is_permanent = FALSE THEN
            NEW.status := 'closed';
          ELSE
            NEW.status := 'ongoing';
          END IF;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS permanent_exhibition_trigger ON exhibitions;
      
      CREATE TRIGGER permanent_exhibition_trigger
      BEFORE INSERT OR UPDATE ON exhibitions
      FOR EACH ROW
      EXECUTE FUNCTION handle_permanent_exhibition();
    `;
    
    const { error: triggerError } = await supabase.rpc('execute_sql', { 
      query: createTrigger 
    });
    
    if (triggerError) {
      console.log('⚠️ 트리거 생성 중 경고:', triggerError.message);
    } else {
      console.log('✅ 트리거 생성 완료\n');
    }

    // 4. 인덱스 추가 (성능 최적화)
    console.log('🔧 인덱스 추가 중...');
    
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_exhibitions_is_permanent ON exhibitions(is_permanent)`,
      `CREATE INDEX IF NOT EXISTS idx_exhibitions_exhibition_type ON exhibitions(exhibition_type)`,
      `CREATE INDEX IF NOT EXISTS idx_exhibitions_venue_name ON exhibitions(venue_name)`,
      `CREATE INDEX IF NOT EXISTS idx_exhibitions_status ON exhibitions(status)`,
      `CREATE INDEX IF NOT EXISTS idx_exhibitions_dates ON exhibitions(start_date, end_date)`
    ];
    
    for (const query of indexQueries) {
      const { error } = await supabase.rpc('execute_sql', { query });
      if (error) {
        console.log(`⚠️ 인덱스 생성 중 경고:`, error.message);
      }
    }
    console.log('✅ 인덱스 추가 완료\n');

    // 5. 스키마 검증
    console.log('🔍 업데이트된 스키마 확인...');
    const { data: sample, error: sampleError } = await supabase
      .from('exhibitions')
      .select('*')
      .limit(1);
    
    if (!sampleError && sample && sample.length > 0) {
      const newColumns = [
        'poster_image_url', 'gallery_images', 'themes', 
        'sponsors', 'is_permanent', 'personality_matches'
      ];
      
      const existingColumns = Object.keys(sample[0]);
      console.log('\n새로 추가된 컬럼 확인:');
      newColumns.forEach(col => {
        const exists = existingColumns.includes(col);
        console.log(`  ${exists ? '✅' : '❌'} ${col}`);
      });
    }
    
    console.log('\n✨ 스키마 업데이트 완료!');
    console.log('\n📌 상설 전시 처리 방식:');
    console.log('  - is_permanent = true 설정');
    console.log('  - exhibition_type = "permanent" 설정');
    console.log('  - end_date = "2099-12-31" (관례적 무한대 날짜)');
    console.log('  - status = "ongoing" (항상 진행중)');
    
  } catch (error) {
    console.error('❌ 스키마 업데이트 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
    if (error.hint) console.error('힌트:', error.hint);
  }
}

// 실행
updateExhibitionsSchema();