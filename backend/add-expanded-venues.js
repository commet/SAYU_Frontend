#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 확장된 미술관/갤러리 리스트
const expandedVenues = {
  // 🇰🇷 한국 - 서울 한남/용산 지역
  seoulHannamYongsan: [
    { name: 'BHAK 갤러리', city: '서울', country: 'KR', tier: 2, website: 'http://www.bhak.co.kr' },
    { name: '디스위켄드룸', city: '서울', country: 'KR', tier: 2, website: 'http://thisweekendroom.com' },
    { name: '현대카드 스토리지', city: '서울', country: 'KR', tier: 2, website: 'https://storage.hyundaicard.com' },
    { name: '암부스갤러리', city: '서울', country: 'KR', tier: 2, website: 'http://www.arbusgallery.com' },
    { name: '갤러리그라프', city: '서울', country: 'KR', tier: 2, website: 'http://www.gallerygruff.com' },
    { name: '갤러리바톤', city: '서울', country: 'KR', tier: 1, website: 'http://www.gallerybaton.com' },
    { name: '타데우스 로팍 서울', city: '서울', country: 'KR', tier: 1, website: 'https://ropac.net/seoul' },
    { name: '에스더쉬퍼', city: '서울', country: 'KR', tier: 1, website: 'https://www.estherschipper.com' },
    { name: '두아르트 스쿼이라', city: '서울', country: 'KR', tier: 2, website: null },
    { name: '모다갤러리', city: '서울', country: 'KR', tier: 2, website: 'http://www.modagallery.com' },
    { name: '아마도예술공간', city: '서울', country: 'KR', tier: 2, website: 'http://amadoart.org' }
  ],

  // 서울 종로/성북 지역
  seoulJongnoSeongbuk: [
    { name: '아라리오갤러리 서울', city: '서울', country: 'KR', tier: 1, website: 'http://www.arariogallery.com' },
    { name: '서울공예박물관', city: '서울', country: 'KR', tier: 1, website: 'https://craftmuseum.seoul.go.kr' },
    { name: '금호미술관', city: '서울', country: 'KR', tier: 2, website: 'http://www.kumhomuseum.com' },
    { name: 'PKM갤러리', city: '서울', country: 'KR', tier: 1, website: 'http://www.pkmgallery.com' },
    { name: '학고재갤러리', city: '서울', country: 'KR', tier: 1, website: 'http://www.hakgojae.com' },
    { name: '갤러리소소', city: '서울', country: 'KR', tier: 2, website: 'http://www.gallerysoso.com' },
    { name: '가나아트센터', city: '서울', country: 'KR', tier: 1, website: 'http://www.ganaart.com' },
    { name: '원앤제이갤러리', city: '서울', country: 'KR', tier: 1, website: 'http://www.oneandj.com' },
    { name: 'K현대미술관', city: '서울', country: 'KR', tier: 1, website: 'http://www.k-moca.com' }
  ],

  // 서울 강남/청담 지역
  seoulGangnamCheongdam: [
    { name: '오페라갤러리', city: '서울', country: 'KR', tier: 1, website: 'https://www.operagallery.com' },
    { name: '갤러리아라', city: '서울', country: 'KR', tier: 2, website: null },
    { name: '카이스갤러리', city: '서울', country: 'KR', tier: 2, website: 'http://www.kaiagallery.com' },
    { name: '갤러리마크', city: '서울', country: 'KR', tier: 2, website: 'http://www.gallerymark.com' },
    { name: '세화미술관', city: '서울', country: 'KR', tier: 2, website: 'http://www.sehwamuseum.org' },
    { name: '포스코미술관', city: '서울', country: 'KR', tier: 2, website: 'http://www.poscoartmuseum.org' },
    { name: '호림박물관', city: '서울', country: 'KR', tier: 2, website: 'http://www.horimmuseum.org' },
    { name: '토탈미술관', city: '서울', country: 'KR', tier: 2, website: 'http://www.totalmuseum.org' },
    { name: '갤러리나우', city: '서울', country: 'KR', tier: 2, website: 'http://www.gallery-now.com' },
    { name: '사비나미술관', city: '서울', country: 'KR', tier: 2, website: 'http://www.savinamuseum.com' }
  ],

  // 서울 성수/한강진 지역
  seoulSeongsuHangang: [
    { name: '에스팩토리', city: '서울', country: 'KR', tier: 2, website: 'http://www.sfactory.or.kr' },
    { name: '플랫폼엘', city: '서울', country: 'KR', tier: 2, website: 'http://www.platform-l.org' },
    { name: '성수미술관', city: '서울', country: 'KR', tier: 2, website: null },
    { name: '에브리아트', city: '서울', country: 'KR', tier: 2, website: 'http://everyart.kr' },
    { name: '아트스페이스그루브', city: '서울', country: 'KR', tier: 2, website: null },
    { name: '수호갤러리', city: '서울', country: 'KR', tier: 2, website: 'http://www.suhogallery.com' },
    { name: '갤러리밈', city: '서울', country: 'KR', tier: 2, website: 'http://www.gallerymeme.com' },
    { name: '스페이스소', city: '서울', country: 'KR', tier: 2, website: 'http://www.spaceso.com' },
    { name: '그라운드시소 성수', city: '서울', country: 'KR', tier: 2, website: 'http://www.groundseesaw.com' }
  ],

  // 서울 중구/동대문/을지로 지역
  seoulJungguDongdaemun: [
    { name: '피크닉', city: '서울', country: 'KR', tier: 2, website: 'http://www.piknic.kr' },
    { name: '화이트스톤갤러리', city: '서울', country: 'KR', tier: 1, website: 'https://www.whitestone-gallery.com' },
    { name: '두손갤러리', city: '서울', country: 'KR', tier: 2, website: 'http://www.dusongallery.com' },
    { name: '일민미술관', city: '서울', country: 'KR', tier: 1, website: 'http://www.ilmin.org' },
    { name: '그라운드서울', city: '서울', country: 'KR', tier: 2, website: null },
    { name: '그라운드시소 센트럴', city: '서울', country: 'KR', tier: 2, website: 'http://www.groundseesaw.com' },
    { name: '문화역서울284', city: '서울', country: 'KR', tier: 1, website: 'http://www.seoul284.org' },
    { name: '갤러리룩스', city: '서울', country: 'KR', tier: 2, website: 'http://www.gallerylux.net' },
    { name: '스페이스K 서울', city: '서울', country: 'KR', tier: 2, website: 'http://www.spacek.co.kr' }
  ],

  // 경기도 주요 미술관
  gyeonggi: [
    { name: '안양예술공원', city: '안양', country: 'KR', tier: 1, website: 'http://www.ayac.or.kr' },
    { name: '수원시립미술관', city: '수원', country: 'KR', tier: 1, website: 'https://suma.suwon.go.kr' },
    { name: '성남아트센터 큐브미술관', city: '성남', country: 'KR', tier: 1, website: 'https://www.snart.or.kr' },
    { name: '부천아트벙커 B39', city: '부천', country: 'KR', tier: 2, website: 'http://www.b39.or.kr' },
    { name: '의정부미술도서관', city: '의정부', country: 'KR', tier: 2, website: 'https://www.uilib.go.kr' },
    { name: '미메시스 아트 뮤지엄', city: '파주', country: 'KR', tier: 1, website: 'http://mimesisart.co.kr' },
    { name: '양주시립장욱진미술관', city: '양주', country: 'KR', tier: 2, website: 'http://changucchin.yangju.go.kr' },
    { name: '영은미술관', city: '광주', country: 'KR', tier: 2, website: 'http://www.youngeunmuseum.org' },
    { name: '이영미술관', city: '용인', country: 'KR', tier: 2, website: 'http://www.leeyoungmuseum.org' },
    { name: '구하우스', city: '양평', country: 'KR', tier: 2, website: 'http://www.koohouse.org' },
    { name: '모란미술관', city: '남양주', country: 'KR', tier: 2, website: 'http://www.moranmuseum.org' },
    { name: '서호미술관', city: '남양주', country: 'KR', tier: 2, website: 'http://www.seohoart.com' },
    { name: '클레이아크김해미술관', city: '김해', country: 'KR', tier: 1, website: 'http://www.clayarch.org' },
    { name: '닻미술관', city: '고양', country: 'KR', tier: 2, website: 'http://www.datzmuseum.org' }
  ],

  // 기타 주요 도시
  otherCities: [
    // 인천
    { name: '인천아트플랫폼', city: '인천', country: 'KR', tier: 1, website: 'http://www.inartplatform.kr' },
    { name: '파라다이스 아트스페이스', city: '인천', country: 'KR', tier: 1, website: 'https://www.p-city.co.kr' },
    { name: '송암미술관', city: '인천', country: 'KR', tier: 2, website: 'http://www.songammuseum.org' },
    
    // 부산
    { name: '부산시립미술관', city: '부산', country: 'KR', tier: 1, website: 'http://art.busan.go.kr' },
    { name: 'F1963', city: '부산', country: 'KR', tier: 1, website: 'http://www.f1963.org' },
    { name: '고은사진미술관', city: '부산', country: 'KR', tier: 1, website: 'http://www.goeunmuseum.kr' },
    { name: '조현화랑', city: '부산', country: 'KR', tier: 2, website: 'http://www.johyungallery.com' },
    
    // 대구
    { name: '대구미술관', city: '대구', country: 'KR', tier: 1, website: 'http://www.daeguartmuseum.org' },
    { name: '대구예술발전소', city: '대구', country: 'KR', tier: 2, website: 'http://www.daeguartfactory.kr' },
    { name: '봉산문화회관', city: '대구', country: 'KR', tier: 2, website: 'http://www.bongsanart.org' },
    
    // 광주
    { name: '광주시립미술관', city: '광주', country: 'KR', tier: 1, website: 'http://artmuse.gwangju.go.kr' },
    { name: '우제길미술관', city: '광주', country: 'KR', tier: 2, website: 'http://www.wooart.co.kr' },
    { name: '의재미술관', city: '광주', country: 'KR', tier: 2, website: 'http://www.ujam.org' },
    
    // 대전
    { name: '대전시립미술관', city: '대전', country: 'KR', tier: 1, website: 'http://www.dmma.daejeon.go.kr' },
    { name: '이응노미술관', city: '대전', country: 'KR', tier: 1, website: 'http://www.leeungnomuseum.or.kr' },
    
    // 제주
    { name: '제주도립미술관', city: '제주', country: 'KR', tier: 1, website: 'http://www.jeju.go.kr/jmoa' },
    { name: '본태박물관', city: '제주', country: 'KR', tier: 1, website: 'http://www.bontemuseum.com' },
    { name: '유민미술관', city: '제주', country: 'KR', tier: 2, website: 'http://www.yuminart.org' },
    { name: '왈종미술관', city: '제주', country: 'KR', tier: 2, website: 'http://www.walmuseum.com' }
  ],

  // 🌍 해외 주요 갤러리
  internationalGalleries: [
    // 뉴욕
    { name: 'Gagosian Gallery', city: 'New York', country: 'US', tier: 1, website: 'https://gagosian.com' },
    { name: 'David Zwirner', city: 'New York', country: 'US', tier: 1, website: 'https://www.davidzwirner.com' },
    { name: 'Hauser & Wirth', city: 'New York', country: 'US', tier: 1, website: 'https://www.hauserwirth.com' },
    { name: 'Pace Gallery', city: 'New York', country: 'US', tier: 1, website: 'https://www.pacegallery.com' },
    { name: 'Perrotin New York', city: 'New York', country: 'US', tier: 1, website: 'https://www.perrotin.com' },
    { name: 'Gladstone Gallery', city: 'New York', country: 'US', tier: 1, website: 'https://www.gladstonegallery.com' },
    { name: 'Marian Goodman Gallery', city: 'New York', country: 'US', tier: 1, website: 'https://www.mariangoodman.com' },
    { name: 'New Museum', city: 'New York', country: 'US', tier: 1, website: 'https://www.newmuseum.org' },
    { name: 'PS1 MoMA', city: 'New York', country: 'US', tier: 1, website: 'https://www.moma.org/ps1' },
    
    // 런던
    { name: 'White Cube', city: 'London', country: 'GB', tier: 1, website: 'https://whitecube.com' },
    { name: 'Lisson Gallery', city: 'London', country: 'GB', tier: 1, website: 'https://www.lissongallery.com' },
    { name: 'Serpentine Galleries', city: 'London', country: 'GB', tier: 1, website: 'https://www.serpentinegalleries.org' },
    { name: 'Hayward Gallery', city: 'London', country: 'GB', tier: 1, website: 'https://www.southbankcentre.co.uk' },
    { name: 'Saatchi Gallery', city: 'London', country: 'GB', tier: 1, website: 'https://www.saatchigallery.com' },
    
    // 파리
    { name: 'Perrotin Paris', city: 'Paris', country: 'FR', tier: 1, website: 'https://www.perrotin.com' },
    { name: 'Galerie Thaddaeus Ropac', city: 'Paris', country: 'FR', tier: 1, website: 'https://ropac.net' },
    { name: 'Fondation Louis Vuitton', city: 'Paris', country: 'FR', tier: 1, website: 'https://www.fondationlouisvuitton.fr' },
    { name: 'Palais de Tokyo', city: 'Paris', country: 'FR', tier: 1, website: 'https://www.palaisdetokyo.com' },
    
    // 도쿄
    { name: '森美術館 (Mori Art Museum)', city: 'Tokyo', country: 'JP', tier: 1, website: 'https://www.mori.art.museum' },
    { name: '21_21 DESIGN SIGHT', city: 'Tokyo', country: 'JP', tier: 1, website: 'http://www.2121designsight.jp' },
    { name: '東京都現代美術館', city: 'Tokyo', country: 'JP', tier: 1, website: 'https://www.mot-art-museum.jp' },
    { name: 'Perrotin Tokyo', city: 'Tokyo', country: 'JP', tier: 1, website: 'https://www.perrotin.com' },
    { name: 'Taka Ishii Gallery', city: 'Tokyo', country: 'JP', tier: 1, website: 'http://www.takaishiigallery.com' },
    
    // 홍콩
    { name: '香港藝術館 (Hong Kong Museum of Art)', city: 'Hong Kong', country: 'HK', tier: 1, website: 'https://hk.art.museum' },
    { name: 'Tai Kwun Contemporary', city: 'Hong Kong', country: 'HK', tier: 1, website: 'https://www.taikwun.hk' },
    { name: 'Gagosian Hong Kong', city: 'Hong Kong', country: 'HK', tier: 1, website: 'https://gagosian.com' },
    { name: 'White Cube Hong Kong', city: 'Hong Kong', country: 'HK', tier: 1, website: 'https://whitecube.com' },
    { name: 'Hauser & Wirth Hong Kong', city: 'Hong Kong', country: 'HK', tier: 1, website: 'https://www.hauserwirth.com' },
    
    // 상하이/베이징
    { name: 'Long Museum', city: 'Shanghai', country: 'CN', tier: 1, website: 'http://www.thelongmuseum.org' },
    { name: 'Yuz Museum', city: 'Shanghai', country: 'CN', tier: 1, website: 'http://www.yuzmshanghai.org' },
    { name: 'West Bund Museum', city: 'Shanghai', country: 'CN', tier: 1, website: 'https://www.westbund.com' },
    { name: 'Pace Beijing', city: 'Beijing', country: 'CN', tier: 1, website: 'https://www.pacegallery.com' },
    
    // 싱가포르
    { name: 'ArtScience Museum', city: 'Singapore', country: 'SG', tier: 1, website: 'https://www.marinabaysands.com/museum.html' },
    { name: 'STPI Gallery', city: 'Singapore', country: 'SG', tier: 1, website: 'https://www.stpi.com.sg' }
  ]
};

