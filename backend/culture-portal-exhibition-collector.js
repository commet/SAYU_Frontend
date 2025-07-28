#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');
const { parseStringPromise } = require('xml2js');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class CulturePortalExhibitionCollector {
  constructor() {
    // 제공받은 API 키 사용
    this.serviceKey = '+wfa+sUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa+3+DxNM7RHCETyzDMbzmA==';
    this.baseUrl = 'https://apis.data.go.kr/B553457/cultureinfo';
    this.endpoints = {
      exhibition: '/exhibitionAPI/request',       // 전시 정보
      performance: '/performanceAPI/request',     // 공연 정보
      festival: '/festivalAPI/request',          // 축제 정보
      facility: '/facilityAPI/request'           // 시설 정보
    };
  }

  async collectExhibitions() {
    console.log('🎨 문화포털 API - 전시 데이터 수집 시작\n');
    console.log('✅ 인증키 설정 완료');
    console.log('📍 엔드포인트:', this.baseUrl + this.endpoints.exhibition);

    const allExhibitions = [];
    let pageNo = 1;
    const numOfRows = 100;
    let hasMore = true;

    try {
      while (hasMore && pageNo <= 10) { // 최대 10페이지까지
        console.log(`\n📄 페이지 ${pageNo} 조회 중...`);

        const params = {
          serviceKey: this.serviceKey,
          numOfRows,
          pageNo
          // 검색 조건 추가 가능
          // keyword: '미술',
          // period: '202507'
        };

        const response = await axios.get(this.baseUrl + this.endpoints.exhibition, {
          params,
          headers: {
            'Accept': 'application/xml'
          }
        });

        if (response.data) {
          const exhibitions = await this.parseExhibitionData(response.data);

          if (exhibitions && exhibitions.length > 0) {
            console.log(`✅ ${exhibitions.length}개 전시 발견`);
            allExhibitions.push(...exhibitions);

            if (exhibitions.length < numOfRows) {
              hasMore = false;
            } else {
              pageNo++;
            }
          } else {
            console.log('⚠️ 더 이상 데이터가 없습니다.');
            hasMore = false;
          }
        }

        // API 부하 방지
        await this.delay(1000);
      }

      console.log(`\n📊 총 ${allExhibitions.length}개 전시 정보 수집 완료`);

      // 데이터베이스 저장
      if (allExhibitions.length > 0) {
        await this.saveToDatabase(allExhibitions);
      }

      // 시설 정보도 수집 (전시장 메타데이터)
      await this.collectFacilities();

      return allExhibitions;

    } catch (error) {
      console.error('❌ API 오류:', error.message);
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data?.substring(0, 500));
      }

      console.log('\n🔧 문제 해결 방법:');
      console.log('1. API 키가 올바른지 확인');
      console.log('2. 일일 호출 제한 확인 (1000건)');
      console.log('3. 네트워크 연결 상태 확인');
    }

    return [];
  }

  async parseExhibitionData(xmlData) {
    try {
      const result = await parseStringPromise(xmlData, {
        explicitArray: false,
        ignoreAttrs: true
      });

      if (!result || !result.response || !result.response.body) {
        console.log('⚠️ 응답 데이터 구조가 예상과 다릅니다.');
        return [];
      }

      const { body } = result.response;

      // 에러 체크
      if (body.resultCode && body.resultCode !== '00') {
        console.error(`❌ API 에러: ${body.resultCode} - ${body.resultMsg}`);
        return [];
      }

      // items가 배열이 아닌 경우 배열로 변환
      let items = body.items?.item || [];
      if (!Array.isArray(items)) {
        items = [items];
      }

      return items.map(item => this.transformExhibitionData(item));

    } catch (error) {
      console.error('❌ XML 파싱 오류:', error.message);
      return [];
    }
  }

  transformExhibitionData(item) {
    // 날짜 형식 변환 (YYYYMMDD -> YYYY-MM-DD)
    const formatDate = (dateStr) => {
      if (!dateStr || dateStr.length !== 8) return null;
      return `${dateStr.substr(0, 4)}-${dateStr.substr(4, 2)}-${dateStr.substr(6, 2)}`;
    };

    // 상태 결정
    const determineStatus = (startDate, endDate) => {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (now < start) return 'upcoming';
      if (now > end) return 'ended';
      return 'ongoing';
    };

    const startDate = formatDate(item.startDate);
    const endDate = formatDate(item.endDate);

    return {
      title_local: item.title || '제목 없음',
      title_en: item.titleEng || item.title || 'Untitled',
      venue_name: item.place || item.placeName || '장소 미정',
      venue_city: item.area || item.cityName || '서울',
      venue_country: 'KR',
      start_date: startDate,
      end_date: endDate,
      description: item.contents || item.description || null,
      admission_fee: item.charge || item.price || '무료',
      official_url: item.url || item.homepageUrl || null,
      image_url: item.imageUrl || item.thumbnail || null,
      contact_info: item.contactInfo || item.phone || null,
      opening_hours: item.time || null,
      status: determineStatus(startDate, endDate),
      source: 'culture_portal_api',
      metadata: {
        placeCode: item.placeCode,
        genre: item.genre,
        subGenre: item.subGenre,
        sponsor: item.sponsor,
        host: item.host
      }
    };
  }

  async collectFacilities() {
    console.log('\n🏛️ 문화시설 정보 수집...');

    try {
      const params = {
        serviceKey: this.serviceKey,
        numOfRows: 50,
        pageNo: 1,
        keyword: '미술관'
      };

      const response = await axios.get(this.baseUrl + this.endpoints.facility, {
        params,
        headers: {
          'Accept': 'application/xml'
        }
      });

      if (response.data) {
        const facilities = await this.parseFacilityData(response.data);
        console.log(`✅ ${facilities.length}개 문화시설 정보 수집`);

        // venues 테이블 업데이트
        await this.updateVenues(facilities);
      }

    } catch (error) {
      console.log('⚠️ 시설 정보 수집 실패:', error.message);
    }
  }

  async parseFacilityData(xmlData) {
    try {
      const result = await parseStringPromise(xmlData, {
        explicitArray: false,
        ignoreAttrs: true
      });

      const body = result.response?.body;
      if (!body || body.resultCode !== '00') {
        return [];
      }

      let items = body.items?.item || [];
      if (!Array.isArray(items)) {
        items = [items];
      }

      return items.map(item => ({
        name: item.facilityName,
        address: item.address,
        city: item.cityName,
        phone: item.phone,
        homepage: item.homepage,
        type: item.facilityType
      }));

    } catch (error) {
      console.error('❌ 시설 데이터 파싱 오류:', error.message);
      return [];
    }
  }

  async saveToDatabase(exhibitions) {
    const client = await pool.connect();
    let saved = 0;
    let updated = 0;

    try {
      await client.query('BEGIN');

      for (const exhibition of exhibitions) {
        if (!exhibition.start_date || !exhibition.end_date) continue;

        // 중복 확인
        const existing = await client.query(
          'SELECT id FROM exhibitions WHERE title_local = $1 AND venue_name = $2 AND start_date = $3',
          [exhibition.title_local, exhibition.venue_name, exhibition.start_date]
        );

        if (existing.rows.length > 0) {
          // 기존 레코드 업데이트
          await client.query(`
            UPDATE exhibitions SET
              end_date = $1,
              status = $2,
              description = COALESCE($3, description),
              official_url = COALESCE($4, official_url),
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
          `, [
            exhibition.end_date,
            exhibition.status,
            exhibition.description,
            exhibition.official_url,
            existing.rows[0].id
          ]);
          updated++;
        } else {
          // 새 레코드 삽입
          await client.query(`
            INSERT INTO exhibitions (
              title_local, title_en, venue_name, venue_city, venue_country,
              start_date, end_date, description, admission_fee, official_url,
              image_url, contact_info, opening_hours, status, source,
              created_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
              CURRENT_TIMESTAMP
            )
          `, [
            exhibition.title_local,
            exhibition.title_en,
            exhibition.venue_name,
            exhibition.venue_city,
            exhibition.venue_country,
            exhibition.start_date,
            exhibition.end_date,
            exhibition.description,
            exhibition.admission_fee,
            exhibition.official_url,
            exhibition.image_url,
            exhibition.contact_info,
            exhibition.opening_hours,
            exhibition.status,
            exhibition.source
          ]);
          saved++;
        }
      }

      await client.query('COMMIT');
      console.log(`\n💾 데이터베이스 저장 완료:`);
      console.log(`   - 신규 저장: ${saved}개`);
      console.log(`   - 업데이트: ${updated}개`);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ DB 저장 오류:', error.message);
    } finally {
      client.release();
    }
  }

  async updateVenues(facilities) {
    const client = await pool.connect();

    try {
      for (const facility of facilities) {
        // venues 테이블이 있다면 업데이트
        await client.query(`
          UPDATE venues 
          SET 
            address = COALESCE($1, address),
            phone = COALESCE($2, phone),
            website = COALESCE($3, website),
            updated_at = CURRENT_TIMESTAMP
          WHERE name = $4 AND city = $5
        `, [
          facility.address,
          facility.phone,
          facility.homepage,
          facility.name,
          facility.city
        ]);
      }
    } catch (error) {
      console.log('⚠️ venues 업데이트 스킵:', error.message);
    } finally {
      client.release();
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 월별 전시 수집 (특정 기간)
  async collectByPeriod(yearMonth) {
    console.log(`\n📅 ${yearMonth} 전시 정보 수집...`);

    const params = {
      serviceKey: this.serviceKey,
      numOfRows: 100,
      pageNo: 1,
      period: yearMonth // 예: '202507'
    };

    try {
      const response = await axios.get(this.baseUrl + this.endpoints.exhibition, {
        params,
        headers: {
          'Accept': 'application/xml'
        }
      });

      if (response.data) {
        const exhibitions = await this.parseExhibitionData(response.data);
        console.log(`✅ ${yearMonth}: ${exhibitions.length}개 전시`);
        return exhibitions;
      }
    } catch (error) {
      console.error(`❌ ${yearMonth} 수집 실패:`, error.message);
    }

    return [];
  }

  // 지역별 전시 수집
  async collectByArea(keyword) {
    console.log(`\n📍 "${keyword}" 지역 전시 정보 수집...`);

    const params = {
      serviceKey: this.serviceKey,
      numOfRows: 100,
      pageNo: 1,
      keyword // 예: '서울', '부산', '국립'
    };

    try {
      const response = await axios.get(this.baseUrl + this.endpoints.exhibition, {
        params,
        headers: {
          'Accept': 'application/xml'
        }
      });

      if (response.data) {
        const exhibitions = await this.parseExhibitionData(response.data);
        console.log(`✅ ${keyword}: ${exhibitions.length}개 전시`);
        return exhibitions;
      }
    } catch (error) {
      console.error(`❌ ${keyword} 수집 실패:`, error.message);
    }

    return [];
  }
}

// 실행
async function main() {
  const collector = new CulturePortalExhibitionCollector();

  console.log('🇰🇷 한국문화포털 전시 정보 수집 시스템');
  console.log('=' .repeat(50));
  console.log('✅ 실시간 전국 전시 정보');
  console.log('✅ 국공립 + 사립 미술관/갤러리');
  console.log('✅ 공식 데이터 (한국문화정보원)');
  console.log('=' .repeat(50));

  // 1. 전체 전시 수집
  await collector.collectExhibitions();

  // 2. 특정 월 수집 (옵션)
  // await collector.collectByPeriod('202507');
  // await collector.collectByPeriod('202508');

  // 3. 지역별 수집 (옵션)
  // const areas = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '제주'];
  // for (const area of areas) {
  //   await collector.collectByArea(area);
  //   await collector.delay(1000);
  // }

  // 4. 주요 기관별 수집 (옵션)
  // const institutions = ['국립', '시립', '도립', '현대미술관', '미술관'];
  // for (const inst of institutions) {
  //   await collector.collectByArea(inst);
  //   await collector.delay(1000);
  // }

  await pool.end();
  console.log('\n✨ 문화포털 API 전시 데이터 수집 완료!');
}

if (require.main === module) {
  main();
}

module.exports = CulturePortalExhibitionCollector;
