#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');
const { parseStringPromise } = require('xml2js');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class CulturePortalAPI {
  constructor() {
    // 제공받은 인코딩된 키 사용
    this.serviceKeyEncoded = '%2Bwfa%2BsUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa%2B3%2BDxNM7RHCETyzDMbzmA%3D%3D';
    // 디코딩된 키
    this.serviceKeyDecoded = '+wfa+sUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa+3+DxNM7RHCETyzDMbzmA==';

    this.baseUrl = 'http://www.culture.go.kr/openapi/rest/publicperformancedisplays';

    this.stats = {
      total: 0,
      saved: 0,
      errors: 0
    };
  }

  async testAPI() {
    console.log('🎨 문화포털 API 테스트\n');
    console.log('📋 API 정보:');
    console.log('   - 서비스: 한국문화정보원 공연전시정보');
    console.log('   - 엔드포인트:', this.baseUrl);
    console.log('   - 인증키 설정 완료\n');

    try {
      // 간단한 테스트 요청
      const testUrl = `${this.baseUrl}/period`;
      const params = {
        serviceKey: this.serviceKeyDecoded,
        from: '20250701',
        to: '20250731',
        rows: 10,
        cPage: 1
      };

      console.log('🔍 테스트 요청 중...');
      const response = await axios.get(testUrl, {
        params,
        headers: {
          'Accept': 'application/xml'
        }
      });

      if (response.status === 200) {
        console.log('✅ API 연결 성공!');
        console.log('응답 타입:', response.headers['content-type']);
        return true;
      }
    } catch (error) {
      console.error('❌ API 테스트 실패:', error.message);
      if (error.response) {
        console.error('상태 코드:', error.response.status);
        console.error('응답:', error.response.data?.substring(0, 200));
      }
      return false;
    }
  }

  async collectExhibitions() {
    console.log('\n📊 전시 데이터 수집 시작...\n');

    const allExhibitions = [];

    try {
      // 1. 기간별 조회 (2025년 7월~12월)
      const months = ['07', '08', '09', '10', '11', '12'];

      for (const month of months) {
        const fromDate = `2025${month}01`;
        const toDate = `2025${month}31`;

        console.log(`\n📅 2025년 ${month}월 전시 정보 조회...`);

        const url = `${this.baseUrl}/period`;
        const params = {
          serviceKey: this.serviceKeyDecoded,
          from: fromDate,
          to: toDate,
          rows: 100,
          cPage: 1,
          realmCode: 'D000'  // D000: 전시
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
            if (exhibitions.length > 0) {
              console.log(`   ✅ ${exhibitions.length}개 전시 발견`);
              allExhibitions.push(...exhibitions);
            } else {
              console.log('   ⚠️  데이터 없음');
            }
          }

        } catch (error) {
          console.error(`   ❌ ${month}월 조회 실패:`, error.message);
        }

        await this.delay(1000);
      }

      // 2. 지역별 조회
      const areas = [
        { code: '11', name: '서울' },
        { code: '26', name: '부산' },
        { code: '27', name: '대구' },
        { code: '28', name: '인천' },
        { code: '29', name: '광주' }
      ];

      for (const area of areas) {
        console.log(`\n📍 ${area.name} 지역 전시 조회...`);

        const url = `${this.baseUrl}/area`;
        const params = {
          serviceKey: this.serviceKeyDecoded,
          sido: area.code,
          rows: 100,
          cPage: 1,
          realmCode: 'D000'
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
            if (exhibitions.length > 0) {
              console.log(`   ✅ ${exhibitions.length}개 전시 발견`);
              allExhibitions.push(...exhibitions);
            }
          }

        } catch (error) {
          console.error(`   ❌ ${area.name} 조회 실패:`, error.message);
        }

        await this.delay(1000);
      }

    } catch (error) {
      console.error('❌ 수집 중 오류:', error.message);
    }

    // 중복 제거
    const uniqueExhibitions = this.removeDuplicates(allExhibitions);
    this.stats.total = uniqueExhibitions.length;

    console.log(`\n📊 총 ${uniqueExhibitions.length}개 전시 수집 (중복 제거)`);

    return uniqueExhibitions;
  }

  async parseResponse(xmlData) {
    try {
      const result = await parseStringPromise(xmlData, {
        explicitArray: false,
        ignoreAttrs: true
      });

      if (!result || !result.response || !result.response.msgBody) {
        return [];
      }

      const { msgBody } = result.response;

      // perforList가 배열이 아닌 경우 배열로 변환
      let items = msgBody.perforList || [];
      if (!Array.isArray(items)) {
        items = [items];
      }

      return items.map(item => this.transformExhibition(item));

    } catch (error) {
      console.error('❌ XML 파싱 오류:', error.message);
      return [];
    }
  }

  transformExhibition(item) {
    // 날짜 형식 변환
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
      title_en: item.title || 'Untitled',
      venue_name: item.place || '장소 미정',
      venue_city: item.area || '서울',
      venue_country: 'KR',
      start_date: startDate,
      end_date: endDate,
      description: item.contents || null,
      admission_fee: item.price || '무료',
      official_url: item.url || null,
      image_url: item.imgUrl || item.thumbnail || null,
      contact_info: item.phone || null,
      opening_hours: item.time || null,
      status: determineStatus(startDate, endDate),
      source: 'culture_portal_api',
      metadata: {
        seq: item.seq,
        realmName: item.realmName,
        placeAddr: item.placeAddr,
        gpsX: item.gpsX,
        gpsY: item.gpsY
      }
    };
  }

  removeDuplicates(exhibitions) {
    const seen = new Set();
    return exhibitions.filter(item => {
      const key = `${item.title_local}_${item.venue_name}_${item.start_date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async saveToDatabase(exhibitions) {
    console.log('\n💾 데이터베이스 저장 시작...');

    const client = await pool.connect();

    try {
      for (const exhibition of exhibitions) {
        try {
          if (!exhibition.start_date || !exhibition.end_date) continue;

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
              exhibition.description,
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
    console.log('🚀 문화포털 API 전시 데이터 수집\n');
    console.log('=' .repeat(60));
    console.log('제공: 한국문화정보원');
    console.log('데이터: 전국 문화시설 전시 정보');
    console.log('=' .repeat(60));

    // API 테스트
    const isValid = await this.testAPI();
    if (!isValid) {
      console.log('\n⚠️  API 연결에 문제가 있습니다.');
      console.log('가능한 원인:');
      console.log('1. API 서비스 점검 중');
      console.log('2. 인증키 만료');
      console.log('3. 일일 요청 한도 초과');
      return;
    }

    // 전시 수집
    const exhibitions = await this.collectExhibitions();

    // 데이터베이스 저장
    if (exhibitions.length > 0) {
      await this.saveToDatabase(exhibitions);
    }

    // 결과 요약
    console.log(`\n${'=' .repeat(60)}`);
    console.log('📊 최종 결과:');
    console.log(`   📥 수집된 전시: ${this.stats.total}개`);
    console.log(`   💾 저장된 전시: ${this.stats.saved}개`);
    console.log(`   ❌ 오류: ${this.stats.errors}개`);
    console.log('=' .repeat(60));
    console.log('\n✨ 문화포털 API 수집 완료!');
  }
}

// 실행
async function main() {
  const collector = new CulturePortalAPI();
  await collector.run();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = CulturePortalAPI;
