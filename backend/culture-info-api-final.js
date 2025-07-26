#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');
const { parseStringPromise } = require('xml2js');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class CultureInfoAPI {
  constructor() {
    // 제공받은 인증키
    this.serviceKey = '+wfa+sUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa+3+DxNM7RHCETyzDMbzmA==';
    // 정확한 엔드포인트
    this.baseUrl = 'http://api.kcisa.kr/openapi/CNV_060/request';
    
    this.stats = {
      total: 0,
      saved: 0,
      errors: 0
    };
  }

  async testAPI() {
    console.log('🎨 한국문화정보원 한눈에보는문화정보 API 테스트\n');
    console.log('📋 API 정보:');
    console.log('   서비스: 공연전시정보조회서비스');
    console.log('   제공기관: 한국문화정보원');
    console.log('   데이터: 문화예술, 공연, 전시 정보');

    try {
      const params = {
        serviceKey: this.serviceKey,
        numOfRows: 10,
        pageNo: 1
      };

      console.log('\n🔍 API 연결 테스트...');
      const response = await axios.get(this.baseUrl, { 
        params,
        headers: {
          'Accept': 'application/xml, text/xml'
        },
        timeout: 30000
      });

      if (response.status === 200) {
        console.log('✅ API 연결 성공!');
        console.log('📄 응답 타입:', response.headers['content-type']);
        
        // 응답 파싱 테스트
        const data = await this.parseResponse(response.data);
        if (data && data.length > 0) {
          console.log(`✅ 데이터 파싱 성공: ${data.length}개 항목`);
          console.log('📝 샘플 데이터:', data[0].title || '제목 없음');
        }
        
        return true;
      }
    } catch (error) {
      console.error('❌ API 테스트 실패:', error.message);
      if (error.response) {
        console.error('상태 코드:', error.response.status);
        this.checkErrorCode(error.response);
      }
      return false;
    }
  }

  checkErrorCode(response) {
    // API 오류 코드 확인
    const errorCodes = {
      '1': 'APPLICATION ERROR - 어플리케이션 에러',
      '4': 'HTTP_ERROR - HTTP 에러',
      '12': 'NO_OPENAPI_SERVICE_ERROR - 해당 오픈 API 서비스가 없거나 폐기됨',
      '20': 'SERVICE_ACCESS_DENIED_ERROR - 서비스 접근거부',
      '22': 'LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR - 서비스 요청제한횟수 초과',
      '30': 'SERVICE_KEY_IS_NOT_REGISTERED_ERROR - 등록되지 않은 서비스키',
      '31': 'DEADLINE_HAS_EXPIRED_ERROR - 활용기간 만료',
      '32': 'UNREGISTERED_IP_ERROR - 등록되지 않은 IP',
      '99': 'UNKNOWN_ERROR - 기타에러'
    };

    try {
      const data = response.data;
      if (data && data.includes('returnReasonCode')) {
        const codeMatch = data.match(/<returnReasonCode>(\d+)<\/returnReasonCode>/);
        if (codeMatch) {
          const code = codeMatch[1];
          console.log('⚠️  오류 코드:', errorCodes[code] || `알 수 없는 오류 (${code})`);
        }
      }
    } catch (e) {
      // 오류 파싱 실패 시 무시
    }
  }

  async collectExhibitions() {
    console.log('\n📊 전시 데이터 수집 시작...\n');

    const allExhibitions = [];
    let pageNo = 1;
    const numOfRows = 100;
    let hasMore = true;

    try {
      // 1. 전체 목록 조회
      while (hasMore && pageNo <= 20) {
        console.log(`📄 페이지 ${pageNo} 조회 중...`);
        
        const params = {
          serviceKey: this.serviceKey,
          numOfRows: numOfRows,
          pageNo: pageNo
        };

        try {
          const response = await axios.get(this.baseUrl, { 
            params,
            headers: {
              'Accept': 'application/xml'
            },
            timeout: 30000
          });

          if (response.data) {
            const exhibitions = await this.parseResponse(response.data);
            
            if (exhibitions && exhibitions.length > 0) {
              // 전시 관련만 필터링
              const filteredExhibitions = exhibitions.filter(item => {
                const title = item.title || '';
                const category = item.category || '';
                const genre = item.genre || '';
                
                // 전시 관련 키워드 포함
                return (
                  title.includes('전시') || 
                  title.includes('展') ||
                  title.includes('갤러리') ||
                  title.includes('미술') ||
                  title.includes('아트') ||
                  category.includes('전시') ||
                  genre.includes('전시') ||
                  genre === 'D000' // 전시 분야 코드
                ) && !title.includes('공연') && !title.includes('콘서트');
              });
              
              console.log(`   ✅ ${exhibitions.length}개 중 ${filteredExhibitions.length}개 전시 발견`);
              allExhibitions.push(...filteredExhibitions);
              
              if (exhibitions.length < numOfRows) {
                hasMore = false;
              } else {
                pageNo++;
              }
            } else {
              hasMore = false;
            }
          }

        } catch (error) {
          console.error(`   ❌ 페이지 ${pageNo} 조회 실패:`, error.message);
          hasMore = false;
        }

        await this.delay(500);
      }

      // 2. 키워드 검색
      const keywords = ['전시', '미술관', '갤러리', '아트', '특별전'];
      
      for (const keyword of keywords) {
        console.log(`\n🔍 "${keyword}" 키워드 검색...`);
        
        const params = {
          serviceKey: this.serviceKey,
          numOfRows: 100,
          pageNo: 1,
          keyword: keyword
        };

        try {
          const response = await axios.get(this.baseUrl, { 
            params,
            headers: {
              'Accept': 'application/xml'
            }
          });

          if (response.data) {
            const exhibitions = await this.parseResponse(response.data);
            if (exhibitions && exhibitions.length > 0) {
              console.log(`   ✅ ${exhibitions.length}개 결과`);
              allExhibitions.push(...exhibitions);
            }
          }
        } catch (error) {
          console.error(`   ❌ "${keyword}" 검색 실패:`, error.message);
        }

        await this.delay(500);
      }

    } catch (error) {
      console.error('❌ 수집 중 오류:', error.message);
    }

    // 중복 제거
    const uniqueExhibitions = this.removeDuplicates(allExhibitions);
    this.stats.total = uniqueExhibitions.length;
    
    console.log(`\n📊 총 ${uniqueExhibitions.length}개 전시 정보 수집 (중복 제거)`);
    
    return uniqueExhibitions;
  }

  async parseResponse(xmlData) {
    try {
      const result = await parseStringPromise(xmlData, {
        explicitArray: false,
        ignoreAttrs: true,
        trim: true,
        normalizeTags: true,
        explicitRoot: false
      });

      // 응답 구조 확인
      if (!result) return [];

      // items 찾기 (다양한 경로 시도)
      let items = null;
      
      // 가능한 경로들
      const paths = [
        result.items,
        result.response?.msgBody?.items,
        result.response?.body?.items,
        result.msgBody?.items,
        result.body?.items,
        result.item,
        result.response?.msgBody,
        result.response?.body
      ];

      for (const path of paths) {
        if (path) {
          if (Array.isArray(path)) {
            items = path;
          } else if (path.item) {
            items = Array.isArray(path.item) ? path.item : [path.item];
          } else if (typeof path === 'object') {
            items = [path];
          }
          if (items) break;
        }
      }

      if (!items) {
        console.log('⚠️  데이터 구조에서 항목을 찾을 수 없습니다.');
        return [];
      }

      return items.map(item => this.transformExhibition(item));

    } catch (error) {
      console.error('❌ XML 파싱 오류:', error.message);
      return [];
    }
  }

  transformExhibition(item) {
    // 날짜 처리
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      
      // YYYYMMDD 형식
      if (dateStr.length === 8 && !isNaN(dateStr)) {
        return `${dateStr.substr(0, 4)}-${dateStr.substr(4, 2)}-${dateStr.substr(6, 2)}`;
      }
      
      // YYYY.MM.DD 형식
      if (dateStr.includes('.')) {
        return dateStr.split('.').join('-');
      }
      
      // YYYY-MM-DD 형식 (이미 올바른 형식)
      if (dateStr.includes('-')) {
        return dateStr.split(' ')[0];
      }
      
      return dateStr;
    };

    // 상태 결정
    const determineStatus = (startDate, endDate) => {
      if (!startDate || !endDate) return 'unknown';
      
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'unknown';
      
      if (now < start) return 'upcoming';
      if (now > end) return 'ended';
      return 'ongoing';
    };

    // 다양한 필드명 지원
    const title = item.title || item.TITLE || item.eventNm || item.perforNm || '';
    const place = item.place || item.PLACE || item.eventPlace || item.perforPlace || '';
    const startDate = formatDate(item.startDate || item.eventStartDate || item.perforStartDate || item.period?.split('~')[0]);
    const endDate = formatDate(item.endDate || item.eventEndDate || item.perforEndDate || item.period?.split('~')[1]);

    return {
      title_local: title,
      title_en: title,
      venue_name: place || '장소 미정',
      venue_city: item.area || item.AREA || item.sido || '서울',
      venue_country: 'KR',
      start_date: startDate,
      end_date: endDate,
      description: item.contents || item.CONTENTS || item.synopsis || null,
      admission_fee: item.price || item.PRICE || item.charge || '정보 없음',
      official_url: item.url || item.URL || item.linkUrl || null,
      image_url: item.imgUrl || item.imageUrl || item.thumbnail || null,
      contact_info: item.tel || item.TEL || item.phone || null,
      opening_hours: item.time || item.TIME || null,
      status: determineStatus(startDate, endDate),
      source: 'kcisa_culture_info'
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
    console.log('🚀 한국문화정보원 한눈에보는문화정보 API 전시 데이터 수집\n');
    console.log('=' .repeat(60));
    console.log('서비스: 공연전시정보조회서비스');
    console.log('제공기관: 한국문화정보원');
    console.log('데이터: 대한민국 문화체육관광부 문화정보');
    console.log('=' .repeat(60));

    // API 테스트
    const isValid = await this.testAPI();
    if (!isValid) {
      console.log('\n❌ API 연결에 실패했습니다.');
      return;
    }

    // 전시 데이터 수집
    const exhibitions = await this.collectExhibitions();

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
    console.log('\n✨ 한국문화정보원 API 전시 데이터 수집 완료!');
  }
}

// 실행
async function main() {
  const collector = new CultureInfoAPI();
  await collector.run();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = CultureInfoAPI;