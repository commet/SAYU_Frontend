/**
 * Artmap.com 크롤링 실행 스크립트
 * 사용법: node crawl-artmap.js [옵션]
 * 
 * 옵션:
 *   --letter=a     특정 알파벳으로 시작하는 기관만 크롤링
 *   --limit=10     크롤링할 기관 수 제한
 *   --exhibitions  전시 정보만 크롤링
 *   --test         테스트 모드 (DB 저장 안 함)
 */

require('dotenv').config();
const ArtmapCrawlerService = require('./src/services/artmapCrawlerService');

async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // 명령줄 인자 파싱
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value || true;
    }
  });

  const crawler = new ArtmapCrawlerService();
  
  try {
    if (options.test) {
      console.log('🧪 테스트 모드로 실행 중...');
      
      // 테스트: 단일 기관 크롤링
      console.log('\n1. 기관 목록 테스트 (A로 시작하는 기관들)');
      const institutions = await crawler.crawlInstitutionsList('a');
      console.log(`발견된 기관 수: ${institutions.length}`);
      if (institutions.length > 0) {
        console.log('첫 번째 기관:', institutions[0]);
        
        // 첫 번째 기관의 상세 정보 가져오기
        console.log('\n2. 기관 상세 정보 테스트');
        const details = await crawler.crawlInstitutionDetail(institutions[0].urlPath);
        console.log('상세 정보:', JSON.stringify(details, null, 2));
      }
      
      // 테스트: 전시 목록 크롤링
      console.log('\n3. 전시 목록 테스트');
      const exhibitions = await crawler.crawlExhibitionsList();
      console.log(`발견된 전시 수: ${exhibitions.length}`);
      if (exhibitions.length > 0) {
        console.log('첫 번째 전시:', exhibitions[0]);
        
        // 첫 번째 전시의 상세 정보
        console.log('\n4. 전시 상세 정보 테스트');
        const exhibitionDetail = await crawler.crawlExhibitionDetail(exhibitions[0].urlPath);
        console.log('전시 상세:', JSON.stringify(exhibitionDetail, null, 2));
      }
      
    } else if (options.letter) {
      // 특정 알파벳 크롤링
      console.log(`📝 ${options.letter.toUpperCase()}로 시작하는 기관 크롤링 중...`);
      const institutions = await crawler.crawlInstitutionsList(options.letter);
      
      const limit = options.limit ? parseInt(options.limit) : institutions.length;
      for (let i = 0; i < Math.min(limit, institutions.length); i++) {
        const inst = institutions[i];
        console.log(`\n[${i + 1}/${limit}] ${inst.name} 처리 중...`);
        
        const details = await crawler.crawlInstitutionDetail(inst.urlPath);
        if (details) {
          const fullInfo = { ...inst, ...details };
          await crawler.saveInstitution(fullInfo);
          console.log(`✅ ${inst.name} 저장 완료`);
        }
      }
      
    } else if (options.exhibitions) {
      // 전시 정보만 크롤링
      console.log('🎨 전시 정보 크롤링 중...');
      const exhibitions = await crawler.crawlExhibitionsList();
      
      const limit = options.limit ? parseInt(options.limit) : 50;
      for (let i = 0; i < Math.min(limit, exhibitions.length); i++) {
        const exhibition = exhibitions[i];
        console.log(`\n[${i + 1}/${limit}] ${exhibition.title} 처리 중...`);
        
        const details = await crawler.crawlExhibitionDetail(exhibition.urlPath);
        if (details) {
          console.log(`✅ 전시: ${details.title}`);
          console.log(`   아티스트: ${details.artists.join(', ')}`);
          console.log(`   장소: ${exhibition.venueName}`);
        }
      }
      
    } else {
      // 전체 크롤링
      console.log('🌍 전체 크롤링 시작...');
      console.log('⚠️  경고: 이 작업은 몇 시간이 걸릴 수 있습니다.');
      console.log('Ctrl+C로 중단할 수 있습니다.\n');
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3초 대기
      
      await crawler.crawlAll();
    }
    
    console.log('\n✨ 크롤링 완료!');
    
  } catch (error) {
    console.error('❌ 크롤링 중 오류 발생:', error);
    process.exit(1);
  }
}

// 크롤링 통계 출력
function printStats(stats) {
  console.log('\n📊 크롤링 통계:');
  console.log(`   - 수집된 기관 수: ${stats.institutions || 0}`);
  console.log(`   - 수집된 전시 수: ${stats.exhibitions || 0}`);
  console.log(`   - 총 소요 시간: ${stats.duration || 0}초`);
}

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
  console.log('\n\n🛑 크롤링이 사용자에 의해 중단되었습니다.');
  process.exit(0);
});

// 실행
main().catch(console.error);