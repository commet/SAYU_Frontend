#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class TourAPIWorking {
  constructor() {
    // 디코딩된 원본 키 사용
    this.serviceKey = '+wfa+sUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa+3+DxNM7RHCETyzDMbzmA==';
    this.baseUrl = 'http://apis.data.go.kr/B551011/KorService2';
    
    this.stats = {
      venues: 0,
      exhibitions: 0,
      saved: 0,
      errors: 0
    };
  }

  // API 테스트
  async testAPI() {
    console.log('🔑 한국관광공사 API 테스트...\n');
    
    try {
      // 지역코드 조회로 테스트
      const response = await axios.get(`${this.baseUrl}/areaCode2`, {
        params: {
          serviceKey: this.serviceKey,
          numOfRows: 1,
          pageNo: 1,
          MobileOS: 'ETC',
          MobileApp: 'SAYU',
          _type: 'json'
        }
      });
      
      if (response.data.response?.header?.resultCode === '0000') {
        console.log('✅ API 키 정상 작동!');
        return true;
      } else {
        console.log('❌ API 오류:', response.data.response?.header?.resultMsg);
        return false;
      }
    } catch (error) {
      console.log('❌ 연결 실패:', error.message);
      return false;
    }
  }

  // 문화시설(미술관/갤러리) 수집
  async collectCulturalFacilities() {
    console.log('\n🏛️ 문화시설 데이터 수집...');
    
    const areas = [
      { code: 1, name: '서울' },
      { code: 6, name: '부산' },
      { code: 2, name: '인천' },
      { code: 31, name: '경기' }
    ];
    
    let allFacilities = [];
    
    for (const area of areas) {
      console.log(`\n📍 ${area.name} 지역 검색...`);
      
      try {
        const response = await axios.get(`${this.baseUrl}/areaBasedList2`, {
          params: {
            serviceKey: this.serviceKey,
            numOfRows: 100,
            pageNo: 1,
            MobileOS: 'ETC',
            MobileApp: 'SAYU',
            _type: 'json',
            contentTypeId: 14,  // 문화시설
            areaCode: area.code,
            arrange: 'A'  // 제목순
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
            item.cat3 === 'A02060100'  // 미술관 카테고리
          );
          
          console.log(`   ✅ ${artVenues.length}개 미술관/갤러리 발견`);
          
          if (artVenues.length > 0) {
            console.log(`   예시: ${artVenues[0].title}`);
          }
          
          allFacilities = allFacilities.concat(artVenues);
        }
      } catch (error) {
        console.log(`   ❌ ${area.name} 수집 실패:`, error.message);
        this.stats.errors++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    this.stats.venues = allFacilities.length;
    console.log(`\n✨ 총 ${allFacilities.length}개 문화시설 수집`);
    
    return allFacilities;
  }

  // 행사/전시 정보 수집
  async collectExhibitions() {
    console.log('\n🎨 전시/행사 데이터 수집...');
    
    try {
      // 현재 날짜 기준
      const today = new Date();
      const startDate = today.toISOString().slice(0, 10).replace(/-/g, '');
      const endDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
      
      console.log(`   기간: ${startDate} ~ ${endDate}`);
      
      const response = await axios.get(`${this.baseUrl}/searchFestival2`, {
        params: {
          serviceKey: this.serviceKey,
          numOfRows: 100,
          pageNo: 1,
          MobileOS: 'ETC',
          MobileApp: 'SAYU',
          _type: 'json',
          eventStartDate: startDate,
          eventEndDate: endDate,
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
          item.cat3?.includes('A0207')  // 전시회 카테고리
        );
        
        console.log(`   ✅ ${exhibitions.length}개 전시 발견`);
        
        this.stats.exhibitions = exhibitions.length;
        return exhibitions;
      }
    } catch (error) {
      console.log('   ❌ 전시 수집 실패:', error.message);
      this.stats.errors++;
    }
    
    return [];
  }

  // 키워드 검색으로 추가 수집
  async searchByKeyword() {
    console.log('\n🔍 키워드 검색으로 추가 데이터 수집...');
    
    const keywords = ['전시', '미술관', '갤러리', '아트', '특별전', '기획전'];
    let allResults = [];
    
    for (const keyword of keywords) {
      console.log(`\n   "${keyword}" 검색 중...`);
      
      try {
        const response = await axios.get(`${this.baseUrl}/searchKeyword2`, {
          params: {
            serviceKey: this.serviceKey,
            numOfRows: 50,
            pageNo: 1,
            MobileOS: 'ETC',
            MobileApp: 'SAYU',
            _type: 'json',
            keyword: keyword,
            arrange: 'A'
          }
        });
        
        if (response.data.response?.header?.resultCode === '0000') {
          const items = response.data.response.body.items?.item || [];
          const itemArray = Array.isArray(items) ? items : [items];
          
          console.log(`   ✅ ${itemArray.length}개 결과`);
          allResults = allResults.concat(itemArray);
        }
      } catch (error) {
        console.log(`   ❌ "${keyword}" 검색 실패:`, error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // 중복 제거
    const uniqueResults = allResults.filter((item, index, self) =>
      index === self.findIndex(t => t.contentid === item.contentid)
    );
    
    console.log(`\n✨ 키워드 검색 결과: ${uniqueResults.length}개 (중복 제거)`);
    
    return uniqueResults;
  }

  // 데이터베이스 저장
  async saveToDatabase(venues, exhibitions) {
    console.log('\n💾 데이터베이스 저장 시작...');
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. 문화시설 저장
      if (venues.length > 0) {
        console.log('\n📌 문화시설 저장 중...');
        
        for (const venue of venues) {
          try {
            await client.query(`
              INSERT INTO venues (
                name, type, city, address, 
                latitude, longitude, 
                phone, website, description,
                source, external_id
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              ON CONFLICT (name, city) DO UPDATE
              SET address = EXCLUDED.address,
                  phone = EXCLUDED.phone,
                  updated_at = NOW()
            `, [
              venue.title,
              'gallery',
              venue.addr1?.split(' ')[0] || '서울',
              venue.addr1,
              venue.mapy,
              venue.mapx,
              venue.tel || null,
              null,
              '',  // overview 필드 제거
              '한국관광공사',
              venue.contentid
            ]);
            
          } catch (err) {
            console.log(`   ⚠️ 시설 저장 실패: ${venue.title}`);
          }
        }
      }
      
      // 2. 전시 정보 저장
      if (exhibitions.length > 0) {
        console.log('\n📌 전시 정보 저장 중...');
        
        for (const exhibition of exhibitions) {
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
            
            await client.query(`
              INSERT INTO exhibitions (
                title_en, title_local, 
                venue_name, venue_city,
                start_date, end_date,
                description, image_url,
                source, source_url,
                collected_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
              ON CONFLICT (title_en, venue_name, start_date) DO UPDATE
              SET end_date = EXCLUDED.end_date,
                  description = EXCLUDED.description,
                  image_url = EXCLUDED.image_url,
                  updated_at = NOW()
            `, [
              exhibition.title,
              exhibition.title,
              exhibition.addr1?.split(' ').slice(-1)[0] || exhibition.title,
              exhibition.addr1?.split(' ')[0] || '서울',
              startDate,
              endDate,
              '',  // overview 필드 제거
              exhibition.firstimage || null,
              '한국관광공사',
              `https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=${exhibition.contentid}`
            ]);
            
            this.stats.saved++;
            
          } catch (err) {
            console.log(`   ⚠️ 전시 저장 실패: ${exhibition.title}`);
          }
        }
      }
      
      await client.query('COMMIT');
      console.log(`\n✅ 저장 완료: ${this.stats.saved}개 항목`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ 저장 중 오류:', error.message);
    } finally {
      client.release();
    }
  }

  // 전체 실행
  async run() {
    console.log('🚀 한국관광공사 API 데이터 수집 시작\n');
    console.log('='.repeat(60));
    
    // API 테스트
    const isValid = await this.testAPI();
    if (!isValid) {
      console.log('\n❌ API 키 문제로 종료합니다.');
      return;
    }
    
    // 데이터 수집
    const venues = await this.collectCulturalFacilities();
    const exhibitions = await this.collectExhibitions();
    const keywordResults = await this.searchByKeyword();
    
    // 결과 요약
    console.log('\n' + '='.repeat(60));
    console.log('📊 수집 결과:');
    console.log(`   🏛️ 문화시설: ${this.stats.venues}개`);
    console.log(`   🎨 전시/행사: ${this.stats.exhibitions}개`);
    console.log(`   🔍 키워드 검색: ${keywordResults.length}개`);
    console.log(`   ❌ 오류: ${this.stats.errors}개`);
    
    // 데이터베이스 저장
    if (venues.length > 0 || exhibitions.length > 0) {
      await this.saveToDatabase(venues, exhibitions);
    }
    
    console.log('\n✨ 작업 완료!');
  }
}

// 실행
const collector = new TourAPIWorking();
collector.run().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('오류:', error);
  process.exit(1);
});