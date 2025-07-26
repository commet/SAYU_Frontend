#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 문화포털 수동 수집 전시들의 venue 정보 (웹사이트 포함)
const manualVenues = [
  // 국공립 미술관/박물관
  {
    name: "국립민속박물관",
    city: "서울",
    type: "museum",
    website: "https://www.nfm.go.kr",
    address: "서울특별시 종로구 삼청로 37",
    country: "KR"
  },
  {
    name: "서울공예박물관",
    city: "서울",
    type: "museum",
    website: "https://craftmuseum.seoul.go.kr",
    address: "서울특별시 종로구 율곡로3길 4",
    country: "KR"
  },
  {
    name: "서울교육박물관",
    city: "서울",
    type: "museum",
    website: "http://edumuseum.sen.go.kr",
    address: "서울특별시 종로구 송월길 48",
    country: "KR"
  },
  {
    name: "서울시립과학관",
    city: "서울",
    type: "museum",
    website: "https://science.seoul.go.kr",
    address: "서울특별시 노원구 한글비석로 160",
    country: "KR"
  },
  {
    name: "서울역사박물관",
    city: "서울",
    type: "museum",
    website: "https://museum.seoul.go.kr",
    address: "서울특별시 종로구 새문안로 55",
    country: "KR"
  },
  {
    name: "서울시립미술아카이브",
    city: "서울",
    type: "museum",
    website: "https://sema.seoul.go.kr",
    address: "서울특별시 종로구 평창30길 28",
    country: "KR"
  },
  {
    name: "종로구립 박노수미술관",
    city: "서울",
    type: "museum",
    website: "https://www.jongno.go.kr/museumMain.do",
    address: "서울특별시 종로구 옥인1길 34",
    country: "KR"
  },
  {
    name: "우리옛돌박물관",
    city: "서울",
    type: "museum",
    website: "http://www.koreanstonemuseum.com",
    address: "서울특별시 성북구 대사관로 15길 7",
    country: "KR"
  },
  {
    name: "아르코미술관",
    city: "서울",
    type: "museum",
    website: "https://www.arko.or.kr/arkomuseum",
    address: "서울특별시 종로구 동숭길 3",
    country: "KR"
  },
  
  // 사립 미술관
  {
    name: "사비나미술관",
    city: "서울",
    type: "museum",
    website: "https://www.savinamuseum.com",
    address: "서울특별시 종로구 율곡로 49-4",
    country: "KR"
  },
  {
    name: "한원미술관",
    city: "서울",
    type: "museum",
    website: "http://www.hanwon.org",
    address: "서울특별시 서초구 남부순환로 2423",
    country: "KR"
  },
  
  // 갤러리
  {
    name: "노화랑",
    city: "서울",
    type: "gallery",
    website: "https://www.nohgallery.com",
    address: "서울특별시 강남구 언주로152길 18",
    country: "KR"
  },
  {
    name: "모다갤러리",
    city: "서울",
    type: "gallery",
    website: "https://www.modagallery.co.kr",
    address: "서울특별시 용산구 한남대로 42길 39",
    country: "KR"
  },
  {
    name: "히든엠갤러리",
    city: "서울",
    type: "gallery",
    website: "https://www.hiddenm.com",
    address: "서울특별시 강남구 도산대로85길 24",
    country: "KR"
  },
  {
    name: "슈페리어갤러리",
    city: "서울",
    type: "gallery",
    website: "http://www.superiorgallery.co.kr",
    address: "서울특별시 강남구 압구정로80길 6",
    country: "KR"
  },
  {
    name: "갤러리 그림손",
    city: "서울",
    type: "gallery",
    website: "http://www.grimson.co.kr",
    address: "서울특별시 종로구 인사동10길 22",
    country: "KR"
  },
  {
    name: "갤러리 인사 1010",
    city: "서울",
    type: "gallery",
    website: null, // 웹사이트 정보 없음
    address: "서울특별시 종로구 인사동길 10-10",
    country: "KR"
  },
  {
    name: "PS CENTER",
    city: "서울",
    type: "gallery",
    website: "https://www.pscenter.kr",
    address: "서울특별시 용산구 이태원로 131",
    country: "KR"
  },
  {
    name: "갤러그리미디어그룹 이(畵)올림",
    city: "서울",
    type: "gallery",
    website: null, // 웹사이트 정보 없음
    address: "서울특별시 중구",
    country: "KR"
  },
  
  // 문화재단/문화시설
  {
    name: "강남문화재단",
    city: "서울",
    type: "culture_center",
    website: "https://www.gangnam.go.kr/office/gfac",
    address: "서울특별시 강남구 학동로 426",
    country: "KR"
  },
  {
    name: "강동아트센터",
    city: "서울",
    type: "culture_center",
    website: "https://www.gangdongarts.or.kr",
    address: "서울특별시 강동구 동남로 870",
    country: "KR"
  },
  {
    name: "서울문화재단 본관",
    city: "서울",
    type: "culture_center",
    website: "https://www.sfac.or.kr",
    address: "서울특별시 동대문구 청계천로 517",
    country: "KR"
  },
  {
    name: "서리풀 아트홀",
    city: "서울",
    type: "culture_center",
    website: "https://www.seochocf.or.kr",
    address: "서울특별시 서초구 남부순환로 2364",
    country: "KR"
  },
  {
    name: "문화역서울 284",
    city: "서울",
    type: "culture_center",
    website: "https://www.seoul284.org",
    address: "서울특별시 중구 통일로 1",
    country: "KR"
  },
  {
    name: "문화철도 959",
    city: "서울",
    type: "culture_center",
    website: null, // 웹사이트 정보 없음
    address: "서울특별시 마포구",
    country: "KR"
  },
  {
    name: "DDP 동대문디자인플라자",
    city: "서울",
    type: "culture_center",
    website: "https://www.ddp.or.kr",
    address: "서울특별시 중구 을지로 281",
    country: "KR"
  },
  
  // 교육기관
  {
    name: "한국예술종합학교",
    city: "서울",
    type: "education",
    website: "https://www.karts.ac.kr",
    address: "서울특별시 성북구 창경궁로 215",
    country: "KR"
  },
  {
    name: "국가무형문화재전수교육관",
    city: "서울",
    type: "education",
    website: "https://www.nihc.go.kr",
    address: "서울특별시 강남구 봉은사로 406",
    country: "KR"
  },
  
  // 특수 공간
  {
    name: "운현궁",
    city: "서울",
    type: "heritage",
    website: "http://www.unhyeongung.or.kr",
    address: "서울특별시 종로구 삼일대로 464",
    country: "KR"
  },
  {
    name: "통의동 보안여관",
    city: "서울",
    type: "gallery",
    website: "http://www.boan1942.com",
    address: "서울특별시 종로구 효자로 33",
    country: "KR"
  },
  {
    name: "아마도 예술 공간(Amado Art Space)",
    city: "서울",
    type: "gallery",
    website: "http://www.amadoart.org",
    address: "서울특별시 용산구 이태원로54길 53",
    country: "KR"
  },
  {
    name: "경춘선숲길 갤러리",
    city: "서울",
    type: "gallery",
    website: null, // 웹사이트 정보 없음
    address: "서울특별시 노원구 공릉로 86",
    country: "KR"
  },
  {
    name: "서울생활문화센터 서교 서교스케어",
    city: "서울",
    type: "culture_center",
    website: "https://seogyo.sfac.or.kr",
    address: "서울특별시 마포구 잔다리로6길 33",
    country: "KR"
  },
  
  // 기타
  {
    name: "현대백화점 무역센터점",
    city: "서울",
    type: "commercial",
    website: "https://www.ehyundai.com/newPortal/DP/DP000000_V.do?branchCd=B00145000",
    address: "서울특별시 강남구 테헤란로 517",
    country: "KR"
  },
  {
    name: "세종이야기 충무공이야기 전시장",
    city: "서울",
    type: "museum",
    website: null, // 웹사이트 정보 없음
    address: "서울특별시 종로구 세종대로 175",
    country: "KR"
  },
  {
    name: "솔숨센터",
    city: "서울",
    type: "gallery",
    website: null, // 웹사이트 정보 없음
    address: "서울특별시 서울숲",
    country: "KR"
  },
  {
    name: "디크레센도",
    city: "서울",
    type: "gallery",
    website: null, // 웹사이트 정보 없음
    address: "서울특별시",
    country: "KR"
  }
];

