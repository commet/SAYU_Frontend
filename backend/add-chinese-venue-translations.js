require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 중국 주요 미술관 한글명 번역
const chineseVenueTranslations = [
  {
    id: 1284,
    name_ko: '중국국가박물관',
    description_ko: '베이징 천안문 광장에 위치한 중국 최대 규모의 국립박물관',
    address_ko: '중국 베이징시 동성구 동장안제 16호'
  },
  {
    id: 1247,
    name_ko: '페이스 베이징',
    description_ko: '국제적인 현대미술 갤러리 페이스의 베이징 지점',
    address_ko: '중국 베이징시 차오양구'
  },
  {
    id: 1223,
    name_ko: 'UCCA 당대예술센터',
    description_ko: '베이징의 대표적인 현대미술관, 중국 당대예술의 중심지',
    address_ko: '중국 베이징시 차오양구 798예술구'
  },
  {
    id: 1250,
    name_ko: '롱미술관',
    description_ko: '상하이의 현대미술관, 중국 당대예술과 국제 현대미술 전시',
    address_ko: '중국 상하이시 푸둥신구'
  },
  {
    id: 1221,
    name_ko: '파워스테이션 오브 아트',
    description_ko: '상하이 비엔날레 본부이자 중국 최대 현대미술관',
    address_ko: '중국 상하이시 황푸구 화디안루 200호'
  },
  {
    id: 1252,
    name_ko: '웨스트번드 미술관',
    description_ko: '상하이 웨스트번드 문화구역의 현대미술관',
    address_ko: '중국 상하이시 쉬후이구 룽텅다다오'
  },
  {
    id: 1300,
    name_ko: '유즈미술관',
    description_ko: '중국 현대미술과 국제 현대미술을 전시하는 사립미술관',
    address_ko: '중국 상하이시 쉬후이구'
  }
];

async function addChineseTranslations() {
  try {
    const client = await pool.connect();
    
    console.log('🇨🇳 중국 미술관 한글명 추가 시작...\n');
    
    for (const venue of chineseVenueTranslations) {
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
      WHERE country = 'China' 
      ORDER BY city, name_en
    `);
    
    result.rows.forEach(venue => {
      console.log(`${venue.name_en} → ${venue.name_ko || '❌ 미번역'}`);
      console.log(`  도시: ${venue.city}`);
      console.log(`  설명: ${venue.description_ko?.substring(0, 40) || '❌ 미번역'}...`);
      console.log('-'.repeat(40));
    });
    
    const totalChinese = await client.query('SELECT COUNT(*) FROM global_venues WHERE country = \'China\'');
    const translatedChinese = await client.query('SELECT COUNT(*) FROM global_venues WHERE country = \'China\' AND name_ko IS NOT NULL');
    
    console.log(`\n📈 번역 완료율: ${translatedChinese.rows[0].count}/${totalChinese.rows[0].count} (${Math.round(translatedChinese.rows[0].count/totalChinese.rows[0].count*100)}%)`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addChineseTranslations();