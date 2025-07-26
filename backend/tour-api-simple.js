#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class TourAPISimple {
  constructor() {
    this.serviceKey = '+wfa+sUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa+3+DxNM7RHCETyzDMbzmA==';
    this.baseUrl = 'http://apis.data.go.kr/B551011/KorService2';
    
    this.stats = {
      exhibitions: 0,
      saved: 0,
      errors: 0
    };
  }

  // 전시/축제 정보 수집 (전시만)
  async collectExhibitions() {
    console.log('🎨 한국관광공사 API - 전시 데이터 수집\n');
    
    const allExhibitions = [];
    
    try {
      // 1. 키워드로 전시 검색
      const keywords = ['전시', '미술관', '갤러리', '아트', '특별전', '기획전', '현대미술', '전시회'];
      
      for (const keyword of keywords) {
        console.log(`\n🔍 "${keyword}" 검색 중...`);
        
        const response = await axios.get(`${this.baseUrl}/searchKeyword2`, {
          params: {
            serviceKey: this.serviceKey,
            numOfRows: 100,
            pageNo: 1,
            MobileOS: 'ETC',
            MobileApp: 'SAYU',
            _type: 'json',
            keyword: keyword,
            arrange: 'D'  // 수정일순
          }
        });
        
        if (response.data.response?.header?.resultCode === '0000') {
          const items = response.data.response.body.items?.item || [];
          const itemArray = Array.isArray(items) ? items : [items];
          
          // 전시 관련만 필터링
          const exhibitions = itemArray.filter(item => {
            const title = item.title || '';
            const addr = item.addr1 || '';
            
            // 전시 관련 키워드 포함 & 축제 제외
            return (
              (title.includes('전시') || title.includes('展') || 
               title.includes('갤러리') || title.includes('미술') ||
               title.includes('아트') || title.includes('특별전') ||
               title.includes('기획전') || title.includes('작품') ||
               addr.includes('미술관') || addr.includes('갤러리')) &&
              !title.includes('축제') && !title.includes('페스티벌') &&
              !title.includes('공연') && !title.includes('뮤지컬')
            );
          });
          
          console.log(`   ✅ ${exhibitions.length}개 전시 발견`);
          allExhibitions.push(...exhibitions);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // 2. 지역별 문화시설 내 전시 검색
      const areas = [
        { code: 1, name: '서울' },
        { code: 6, name: '부산' },
        { code: 31, name: '경기' }
      ];
      
      for (const area of areas) {
        console.log(`\n📍 ${area.name} 지역 문화시설 검색...`);
        
        const response = await axios.get(`${this.baseUrl}/areaBasedList2`, {
          params: {
            serviceKey: this.serviceKey,
            numOfRows: 50,
            pageNo: 1,
            MobileOS: 'ETC',
            MobileApp: 'SAYU',
            _type: 'json',
            contentTypeId: 14,  // 문화시설
            areaCode: area.code,
            cat1: 'A02',
            cat2: 'A0206',  // 전시/기념관
            arrange: 'D'
          }
        });
        
        if (response.data.response?.header?.resultCode === '0000') {
          const items = response.data.response.body.items?.item || [];
          const itemArray = Array.isArray(items) ? items : [items];
          
          const exhibitions = itemArray.filter(item => 
            item.title?.includes('전시') || 
            item.title?.includes('특별전') ||
            item.cat3 === 'A02060100'
          );
          
          console.log(`   ✅ ${exhibitions.length}개 전시 발견`);
          allExhibitions.push(...exhibitions);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
    } catch (error) {
      console.error('❌ API 오류:', error.message);
      this.stats.errors++;
    }
    
    // 중복 제거
    const uniqueExhibitions = this.removeDuplicates(allExhibitions);
    this.stats.exhibitions = uniqueExhibitions.length;
    
    console.log(`\n📊 총 ${uniqueExhibitions.length}개 전시 수집 (중복 제거)`);
    
    return uniqueExhibitions;
  }

  // 중복 제거
  removeDuplicates(exhibitions) {
    const seen = new Set();
    return exhibitions.filter(item => {
      const key = item.contentid || `${item.title}_${item.addr1}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // 데이터베이스 저장
  async saveToDatabase(exhibitions) {
    console.log('\n💾 전시 데이터 저장 시작...');
    
    const client = await pool.connect();
    
    try {
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
          
          // 기본값 설정
          if (!startDate) {
            startDate = new Date().toISOString().split('T')[0];
          }
          if (!endDate) {
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 3);
            endDate = futureDate.toISOString().split('T')[0];
          }
          
          // 장소 정보 추출
          const addressParts = exhibition.addr1?.split(' ') || [];
          const city = addressParts[0] || '서울';
          const venueName = this.extractVenueName(exhibition);
          
          // 상태 결정
          const status = this.determineStatus(startDate, endDate);
          
          // 중복 확인
          const existing = await client.query(
            'SELECT id FROM exhibitions WHERE title_en = $1 AND venue_name = $2',
            [exhibition.title, venueName]
          );
          
          if (existing.rows.length === 0) {
            await client.query(`
              INSERT INTO exhibitions (
                title_en, title_local, 
                venue_name, venue_city, venue_country,
                start_date, end_date,
                description, 
                source, source_url,
                status, collected_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
            `, [
              exhibition.title,
              exhibition.title,
              venueName,
              city,
              'KR',
              startDate,
              endDate,
              this.cleanDescription(exhibition.overview),
              '한국관광공사',
              `https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=${exhibition.contentid}`,
              status
            ]);
            
            this.stats.saved++;
            console.log(`   ✅ 저장: ${exhibition.title}`);
          } else {
            console.log(`   ⏭️  중복: ${exhibition.title}`);
          }
          
        } catch (err) {
          console.log(`   ❌ 실패: ${exhibition.title} - ${err.message}`);
          this.stats.errors++;
        }
      }
      
      console.log(`\n✅ 저장 완료: ${this.stats.saved}개 전시`);
      
    } catch (error) {
      console.error('❌ 저장 중 오류:', error.message);
    } finally {
      client.release();
    }
  }

  // 장소명 추출
  extractVenueName(exhibition) {
    // 주소에서 미술관/갤러리명 추출 시도
    const addr = exhibition.addr1 || '';
    const title = exhibition.title || '';
    
    // 주소에 미술관/갤러리가 포함된 경우
    const venueMatch = addr.match(/([\w\s]+(?:미술관|갤러리|아트센터|박물관))/);
    if (venueMatch) return venueMatch[1].trim();
    
    // 제목에서 장소 추출
    if (title.includes('@')) {
      return title.split('@')[1].trim();
    }
    
    // 기본값: 주소의 마지막 부분
    const parts = addr.split(' ');
    return parts[parts.length - 1] || '미정';
  }

  // 설명 정리
  cleanDescription(overview) {
    if (!overview) return null;
    
    // HTML 태그 제거
    let cleaned = overview.replace(/<[^>]*>/g, '');
    
    // 과도한 공백 제거
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // 500자 제한
    if (cleaned.length > 500) {
      cleaned = cleaned.substring(0, 497) + '...';
    }
    
    return cleaned || null;
  }

  // 상태 결정
  determineStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'ongoing';
  }

  // 실행
  async run() {
    console.log('🚀 한국관광공사 전시 데이터 수집 (간소화 버전)\n');
    console.log('='.repeat(60));
    
    const exhibitions = await this.collectExhibitions();
    
    if (exhibitions.length > 0) {
      await this.saveToDatabase(exhibitions);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 최종 결과:');
    console.log(`   🎨 수집된 전시: ${this.stats.exhibitions}개`);
    console.log(`   💾 저장된 전시: ${this.stats.saved}개`);
    console.log(`   ❌ 오류: ${this.stats.errors}개`);
    console.log('\n✨ 작업 완료!');
  }
}

// 실행
const collector = new TourAPISimple();
collector.run().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('오류:', error);
  process.exit(1);
});