async function insertVenuesWithWebsites() {
  console.log('🏛️ 문화포털 수동 수집 venue 정보 입력 (웹사이트 포함)\n');
  console.log(`📊 총 ${manualVenues.length}개 venue 정보`);
  console.log('=' .repeat(60));
  
  const client = await pool.connect();
  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  
  try {
    for (const venue of manualVenues) {
      try {
        // 기존 레코드 확인
        const existing = await client.query(
          'SELECT id, website FROM venues WHERE name = $1 AND city = $2',
          [venue.name, venue.city]
        );
        
        if (existing.rows.length > 0) {
          // 웹사이트 정보 업데이트
          if (!existing.rows[0].website && venue.website) {
            await client.query(
              'UPDATE venues SET website = $1, updated_at = NOW() WHERE id = $2',
              [venue.website, existing.rows[0].id]
            );
            console.log(`🔄 업데이트: ${venue.name} - 웹사이트 추가`);
            updatedCount++;
          } else {
            console.log(`⏭️  스킵: ${venue.name} - 이미 존재함`);
          }
        } else {
          // 새로운 venue 추가
          await client.query(`
            INSERT INTO venues (
              name, city, country, type, website, address, 
              is_active, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, true, NOW(), NOW()
            )
          `, [
            venue.name,
            venue.city,
            venue.country,
            venue.type,
            venue.website,
            venue.address
          ]);
          
          console.log(`✅ 추가: ${venue.name} ${venue.website ? '(웹사이트 있음)' : '(웹사이트 없음)'}`);
          insertedCount++;
        }
        
      } catch (err) {
        console.error(`❌ 오류: ${venue.name} - ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 처리 결과:');
    console.log(`   ✅ 신규 추가: ${insertedCount}개`);
    console.log(`   🔄 업데이트: ${updatedCount}개`);
    console.log(`   ❌ 오류: ${errorCount}개`);
    console.log(`   📥 전체: ${manualVenues.length}개`);
    console.log('=' .repeat(60));
    console.log('\n✨ venue 정보 입력 완료!');
    
  } catch (error) {
    console.error('❌ 전체 처리 오류:', error.message);
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  await insertVenuesWithWebsites();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = { manualVenues };