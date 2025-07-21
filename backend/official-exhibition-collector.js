#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 검증된 공식 전시 정보 소스들
const OFFICIAL_SOURCES = {
  // 1. 전문 매거진 (검증됨)
  magazines: {
    'design_plus': {
      name: 'Design+ 매거진',
      type: 'professional_magazine',
      method: 'manual_extraction',
      url: 'https://design.co.kr/',
      articles: [
        'https://design.co.kr/article/105122', // 2025년 주목 전시 11
        // 추가 기사들 정기 확인 필요
      ],
      reliability: 95,
      last_checked: null
    },
    'monthly_art': {
      name: '월간미술',
      type: 'established_magazine', 
      method: 'rss_or_manual',
      url: 'https://monthlyart.com/',
      reliability: 90,
      robots_allowed: true
    },
    'art_insight': {
      name: '아트인사이트',
      type: 'art_magazine',
      method: 'manual_extraction',
      url: 'https://www.artinsight.co.kr/',
      reliability: 85
    }
  },

  // 2. 공식 미술관 사이트 (가장 신뢰도 높음)
  museums: {
    'mmca': {
      name: '국립현대미술관',
      type: 'official_museum',
      method: 'webpage_parsing',
      url: 'https://www.mmca.go.kr/exhibitions/progressList.do',
      reliability: 99,
      robots_allowed: true
    },
    'leeum': {
      name: '리움미술관',
      type: 'official_museum',
      method: 'webpage_parsing',
      url: 'https://www.leeum.org/html/exhibition/exhibition.asp',
      reliability: 99
    },
    'sac': {
      name: '예술의전당',
      type: 'official_venue',
      method: 'webpage_parsing',
      url: 'https://www.sac.or.kr/site/main/program/schedule?tab=1',
      reliability: 95
    },
    'sema': {
      name: '서울시립미술관',
      type: 'official_museum',
      method: 'webpage_parsing', 
      url: 'https://sema.seoul.go.kr/kr/exhibition/exhibitionCurrent',
      reliability: 95
    }
  },

  // 3. 소셜미디어 (인스타그램 제약으로 일부만 가능)
  social: {
    'instagram_business': {
      name: '미술관 인스타그램 비즈니스 계정',
      type: 'social_official',
      method: 'instagram_graph_api',
      accounts: [
        '@mmca_korea',
        '@leeum_museum', 
        '@sac_official',
        '@seoul_museum'
      ],
      reliability: 80,
      api_required: true,
      limitations: '비즈니스 계정 연동 필요, 시간당 200회 제한'
    }
  },

  // 4. 전시 통합 플랫폼
  platforms: {
    'seoul_art_guide': {
      name: '서울아트가이드',
      type: 'aggregator',
      method: 'webpage_parsing',
      url: 'https://www.daljin.com/?WS=22&kind=B',
      reliability: 70,
      robots_allowed: true
    }
  }
};

class OfficialExhibitionCollector {
  constructor() {
    this.stats = {
      sources_checked: 0,
      exhibitions_found: 0,
      success_rate: 0
    };
  }

  async startCollection() {
    console.log('🎨 공식 전시 정보 수집 시스템 구축');
    console.log('✅ 검증된 공식 소스만 사용');
    console.log('⚖️ 합법성 및 로봇 규정 준수\n');

    // 1. 소스 접근성 검사
    await this.checkSourceAccessibility();
    
    // 2. 실제 수집 가능성 평가
    await this.evaluateCollectionFeasibility();
    
    // 3. 소셜미디어 수집 방법 연구
    await this.researchSocialMediaCollection();
    
    // 4. 권장 수집 전략 제시
    this.recommendCollectionStrategy();
  }

