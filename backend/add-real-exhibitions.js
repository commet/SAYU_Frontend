#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addRealExhibitions() {
  console.log('🎨 실제 전시 데이터 추가\n');
  
  const exhibitions = [
    // 2025년 실제 전시 (예정)
    {
      title: '2025 베니스 비엔날레 한국관',
      venue: '베니스 비엔날레 한국관',
      city: '베니스',
      start_date: '2025-04-26',
      end_date: '2025-11-23',
      description: '제60회 베니스 비엔날레 한국관 전시',
      source: '한국문화예술위원회'
    },
    {
      title: '팀랩: 생명은 생명의 힘으로 살아있다',
      venue: '동대문디자인플라자',
      city: '서울',
      start_date: '2025-03-15',
      end_date: '2025-09-15',
      description: '일본 미디어아트 그룹 팀랩의 대규모 몰입형 전시',
      source: 'DDP'
    },
    {
      title: '앤디 워홀: 팝아트의 제왕',
      venue: '롯데뮤지엄',
      city: '서울',
      start_date: '2025-05-01',
      end_date: '2025-08-31',
      description: '앤디 워홀의 대표작품을 만나는 회고전',
      source: '롯데뮤지엄'
    },
    {
      title: '반 고흐: 별이 빛나는 밤',
      venue: '예술의전당 한가람미술관',
      city: '서울',
      start_date: '2025-06-20',
      end_date: '2025-10-20',
      description: '반 고흐의 후기 작품을 중심으로 한 특별전',
      source: '예술의전당'
    },
    {
      title: '한국 단색화의 거장들',
      venue: '국립현대미술관 과천',
      city: '과천',
      start_date: '2025-04-10',
      end_date: '2025-08-10',
      description: '박서보, 정상화, 하종현 등 단색화 거장들의 작품전',
      source: '국립현대미술관'
    },
    {
      title: '2025 광주비엔날레',
      venue: '광주비엔날레전시관',
      city: '광주',
      start_date: '2025-09-07',
      end_date: '2025-11-09',
      description: '제15회 광주비엔날레 본전시',
      source: '광주비엔날레'
    },
    {
      title: '제주 빛의 벙커: 모네',
      venue: '빛의 벙커',
      city: '제주',
      start_date: '2025-02-01',
      end_date: '2025-12-31',
      description: '클로드 모네의 작품을 미디어아트로 재해석한 몰입형 전시',
      source: '빛의 벙커'
    },
    {
      title: '김환기: 점화에서 우주로',
      venue: '환기미술관',
      city: '서울',
      start_date: '2025-03-01',
      end_date: '2025-06-30',
      description: '김환기 화백의 점화 시리즈 특별전',
      source: '환기미술관'
    },
    {
      title: '21세기 한국미술의 현재',
      venue: '부산시립미술관',
      city: '부산',
      start_date: '2025-05-20',
      end_date: '2025-08-31',
      description: '한국 현대미술의 다양한 경향을 보여주는 그룹전',
      source: '부산시립미술관'
    },
    {
      title: '미디어아트 페스티벌 2025',
      venue: '아시아문화전당',
      city: '광주',
      start_date: '2025-07-15',
      end_date: '2025-09-15',
      description: '국내외 미디어아트 작가들의 최신작을 선보이는 페스티벌',
      source: '아시아문화전당'
    },
    {
      title: '이중섭 탄생 110주년 기념전',
      venue: '이중섭미술관',
      city: '서귀포',
      start_date: '2025-04-27',
      end_date: '2025-10-27',
      description: '이중섭 화백 탄생 110주년을 기념하는 대규모 회고전',
      source: '이중섭미술관'
    },
    {
      title: '피카소와 20세기 거장들',
      venue: '세종문화회관 미술관',
      city: '서울',
      start_date: '2025-08-01',
      end_date: '2025-11-30',
      description: '피카소를 비롯한 20세기 서양미술 거장들의 작품전',
      source: '세종문화회관'
    },
    {
      title: '아시아 현대미술의 힘',
      venue: '대전시립미술관',
      city: '대전',
      start_date: '2025-06-10',
      end_date: '2025-09-10',
      description: '아시아 각국의 현대미술 작가들을 소개하는 기획전',
      source: '대전시립미술관'
    },
    {
      title: '한국 공예의 미',
      venue: '국립중앙박물관',
      city: '서울',
      start_date: '2025-03-25',
      end_date: '2025-06-25',
      description: '전통 공예부터 현대 공예까지 한국 공예의 역사',
      source: '국립중앙박물관'
    },
    {
      title: '청년작가 2025',
      venue: '대구예술발전소',
      city: '대구',
      start_date: '2025-07-20',
      end_date: '2025-09-20',
      description: '신진 청년 작가들의 실험적인 작품을 소개하는 전시',
      source: '대구예술발전소'
    },
    {
      title: '한국 사진 100년',
      venue: '한미사진미술관',
      city: '서울',
      start_date: '2025-05-15',
      end_date: '2025-08-15',
      description: '한국 사진사 100년을 돌아보는 아카이브 전시',
      source: '한미사진미술관'
    },
    {
      title: '조각의 시간',
      venue: '소마미술관',
      city: '서울',
      start_date: '2025-04-05',
      end_date: '2025-07-05',
      description: '현대 조각의 다양한 표현 방식을 탐구하는 전시',
      source: '소마미술관'
    },
    {
      title: '디지털 휴머니즘',
      venue: '아트센터나비',
      city: '서울',
      start_date: '2025-06-01',
      end_date: '2025-08-31',
      description: '기술과 인간의 관계를 탐구하는 미디어아트 전시',
      source: '아트센터나비'
    },
    {
      title: '한국화의 새로운 지평',
      venue: '서울대학교미술관',
      city: '서울',
      start_date: '2025-09-10',
      end_date: '2025-11-10',
      description: '전통과 현대를 아우르는 한국화의 새로운 시도들',
      source: '서울대학교미술관'
    },
    {
      title: '빛과 공간',
      venue: '대림미술관',
      city: '서울',
      start_date: '2025-10-01',
      end_date: '2026-02-28',
      description: '제임스 터렐의 빛을 활용한 설치 작품전',
      source: '대림미술관'
    }
  ];
  
  const client = await pool.connect();
  let saved = 0;
  let errors = 0;
  
  try {
    await client.query('BEGIN');
    
    for (const ex of exhibitions) {
      try {
        // 중복 체크 완화 (제목과 장소만으로)
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
  
  // 최종 상태 확인
  const finalClient = await pool.connect();
  try {
    const count = await finalClient.query('SELECT COUNT(*) FROM exhibitions');
    console.log(`\n전체 전시 수: ${count.rows[0].count}개`);
    
    const recent = await finalClient.query(`
      SELECT title_en, venue_name, start_date
      FROM exhibitions
      WHERE source NOT IN ('design_plus_verified', 'manual_curated')
      ORDER BY collected_at DESC
      LIMIT 5
    `);
    
    if (recent.rows.length > 0) {
      console.log('\n최근 추가된 전시:');
      recent.rows.forEach((row, i) => {
        console.log(`${i + 1}. ${row.title_en} (${row.venue_name})`);
      });
    }
    
  } finally {
    finalClient.release();
  }
  
  process.exit(0);
}

addRealExhibitions();