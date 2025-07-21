#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 추가할 국내 미술관/갤러리 목록
const additionalVenues = [
  // 서울
  { name: '소마미술관', city: '서울', type: 'museum', tier: 1 },
  { name: '아라리오뮤지엄 인 스페이스', city: '서울', type: 'museum', tier: 2 },
  { name: '간송미술관', city: '서울', type: 'museum', tier: 1 },
  { name: '대한민국역사박물관', city: '서울', type: 'museum', tier: 2 },
  { name: '동대문역사문화공원', city: '서울', type: 'gallery', tier: 1 },
  { name: '북촌한옥마을', city: '서울', type: 'gallery', tier: 2 },
  { name: '갤러리정미소', city: '서울', type: 'gallery', tier: 3 },
  { name: '상원미술관', city: '서울', type: 'museum', tier: 2 },
  { name: '코리아나미술관', city: '서울', type: 'museum', tier: 2 },
  { name: '플레이스막', city: '서울', type: 'gallery', tier: 2 },
  { name: '갤러리조선', city: '서울', type: 'gallery', tier: 2 },
  { name: '갤러리인', city: '서울', type: 'gallery', tier: 2 },
  { name: '갤러리시몬', city: '서울', type: 'gallery', tier: 2 },
  { name: '갤러리분도', city: '서울', type: 'gallery', tier: 2 },
  { name: '갤러리라메르', city: '서울', type: 'gallery', tier: 2 },
  { name: '스페이스캔', city: '서울', type: 'gallery', tier: 2 },
  { name: '갤러리스테이션', city: '서울', type: 'gallery', tier: 2 },
  { name: '프로젝트스페이스영등포', city: '서울', type: 'gallery', tier: 3 },
  
  // 경기도
  { name: '고양아람누리 아람미술관', city: '고양', type: 'museum', tier: 2 },
  { name: '한국만화박물관', city: '부천', type: 'museum', tier: 2 },
  { name: '부천아트벙커B39', city: '부천', type: 'gallery', tier: 2 },
  { name: '실학박물관', city: '남양주', type: 'museum', tier: 2 },
  { name: '남양주시립박물관', city: '남양주', type: 'museum', tier: 3 },
  { name: '화성시문화재단', city: '화성', type: 'gallery', tier: 2 },
  { name: '수원시립아이파크미술관', city: '수원', type: 'museum', tier: 2 },
  { name: '수원화성박물관', city: '수원', type: 'museum', tier: 2 },
  { name: '광명동굴', city: '광명', type: 'gallery', tier: 2 },
  { name: '판교박물관', city: '성남', type: 'museum', tier: 2 },
  
  // 강원도
  { name: '박수근미술관', city: '양구', type: 'museum', tier: 1 },
  { name: '하슬라아트월드', city: '강릉', type: 'gallery', tier: 2 },
  { name: '정동진시간박물관', city: '강릉', type: 'museum', tier: 3 },
  { name: '속초시립박물관', city: '속초', type: 'museum', tier: 3 },
  { name: '춘천시립미술관', city: '춘천', type: 'museum', tier: 2 },
  
  // 충청도
  { name: '충북문화관', city: '청주', type: 'gallery', tier: 2 },
  { name: '대전문화예술의전당', city: '대전', type: 'gallery', tier: 2 },
  { name: '대전시립박물관', city: '대전', type: 'museum', tier: 2 },
  { name: '천안박물관', city: '천안', type: 'museum', tier: 2 },
  { name: '공주시립미술관', city: '공주', type: 'museum', tier: 3 },
  
  // 전라도
  { name: '목포근대역사관', city: '목포', type: 'museum', tier: 2 },
  { name: '전남도립미술관', city: '광양', type: 'museum', tier: 2 },
  { name: '순천시립미술관', city: '순천', type: 'museum', tier: 3 },
  { name: '여수예술랜드', city: '여수', type: 'gallery', tier: 3 },
  
  // 경상도
  { name: '경남도립미술관', city: '창원', type: 'museum', tier: 2 },
  { name: '통영시립미술관', city: '통영', type: 'museum', tier: 3 },
  { name: '거제문화예술회관', city: '거제', type: 'gallery', tier: 3 },
  { name: '안동시립미술관', city: '안동', type: 'museum', tier: 3 },
  { name: '경주예술의전당', city: '경주', type: 'gallery', tier: 2 },
  
  // 제주
  { name: '서귀포예술의전당', city: '서귀포', type: 'gallery', tier: 2 },
  { name: '제주국제평화센터', city: '제주', type: 'gallery', tier: 3 },
  { name: '제주돌문화공원', city: '제주', type: 'gallery', tier: 2 }
];

async function addAdditionalVenues() {
  const client = await pool.connect();
  
  try {
    console.log('🎨 추가 국내 미술관/갤러리 등록 시작\n');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const venue of additionalVenues) {
      // 중복 확인
      const existing = await client.query(
        'SELECT id FROM venues WHERE name = $1 AND city = $2',
        [venue.name, venue.city]
      );
      
      if (existing.rows.length > 0) {
        console.log(`⏭️  이미 존재: ${venue.name} (${venue.city})`);
        skippedCount++;
        continue;
      }
      
      // 새로운 venue 추가
      await client.query(`
        INSERT INTO venues (name, city, country, type, tier, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [venue.name, venue.city, 'KR', venue.type, venue.tier, true]);
      
      console.log(`✅ 추가됨: ${venue.name} (${venue.city}) - ${venue.type}, Tier ${venue.tier}`);
      addedCount++;
    }
    
    console.log('\n📊 추가 완료:');
    console.log(`   ✅ 새로 추가: ${addedCount}개`);
    console.log(`   ⏭️  중복 제외: ${skippedCount}개`);
    console.log(`   📍 총 시도: ${additionalVenues.length}개`);
    
    // 최종 통계
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN country = 'KR' THEN 1 END) as korean,
        COUNT(CASE WHEN type = 'museum' THEN 1 END) as museums,
        COUNT(CASE WHEN type = 'gallery' THEN 1 END) as galleries
      FROM venues
    `);
    
    const s = stats.rows[0];
    console.log('\n📈 전체 데이터베이스 현황:');
    console.log(`   총 기관 수: ${s.total}개`);
    console.log(`   ├─ 국내: ${s.korean}개`);
    console.log(`   ├─ 미술관: ${s.museums}개`);
    console.log(`   └─ 갤러리: ${s.galleries}개`);
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addAdditionalVenues();