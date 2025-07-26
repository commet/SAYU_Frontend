#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');
const { parseStringPromise } = require('xml2js');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class CultureAPIv2 {
  constructor() {
    // 제공받은 API 키
    this.serviceKey = '+wfa+sUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa+3+DxNM7RHCETyzDMbzmA==';
    // 한국문화정보원 API 엔드포인트들
    this.endpoints = {
      period: 'http://www.culture.go.kr/openapi/rest/publicperformancedisplays/period',
      area: 'http://www.culture.go.kr/openapi/rest/publicperformancedisplays/area', 
      realm: 'http://www.culture.go.kr/openapi/rest/publicperformancedisplays/realm',
      detail: 'http://www.culture.go.kr/openapi/rest/publicperformancedisplays/d/'
    };
    
    this.stats = {
      total: 0,
      saved: 0,
      errors: 0
    };
  }

  async testAPI() {
    console.log('🎨 한국문화정보원 공연전시정보 API 테스트\n');

    try {
      // 기간별 조회로 테스트
      const today = new Date();
      const from = today.toISOString().slice(0, 10).replace(/-/g, '');
      const to = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
      
      const params = {
        serviceKey: this.serviceKey,
        from: from,
        to: to,
        rows: 10,
        cPage: 1
      };

      console.log('🔍 기간별 조회 테스트...');
      console.log(`   기간: ${from} ~ ${to}`);
      
      const response = await axios.get(this.endpoints.period, { 
        params,
        headers: {
          'Accept': 'application/xml'
        },
        timeout: 30000
      });

      if (response.status === 200) {
        console.log('✅ API 연결 성공!');
        console.log('📄 응답 타입:', response.headers['content-type']);
        
        // 응답 내용 확인
        const data = await this.parseResponse(response.data);
        if (data && data.totalCount > 0) {
          console.log(`✅ 총 ${data.totalCount}개 데이터 확인`);
          if (data.items && data.items.length > 0) {
            console.log(`📝 첫 번째 항목: ${data.items[0].title}`);
          }
        }
        
        return true;
      }
    } catch (error) {
      console.error('❌ API 테스트 실패:', error.message);
      if (error.response) {
        console.error('상태 코드:', error.response.status);
        console.error('응답:', error.response.data?.substring(0, 300));
      }
      return false;
    }
  }

  async collectByPeriod() {
    console.log('\n📅 기간별 전시 데이터 수집...\n');
    
    const allItems = [];
    const today = new Date();
    
    // 현재부터 6개월간의 데이터 수집
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const fromDate = new Date(today.getTime() + monthOffset * 30 * 24 * 60 * 60 * 1000);
      const toDate = new Date(fromDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const from = fromDate.toISOString().slice(0, 10).replace(/-/g, '');
      const to = toDate.toISOString().slice(0, 10).replace(/-/g, '');
      
      console.log(`\n📆 ${from} ~ ${to} 기간 조회...`);
      
      let pageNo = 1;
      let hasMore = true;
      
      while (hasMore && pageNo <= 10) {
        const params = {
          serviceKey: this.serviceKey,
          from: from,
          to: to,
          rows: 100,
          cPage: pageNo,
          realmCode: 'D000' // 전시 분야
        };

        try {
          const response = await axios.get(this.endpoints.period, { 
            params,
            headers: {
              'Accept': 'application/xml'
            },
            timeout: 30000
          });

          if (response.data) {
            const data = await this.parseResponse(response.data);
            
            if (data && data.items && data.items.length > 0) {
              console.log(`   📄 페이지 ${pageNo}: ${data.items.length}개 항목`);
              allItems.push(...data.items);
              
              if (data.items.length < 100) {
                hasMore = false;
              } else {
                pageNo++;
              }
            } else {
              hasMore = false;
            }
          }

        } catch (error) {
          console.error(`   ❌ 페이지 ${pageNo} 오류:`, error.message);
          hasMore = false;
        }

        await this.delay(500);
      }
    }
    
    return allItems;
  }

  async collectByArea() {
    console.log('\n📍 지역별 전시 데이터 수집...\n');
    
    const allItems = [];
    const areas = [
      { code: '11', name: '서울' },
      { code: '26', name: '부산' },
      { code: '27', name: '대구' },
      { code: '28', name: '인천' },
      { code: '29', name: '광주' },
      { code: '30', name: '대전' },
      { code: '31', name: '울산' },
      { code: '41', name: '경기' }
    ];
    
    for (const area of areas) {
      console.log(`\n🏙️ ${area.name} 지역 조회...`);
      
      const params = {
        serviceKey: this.serviceKey,
        sido: area.code,
        rows: 100,
        cPage: 1,
        realmCode: 'D000' // 전시 분야
      };

      try {
        const response = await axios.get(this.endpoints.area, { 
          params,
          headers: {
            'Accept': 'application/xml'
          },
          timeout: 30000
        });

        if (response.data) {
          const data = await this.parseResponse(response.data);
          
          if (data && data.items && data.items.length > 0) {
            console.log(`   ✅ ${data.items.length}개 전시 발견`);
            allItems.push(...data.items);
          } else {
            console.log(`   ⚠️  데이터 없음`);
          }
        }

      } catch (error) {
        console.error(`   ❌ ${area.name} 조회 실패:`, error.message);
      }

      await this.delay(500);
    }
    
    return allItems;
  }

  async parseResponse(xmlData) {
    try {
      const result = await parseStringPromise(xmlData, {
        explicitArray: false,
        ignoreAttrs: true,
        trim: true
      });

      if (!result || !result.response) {
        return null;
      }

      const response = result.response;
      
      // 오류 체크
      if (response.comMsgHeader) {
        const header = response.comMsgHeader;
        if (header.returnCode && header.returnCode !== '00') {
          console.error(`API 오류: ${header.returnReasonCode} - ${header.errMsg}`);
          return null;
        }
      }

      // 데이터 추출
      const msgBody = response.msgBody;
      if (!msgBody) return null;

      const totalCount = parseInt(msgBody.totalCount || 0);
      
      let items = [];
      if (msgBody.perforList) {
        items = Array.isArray(msgBody.perforList) ? msgBody.perforList : [msgBody.perforList];
      }

      return {
        totalCount: totalCount,
        items: items
      };

    } catch (error) {
      console.error('❌ XML 파싱 오류:', error.message);
      return null;
    }
  }

  transformToExhibition(item) {
    // 날짜 처리
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      
      // YYYYMMDD 형식
      if (dateStr.length === 8) {
        return `${dateStr.substr(0, 4)}-${dateStr.substr(4, 2)}-${dateStr.substr(6, 2)}`;
      }
      
      // YYYY.MM.DD 형식
      if (dateStr.includes('.')) {
        return dateStr.replace(/\./g, '-');
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
      admission_fee: item.price || '정보 없음',
      official_url: item.url || null,
      image_url: item.thumbnail || null,
      contact_info: item.phone || null,
      opening_hours: item.time || null,
      status: determineStatus(startDate, endDate),
      source: 'culture_portal',
      metadata: {
        seq: item.seq,
        realmName: item.realmName,
        realmCode: item.realmCode
      }
    };
  }

  removeDuplicates(items) {
    const seen = new Set();
    return items.filter(item => {
      const key = `${item.title}_${item.place}_${item.startDate}`;
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
              exhibition.description?.substring(0, 1000),
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
    console.log('🚀 한국문화정보원 공연전시정보 API 전시 데이터 수집\n');
    console.log('=' .repeat(60));
    console.log('서비스: 한눈에보는문화정보조회서비스');
    console.log('제공기관: 한국문화정보원');
    console.log('데이터: 문화체육관광부 문화예술 정보');
    console.log('=' .repeat(60));

    // API 테스트
    const isValid = await this.testAPI();
    if (!isValid) {
      console.log('\n❌ API 연결에 실패했습니다.');
      return;
    }

    // 데이터 수집
    console.log('\n📊 전시 데이터 수집 시작...');
    
    // 1. 기간별 수집
    const periodItems = await this.collectByPeriod();
    console.log(`\n✅ 기간별 수집: ${periodItems.length}개`);
    
    // 2. 지역별 수집
    const areaItems = await this.collectByArea();
    console.log(`✅ 지역별 수집: ${areaItems.length}개`);
    
    // 전체 합치기 및 중복 제거
    const allItems = [...periodItems, ...areaItems];
    const uniqueItems = this.removeDuplicates(allItems);
    
    // 전시만 필터링
    const exhibitions = uniqueItems
      .filter(item => {
        const realmCode = item.realmCode || '';
        const title = item.title || '';
        return realmCode === 'D000' || title.includes('전시') || title.includes('展');
      })
      .map(item => this.transformToExhibition(item));
    
    this.stats.total = exhibitions.length;
    console.log(`\n📊 전시 필터링 결과: ${exhibitions.length}개 (전체 ${uniqueItems.length}개 중)`);

    // 데이터베이스 저장
    if (exhibitions.length > 0) {
      await this.saveToDatabase(exhibitions);
    }

    // 결과 요약
    console.log('\n' + '=' .repeat(60));
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
  const collector = new CultureAPIv2();
  await collector.run();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = CultureAPIv2;