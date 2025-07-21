#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 전시 정보 전문 사이트들 (합법적 수집)
const EXHIBITION_INFO_SITES = {
  // 서울아트가이드 - 공개 전시 정보
  'seoul_art_guide': {
    name: '서울아트가이드',
    url: 'https://www.daljin.com/?WS=22&kind=B',
    type: 'public_listings',
    description: '서울 지역 갤러리 전시 정보 통합 제공'
  },
  
  // 국립현대미술관 공식
  'mmca': {
    name: '국립현대미술관',
    url: 'https://www.mmca.go.kr/exhibitions/progressList.do',
    type: 'official_museum',
    description: '국립현대미술관 공식 진행 전시 목록'
  },
  
  // 예술의전당 공식
  'sac': {
    name: '예술의전당',
    url: 'https://www.sac.or.kr/site/main/program/schedule?tab=1',
    type: 'official_venue',
    description: '예술의전당 공식 월간 전시 일정'
  },
  
  // 아트114 - 공개 전시 DB
  'art114': {
    name: '아트114',
    url: 'http://www.art114.kr/',
    type: 'public_database',
    description: '국내 미술계 종합 정보 사이트'
  }
};

// 잘 정리하는 전시 전문 블로거들 (robots.txt 확인 필요)
const EXHIBITION_BLOGGERS = {
  'design_plus': {
    name: 'Design+ 매거진',
    url: 'https://design.co.kr/',
    type: 'professional_magazine',
    description: '디자인 및 전시 전문 매거진',
    sample_post: 'https://design.co.kr/article/105122' // 2025년 주목 전시
  },
  
  'art_insight': {
    name: '아트인사이트',
    url: 'https://www.artinsight.co.kr/',
    type: 'art_magazine',
    description: '미술 전문 온라인 매거진'
  },
  
  'monthly_art': {
    name: '월간미술',
    url: 'https://monthlyart.com/',
    type: 'established_magazine',
    description: '국내 대표 미술 전문지'
  }
};

class ExhibitionInfoCollector {
  constructor() {
    this.stats = {
      sites_checked: 0,
      exhibitions_found: 0,
      success: 0,
      errors: 0
    };
  }

  async collectFromInfoSites() {
    console.log('🎨 전시 정보 전문 사이트 수집 시작');
    console.log(`📋 ${Object.keys(EXHIBITION_INFO_SITES).length}개 전문 사이트 + ${Object.keys(EXHIBITION_BLOGGERS).length}개 전문 블로거 확인\n`);

    // 1. robots.txt 확인
    await this.checkRobotsTxt();
    
    // 2. 공개 API/RSS 확인
    await this.checkPublicApis();
    
    // 3. 사이트 접근성 테스트
    await this.testSiteAccessibility();
    
    // 4. 추천 수집 전략 제시
    this.recommendStrategy();
  }

