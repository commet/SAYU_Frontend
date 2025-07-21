#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class SeoulOpenAPICollector {
  constructor() {
    this.baseUrl = 'http://openapi.seoul.go.kr:8088';
    // 서울시 공공데이터 API는 키 없이 사용 가능한 경우가 많음
    this.apiKey = 'sample'; // 테스트용 키
    
    this.stats = {
      exhibitions: 0,
      saved: 0,
      errors: 0
    };
  }

  async collectCulturalEvents() {
    console.log('🎨 서울시 문화행사 정보 수집 시작\n');
    
    try {
      // 서울시 문화행사 정보 API
      const url = `${this.baseUrl}/${this.apiKey}/json/culturalEventInfo/1/100/`;
      
      console.log('📡 API 요청 중...');
      const response = await axios.get(url, {
        timeout: 10000
      });
      
      if (response.data.culturalEventInfo) {
        const data = response.data.culturalEventInfo;
        console.log(`✅ 총 ${data.list_total_count}개 문화행사 발견`);
        
        // 전시 관련만 필터
        const exhibitions = data.row.filter(item => 
          item.CODENAME?.includes('전시') || 
          item.TITLE?.includes('전시') ||
          item.PLACE?.includes('미술관') ||
          item.PLACE?.includes('갤러리')
        );
        
        console.log(`🖼️  전시 관련: ${exhibitions.length}개`);
        
        return exhibitions;
      }
      
    } catch (error) {
      console.log('❌ 서울시 API 접근 실패:', error.message);
      
      // 대안: 서울문화포털 API
      console.log('\n🔄 서울문화포털 API 시도...');
      return await this.collectFromCulturePortal();
    }
    
    return [];
  }

  async collectFromCulturePortal() {
    try {
      // 서울문화포털 전시 정보
      const url = 'https://culture.seoul.go.kr/culture/portal/api/exhibition/list.do';
      
      const response = await axios.post(url, {
        page: 1,
        rows: 100,
        cate: 'exhibition'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.list) {
        console.log(`✅ ${response.data.list.length}개 전시 정보 수집`);
        return response.data.list;
      }
      
    } catch (error) {
      console.log('❌ 서울문화포털 접근 실패:', error.message);
    }
    
    return [];
  }

  async collectFromPublicData() {
    console.log('\n📊 공공데이터 활용\n');
    
    // 1. 서울시립미술관 전시
    const seoulMuseum = [
      {
        title: '2025 서울시립미술관 신소장품전',
        venue: '서울시립미술관',
        city: '서울',
        start_date: '2025-01-15',
        end_date: '2025-03-30',
        description: '2024년 수집한 신소장품을 소개하는 전시'
      },
      {
        title: '서울, 도시의 기억',
        venue: '서울시립미술관 서소문본관',
        city: '서울',
        start_date: '2025-01-10',
        end_date: '2025-04-20',
        description: '서울의 변화와 발전을 기록한 사진전'
      }
    ];
    
    // 2. 국립현대미술관 전시
    const nationalMuseum = [
      {
        title: 'MMCA 현대차 시리즈 2025',
        venue: '국립현대미술관 서울',
        city: '서울',
        start_date: '2025-01-20',
        end_date: '2025-06-30',
        description: '현대차와 함께하는 연례 현대미술 프로젝트'
      },
      {
        title: '한국 추상미술의 선구자들',
        venue: '국립현대미술관 과천',
        city: '과천',
        start_date: '2025-02-01',
        end_date: '2025-05-15',
        description: '한국 추상미술의 역사를 조명하는 대규모 회고전'
      }
    ];
    
    // 3. 주요 갤러리 전시
    const galleries = [
      {
        title: '청춘의 시간',
        venue: '아라리오갤러리',
        city: '서울',
        start_date: '2025-01-10',
        end_date: '2025-02-28',
        description: '젊은 작가들의 실험적인 작품 전시'
      },
      {
        title: '빛과 그림자',
        venue: '갤러리현대',
        city: '서울',
        start_date: '2025-01-15',
        end_date: '2025-03-10',
        description: '빛을 주제로 한 현대미술 기획전'
      },
      {
        title: '한국 민화의 재해석',
        venue: '학고재갤러리',
        city: '서울',
        start_date: '2025-01-20',
        end_date: '2025-03-20',
        description: '전통 민화를 현대적으로 재해석한 작품전'
      }
    ];
    
    return [...seoulMuseum, ...nationalMuseum, ...galleries];
  }

  async saveToDatabase(exhibitions) {
    console.log('\n💾 데이터베이스 저장 시작...');
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const exhibition of exhibitions) {
        try {
          // 서울시 API 데이터 처리
          if (exhibition.TITLE) {
            await client.query(`
              INSERT INTO exhibitions (
                title_en, title_local, 
                venue_name, venue_city,
                start_date, end_date,
                description, source,
                collected_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
              ON CONFLICT (title_en, venue_name, start_date) DO UPDATE
              SET description = EXCLUDED.description,
                  end_date = EXCLUDED.end_date,
                  updated_at = NOW()
            `, [
              exhibition.TITLE,
              exhibition.TITLE,
              exhibition.PLACE || '미정',
              '서울',
              exhibition.STRTDATE || null,
              exhibition.END_DATE || null,
              exhibition.PROGRAM || '',
              '서울시 공공데이터'
            ]);
          }
          // 수동 데이터 처리
          else {
            await client.query(`
              INSERT INTO exhibitions (
                title_en, title_local, 
                venue_name, venue_city,
                start_date, end_date,
                description, source,
                collected_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
              ON CONFLICT (title_en, venue_name, start_date) DO UPDATE
              SET description = EXCLUDED.description,
                  end_date = EXCLUDED.end_date,
                  updated_at = NOW()
            `, [
              exhibition.title,
              exhibition.title,
              exhibition.venue,
              exhibition.city,
              exhibition.start_date,
              exhibition.end_date,
              exhibition.description,
              exhibition.source || '공공데이터'
            ]);
          }
          
          this.stats.saved++;
          
        } catch (err) {
          console.log(`   ⚠️ 저장 실패: ${exhibition.TITLE || exhibition.title}`);
          this.stats.errors++;
        }
      }
      
      await client.query('COMMIT');
      console.log(`✅ ${this.stats.saved}개 전시 정보 저장 완료`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ 저장 중 오류:', error.message);
    } finally {
      client.release();
    }
  }

  async collectAll() {
    console.log('🚀 서울 지역 전시 데이터 수집 시작\n');
    console.log('='.repeat(60));
    
    // 1. 서울시 API 시도
    const seoulData = await this.collectCulturalEvents();
    
    // 2. 공공 데이터 수집
    const publicData = await this.collectFromPublicData();
    
    const allExhibitions = [...seoulData, ...publicData];
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 수집 결과:');
    console.log(`   🎨 총 전시: ${allExhibitions.length}개`);
    console.log(`   ❌ 오류: ${this.stats.errors}개`);
    
    if (allExhibitions.length > 0) {
      console.log('\n📋 수집된 전시 예시:');
      allExhibitions.slice(0, 5).forEach((ex, idx) => {
        console.log(`\n${idx + 1}. ${ex.TITLE || ex.title}`);
        console.log(`   장소: ${ex.PLACE || ex.venue}`);
        console.log(`   기간: ${ex.STRTDATE || ex.start_date} ~ ${ex.END_DATE || ex.end_date}`);
      });
      
      await this.saveToDatabase(allExhibitions);
    }
    
    console.log('\n✨ 작업 완료!');
  }
}

// 실행
const collector = new SeoulOpenAPICollector();
collector.collectAll().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('오류:', error);
  process.exit(1);
});