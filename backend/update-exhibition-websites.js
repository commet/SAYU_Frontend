#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 올바른 웹사이트 정보 매핑
const correctWebsiteInfo = [
  {
    title: "양민희 <달의 해안>",
    website_url: "http://www.gfac.kr/"
  },
  {
    title: "[2025 신진미술인 지원 프로그램] 박서연 개인전 《접을 풋는 자》",
    website_url: "http://www.boan1942.com/boan/"
  },
  {
    title: "[2025 신진미술인 지원 프로그램] 박나라 개인전 《제스처들》",
    website_url: "http://www.boan1942.com/boan/"
  },
  {
    title: "2025 하우스뮤지엄 <조선 남자의 품격, 액자 속의 조선>",
    website_url: "https://www.unhyeongung.or.kr/"
  },
  {
    title: "37°N, 127°E",
    website_url: "http://grimson.co.kr/"
  },
  {
    title: "[DDP] Prelude to spring_봄을 여는 꽃의 전주곡",
    website_url: "http://www.ddp.or.kr/"
  },
  {
    title: "굿페인터스 VOL.2 한여름 소낙비처럼",
    website_url: "http://www.seogyocenter.or.kr"
  },
  {
    title: "2025 경춘선숲길 갤러리 노원×춘천 예술교류 프로젝트 엉겁버린 감각들",
    website_url: "https://nowonarts.kr/html/cultureeducation/culturalfacility.php"
  },
  {
    title: "강승희 <새벽, 여백을 열다>",
    website_url: "http://www.rhogallery.com/"
  },
  {
    title: "박노수미술관 개관11주년 기념전시 「간원일기」",
    website_url: "https://www.jfac.or.kr/site/main/content/parkns01"
  },
  {
    title: "[2차] 장난감으로 만나는 독립운동가",
    website_url: "http://edumuseum.sen.go.kr/edumuseum_index.jsp"
  },
  {
    title: "《생태의 집 - 한옥》",
    website_url: "http://www.savinamuseum.com/kor/about/direction.jsp"
  },
  {
    title: "드리프팅 스테이션 - 찬미와 애도에 관한 행성간 다종 오페라",
    website_url: "http://www.arko.or.kr/artcenter/"
  },
  {
    title: "청풍전, 바람의 축제",
    website_url: "https://blog.naver.com/insa1010"
  },
  {
    title: "소목장 소병진과 제자 동행전",
    website_url: "http://www.chf.or.kr/c4/sub1.jsp"
  },
  {
    title: "Tremor&Gaze",
    website_url: "http://www.hiddenmgallery.com"
  },
  {
    title: "[문화철도959] 임주작가 조혜은 개인전 <미래에게 말을 걸다>",
    website_url: "https://gutoartsvalley.or.kr/user/page/mn011509.do"
  },
  {
    title: "Skinship",
    website_url: "https://www.instagram.com/p.s.center/"
  }
];

async function updateExhibitionWebsites() {
  console.log('🔄 전시 웹사이트 URL 업데이트\n');
  console.log(`📊 업데이트할 전시 수: ${correctWebsiteInfo.length}개`);
  console.log('=' .repeat(60));
  
  const client = await pool.connect();
  let updatedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;
  
  try {
    for (const info of correctWebsiteInfo) {
      try {
        // 전시 찾기
        const existingResult = await client.query(
          'SELECT id, title_local, venue_name FROM exhibitions WHERE title_local = $1',
          [info.title]
        );
        
        if (existingResult.rows.length === 0) {
          console.log(`❌ 찾을 수 없음: ${info.title}`);
          notFoundCount++;
          continue;
        }
        
        const exhibition = existingResult.rows[0];
        
        // 웹사이트 URL 업데이트
        const updateResult = await client.query(
          'UPDATE exhibitions SET website_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [info.website_url, exhibition.id]
        );
        
        if (updateResult.rowCount > 0) {
          console.log(`✅ 업데이트: ${exhibition.title_local}`);
          console.log(`   🌐 URL: ${info.website_url}`);
          updatedCount++;
        }
        
      } catch (err) {
        console.error(`❌ 오류: ${info.title} - ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 업데이트 결과:');
    console.log(`   ✅ 업데이트 완료: ${updatedCount}개`);
    console.log(`   ❌ 찾을 수 없음: ${notFoundCount}개`);
    console.log(`   ❌ 오류: ${errorCount}개`);
    console.log(`   📥 전체: ${correctWebsiteInfo.length}개`);
    console.log('=' .repeat(60));
    console.log('\n✨ 웹사이트 URL 업데이트 완료!');
    
  } catch (error) {
    console.error('❌ 전체 처리 오류:', error.message);
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  await updateExhibitionWebsites();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = { correctWebsiteInfo };