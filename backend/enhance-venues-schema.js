#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function enhanceVenuesSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🏛️ venues 테이블 스키마 확장 시작');
    console.log('📋 추가할 필드:');
    console.log('   - 지리적 정보 (주소, 위도/경도)');
    console.log('   - 운영 정보 (시간, 입장료)');
    console.log('   - 특징/설명 (전문분야, 설립연도)');
    console.log('   - 연락처 (전화, 이메일, SNS)');
    console.log('   - 편의시설 정보\n');

    await client.query('BEGIN');

    // 지리적 정보 컬럼 추가
    const geographicColumns = [
      'address TEXT',
      'latitude DECIMAL(10, 8)',
      'longitude DECIMAL(11, 8)',
      'postal_code VARCHAR(20)',
      'district VARCHAR(100)',
      'subway_station VARCHAR(200)',
      'parking_info TEXT'
    ];

    for (const column of geographicColumns) {
      const columnName = column.split(' ')[0];
      try {
        await client.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS ${column}`);
        console.log(`✅ 지리정보: ${columnName} 컬럼 추가`);
      } catch (error) {
        console.log(`ℹ️  지리정보: ${columnName} - ${error.message}`);
      }
    }

    // 운영 정보 컬럼 추가
    const operationColumns = [
      'opening_hours JSONB',
      'closed_days TEXT[]',
      'admission_fee JSONB',
      'special_hours JSONB',
      'holiday_schedule JSONB'
    ];

    for (const column of operationColumns) {
      const columnName = column.split(' ')[0];
      try {
        await client.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS ${column}`);
        console.log(`✅ 운영정보: ${columnName} 컬럼 추가`);
      } catch (error) {
        console.log(`ℹ️  운영정보: ${columnName} - ${error.message}`);
      }
    }

    // 특징/설명 컬럼 추가
    const descriptiveColumns = [
      'description TEXT',
      'specialties TEXT[]',
      'established_year INTEGER',
      'architect VARCHAR(200)',
      'building_type VARCHAR(100)',
      'floor_area INTEGER',
      'exhibition_spaces INTEGER',
      'permanent_collection BOOLEAN DEFAULT false',
      'art_genres TEXT[]'
    ];

    for (const column of descriptiveColumns) {
      const columnName = column.split(' ')[0];
      try {
        await client.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS ${column}`);
        console.log(`✅ 특징정보: ${columnName} 컬럼 추가`);
      } catch (error) {
        console.log(`ℹ️  특징정보: ${columnName} - ${error.message}`);
      }
    }

    // 연락처 정보 컬럼 추가
    const contactColumns = [
      'phone VARCHAR(50)',
      'email VARCHAR(200)',
      'social_media JSONB',
      'official_app VARCHAR(200)',
      'newsletter_signup VARCHAR(500)'
    ];

    for (const column of contactColumns) {
      const columnName = column.split(' ')[0];
      try {
        await client.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS ${column}`);
        console.log(`✅ 연락처: ${columnName} 컬럼 추가`);
      } catch (error) {
        console.log(`ℹ️  연락처: ${columnName} - ${error.message}`);
      }
    }

    // 편의시설 정보 컬럼 추가
    const facilityColumns = [
      'facilities JSONB',
      'accessibility JSONB',
      'shop BOOLEAN DEFAULT false',
      'cafe_restaurant BOOLEAN DEFAULT false',
      'wifi BOOLEAN DEFAULT false',
      'photography_allowed BOOLEAN DEFAULT true',
      'group_tours BOOLEAN DEFAULT false',
      'audio_guide BOOLEAN DEFAULT false'
    ];

    for (const column of facilityColumns) {
      const columnName = column.split(' ')[0];
      try {
        await client.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS ${column}`);
        console.log(`✅ 편의시설: ${columnName} 컬럼 추가`);
      } catch (error) {
        console.log(`ℹ️  편의시설: ${columnName} - ${error.message}`);
      }
    }

    // 평가/통계 정보 컬럼 추가
    const analyticsColumns = [
      'rating DECIMAL(3,2)',
      'review_count INTEGER DEFAULT 0',
      'visitor_count_annual INTEGER',
      'instagram_followers INTEGER',
      'last_updated TIMESTAMP DEFAULT NOW()',
      'data_completeness INTEGER DEFAULT 0'
    ];

    for (const column of analyticsColumns) {
      const columnName = column.split(' ')[0];
      try {
        await client.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS ${column}`);
        console.log(`✅ 평가정보: ${columnName} 컬럼 추가`);
      } catch (error) {
        console.log(`ℹ️  평가정보: ${columnName} - ${error.message}`);
      }
    }

    // 인덱스 생성
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_venues_location ON venues USING GIST (ST_POINT(longitude, latitude))',
      'CREATE INDEX IF NOT EXISTS idx_venues_city_country ON venues(city, country)',
      'CREATE INDEX IF NOT EXISTS idx_venues_tier_active ON venues(tier, is_active)',
      'CREATE INDEX IF NOT EXISTS idx_venues_specialties ON venues USING GIN(specialties)',
      'CREATE INDEX IF NOT EXISTS idx_venues_art_genres ON venues USING GIN(art_genres)',
      'CREATE INDEX IF NOT EXISTS idx_venues_rating ON venues(rating DESC)',
      'CREATE INDEX IF NOT EXISTS idx_venues_data_completeness ON venues(data_completeness DESC)'
    ];

    console.log('\n📊 인덱스 생성 중...');
    for (const indexQuery of indexes) {
      try {
        await client.query(indexQuery);
        console.log(`✅ 인덱스 생성: ${indexQuery.split(' ')[5]}`);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`ℹ️  인덱스: ${error.message}`);
        }
      }
    }

    await client.query('COMMIT');

    // 테이블 구조 확인
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'venues' 
      ORDER BY ordinal_position
    `);

    console.log('\n📋 완성된 venues 테이블 구조:');
    console.log('='.repeat(80));
    
    let categoryColumns = {
      '기본정보': ['id', 'name', 'city', 'country', 'tier', 'is_active'],
      '지리정보': ['address', 'latitude', 'longitude', 'postal_code', 'district', 'subway_station'],
      '운영정보': ['opening_hours', 'closed_days', 'admission_fee', 'special_hours'],
      '특징정보': ['description', 'specialties', 'established_year', 'art_genres', 'building_type'],
      '연락처': ['website', 'phone', 'email', 'social_media'],
      '편의시설': ['facilities', 'accessibility', 'shop', 'cafe_restaurant', 'wifi'],
      '통계정보': ['rating', 'review_count', 'visitor_count_annual', 'data_completeness']
    };

    for (const [category, columns] of Object.entries(categoryColumns)) {
      console.log(`\n${category}:`);
      tableInfo.rows.forEach(col => {
        if (columns.includes(col.column_name)) {
          console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
        }
      });
    }

    console.log('\n🎉 venues 테이블 스키마 확장 완료!');
    console.log(`📊 총 ${tableInfo.rows.length}개 컬럼으로 확장`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 스키마 확장 오류:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await enhanceVenuesSchema();
  } catch (error) {
    console.error('실행 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { enhanceVenuesSchema };