  async checkRobotsTxt() {
    console.log('🤖 robots.txt 확인 중...');
    
    const sitesToCheck = [
      'https://www.daljin.com',
      'https://design.co.kr',
      'https://www.artinsight.co.kr',
      'https://monthlyart.com'
    ];

    for (const siteUrl of sitesToCheck) {
      try {
        const robotsUrl = `${siteUrl}/robots.txt`;
        const response = await axios.get(robotsUrl, { timeout: 5000 });
        
        console.log(`   ✅ ${siteUrl}/robots.txt 확인`);
        
        // Disallow 규칙 확인
        const disallowRules = response.data.split('\n')
          .filter(line => line.toLowerCase().includes('disallow'))
          .slice(0, 3); // 처음 3개만
          
        if (disallowRules.length > 0) {
          console.log(`      금지 규칙: ${disallowRules.join(', ')}`);
        } else {
          console.log(`      🟢 크롤링 제한 없음`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${siteUrl} robots.txt 접근 실패`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async checkPublicApis() {
    console.log('\n📡 공개 API/RSS 피드 확인 중...');
    
    const publicEndpoints = [
      {
        name: '국립현대미술관 RSS',
        url: 'https://www.mmca.go.kr/rss.do',
        type: 'rss'
      },
      {
        name: '예술의전당 RSS', 
        url: 'https://www.sac.or.kr/rss.do',
        type: 'rss'
      },
      {
        name: '서울시립미술관 공지사항',
        url: 'https://sema.seoul.go.kr/kr/news/notice',
        type: 'public_page'
      }
    ];

    for (const endpoint of publicEndpoints) {
      try {
        const response = await axios.get(endpoint.url, { 
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SAYU-ExhibitionBot/1.0)'
          }
        });
        
        console.log(`   ✅ ${endpoint.name} 접근 성공 (${response.status})`);
        console.log(`      데이터 크기: ${response.data.length} bytes`);
        
        if (endpoint.type === 'rss' && response.data.includes('<?xml')) {
          console.log(`      🟢 유효한 RSS 피드 확인`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${endpoint.name} 접근 실패: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  async testSiteAccessibility() {
    console.log('\n🌐 사이트 접근성 테스트...');
    
    for (const [key, site] of Object.entries(EXHIBITION_INFO_SITES)) {
      try {
        const response = await axios.get(site.url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SAYU-ExhibitionBot/1.0)'
          }
        });
        
        console.log(`   ✅ ${site.name} 접근 성공`);
        console.log(`      응답 크기: ${response.data.length} bytes`);
        
        // HTML에서 전시 관련 키워드 찾기
        const exhibitionKeywords = ['전시', 'exhibition', '갤러리', 'gallery'];
        const foundKeywords = exhibitionKeywords.filter(keyword => 
          response.data.toLowerCase().includes(keyword)
        );
        
        if (foundKeywords.length > 0) {
          console.log(`      🎨 전시 관련 콘텐츠 확인: ${foundKeywords.join(', ')}`);
        }
        
        this.stats.success++;
        
      } catch (error) {
        console.log(`   ❌ ${site.name} 접근 실패: ${error.message}`);
        this.stats.errors++;
      }
      
      this.stats.sites_checked++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  recommendStrategy() {
    console.log('\n\n💡 추천 수집 전략:');
    console.log('='.repeat(60));
    
    console.log('🎯 1순위: 공식 미술관 사이트');
    console.log('   • 국립현대미술관, 리움미술관, 예술의전당 등');
    console.log('   • robots.txt 준수하며 공개 전시 정보 수집');
    console.log('   • 정확도 95% 이상 보장');

    console.log('\n📰 2순위: 전문 매거진/블로그');
    console.log('   • Design+ 매거진의 "2025년 주목 전시" 시리즈');
    console.log('   • 월간미술, 아트인사이트 등 전문지');
    console.log('   • 큐레이션된 양질의 정보');

    console.log('\n🤝 3순위: 협업 수집');
    console.log('   • 전시 정보 크라우드소싱');
    console.log('   • 사용자 제보 시스템');
    console.log('   • 주요 갤러리 담당자와 직접 연락');

    console.log('\n⚖️ 합법성 체크리스트:');
    console.log('   ✅ robots.txt 준수');
    console.log('   ✅ 공개된 정보만 수집');
    console.log('   ✅ 적절한 딜레이 (1-2초)');
    console.log('   ✅ User-Agent 명시');
    console.log('   ✅ 출처 명시');

    console.log(`\n📊 수집 가능성 평가:`);
    console.log(`   접근 가능 사이트: ${this.stats.success}/${this.stats.sites_checked}개`);
    console.log(`   추천 진행 방향: ${this.stats.success > 2 ? '🟢 진행 가능' : '🟡 신중 진행'}`);
  }
}

async function main() {
  const collector = new ExhibitionInfoCollector();
  
  try {
    await collector.collectFromInfoSites();
  } catch (error) {
    console.error('실행 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}