#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');
const fs = require('fs').promises;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class TourDataSaver {
  constructor() {
    this.serviceKey = '+wfa+sUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa+3+DxNM7RHCETyzDMbzmA==';
    this.baseUrl = 'http://apis.data.go.kr/B551011/KorService2';
    
    this.stats = {
      venues: 0,
      exhibitions: 0,
      saved: 0,
      errors: 0
    };
    
    this.allData = {
      venues: [],
      exhibitions: []
    };
  }

  // 데이터 수집
  async collectData() {
    console.log('🚀 데이터 수집 시작...\n');
    
    // 1. 문화시설 수집
    await this.collectVenues();
    
    // 2. 전시 정보 수집
    await this.collectExhibitions();
    
    // 3. JSON 파일로 저장
    await this.saveToJSON();
    
    // 4. 데이터베이스 저장
    await this.saveToDatabase();
  }

  // 문화시설 수집
  async collectVenues() {
    console.log('🏛️ 문화시설 수집 중...');
    
    const areas = [
      { code: 1, name: '서울' },
      { code: 6, name: '부산' },
      { code: 2, name: '인천' },
      { code: 4, name: '대구' },
      { code: 5, name: '광주' },
      { code: 3, name: '대전' },
      { code: 31, name: '경기' }
    ];
    
    for (const area of areas) {
      try {
        const response = await axios.get(`${this.baseUrl}/areaBasedList2`, {
          params: {
            serviceKey: this.serviceKey,
            numOfRows: 200,
            pageNo: 1,
            MobileOS: 'ETC',
            MobileApp: 'SAYU',
            _type: 'json',
            contentTypeId: 14,  // 문화시설
            areaCode: area.code,
            arrange: 'A'
          }
        });
        
        if (response.data.response?.header?.resultCode === '0000') {
          const items = response.data.response.body.items?.item || [];
          const itemArray = Array.isArray(items) ? items : [items];
          
          // 미술관/갤러리만 필터
          const artVenues = itemArray.filter(item => 
            item.title?.includes('미술관') || 
            item.title?.includes('갤러리') ||
            item.title?.includes('아트') ||
            item.title?.includes('미술') ||
            item.cat3 === 'A02060100'
          );
          
          this.allData.venues = this.allData.venues.concat(artVenues);
          console.log(`   ${area.name}: ${artVenues.length}개`);
        }
      } catch (error) {
        console.log(`   ❌ ${area.name} 실패`);
        this.stats.errors++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    this.stats.venues = this.allData.venues.length;
    console.log(`✅ 총 ${this.stats.venues}개 문화시설 수집\n`);
  }

  // 전시 정보 수집
  async collectExhibitions() {
    console.log('🎨 전시 정보 수집 중...');
    
    // 현재부터 6개월 후까지
    const today = new Date();
    const startDate = today.toISOString().slice(0, 10).replace(/-/g, '');
    const endDate = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
    
    try {
      const response = await axios.get(`${this.baseUrl}/searchFestival2`, {
        params: {
          serviceKey: this.serviceKey,
          numOfRows: 500,
          pageNo: 1,
          MobileOS: 'ETC',
          MobileApp: 'SAYU',
          _type: 'json',
          eventStartDate: startDate,
          arrange: 'A'
        }
      });
      
      if (response.data.response?.header?.resultCode === '0000') {
        const items = response.data.response.body.items?.item || [];
        const itemArray = Array.isArray(items) ? items : [items];
        
        // 전시 관련만 필터
        const exhibitions = itemArray.filter(item => 
          item.title?.includes('전시') || 
          item.title?.includes('미술') ||
          item.title?.includes('갤러리') ||
          item.title?.includes('아트') ||
          item.title?.includes('작품') ||
          item.title?.includes('예술')
        );
        
        this.allData.exhibitions = exhibitions;
        this.stats.exhibitions = exhibitions.length;
        console.log(`✅ ${this.stats.exhibitions}개 전시 수집\n`);
      }
    } catch (error) {
      console.log('❌ 전시 수집 실패\n');
      this.stats.errors++;
    }
  }

  // JSON 파일로 저장
  async saveToJSON() {
    console.log('💾 JSON 파일 저장 중...');
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const data = {
      timestamp: timestamp,
      stats: this.stats,
      venues: this.allData.venues,
      exhibitions: this.allData.exhibitions
    };
    
    await fs.writeFile(
      `tour-api-data-${timestamp}.json`,
      JSON.stringify(data, null, 2),
      'utf8'
    );
    
    console.log(`✅ tour-api-data-${timestamp}.json 저장 완료\n`);
  }

  // 데이터베이스 저장
  async saveToDatabase() {
    console.log('💾 데이터베이스 저장 시작...\n');
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. 문화시설 저장
      console.log('📌 문화시설 저장 중...');
      let venuesSaved = 0;
      
      for (const venue of this.allData.venues) {
        try {
          // 중복 체크
          const existing = await client.query(
            'SELECT id FROM venues WHERE name = $1 AND city = $2',
            [venue.title, venue.addr1?.split(' ')[0] || '서울']
          );
          
          if (existing.rows.length === 0) {
            await client.query(`
              INSERT INTO venues (
                name, type, city, address, 
                latitude, longitude, 
                phone, description,
                source, external_id
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
              venue.title,
              'gallery',
              venue.addr1?.split(' ')[0] || '서울',
              venue.addr1 || '',
              parseFloat(venue.mapy) || null,
              parseFloat(venue.mapx) || null,
              venue.tel || null,
              '',
              '한국관광공사',
              venue.contentid
            ]);
            
            venuesSaved++;
          }
        } catch (err) {
          // 개별 오류는 무시
        }
      }
      
      console.log(`   ✅ ${venuesSaved}개 신규 문화시설 저장\n`);
      
      // 2. 전시 정보 저장
      console.log('📌 전시 정보 저장 중...');
      let exhibitionsSaved = 0;
      
      for (const exhibition of this.allData.exhibitions) {
        try {
          // 날짜 처리
          let startDate = null, endDate = null;
          
          if (exhibition.eventstartdate) {
            const s = exhibition.eventstartdate;
            startDate = `${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}`;
          }
          
          if (exhibition.eventenddate) {
            const e = exhibition.eventenddate;
            endDate = `${e.substring(0,4)}-${e.substring(4,6)}-${e.substring(6,8)}`;
          }
          
          // 장소명 추출
          const venueName = exhibition.eventplace || 
                           exhibition.addr1?.split(' ').pop() || 
                           exhibition.title;
          
          // 중복 체크
          const existing = await client.query(
            'SELECT id FROM exhibitions WHERE title_en = $1 AND venue_name = $2 AND start_date = $3',
            [exhibition.title, venueName, startDate]
          );
          
          if (existing.rows.length === 0) {
            await client.query(`
              INSERT INTO exhibitions (
                title_en, title_local, 
                venue_name, venue_city,
                start_date, end_date,
                description, image_url,
                source, source_url,
                collected_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            `, [
              exhibition.title,
              exhibition.title,
              venueName,
              exhibition.addr1?.split(' ')[0] || '서울',
              startDate,
              endDate,
              '',
              exhibition.firstimage || null,
              '한국관광공사',
              `https://korean.visitkorea.or.kr/detail/fes_detail.do?cotid=${exhibition.contentid}`
            ]);
            
            exhibitionsSaved++;
          }
        } catch (err) {
          // 개별 오류는 무시
        }
      }
      
      console.log(`   ✅ ${exhibitionsSaved}개 신규 전시 저장\n`);
      
      await client.query('COMMIT');
      
      this.stats.saved = venuesSaved + exhibitionsSaved;
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ 저장 중 오류:', error.message);
    } finally {
      client.release();
    }
  }

  // 결과 요약
  async showSummary() {
    console.log('='.repeat(60));
    console.log('📊 최종 결과:');
    console.log(`   🏛️ 수집된 문화시설: ${this.stats.venues}개`);
    console.log(`   🎨 수집된 전시: ${this.stats.exhibitions}개`);
    console.log(`   💾 DB 저장: ${this.stats.saved}개`);
    console.log(`   ❌ 오류: ${this.stats.errors}개`);
    
    // 현재 DB 상태
    const client = await pool.connect();
    try {
      const venues = await client.query('SELECT COUNT(*) FROM venues');
      const exhibitions = await client.query('SELECT COUNT(*) FROM exhibitions');
      
      console.log('\n📌 현재 데이터베이스 상태:');
      console.log(`   장소: ${venues.rows[0].count}개`);
      console.log(`   전시: ${exhibitions.rows[0].count}개`);
      
      // 최근 저장된 전시 샘플
      const recent = await client.query(`
        SELECT title_en, venue_name, start_date, end_date 
        FROM exhibitions 
        WHERE source = '한국관광공사'
        ORDER BY collected_at DESC 
        LIMIT 5
      `);
      
      if (recent.rows.length > 0) {
        console.log('\n🎨 최근 저장된 전시:');
        recent.rows.forEach((ex, idx) => {
          console.log(`   ${idx + 1}. ${ex.title_en}`);
          console.log(`      장소: ${ex.venue_name}`);
          console.log(`      기간: ${ex.start_date} ~ ${ex.end_date}`);
        });
      }
      
    } finally {
      client.release();
    }
    
    console.log('\n✨ 작업 완료!');
  }
}

// 실행
async function main() {
  const saver = new TourDataSaver();
  await saver.collectData();
  await saver.showSummary();
  process.exit(0);
}

main().catch(error => {
  console.error('오류:', error);
  process.exit(1);
});