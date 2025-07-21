#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addCurrentExhibitions() {
  console.log('🎨 2025년 7월 현재 진행 중인 전시 추가\n');
  
  const exhibitions = [
    // 서울 지역
    {
      title: '오를랑: 하이브리드 신체',
      venue: '서울시립미술관 서소문본관',
      city: '서울',
      start_date: '2025-06-24',
      end_date: '2025-09-22',
      description: '프랑스 아티스트 오를랑의 아시아 첫 대규모 회고전',
      source: '서울시립미술관'
    },
    {
      title: '모마 컬렉션: 현대미술의 거장들',
      venue: '국립현대미술관 서울',
      city: '서울',
      start_date: '2025-05-28',
      end_date: '2025-09-14',
      description: '뉴욕현대미술관(MoMA) 소장품 특별전',
      source: '국립현대미술관'
    },
    {
      title: '그림자와 빛: 렘브란트',
      venue: '예술의전당 한가람미술관',
      city: '서울',
      start_date: '2025-06-15',
      end_date: '2025-09-28',
      description: '렘브란트 작품과 17세기 네덜란드 회화전',
      source: '예술의전당'
    },
    {
      title: '강서경: 검은 모래',
      venue: '아트선재센터',
      city: '서울',
      start_date: '2025-06-12',
      end_date: '2025-08-17',
      description: '강서경 작가의 신작 설치 전시',
      source: '아트선재센터'
    },
    {
      title: '디올과 예술가들',
      venue: '동대문디자인플라자 배움터',
      city: '서울',
      start_date: '2025-04-26',
      end_date: '2025-08-25',
      description: '크리스찬 디올과 예술가들의 협업 전시',
      source: 'DDP'
    },
    {
      title: '정연두: 백년 여행기',
      venue: '플라토',
      city: '서울',
      start_date: '2025-05-31',
      end_date: '2025-08-31',
      description: '정연두 작가의 시간과 기억에 관한 전시',
      source: '플라토'
    },
    {
      title: '바스키아: 거리의 왕',
      venue: '롯데뮤지엄',
      city: '서울',
      start_date: '2025-06-20',
      end_date: '2025-10-12',
      description: '장 미셸 바스키아의 회화와 드로잉 전시',
      source: '롯데뮤지엄'
    },
    {
      title: '한국 추상미술의 선구자들',
      venue: '갤러리현대',
      city: '서울',
      start_date: '2025-07-03',
      end_date: '2025-08-24',
      description: '1950-70년대 한국 추상미술 작가들의 작품전',
      source: '갤러리현대'
    },
    {
      title: '윤형근: 침묵의 울림',
      venue: 'PKM갤러리',
      city: '서울',
      start_date: '2025-06-26',
      end_date: '2025-08-30',
      description: '윤형근 화백의 엄브러 시리즈 전시',
      source: 'PKM갤러리'
    },
    {
      title: '2025 서울미디어시티비엔날레 프리뷰',
      venue: '서울시립미술관',
      city: '서울',
      start_date: '2025-07-15',
      end_date: '2025-08-31',
      description: '2026 서울미디어시티비엔날레 프리뷰 전시',
      source: '서울시립미술관'
    },
    
    // 경기/인천 지역
    {
      title: '백남준: 미디어 아트의 개척자',
      venue: '백남준아트센터',
      city: '용인',
      start_date: '2025-04-17',
      end_date: '2025-10-12',
      description: '백남준 탄생 93주년 기념 특별전',
      source: '백남준아트센터'
    },
    {
      title: '한국 근대미술의 빛',
      venue: '경기도미술관',
      city: '안산',
      start_date: '2025-05-20',
      end_date: '2025-08-17',
      description: '일제강점기와 해방 이후 한국 미술의 변화',
      source: '경기도미술관'
    },
    {
      title: '인천상륙작전과 예술',
      venue: '인천아트플랫폼',
      city: '인천',
      start_date: '2025-06-25',
      end_date: '2025-09-15',
      description: '인천상륙작전 75주년 기념 전시',
      source: '인천아트플랫폼'
    },
    
    // 대전/충청 지역
    {
      title: '이응노: 문자추상',
      venue: '이응노미술관',
      city: '대전',
      start_date: '2025-05-13',
      end_date: '2025-09-07',
      description: '이응노 화백의 문자추상 시리즈 특별전',
      source: '이응노미술관'
    },
    {
      title: '충청의 미술가들',
      venue: '대전시립미술관',
      city: '대전',
      start_date: '2025-06-18',
      end_date: '2025-08-24',
      description: '충청 지역 출신 현대미술가들의 그룹전',
      source: '대전시립미술관'
    },
    
    // 부산/경남 지역
    {
      title: '해양 도시의 기억',
      venue: '부산현대미술관',
      city: '부산',
      start_date: '2025-05-30',
      end_date: '2025-09-21',
      description: '부산의 해양 문화를 주제로 한 현대미술전',
      source: '부산현대미술관'
    },
    {
      title: '김종학: 설악의 화가',
      venue: '부산시립미술관',
      city: '부산',
      start_date: '2025-07-04',
      end_date: '2025-10-05',
      description: '김종학 화백의 설악산 연작 전시',
      source: '부산시립미술관'
    },
    
    // 대구/경북 지역
    {
      title: '이인성미술상 수상작가전',
      venue: '대구미술관',
      city: '대구',
      start_date: '2025-06-27',
      end_date: '2025-09-14',
      description: '제21회 이인성미술상 수상작가 개인전',
      source: '대구미술관'
    },
    
    // 광주/전라 지역
    {
      title: '민주·인권·평화전',
      venue: '광주시립미술관',
      city: '광주',
      start_date: '2025-05-18',
      end_date: '2025-08-15',
      description: '5·18민주화운동 45주년 기념 특별전',
      source: '광주시립미술관'
    },
    {
      title: '남도의 풍경',
      venue: '전남도립미술관',
      city: '광양',
      start_date: '2025-06-05',
      end_date: '2025-09-01',
      description: '전라남도의 자연과 문화를 담은 전시',
      source: '전남도립미술관'
    },
    
    // 제주 지역
    {
      title: '제주 4·3 미술제',
      venue: '제주도립미술관',
      city: '제주',
      start_date: '2025-04-03',
      end_date: '2025-08-03',
      description: '제주 4·3을 기억하는 현대미술전',
      source: '제주도립미술관'
    },
    {
      title: '아라리오뮤지엄 컬렉션',
      venue: '아라리오뮤지엄',
      city: '제주',
      start_date: '2025-03-01',
      end_date: '2025-12-31',
      description: '아라리오 컬렉션 상설전시',
      source: '아라리오뮤지엄'
    },
    
    // 강원 지역
    {
      title: '강원 국제비엔날레 2025',
      venue: '강릉녹색도시체험센터',
      city: '강릉',
      start_date: '2025-07-12',
      end_date: '2025-10-13',
      description: '제3회 강원국제비엔날레',
      source: '강원국제비엔날레'
    },
    
    // 온라인/디지털 전시
    {
      title: 'K-아트 온라인: 디지털 한류',
      venue: '온라인 플랫폼',
      city: '온라인',
      start_date: '2025-06-01',
      end_date: '2025-08-31',
      description: '한국 현대미술을 디지털로 경험하는 온라인 전시',
      source: '한국문화예술위원회'
    },
    {
      title: 'NFT 아트: 새로운 수집의 시대',
      venue: '그라운드시소 성수',
      city: '서울',
      start_date: '2025-07-10',
      end_date: '2025-09-10',
      description: 'NFT 아트와 블록체인 기술을 활용한 전시',
      source: '그라운드시소'
    }
  ];
  
  const client = await pool.connect();
  let saved = 0;
  let errors = 0;
  
  try {
    await client.query('BEGIN');
    
    for (const ex of exhibitions) {
      try {
        const existing = await client.query(
          'SELECT id FROM exhibitions WHERE title_en = $1 AND venue_name = $2',
          [ex.title, ex.venue]
        );
        
        if (existing.rows.length === 0) {
          await client.query(`
            INSERT INTO exhibitions (
              title_en, title_local, 
              venue_name, venue_city,
              start_date, end_date,
              description, source,
              collected_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          `, [
            ex.title,
            ex.title,
            ex.venue,
            ex.city,
            ex.start_date,
            ex.end_date,
            ex.description,
            ex.source
          ]);
          
          saved++;
          console.log(`✅ ${ex.title}`);
        } else {
          console.log(`⏭️  이미 존재: ${ex.title}`);
        }
      } catch (err) {
        errors++;
        console.log(`❌ 실패: ${ex.title} - ${err.message}`);
      }
    }
    
    await client.query('COMMIT');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('트랜잭션 실패:', error.message);
  } finally {
    client.release();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 결과: ${saved}개 저장, ${errors}개 실패`);
  
  // 지역별 통계
  const statsClient = await pool.connect();
  try {
    const count = await statsClient.query('SELECT COUNT(*) FROM exhibitions');
    console.log(`\n전체 전시 수: ${count.rows[0].count}개`);
    
    const byCity = await statsClient.query(`
      SELECT venue_city, COUNT(*) as count
      FROM exhibitions
      GROUP BY venue_city
      ORDER BY count DESC
      LIMIT 10
    `);
    
    console.log('\n도시별 전시 통계:');
    byCity.rows.forEach(row => {
      console.log(`${row.venue_city}: ${row.count}개`);
    });
    
    const bySource = await statsClient.query(`
      SELECT source, COUNT(*) as count
      FROM exhibitions
      GROUP BY source
      ORDER BY count DESC
    `);
    
    console.log('\n출처별 통계:');
    bySource.rows.forEach(row => {
      console.log(`${row.source}: ${row.count}개`);
    });
    
  } finally {
    statsClient.release();
  }
  
  process.exit(0);
}

addCurrentExhibitions();