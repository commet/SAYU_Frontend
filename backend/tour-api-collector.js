#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class TourAPICollector {
  constructor() {
    // 한국관광공사 API 키 (환경변수 또는 직접 입력)
    // 디코딩된 키 사용 (URL 인코딩 없이)
    this.serviceKey = process.env.TOUR_API_KEY || '+wfa+sUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa+3+DxNM7RHCETyzDMbzmA==';
    this.baseUrl = 'http://apis.data.go.kr/B551011/KorService1';
    
    this.stats = {
      museums: 0,
      exhibitions: 0,
      saved: 0,
      errors: 0
    };
  }

  // 1. API 키 테스트
  async testAPIKey() {
    console.log('🔑 한국관광공사 API 키 테스트...\n');
    
    try {
      // serviceKey를 URL에 직접 포함하여 시도
      const url = `${this.baseUrl}/areaCode1?serviceKey=${encodeURIComponent(this.serviceKey)}&numOfRows=1&pageNo=1&MobileOS=ETC&MobileApp=SAYU&_type=json`;
      console.log('요청 URL:', url.substring(0, 100) + '...');
      
      const response = await axios.get(url, {
        timeout: 10000
      });
      
      // 응답 구조 확인
      console.log('응답 상태:', response.status);
      console.log('응답 타입:', response.headers['content-type']);
      
      // XML 응답인 경우 파싱
      if (typeof response.data === 'string' && response.data.includes('<?xml')) {
        console.log('\nXML 응답 받음:');
        const errorMatch = response.data.match(/<returnReasonCode>(.*?)<\/returnReasonCode>/);
        const msgMatch = response.data.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/);
        if (errorMatch) {
          console.log('에러 코드:', errorMatch[1]);
          console.log('에러 메시지:', msgMatch ? msgMatch[1] : '알 수 없음');
        }
        return false;
      }
      
      // JSON 응답 처리
      if (response.data.response?.header?.resultCode === '0000' || 
          response.data.response?.header?.resultCode === '00') {
        console.log('✅ API 키 정상 작동!');
        return true;
      } else {
        console.log('❌ API 키 오류:', response.data.response?.header?.resultMsg || JSON.stringify(response.data));
        return false;
      }
    } catch (error) {
      console.log('❌ API 연결 실패:', error.message);
      console.log('\n📌 해결 방법:');
      console.log('1. https://www.data.go.kr 접속');
      console.log('2. "한국관광공사" 검색');
      console.log('3. "국문 관광정보 서비스" 활용신청');
      console.log('4. 승인 후 인증키 복사');
      console.log('5. 이 파일의 YOUR_API_KEY_HERE 부분에 붙여넣기');
      return false;
    }
  }

  // 2. 문화시설 데이터 수집 (미술관, 갤러리)
  async collectCulturalFacilities() {
    console.log('\n🏛️ 문화시설 데이터 수집 시작...');
    
    const areaCodes = [
      { code: 1, name: '서울' },
      { code: 2, name: '인천' },
      { code: 6, name: '부산' },
      { code: 31, name: '경기' }
    ];
    
    let allFacilities = [];
    
    for (const area of areaCodes) {
      console.log(`\n📍 ${area.name} 지역 검색...`);
      
      try {
        const response = await axios.get(`${this.baseUrl}/areaBasedList1`, {
          params: {
            serviceKey: this.serviceKey,
            numOfRows: 100,
            pageNo: 1,
            MobileOS: 'ETC',
            MobileApp: 'SAYU',
            _type: 'json',
            contentTypeId: 14,  // 문화시설
            areaCode: area.code
          }
        });
        
        if (response.data.response?.body?.items?.item) {
          const items = Array.isArray(response.data.response.body.items.item) 
            ? response.data.response.body.items.item 
            : [response.data.response.body.items.item];
          
          // 미술관, 갤러리만 필터
          const artFacilities = items.filter(item => 
            item.title.includes('미술관') || 
            item.title.includes('갤러리') ||
            item.title.includes('아트') ||
            item.cat3 === 'A02060100'  // 미술관/전시관 카테고리
          );
          
          console.log(`   ✅ ${artFacilities.length}개 미술관/갤러리 발견`);
          allFacilities = allFacilities.concat(artFacilities);
          
          // 샘플 출력
          if (artFacilities.length > 0) {
            console.log(`   예시: ${artFacilities[0].title}`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ ${area.name} 수집 실패:`, error.message);
        this.stats.errors++;
      }
      
      // API 제한 방지 (초당 10회 제한)
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    this.stats.museums = allFacilities.length;
    console.log(`\n✨ 총 ${allFacilities.length}개 문화시설 수집 완료`);
    
    return allFacilities;
  }

  // 3. 전시/행사 데이터 수집
  async collectExhibitions() {
    console.log('\n🎨 전시/행사 데이터 수집 시작...');
    
    const keywords = ['전시', '미술', '갤러리', '아트', '특별전', '기획전'];
    let allExhibitions = [];
    
    for (const keyword of keywords) {
      console.log(`\n🔍 "${keyword}" 키워드 검색...`);
      
      try {
        const response = await axios.get(`${this.baseUrl}/searchKeyword1`, {
          params: {
            serviceKey: this.serviceKey,
            numOfRows: 50,
            pageNo: 1,
            MobileOS: 'ETC',
            MobileApp: 'SAYU',
            _type: 'json',
            keyword: keyword,
            contentTypeId: 15  // 축제공연행사
          }
        });
        
        if (response.data.response?.body?.items?.item) {
          const items = Array.isArray(response.data.response.body.items.item) 
            ? response.data.response.body.items.item 
            : [response.data.response.body.items.item];
          
          console.log(`   ✅ ${items.length}개 결과 발견`);
          allExhibitions = allExhibitions.concat(items);
        }
        
      } catch (error) {
        console.log(`   ❌ 검색 실패:`, error.message);
        this.stats.errors++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // 중복 제거
    const uniqueExhibitions = allExhibitions.filter((item, index, self) =>
      index === self.findIndex(t => t.contentid === item.contentid)
    );
    
    this.stats.exhibitions = uniqueExhibitions.length;
    console.log(`\n✨ 총 ${uniqueExhibitions.length}개 전시/행사 수집 완료 (중복 제거)`);
    
    return uniqueExhibitions;
  }

  // 4. 상세 정보 조회
  async getDetailInfo(contentId, contentTypeId) {
    try {
      const response = await axios.get(`${this.baseUrl}/detailCommon1`, {
        params: {
          serviceKey: this.serviceKey,
          contentId: contentId,
          contentTypeId: contentTypeId,
          MobileOS: 'ETC',
          MobileApp: 'SAYU',
          _type: 'json',
          defaultYN: 'Y',
          addrinfoYN: 'Y',
          overviewYN: 'Y'
        }
      });
      
      if (response.data.response?.body?.items?.item) {
        return response.data.response.body.items.item[0];
      }
    } catch (error) {
      console.log(`상세 정보 조회 실패 (${contentId}):`, error.message);
    }
    return null;
  }

  // 5. 데이터베이스 저장
  async saveToDatabase(facilities, exhibitions) {
    console.log('\n💾 데이터베이스 저장 시작...');
    
    const client = await pool.connect();
    
    try {
      // 트랜잭션 시작
      await client.query('BEGIN');
      
      // 문화시설 저장
      console.log('\n📌 문화시설 저장 중...');
      for (const facility of facilities) {
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
            facility.title,
            'gallery',
            facility.addr1?.split(' ')[0] || '서울',
            facility.addr1,
            facility.mapy,
            facility.mapx,
            facility.tel || null,
            null,  // 홈페이지는 상세 조회에서
            facility.overview || '',
            '한국관광공사',
            facility.contentid
          ]);
          
        } catch (err) {
          console.log(`   ⚠️ 시설 저장 실패: ${facility.title}`);
        }
      }
      
      // 전시/행사 저장
      console.log('\n📌 전시/행사 저장 중...');
      for (const exhibition of exhibitions) {
        try {
          // 날짜 파싱
          const startDate = exhibition.eventstartdate 
            ? `${exhibition.eventstartdate.substring(0,4)}-${exhibition.eventstartdate.substring(4,6)}-${exhibition.eventstartdate.substring(6,8)}`
            : null;
          const endDate = exhibition.eventenddate
            ? `${exhibition.eventenddate.substring(0,4)}-${exhibition.eventenddate.substring(4,6)}-${exhibition.eventenddate.substring(6,8)}`
            : null;
          
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
                updated_at = NOW()
          `, [
            exhibition.title,
            exhibition.title,
            exhibition.addr1?.split(' ').slice(-1)[0] || exhibition.title,
            exhibition.addr1?.split(' ')[0] || '서울',
            startDate,
            endDate,
            exhibition.overview || '',
            exhibition.firstimage || null,
            '한국관광공사',
            `https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=${exhibition.contentid}`
          ]);
          
          this.stats.saved++;
          
        } catch (err) {
          console.log(`   ⚠️ 전시 저장 실패: ${exhibition.title}`);
        }
      }
      
      await client.query('COMMIT');
      console.log(`\n✅ 저장 완료: ${this.stats.saved}개 전시 정보`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ 저장 중 오류:', error.message);
    } finally {
      client.release();
    }
  }

  // 6. 전체 실행
  async collectAll() {
    console.log('🚀 한국관광공사 전시 데이터 수집 시작\n');
    console.log('='.repeat(60));
    
    // API 키 확인
    const isValid = await this.testAPIKey();
    if (!isValid) {
      console.log('\n❌ API 키를 확인해주세요!');
      return;
    }
    
    // 데이터 수집
    const facilities = await this.collectCulturalFacilities();
    const exhibitions = await this.collectExhibitions();
    
    // 결과 요약
    console.log('\n' + '='.repeat(60));
    console.log('📊 수집 결과:');
    console.log(`   🏛️ 문화시설: ${this.stats.museums}개`);
    console.log(`   🎨 전시/행사: ${this.stats.exhibitions}개`);
    console.log(`   ❌ 오류: ${this.stats.errors}개`);
    
    // 저장 여부 확인
    if (facilities.length > 0 || exhibitions.length > 0) {
      console.log('\n💾 데이터베이스에 저장하시겠습니까?');
      console.log('저장하려면 아래 주석을 해제하세요:');
      console.log('// await this.saveToDatabase(facilities, exhibitions);');
      
      // 실제 저장
      // await this.saveToDatabase(facilities, exhibitions);
    }
    
    console.log('\n✨ 작업 완료!');
  }
}

// 실행
const collector = new TourAPICollector();
collector.collectAll().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('오류:', error);
  process.exit(1);
});