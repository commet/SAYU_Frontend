require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 한국 주요 미술관 한글명 및 영문 설명 추가
const koreanVenueTranslations = [
  {
    id: 1253,
    name_ko: '국립현대미술관 서울관',
    description: 'National Museum of Modern and Contemporary Art, Seoul branch, located in the heart of Seoul showcasing contemporary Korean and international art.',
    description_ko: '서울 중심부에 위치한 국립현대미술관 서울관, 한국과 국제 현대미술을 전시'
  },
  {
    id: 1189,
    name_ko: '국립현대미술관 과천관',
    description: 'National Museum of Modern and Contemporary Art, Gwacheon branch, the main branch featuring extensive collections of modern and contemporary art.',
    description_ko: '국립현대미술관의 본관으로 근현대미술의 방대한 컬렉션을 보유'
  },
  {
    id: 1206,
    name_ko: '아시아문화전당',
    description: 'Asia Culture Center, a landmark cultural complex in Gwangju promoting Asian arts and cultural exchange.',
    description_ko: '광주의 랜드마크 문화복합시설로 아시아 예술과 문화 교류를 촉진'
  },
  {
    id: 1304,
    name_ko: '광주시립미술관',
    description: 'Gwangju Museum of Art, a leading contemporary art museum in southwestern Korea.',
    description_ko: '한국 서남권의 대표적인 현대미술관'
  },
  {
    id: 1306,
    name_ko: '대구미술관',
    description: 'Daegu Art Museum, showcasing contemporary art and serving as a cultural hub in southeastern Korea.',
    description_ko: '현대미술을 전시하며 한국 동남권의 문화 허브 역할'
  },
  {
    id: 1207,
    name_ko: '부산시립미술관',
    description: 'Busan Museum of Art, the premier art museum in Korea\'s second largest city, featuring diverse contemporary exhibitions.',
    description_ko: '한국 제2도시 부산의 대표 미술관으로 다양한 현대미술 전시'
  },
  {
    id: 1208,
    name_ko: 'F1963',
    description: 'F1963, a converted wire rope factory turned into a contemporary cultural space featuring art, books, and dining.',
    description_ko: '와이어로프 공장을 개조한 복합문화공간으로 예술, 책, 다이닝을 결합'
  },
  {
    id: 1190,
    name_ko: '디뮤지엄',
    description: 'D Museum, a contemporary art museum in Seoul known for its innovative exhibitions and digital art installations.',
    description_ko: '혁신적인 전시와 디지털 아트 설치로 유명한 서울의 현대미술관'
  },
  {
    id: 1324,
    name_ko: '아모레퍼시픽 미술관',
    description: 'Amorepacific Museum of Art, a corporate museum featuring contemporary art and cultural programs in Seoul.',
    description_ko: '서울에 위치한 기업 미술관으로 현대미술과 문화 프로그램을 제공'
  },
  {
    id: 1325,
    name_ko: '한가람미술관',
    description: 'Hangaram Art Museum, located in Seoul Arts Center, one of Korea\'s most prestigious exhibition venues.',
    description_ko: '예술의전당 내 위치한 한국의 가장 권위 있는 전시 공간 중 하나'
  }
];

async function addKoreanTranslations() {
  try {
    const client = await pool.connect();
    
    console.log('🇰🇷 한국 주요 미술관 한글명 및 영문설명 추가 시작...\n');
    
    for (const venue of koreanVenueTranslations) {
      console.log(`📍 ${venue.name_ko} (ID: ${venue.id}) 업데이트 중...`);
      
      await client.query(`
        UPDATE global_venues 
        SET 
          name_ko = $1,
          description = $2,
          description_ko = $3,
          updated_at = NOW()
        WHERE id = $4
      `, [venue.name_ko, venue.description, venue.description_ko, venue.id]);
      
      console.log(`✅ 완료`);
    }
    
    // 업데이트 결과 확인
    console.log('\n📊 업데이트 결과 확인:');
    console.log('='.repeat(80));
    
    const result = await client.query(`
      SELECT id, name_en, name_ko, city, description, description_ko 
      FROM global_venues 
      WHERE id = ANY($1)
      ORDER BY city, name_ko
    `, [koreanVenueTranslations.map(v => v.id)]);
    
    result.rows.forEach(venue => {
      console.log(`${venue.name_en} → ${venue.name_ko || '❌ 미번역'}`);
      console.log(`  도시: ${venue.city}`);
      console.log(`  영문설명: ${venue.description?.substring(0, 60) || '❌ 미번역'}...`);
      console.log(`  한글설명: ${venue.description_ko?.substring(0, 40) || '❌ 미번역'}...`);
      console.log('-'.repeat(60));
    });
    
    // 전체 통계 다시 확인
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN name_ko IS NOT NULL THEN 1 END) as has_korean_name,
        COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as has_english_desc,
        COUNT(CASE WHEN description_ko IS NOT NULL AND description_ko != '' THEN 1 END) as has_korean_desc
      FROM global_venues 
      WHERE country IN ('South Korea', 'KR')
      AND tier <= 2
    `);
    
    const stat = stats.rows[0];
    console.log(`\n📈 Tier 1-2 한국 미술관 번역 완료율:`);
    console.log(`총 ${stat.total}개 기관`);
    console.log(`한글명: ${stat.has_korean_name}/${stat.total} (${Math.round(stat.has_korean_name/stat.total*100)}%)`);
    console.log(`영문설명: ${stat.has_english_desc}/${stat.total} (${Math.round(stat.has_english_desc/stat.total*100)}%)`);
    console.log(`한글설명: ${stat.has_korean_desc}/${stat.total} (${Math.round(stat.has_korean_desc/stat.total*100)}%)`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addKoreanTranslations();