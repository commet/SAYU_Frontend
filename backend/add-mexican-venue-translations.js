require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 멕시코 주요 미술관 한글명 번역
const mexicanVenueTranslations = [
  {
    id: 1271,
    name_ko: '프리다 칼로 박물관',
    description_ko: '멕시코의 상징적인 화가 프리다 칼로의 생가이자 박물관, 블루 하우스로도 유명',
    address_ko: '멕시코 멕시코시티 코요아칸 런던 247'
  },
  {
    id: 1273,
    name_ko: '국립인류학박물관',
    description_ko: '멕시코와 중남미 고대 문명의 유물을 전시하는 세계적인 인류학 박물관',
    address_ko: '멕시코 멕시코시티 미겔 이달고 구역 차풀테펙 공원'
  }
];

async function addMexicanTranslations() {
  try {
    const client = await pool.connect();
    
    console.log('🇲🇽 멕시코 미술관 한글명 추가 시작...\n');
    
    for (const venue of mexicanVenueTranslations) {
      console.log(`📍 ${venue.name_ko} (ID: ${venue.id}) 업데이트 중...`);
      
      await client.query(`
        UPDATE global_venues 
        SET 
          name_ko = $1,
          description_ko = $2,
          address_ko = $3,
          updated_at = NOW()
        WHERE id = $4
      `, [venue.name_ko, venue.description_ko, venue.address_ko, venue.id]);
      
      console.log(`✅ 완료`);
    }
    
    // 업데이트 결과 확인
    console.log('\n📊 업데이트 결과 확인:');
    console.log('='.repeat(60));
    
    const result = await client.query(`
      SELECT id, name_en, name_ko, city, description_ko 
      FROM global_venues 
      WHERE country = 'Mexico' 
      ORDER BY city, name_en
    `);
    
    result.rows.forEach(venue => {
      console.log(`${venue.name_en} → ${venue.name_ko || '❌ 미번역'}`);
      console.log(`  도시: ${venue.city}`);
      console.log(`  설명: ${venue.description_ko?.substring(0, 40) || '❌ 미번역'}...`);
      console.log('-'.repeat(40));
    });
    
    const totalMexican = await client.query('SELECT COUNT(*) FROM global_venues WHERE country = \'Mexico\'');
    const translatedMexican = await client.query('SELECT COUNT(*) FROM global_venues WHERE country = \'Mexico\' AND name_ko IS NOT NULL');
    
    console.log(`\n📈 번역 완료율: ${translatedMexican.rows[0].count}/${totalMexican.rows[0].count} (${Math.round(translatedMexican.rows[0].count/totalMexican.rows[0].count*100)}%)`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addMexicanTranslations();