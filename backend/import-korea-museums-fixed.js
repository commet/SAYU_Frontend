const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function importKoreaMuseums() {
  try {
    console.log('🏛️  전국 박물관/미술관 데이터 가져오기 시작...\n');
    
    // JSON 파일 읽기
    const filePath = path.join(__dirname, '..', '전국박물관미술관정보표준데이터.json');
    const data = await fs.readFile(filePath, 'utf8');
    const museums = JSON.parse(data).records;
    
    console.log(`📊 총 ${museums.length}개의 박물관/미술관 데이터 발견\n`);
    
    // 미술관만 필터링 (박물관 제외)
    const artMuseums = museums.filter(m => 
      m.시설명.includes('미술관') || 
      m.시설명.includes('갤러리') ||
      m.시설명.includes('아트') ||
      m.박물관미술관구분 === '미술관'
    );
    
    console.log(`🎨 미술관/갤러리: ${artMuseums.length}개\n`);
    
    let added = 0;
    let updated = 0;
    let errors = 0;
    
    for (const museum of artMuseums) {
      try {
        // 도시 정보 추출
        const addressParts = museum.소재지도로명주소?.split(' ') || [];
        const city = addressParts[0] || '';
        const district = addressParts[1] || '';
        
        // 기존 venue 체크
        const existing = await pool.query(
          'SELECT id FROM venues WHERE name = $1 AND city = $2',
          [museum.시설명, city]
        );
        
        // 운영시간 JSON 형식으로 변환
        const openingHours = {
          평일: {
            시작: museum.평일관람시작시각 || '09:00',
            종료: museum.평일관람종료시각 || '18:00'
          },
          주말: {
            시작: museum.공휴일관람시작시각 || museum.평일관람시작시각 || '09:00',
            종료: museum.공휴일관람종료시각 || museum.평일관람종료시각 || '18:00'
          },
          휴관일: museum.휴관정보
        };
        
        // 입장료 JSON 형식으로 변환
        const admissionFee = museum.관람료유무여부 === '유료' ? {
          성인: museum.어른관람료,
          청소년: museum.청소년관람료,
          어린이: museum.어린이관람료
        } : { 무료: true };
        
        if (existing.rows.length > 0) {
          // 업데이트
          await pool.query(`
            UPDATE venues SET
              address = $1,
              latitude = $2,
              longitude = $3,
              phone = $4,
              website = $5,
              opening_hours = $6,
              admission_fee = $7,
              type = $8,
              district = $9,
              updated_at = NOW(),
              last_updated = NOW()
            WHERE id = $10
          `, [
            museum.소재지도로명주소,
            museum.위도 ? parseFloat(museum.위도) : null,
            museum.경도 ? parseFloat(museum.경도) : null,
            museum.운영기관전화번호,
            museum.운영기관홈페이지,
            JSON.stringify(openingHours),
            JSON.stringify(admissionFee),
            museum.박물관미술관구분,
            district,
            existing.rows[0].id
          ]);
          updated++;
        } else {
          // 새로 추가
          await pool.query(`
            INSERT INTO venues (
              name, city, district, country, address,
              latitude, longitude,
              phone, website,
              opening_hours, admission_fee,
              type, is_active,
              created_at, updated_at, last_updated
            ) VALUES (
              $1, $2, $3, 'KR', $4,
              $5, $6,
              $7, $8,
              $9, $10,
              $11, true,
              NOW(), NOW(), NOW()
            )
          `, [
            museum.시설명,
            city,
            district,
            museum.소재지도로명주소,
            museum.위도 ? parseFloat(museum.위도) : null,
            museum.경도 ? parseFloat(museum.경도) : null,
            museum.운영기관전화번호,
            museum.운영기관홈페이지,
            JSON.stringify(openingHours),
            JSON.stringify(admissionFee),
            museum.박물관미술관구분
          ]);
          added++;
          
          if (added <= 10) {
            console.log(`✅ 추가: ${museum.시설명} (${city} ${district})`);
          }
        }
        
      } catch (error) {
        errors++;
        if (errors <= 5) {
          console.error(`❌ 오류: ${museum.시설명} - ${error.message}`);
        }
      }
    }
    
    console.log('\n📊 결과:');
    console.log(`  신규 추가: ${added}개`);
    console.log(`  업데이트: ${updated}개`);
    console.log(`  오류: ${errors}개`);
    
    // 전체 통계
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN country = 'KR' THEN 1 END) as korean,
        COUNT(DISTINCT city) as cities
      FROM venues
      WHERE is_active = true
    `);
    
    console.log(`\n✨ 전체 venue 통계:`);
    console.log(`  총 미술관/갤러리: ${stats.rows[0].total}개`);
    console.log(`  한국: ${stats.rows[0].korean}개`);
    console.log(`  도시: ${stats.rows[0].cities}개`);
    
    // 주요 도시별 통계
    const cityStats = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM venues
      WHERE country = 'KR' AND is_active = true
      GROUP BY city
      ORDER BY count DESC
      LIMIT 10
    `);
    
    console.log('\n🏙️  주요 도시별 미술관:');
    cityStats.rows.forEach(stat => {
      console.log(`  ${stat.city}: ${stat.count}개`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

importKoreaMuseums();