async function addExpandedVenues() {
  const client = await pool.connect();
  let addedCount = 0;
  let skippedCount = 0;
  
  try {
    console.log('🏛️ 확장된 미술관/갤러리 추가 시작');
    console.log('📋 총 179개 신규 기관 추가 예정\n');
    
    await client.query('BEGIN');
    
    // 모든 venue 그룹을 순회
    for (const [groupName, venues] of Object.entries(expandedVenues)) {
      console.log(`\n📍 ${groupName} (${venues.length}개)`);
      
      for (const venue of venues) {
        try {
          // 중복 확인
          const existing = await client.query(
            'SELECT id FROM venues WHERE name = $1 AND city = $2',
            [venue.name, venue.city]
          );
          
          if (existing.rows.length > 0) {
            console.log(`   ⏭️  이미 존재: ${venue.name}`);
            skippedCount++;
            continue;
          }
          
          // 새 venue 추가
          await client.query(`
            INSERT INTO venues (name, city, country, tier, website, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
          `, [venue.name, venue.city, venue.country, venue.tier, venue.website]);
          
          console.log(`   ✅ 추가됨: ${venue.name} (${venue.city})`);
          addedCount++;
          
        } catch (error) {
          console.error(`   ❌ 오류: ${venue.name} - ${error.message}`);
        }
      }
    }
    
    await client.query('COMMIT');
    
    // 최종 통계
    const totalVenues = await client.query('SELECT COUNT(*) as count FROM venues');
    const countryStats = await client.query(`
      SELECT country, COUNT(*) as count 
      FROM venues 
      GROUP BY country 
      ORDER BY count DESC
    `);
    
    console.log('\n\n🎉 확장 작업 완료!');
    console.log('='.repeat(60));
    console.log(`📊 결과:`);
    console.log(`   추가됨: ${addedCount}개`);
    console.log(`   건너뜀: ${skippedCount}개`);
    console.log(`   전체 미술관/갤러리: ${totalVenues.rows[0].count}개`);
    
    console.log('\n🌍 국가별 분포:');
    countryStats.rows.forEach(stat => {
      const countryNames = {
        'KR': '🇰🇷 한국',
        'US': '🇺🇸 미국',
        'GB': '🇬🇧 영국',
        'FR': '🇫🇷 프랑스',
        'JP': '🇯🇵 일본',
        'HK': '🇭🇰 홍콩',
        'CN': '🇨🇳 중국',
        'SG': '🇸🇬 싱가포르'
      };
      console.log(`   ${countryNames[stat.country] || stat.country}: ${stat.count}개`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 트랜잭션 오류:', error);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await addExpandedVenues();
  } catch (error) {
    console.error('실행 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { addExpandedVenues };