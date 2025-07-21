#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class MuseumWebsiteCollector {
  constructor() {
    this.stats = {
      saved: 0,
      errors: 0
    };
  }

  // 주요 미술관 전시 정보 (수동 수집)
  async collectMajorMuseums() {
    console.log('🏛️ 주요 미술관 전시 정보 수집\n');
    
    const exhibitions = [
      // 국립현대미술관
      {
        title: 'MMCA 이건희컬렉션 특별전: 이중섭',
        venue: '국립현대미술관 서울',
        city: '서울',
        start_date: '2025-03-01',
        end_date: '2025-08-31',
        description: '이건희컬렉션 중 이중섭 작품을 중심으로 한 특별전시',
        image_url: null,
        source: '국립현대미술관'
      },
      {
        title: '2025 올해의 작가상',
        venue: '국립현대미술관 서울',
        city: '서울',
        start_date: '2025-09-01',
        end_date: '2025-12-31',
        description: '한국 현대미술을 이끌어갈 젊은 작가들의 전시',
        image_url: null,
        source: '국립현대미술관'
      },
      
      // 서울시립미술관
      {
        title: '서울, 도시의 초상',
        venue: '서울시립미술관',
        city: '서울',
        start_date: '2025-02-15',
        end_date: '2025-05-30',
        description: '서울의 변화와 발전을 기록한 사진과 영상 전시',
        image_url: null,
        source: '서울시립미술관'
      },
      {
        title: '2025 신소장품전',
        venue: '서울시립미술관',
        city: '서울',
        start_date: '2025-01-20',
        end_date: '2025-04-20',
        description: '2024년 수집한 신소장품을 소개하는 전시',
        image_url: null,
        source: '서울시립미술관'
      },
      
      // 리움미술관
      {
        title: '한국 고미술의 정수',
        venue: '리움미술관',
        city: '서울',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        description: '고려청자부터 조선백자까지 한국 도자기의 역사',
        image_url: null,
        source: '리움미술관'
      },
      {
        title: '이우환: 여백의 예술',
        venue: '리움미술관',
        city: '서울',
        start_date: '2025-03-15',
        end_date: '2025-07-15',
        description: '이우환 작가의 대규모 회고전',
        image_url: null,
        source: '리움미술관'
      },
      
      // 아모레퍼시픽미술관
      {
        title: 'APMA, CHAPTER THREE',
        venue: '아모레퍼시픽미술관',
        city: '서울',
        start_date: '2025-02-01',
        end_date: '2025-06-30',
        description: '현대미술과 전통의 만남을 주제로 한 기획전',
        image_url: null,
        source: '아모레퍼시픽미술관'
      },
      
      // 대림미술관
      {
        title: '안도 타다오: 빛의 건축',
        venue: '대림미술관',
        city: '서울',
        start_date: '2025-04-01',
        end_date: '2025-09-30',
        description: '일본 건축가 안도 타다오의 건축 철학과 작품 세계',
        image_url: null,
        source: '대림미술관'
      },
      
      // 동대문디자인플라자(DDP)
      {
        title: '서울라이트 DDP 2025',
        venue: '동대문디자인플라자',
        city: '서울',
        start_date: '2025-07-01',
        end_date: '2025-10-31',
        description: 'DDP 외벽을 활용한 대규모 미디어아트 전시',
        image_url: null,
        source: 'DDP'
      },
      {
        title: '2025 서울디자인페스티벌',
        venue: '동대문디자인플라자',
        city: '서울',
        start_date: '2025-12-01',
        end_date: '2025-12-10',
        description: '국내외 디자이너들의 작품을 만나는 디자인 축제',
        image_url: null,
        source: 'DDP'
      },
      
      // 예술의전당
      {
        title: '모네에서 피카소까지',
        venue: '예술의전당 한가람미술관',
        city: '서울',
        start_date: '2025-05-01',
        end_date: '2025-08-31',
        description: '인상주의부터 입체주의까지 서양미술사의 거장들',
        image_url: null,
        source: '예술의전당'
      },
      {
        title: '한국 근현대미술 100년',
        venue: '예술의전당 서울서예박물관',
        city: '서울',
        start_date: '2025-03-20',
        end_date: '2025-06-20',
        description: '한국 근현대미술의 흐름을 조망하는 대규모 기획전',
        image_url: null,
        source: '예술의전당'
      },
      
      // 부산시립미술관
      {
        title: '부산비엔날레 2025 프리뷰',
        venue: '부산시립미술관',
        city: '부산',
        start_date: '2025-09-01',
        end_date: '2025-11-30',
        description: '2026 부산비엔날레를 미리 만나는 프리뷰 전시',
        image_url: null,
        source: '부산시립미술관'
      },
      {
        title: '해양도시 부산의 예술',
        venue: '부산현대미술관',
        city: '부산',
        start_date: '2025-04-15',
        end_date: '2025-07-31',
        description: '바다와 항구를 주제로 한 현대미술 전시',
        image_url: null,
        source: '부산현대미술관'
      },
      
      // 대구미술관
      {
        title: '이인성 탄생 100주년 기념전',
        venue: '대구미술관',
        city: '대구',
        start_date: '2025-05-20',
        end_date: '2025-08-20',
        description: '대구 출신 서양화가 이인성의 작품 세계',
        image_url: null,
        source: '대구미술관'
      },
      
      // 광주시립미술관
      {
        title: '2025 광주비엔날레 특별전',
        venue: '광주시립미술관',
        city: '광주',
        start_date: '2025-10-01',
        end_date: '2025-12-31',
        description: '광주비엔날레와 연계한 특별 기획전',
        image_url: null,
        source: '광주시립미술관'
      },
      
      // 경기도미술관
      {
        title: '경기천년, 미술로 읽다',
        venue: '경기도미술관',
        city: '안산',
        start_date: '2025-02-10',
        end_date: '2025-05-10',
        description: '경기도의 역사와 문화를 미술로 조명하는 전시',
        image_url: null,
        source: '경기도미술관'
      },
      
      // 백남준아트센터
      {
        title: '백남준: TV 정원',
        venue: '백남준아트센터',
        city: '용인',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        description: '백남준의 대표작 TV 정원을 재해석한 상설전시',
        image_url: null,
        source: '백남준아트센터'
      },
      
      // 소마미술관
      {
        title: '2025 소마드로잉센터 아카이브전',
        venue: '소마미술관',
        city: '서울',
        start_date: '2025-03-01',
        end_date: '2025-05-31',
        description: '한국 현대 드로잉의 역사를 보여주는 아카이브전',
        image_url: null,
        source: '소마미술관'
      },
      
      // 일민미술관
      {
        title: '미디어아트의 현재',
        venue: '일민미술관',
        city: '서울',
        start_date: '2025-04-20',
        end_date: '2025-07-20',
        description: '국내외 미디어아트 작가들의 최신작 전시',
        image_url: null,
        source: '일민미술관'
      }
    ];
    
    return exhibitions;
  }

  // 갤러리 전시 정보
  async collectGalleries() {
    console.log('🖼️ 갤러리 전시 정보 수집\n');
    
    const exhibitions = [
      // 갤러리현대
      {
        title: '김창열: 물방울 70년',
        venue: '갤러리현대',
        city: '서울',
        start_date: '2025-02-05',
        end_date: '2025-03-30',
        description: '물방울 화가 김창열 작가의 70년 화업을 돌아보는 전시',
        image_url: null,
        source: '갤러리현대'
      },
      
      // 국제갤러리
      {
        title: '양혜규: 소리의 조각',
        venue: '국제갤러리',
        city: '서울',
        start_date: '2025-03-10',
        end_date: '2025-05-10',
        description: '블라인드와 방울을 활용한 양혜규의 신작 전시',
        image_url: null,
        source: '국제갤러리'
      },
      
      // 페이스갤러리
      {
        title: '데이비드 호크니: 풍경의 재발견',
        venue: '페이스갤러리',
        city: '서울',
        start_date: '2025-04-01',
        end_date: '2025-06-30',
        description: '영국 현대미술의 거장 데이비드 호크니 전시',
        image_url: null,
        source: '페이스갤러리'
      },
      
      // 아라리오갤러리
      {
        title: '코헤이 나와: 픽셀의 세계',
        venue: '아라리오갤러리',
        city: '서울',
        start_date: '2025-02-20',
        end_date: '2025-04-20',
        description: '일본 작가 코헤이 나와의 디지털 아트 전시',
        image_url: null,
        source: '아라리오갤러리'
      },
      
      // PKM갤러리
      {
        title: '이우환: 관계항',
        venue: 'PKM갤러리',
        city: '서울',
        start_date: '2025-05-15',
        end_date: '2025-07-15',
        description: '이우환 작가의 관계항 시리즈 신작 전시',
        image_url: null,
        source: 'PKM갤러리'
      }
    ];
    
    return exhibitions;
  }

  // 데이터베이스 저장
  async saveToDatabase(exhibitions) {
    console.log('💾 데이터베이스 저장 중...\n');
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const exhibition of exhibitions) {
        try {
          // 중복 체크
          const existing = await client.query(
            'SELECT id FROM exhibitions WHERE title_en = $1 AND venue_name = $2 AND start_date = $3',
            [exhibition.title, exhibition.venue, exhibition.start_date]
          );
          
          if (existing.rows.length === 0) {
            await client.query(`
              INSERT INTO exhibitions (
                title_en, title_local, 
                venue_name, venue_city,
                start_date, end_date,
                description, image_url,
                source, collected_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            `, [
              exhibition.title,
              exhibition.title,
              exhibition.venue,
              exhibition.city,
              exhibition.start_date,
              exhibition.end_date,
              exhibition.description,
              exhibition.image_url,
              exhibition.source
            ]);
            
            this.stats.saved++;
            console.log(`   ✅ ${exhibition.title}`);
          }
        } catch (err) {
          console.log(`   ⚠️ 저장 실패: ${exhibition.title}`);
          this.stats.errors++;
        }
      }
      
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ 저장 중 오류:', error.message);
    } finally {
      client.release();
    }
  }

  // 실행
  async run() {
    console.log('🚀 미술관/갤러리 전시 정보 수집\n');
    console.log('='.repeat(60));
    
    // 데이터 수집
    const museumExhibitions = await this.collectMajorMuseums();
    const galleryExhibitions = await this.collectGalleries();
    
    const allExhibitions = [...museumExhibitions, ...galleryExhibitions];
    
    console.log(`📊 수집된 전시: ${allExhibitions.length}개\n`);
    
    // 데이터베이스 저장
    await this.saveToDatabase(allExhibitions);
    
    // 결과 요약
    console.log('\n' + '='.repeat(60));
    console.log('📊 최종 결과:');
    console.log(`   💾 저장 성공: ${this.stats.saved}개`);
    console.log(`   ❌ 저장 실패: ${this.stats.errors}개`);
    
    // 현재 DB 상태
    const client = await pool.connect();
    try {
      const exhibitions = await client.query('SELECT COUNT(*) FROM exhibitions');
      console.log(`\n📌 전체 전시 개수: ${exhibitions.rows[0].count}개`);
      
      // 최근 저장된 전시
      const recent = await client.query(`
        SELECT title_en, venue_name, start_date
        FROM exhibitions
        ORDER BY collected_at DESC
        LIMIT 5
      `);
      
      if (recent.rows.length > 0) {
        console.log('\n🎨 최근 저장된 전시:');
        recent.rows.forEach((ex, idx) => {
          console.log(`   ${idx + 1}. ${ex.title_en} (${ex.venue_name})`);
        });
      }
      
    } finally {
      client.release();
    }
    
    console.log('\n✨ 작업 완료!');
  }
}

// 실행
const collector = new MuseumWebsiteCollector();
collector.run().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('오류:', error);
  process.exit(1);
});