/**
 * Artmap 데이터를 SAYU 데이터베이스에 저장
 * 수집된 전시 정보를 SAYU 형식으로 변환하여 저장
 */

require('dotenv').config();
const { Pool } = require('pg');
const ImprovedArtmapCrawler = require('./improved-artmap-crawler');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class ArtmapToSayuConverter {
  constructor() {
    this.crawler = new ImprovedArtmapCrawler();
  }

  /**
   * 날짜 형식 변환
   */
  parseDate(dateStr) {
    if (!dateStr) return null;
    
    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    // "11 Jul" 또는 "11 Jul 2025" 형식 처리
    const match = dateStr.match(/(\d{1,2})\s+(\w{3})(?:\s+(\d{4}))?/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = months[match[2]] || '01';
      const year = match[3] || '2025'; // 년도가 없으면 2025년으로 가정
      return `${year}-${month}-${day}`;
    }
    
    console.log(`❌ 날짜 파싱 실패: ${dateStr}`);
    return null;
  }

  /**
   * 장소 정보 저장/업데이트
   */
  async saveVenue(venue) {
    const client = await pool.connect();
    
    try {
      // external_id로 기존 장소 확인
      const checkQuery = `
        SELECT id FROM venues 
        WHERE (name = $1 OR name_en = $1) 
        AND city IS NOT NULL
        LIMIT 1
      `;
      
      const existing = await client.query(checkQuery, [venue.name]);
      
      if (existing.rows.length > 0) {
        console.log(`📍 기존 장소 발견: ${venue.name} (ID: ${existing.rows[0].id})`);
        return existing.rows[0].id;
      }
      
      // 새 장소 추가
      const insertQuery = `
        INSERT INTO venues (
          name, name_en, type, website, 
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id
      `;
      
      const values = [
        venue.name,
        venue.name, // 영문명 (Artmap은 대부분 영문)
        'gallery', // 기본 타입
        venue.url
      ];
      
      const result = await client.query(insertQuery, values);
      console.log(`✅ 새 장소 추가: ${venue.name} (ID: ${result.rows[0].id})`);
      return result.rows[0].id;
      
    } finally {
      client.release();
    }
  }

  /**
   * 전시 정보 저장
   */
  async saveExhibition(exhibition, venueId) {
    const client = await pool.connect();
    
    try {
      // 중복 확인
      const checkQuery = `
        SELECT id FROM exhibitions 
        WHERE title_en = $1 AND venue_id = $2 
        AND start_date = $3
        LIMIT 1
      `;
      
      console.log(`   날짜 정보: ${exhibition.dates.original}`);
      console.log(`   시작: ${exhibition.dates.start} -> 종료: ${exhibition.dates.end}`);
      
      const startDate = this.parseDate(exhibition.dates.start);
      const endDate = this.parseDate(exhibition.dates.end);
      
      console.log(`   파싱된 날짜: ${startDate} ~ ${endDate}`);
      
      const existing = await client.query(checkQuery, [
        exhibition.title,
        venueId,
        startDate
      ]);
      
      if (existing.rows.length > 0) {
        console.log(`📌 이미 존재하는 전시: ${exhibition.title}`);
        return existing.rows[0].id;
      }
      
      // 새 전시 추가
      const insertQuery = `
        INSERT INTO exhibitions (
          title_en, title_local, venue_id, 
          venue_name, venue_city, venue_country,
          start_date, end_date,
          description, status,
          source, source_url,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING id
      `;
      
      const today = new Date().toISOString().split('T')[0];
      
      // 전시 상태 결정
      let status = 'upcoming';
      if (startDate && startDate <= today) {
        if (endDate && endDate >= today) {
          status = 'current';
        } else {
          status = 'past';
        }
      }
      
      // 도시 이름 추출 (예: "Berlinische Galerie" -> "Berlin")
      let cityName = 'Berlin'; // 기본값
      if (exhibition.venue.name.toLowerCase().includes('karlsruhe')) {
        cityName = 'Karlsruhe';
      }
      
      const values = [
        exhibition.title, // title_en
        exhibition.title, // title_local (영문 그대로)
        venueId,
        exhibition.venue.name, // venue_name
        cityName, // venue_city
        'DE', // venue_country (독일)
        startDate,
        endDate,
        exhibition.description || '',
        status,
        'artmap', // source
        exhibition.url // source_url
      ];
      
      const result = await client.query(insertQuery, values);
      console.log(`✅ 새 전시 추가: ${exhibition.title} (ID: ${result.rows[0].id})`);
      
      // 이미지 URL이 있으면 저장 (추가 테이블이 있다면)
      if (exhibition.imageUrl) {
        // TODO: exhibition_images 테이블이 있다면 여기에 저장
        console.log(`   이미지: ${exhibition.imageUrl}`);
      }
      
      return result.rows[0].id;
      
    } finally {
      client.release();
    }
  }

  /**
   * 메인 변환 및 저장 프로세스
   */
  async convertAndSave(limit = 10) {
    console.log('🎨 Artmap → SAYU 데이터 변환 시작');
    console.log(`📊 ${limit}개 전시 수집 예정\n`);
    
    try {
      // 1. Artmap에서 데이터 수집
      const exhibitions = await this.crawler.crawl({
        limit: limit,
        saveToDb: false // 크롤러 자체 DB 저장 비활성화
      });
      
      if (exhibitions.length === 0) {
        console.log('❌ 수집된 전시가 없습니다.');
        return;
      }
      
      console.log(`\n💾 SAYU 데이터베이스에 저장 중...\n`);
      
      // 2. 각 전시 정보를 SAYU DB에 저장
      const savedExhibitions = [];
      
      for (const exhibition of exhibitions) {
        console.log(`\n처리 중: ${exhibition.title}`);
        
        try {
          // 장소 저장
          const venueId = await this.saveVenue(exhibition.venue);
          
          // 전시 저장
          const exhibitionId = await this.saveExhibition(exhibition, venueId);
          
          savedExhibitions.push({
            id: exhibitionId,
            title: exhibition.title,
            venue: exhibition.venue.name,
            dates: exhibition.dates.original
          });
          
        } catch (error) {
          console.error(`❌ 저장 실패: ${exhibition.title}`, error.message);
        }
      }
      
      // 3. 결과 요약
      console.log('\n' + '='.repeat(60));
      console.log('📊 저장 완료 요약:');
      console.log('='.repeat(60));
      console.log(`총 수집: ${exhibitions.length}개`);
      console.log(`성공적으로 저장: ${savedExhibitions.length}개`);
      
      if (savedExhibitions.length > 0) {
        console.log('\n저장된 전시 목록:');
        savedExhibitions.forEach((ex, i) => {
          console.log(`${i + 1}. [ID: ${ex.id}] ${ex.title}`);
          console.log(`   장소: ${ex.venue}`);
          console.log(`   기간: ${ex.dates}`);
        });
      }
      
    } catch (error) {
      console.error('전체 프로세스 오류:', error);
    } finally {
      await pool.end();
    }
  }
}

// 실행
async function main() {
  const converter = new ArtmapToSayuConverter();
  
  // 5개 전시만 신중하게 수집하여 저장
  await converter.convertAndSave(5);
}

if (require.main === module) {
  main();
}

module.exports = ArtmapToSayuConverter;