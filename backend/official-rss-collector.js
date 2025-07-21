#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 실제 제공되는 공식 RSS/API 엔드포인트들
const OFFICIAL_SOURCES = {
  // 국립현대미술관 - 실제 RSS 있음
  'mmca': {
    name: '국립현대미술관',
    rss: 'https://www.mmca.go.kr/pr/rss.do',
    type: 'rss'
  },
  
  // 예술의전당 - 공연/전시 정보 RSS
  'sac': {
    name: '예술의전당',
    rss: 'https://www.sac.or.kr/site/main/rss/getRssList.do',
    type: 'rss'
  },
  
  // 서울시립미술관 - 보도자료 RSS
  'sema': {
    name: '서울시립미술관',
    rss: 'https://sema.seoul.go.kr/kr/news/pressRelease',
    type: 'webpage'
  },
  
  // 아르코미술관 - 전시 정보
  'arko': {
    name: '아르코미술관',
    url: 'https://www.arko.or.kr/zine/artsMagazine_list.do',
    type: 'webpage'
  }
};

class OfficialRSSCollector {
  constructor() {
    this.stats = {
      processed: 0,
      found: 0,
      inserted: 0,
      errors: 0
    };
  }

  async collectFromOfficialSources() {
    console.log('🏛️ 미술관 공식 RSS/API 수집 시작');
    console.log(`📋 ${Object.keys(OFFICIAL_SOURCES).length}개 공식 소스 확인\n`);

    const client = await pool.connect();

    try {
      for (const [key, source] of Object.entries(OFFICIAL_SOURCES)) {
        console.log(`🔍 ${source.name} 공식 데이터 수집 중...`);
        
        if (source.type === 'rss') {
          await this.collectFromRSS(source, client);
        } else {
          await this.collectFromWebpage(source, client);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await this.showResults(client);

    } catch (error) {
      console.error('❌ 수집 중 오류:', error);
    } finally {
      client.release();
    }
  }

  async collectFromRSS(source, client) {
    try {
      const response = await axios.get(source.rss, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      console.log(`   ✅ ${source.name} RSS 접근 성공`);
      console.log(`   📄 응답 크기: ${response.data.length} bytes`);
      
      // RSS 파싱은 실제 XML 구조를 보고 구현해야 함
      this.stats.found++;
      
    } catch (error) {
      console.log(`   ❌ ${source.name} RSS 접근 실패: ${error.message}`);
      this.stats.errors++;
    }
  }

  async collectFromWebpage(source, client) {
    try {
      const response = await axios.get(source.url || source.rss, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      console.log(`   ✅ ${source.name} 웹페이지 접근 성공`);
      console.log(`   📄 응답 크기: ${response.data.length} bytes`);
      
      // HTML 파싱해서 전시 정보 추출
      const exhibitions = this.parseWebpageForExhibitions(response.data, source.name);
      console.log(`   🎨 추출된 전시: ${exhibitions.length}개`);
      
      this.stats.found += exhibitions.length;
      
    } catch (error) {
      console.log(`   ❌ ${source.name} 접근 실패: ${error.message}`);
      this.stats.errors++;
    }
  }

  parseWebpageForExhibitions(html, venueName) {
    // 간단한 HTML 파싱 - 실제로는 cheerio 라이브러리 사용 권장
    const exhibitions = [];
    
    // 전시 관련 키워드가 포함된 텍스트 찾기
    const exhibitionPatterns = [
      /전시[:\s]*([^<\n]+)/g,
      /기획전[:\s]*([^<\n]+)/g,
      /특별전[:\s]*([^<\n]+)/g
    ];

    for (const pattern of exhibitionPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const title = match[1].trim();
        if (title.length > 5 && title.length < 100) {
          exhibitions.push({
            title: title,
            venue: venueName
          });
        }
      }
    }

    return exhibitions;
  }

  async showResults(client) {
    console.log('\n\n🎉 공식 RSS/API 수집 완료!');
    console.log('='.repeat(60));
    console.log(`📊 수집 결과:`);
    console.log(`   처리된 소스: ${Object.keys(OFFICIAL_SOURCES).length}개`);
    console.log(`   발견된 전시: ${this.stats.found}개`);
    console.log(`   DB 추가: ${this.stats.inserted}개`);
    console.log(`   오류: ${this.stats.errors}개`);
    
    console.log('\n💡 다음 단계:');
    console.log('1. 실제 RSS XML 구조 분석하여 파서 구현');
    console.log('2. cheerio 라이브러리로 HTML 파싱 개선');
    console.log('3. 정기적 크론 작업으로 자동 업데이트');
  }
}

async function main() {
  const collector = new OfficialRSSCollector();
  
  try {
    await collector.collectFromOfficialSources();
  } catch (error) {
    console.error('실행 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}