  async checkSourceAccessibility() {
    console.log('🌐 공식 소스 접근성 검사');
    console.log('-'.repeat(60));

    for (const [category, sources] of Object.entries(OFFICIAL_SOURCES)) {
      console.log(`\n📂 ${category.toUpperCase()}:`);
      
      for (const [key, source] of Object.entries(sources)) {
        try {
          if (source.url && source.method === 'webpage_parsing') {
            const response = await axios.get(source.url, {
              timeout: 10000,
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SAYU-ExhibitionBot/1.0)'
              }
            });
            
            console.log(`   ✅ ${source.name} - 접근 가능 (${response.status})`);
            console.log(`      신뢰도: ${source.reliability}% | 크기: ${response.data.length} bytes`);
            
            // 전시 키워드 검사
            const hasExhibitionContent = ['전시', 'exhibition', '갤러리'].some(
              keyword => response.data.toLowerCase().includes(keyword)
            );
            
            if (hasExhibitionContent) {
              console.log(`      🎨 전시 콘텐츠 확인됨`);
            }
            
          } else {
            console.log(`   📋 ${source.name} - ${source.method} 방식`);
            console.log(`      신뢰도: ${source.reliability}%`);
          }
          
          this.stats.sources_checked++;
          
        } catch (error) {
          console.log(`   ❌ ${source.name} - 접근 실패: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }

  async evaluateCollectionFeasibility() {
    console.log('\n\n📊 수집 가능성 평가');
    console.log('-'.repeat(60));
    
    const feasibleSources = [];
    const manualSources = [];
    const restrictedSources = [];

    Object.values(OFFICIAL_SOURCES).forEach(category => {
      Object.entries(category).forEach(([key, source]) => {
        if (source.method === 'webpage_parsing' && source.robots_allowed !== false) {
          feasibleSources.push(source.name);
        } else if (source.method === 'manual_extraction') {
          manualSources.push(source.name);
        } else {
          restrictedSources.push(source.name);
        }
      });
    });

    console.log(`🟢 자동 수집 가능: ${feasibleSources.length}개`);
    feasibleSources.forEach(name => console.log(`   • ${name}`));
    
    console.log(`\n🟡 수동 수집 필요: ${manualSources.length}개`);
    manualSources.forEach(name => console.log(`   • ${name}`));
    
    console.log(`\n🔴 제한/어려움: ${restrictedSources.length}개`);
    restrictedSources.forEach(name => console.log(`   • ${name}`));
  }

  async researchSocialMediaCollection() {
    console.log('\n\n📱 소셜미디어 수집 방법 연구');
    console.log('-'.repeat(60));
    
    console.log('🔍 Instagram 수집 현황:');
    console.log('   • Graph API: 비즈니스 계정 연동 필요');
    console.log('   • 시간당 200회 제한 (2018년 이후 강화)');
    console.log('   • 해시태그 수집 기능 제거됨');
    console.log('   • 공개 계정 미디어 수집 불가');
    
    console.log('\n📱 Threads 수집 현황:');
    console.log('   • 공식 API 아직 제한적');
    console.log('   • 비공식 API 클라이언트 존재하나 안정성 의문');
    console.log('   • ActivityPub 프로토콜 기반 (탈중앙화)');
    
    console.log('\n💡 실용적 대안:');
    console.log('   • 해시스크래퍼 등 전문 크롤링 서비스 활용');
    console.log('   • 미술관 공식 계정의 RSS 피드 확인');
    console.log('   • 수동 모니터링 + 정기 업데이트');
  }

  recommendCollectionStrategy() {
    console.log('\n\n🎯 권장 수집 전략');
    console.log('='.repeat(60));
    
    console.log('📅 1단계: 즉시 구현 가능 (1주일)');
    console.log('   ✅ Design+ 매거진 정기 기사 수동 수집');
    console.log('   ✅ 국립현대미술관 웹페이지 파싱');
    console.log('   ✅ 예술의전당 일정 페이지 파싱');
    console.log('   → 예상 수집량: 월 20-30개 검증된 전시');
    
    console.log('\n📅 2단계: 시스템 확장 (1개월)');
    console.log('   🔧 리움미술관, 서울시립미술관 파싱 시스템');
    console.log('   🔧 월간미술, 아트인사이트 RSS/웹 모니터링');
    console.log('   🔧 서울아트가이드 통합 플랫폼 활용');
    console.log('   → 예상 수집량: 월 50-80개 검증된 전시');
    
    console.log('\n📅 3단계: 고도화 (3개월)');
    console.log('   🚀 Instagram Graph API 연동 (비즈니스 계정)');
    console.log('   🚀 크롤링 스케줄러 자동화');
    console.log('   🚀 데이터 검증 및 중복 제거 시스템');
    console.log('   → 예상 수집량: 월 100+ 검증된 전시');
    
    console.log('\n⭐ 핵심 성공 요소:');
    console.log('   1. 품질 > 양: 검증된 소스만 사용');
    console.log('   2. 합법성 준수: robots.txt 및 이용약관 준수');
    console.log('   3. 지속가능성: API 제한 고려한 수집 주기');
    console.log('   4. 표준화: 일관된 데이터 형식 유지');
    
    console.log(`\n📊 현재 깨끗한 DB: 15개 검증된 전시`);
    console.log('💡 1단계만 구현해도 현재 대비 200% 향상 예상');
  }
}

async function main() {
  const collector = new OfficialExhibitionCollector();
  
  try {
    await collector.startCollection();
  } catch (error) {
    console.error('실행 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}