#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');
const { parseStringPromise } = require('xml2js');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class CultureDataPortalAPI {
  constructor() {
    // 공공데이터포털 API
    this.serviceKey = '+wfa+sUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa+3+DxNM7RHCETyzDMbzmA==';
    this.baseUrl = 'https://apis.data.go.kr/B553457/cultureinfo';

    this.stats = {
      total: 0,
      saved: 0,
      errors: 0
    };
  }

  async testConnection() {
    console.log('🎨 공공데이터포털 문화정보 API 테스트\n');
    console.log('📋 API 정보:');
    console.log('   서비스: 문화정보 API');
    console.log('   제공: 한국문화정보원');
    console.log('   엔드포인트:', this.baseUrl);

    try {
      // 전시정보 엔드포인트 테스트
      const testUrl = `${this.baseUrl}/displayinfo/displayinfoList`;
      const params = {
        serviceKey: this.serviceKey,
        numOfRows: 10,
        pageNo: 1
      };

      console.log('\n🔍 전시정보 API 테스트...');
      const response = await axios.get(testUrl, {
        params,
        headers: {
          'Accept': 'application/xml'
        },
        timeout: 30000
      });

      console.log('✅ 응답 상태:', response.status);
      console.log('📄 응답 타입:', response.headers['content-type']);

      // 응답 내용 일부 출력
      const responseData = response.data;
      console.log('📝 응답 샘플:', typeof responseData === 'string' ? responseData.substring(0, 200) : 'JSON 응답');

      return true;

    } catch (error) {
      console.error('❌ API 연결 실패:', error.message);
      if (error.response) {
        console.error('상태 코드:', error.response.status);
        console.error('오류 내용:', error.response.data?.substring(0, 200));
      }
      return false;
    }
  }

  async collectExhibitions() {
    console.log('\n📊 전시 데이터 수집 시작...\n');

    const allExhibitions = [];
    let pageNo = 1;
    const numOfRows = 100;
    let hasMore = true;

    try {
      while (hasMore && pageNo <= 10) {
        console.log(`📄 페이지 ${pageNo} 조회 중...`);

        const url = `${this.baseUrl}/displayinfo/displayinfoList`;
        const params = {
          serviceKey: this.serviceKey,
          numOfRows,
          pageNo
        };

        try {
          const response = await axios.get(url, {
            params,
            headers: {
              'Accept': 'application/xml'
            },
            timeout: 30000
          });

          if (response.data) {
            const exhibitions = await this.parseResponse(response.data);

            if (exhibitions && exhibitions.length > 0) {
              console.log(`   ✅ ${exhibitions.length}개 전시 발견`);
              allExhibitions.push(...exhibitions);

              if (exhibitions.length < numOfRows) {
                hasMore = false;
              } else {
                pageNo++;
              }
            } else {
              console.log('   ⚠️  더 이상 데이터가 없습니다.');
              hasMore = false;
            }
          }

        } catch (error) {
          console.error(`   ❌ 페이지 ${pageNo} 조회 실패:`, error.message);
          hasMore = false;
        }

        await this.delay(1000);
      }

    } catch (error) {
      console.error('❌ 수집 중 오류:', error.message);
    }

    this.stats.total = allExhibitions.length;
    console.log(`\n📊 총 ${allExhibitions.length}개 전시 정보 수집`);

    return allExhibitions;
  }

  async parseResponse(data) {
    try {
      // XML인지 JSON인지 확인
      if (typeof data === 'string' && data.trim().startsWith('<?xml')) {
        // XML 파싱
        const result = await parseStringPromise(data, {
          explicitArray: false,
          ignoreAttrs: true,
          trim: true
        });

        if (!result || !result.response || !result.response.body) {
          console.log('⚠️  응답에 데이터가 없습니다.');
          return [];
        }

        const { body } = result.response;

        // 에러 체크
        if (result.response.header?.resultCode !== '00') {
          console.error(`❌ API 에러: ${result.response.header?.resultMsg}`);
          return [];
        }

        // items 처리
        let items = body.items?.item || [];
        if (!Array.isArray(items)) {
          items = [items];
        }

        return items.map(item => this.transformExhibition(item));

      } else {
        // JSON 응답 처리
        if (data.response?.body?.items) {
          let items = data.response.body.items.item || [];
          if (!Array.isArray(items)) {
            items = [items];
          }
          return items.map(item => this.transformExhibition(item));
        }
      }

      return [];

    } catch (error) {
      console.error('❌ 파싱 오류:', error.message);
      return [];
    }
  }

  transformExhibition(item) {
    // 날짜 형식 처리
    const formatDate = (dateStr) => {
      if (!dateStr) return null;

      // YYYYMMDD 형식인 경우
      if (dateStr.length === 8) {
        return `${dateStr.substr(0, 4)}-${dateStr.substr(4, 2)}-${dateStr.substr(6, 2)}`;
      }

      // YYYY-MM-DD 형식인 경우
      if (dateStr.includes('-')) {
        return dateStr.split(' ')[0]; // 시간 부분 제거
      }

      return dateStr;
    };

    // 상태 결정
    const determineStatus = (startDate, endDate) => {
      if (!startDate || !endDate) return 'unknown';

      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (now < start) return 'upcoming';
      if (now > end) return 'ended';
      return 'ongoing';
    };

    const startDate = formatDate(item.startDate || item.beginDate || item.eventStartDate);
    const endDate = formatDate(item.endDate || item.eventEndDate);

    return {
      title_local: item.title || item.eventNm || item.displayName || '제목 없음',
      title_en: item.titleEn || item.title || 'Untitled',
      venue_name: item.place || item.placeName || item.venue || '장소 미정',
      venue_city: item.area || item.sido || item.city || '서울',
      venue_country: 'KR',
      start_date: startDate,
      end_date: endDate,
      description: item.contents || item.description || item.outline || null,
      admission_fee: item.price || item.fee || item.charge || '정보 없음',
      official_url: item.url || item.homepageUrl || item.website || null,
      image_url: item.imageUrl || item.imgUrl || item.thumbnail || null,
      contact_info: item.tel || item.phone || item.contactInfo || null,
      opening_hours: item.time || item.openTime || null,
      status: determineStatus(startDate, endDate),
      source: 'culture_data_portal',
      metadata: {
        originalData: JSON.stringify(item)
      }
    };
  }

  async saveToDatabase(exhibitions) {
    console.log('\n💾 데이터베이스 저장 시작...');

    const client = await pool.connect();

    try {
      for (const exhibition of exhibitions) {
        try {
          if (!exhibition.start_date || !exhibition.end_date) {
            console.log(`   ⚠️  날짜 정보 없음: ${exhibition.title_local}`);
            continue;
          }

          // 중복 확인
          const existing = await client.query(
            'SELECT id FROM exhibitions WHERE title_local = $1 AND venue_name = $2 AND start_date = $3',
            [exhibition.title_local, exhibition.venue_name, exhibition.start_date]
          );

          if (existing.rows.length === 0) {
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
              exhibition.description?.substring(0, 1000), // 설명 길이 제한
              exhibition.admission_fee,
              exhibition.official_url,
              exhibition.image_url,
              exhibition.contact_info,
              exhibition.opening_hours,
              exhibition.status,
              exhibition.source
            ]);

            this.stats.saved++;
            console.log(`   ✅ 저장: ${exhibition.title_local}`);
          } else {
            console.log(`   ⏭️  중복: ${exhibition.title_local}`);
          }

        } catch (err) {
          console.log(`   ❌ 저장 실패: ${exhibition.title_local} - ${err.message}`);
          this.stats.errors++;
        }
      }

      console.log(`\n✅ 저장 완료: ${this.stats.saved}개 전시`);

    } catch (error) {
      console.error('❌ DB 오류:', error.message);
    } finally {
      client.release();
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    console.log('🚀 공공데이터포털 문화정보 API 전시 데이터 수집\n');
    console.log('=' .repeat(60));
    console.log('서비스명: 문화정보 API');
    console.log('제공기관: 한국문화정보원');
    console.log('데이터: 전국 전시 정보');
    console.log('=' .repeat(60));

    // API 연결 테스트
    const isConnected = await this.testConnection();
    if (!isConnected) {
      console.log('\n⚠️  API 연결 실패. 다른 엔드포인트를 시도합니다...');

      // 다른 가능한 엔드포인트들
      const endpoints = [
        '/exhibitionAPI/request',
        '/cultureAPI/request',
        '/performanceAPI/request'
      ];

      for (const endpoint of endpoints) {
        console.log(`\n🔄 ${endpoint} 시도 중...`);
        this.baseUrl = `https://apis.data.go.kr/B553457/cultureinfo${endpoint}`;

        const success = await this.testConnection();
        if (success) break;
      }
    }

    // 전시 데이터 수집
    const exhibitions = await this.collectExhibitions();

    // 데이터베이스 저장
    if (exhibitions.length > 0) {
      await this.saveToDatabase(exhibitions);
    } else {
      console.log('\n⚠️  수집된 전시 데이터가 없습니다.');
      console.log('가능한 원인:');
      console.log('1. API 엔드포인트가 변경되었을 수 있습니다.');
      console.log('2. 인증키가 만료되었을 수 있습니다.');
      console.log('3. 서비스가 점검 중일 수 있습니다.');
    }

    // 결과 요약
    console.log(`\n${'=' .repeat(60)}`);
    console.log('📊 최종 결과:');
    console.log(`   📥 수집된 전시: ${this.stats.total}개`);
    console.log(`   💾 저장된 전시: ${this.stats.saved}개`);
    console.log(`   ❌ 오류: ${this.stats.errors}개`);
    console.log('=' .repeat(60));
    console.log('\n✨ 작업 완료!');
  }
}

// 실행
async function main() {
  const collector = new CultureDataPortalAPI();
  await collector.run();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = CultureDataPortalAPI;
