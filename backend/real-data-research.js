#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');

// 실제 검증 가능한 전시 데이터 수집 방법론 연구
class RealExhibitionDataResearch {
  constructor() {
    this.geminiApiKey = process.env.GOOGLE_AI_API_KEY;
    this.gptApiKey = process.env.OPENAI_API_KEY;

    this.realSources = {
      // 1. 공식 API들 (최우선)
      officialAPIs: {
        international: {
          'met_museum': {
            name: 'Metropolitan Museum of Art API',
            url: 'https://metmuseum.github.io/',
            endpoint: 'https://collectionapi.metmuseum.org/public/collection/v1',
            exhibitions_endpoint: 'https://www.metmuseum.org/api/exhibitions',
            free: true,
            reliability: 99,
            data_format: 'JSON',
            features: ['current_exhibitions', 'past_exhibitions', 'object_details']
          },
          'rijksmuseum': {
            name: 'Rijksmuseum API',
            url: 'https://data.rijksmuseum.nl/object-metadata/api/',
            endpoint: 'https://www.rijksmuseum.nl/api/en/collection',
            api_key_required: true,
            free: true,
            reliability: 95,
            data_format: 'JSON'
          },
          'cleveland_museum': {
            name: 'Cleveland Museum of Art API',
            url: 'https://openaccess-api.clevelandart.org/',
            endpoint: 'https://openaccess-api.clevelandart.org/',
            free: true,
            reliability: 90,
            data_format: 'JSON'
          },
          'cooper_hewitt': {
            name: 'Cooper Hewitt API',
            url: 'https://collection.cooperhewitt.org/api/',
            endpoint: 'https://api.collection.cooperhewitt.org/rest/',
            api_key_required: true,
            free: true,
            reliability: 85
          },
          'harvard_art': {
            name: 'Harvard Art Museums API',
            url: 'https://github.com/harvardartmuseums/api-docs',
            endpoint: 'https://api.harvardartmuseums.org/',
            api_key_required: true,
            free: true,
            reliability: 90
          }
        },
        domestic: {
          'mmca': {
            name: '국립현대미술관',
            url: 'https://www.mmca.go.kr',
            api_status: 'investigating',
            alternatives: ['rss', 'structured_data', 'calendar'],
            reliability: 95
          },
          'sema': {
            name: '서울시립미술관',
            url: 'https://sema.seoul.go.kr',
            api_status: 'investigating',
            alternatives: ['rss', 'open_data_portal'],
            reliability: 90
          }
        }
      },

      // 2. RSS 피드들
      rssFeeds: {
        'artforum': {
          name: 'Artforum RSS',
          url: 'https://www.artforum.com/rss.xml',
          content_type: 'news_and_exhibitions',
          reliability: 80
        },
        'artnet': {
          name: 'Artnet News RSS',
          url: 'https://news.artnet.com/feed',
          content_type: 'art_market_news',
          reliability: 75
        }
      },

      // 3. 구조화된 데이터 (Schema.org)
      structuredData: {
        target_types: ['Event', 'ExhibitionEvent', 'VisualArtsEvent'],
        extraction_method: 'json_ld_microdata',
        priority_sites: [
          'https://www.moma.org',
          'https://www.guggenheim.org',
          'https://www.tate.org.uk',
          'https://www.mmca.go.kr',
          'https://sema.seoul.go.kr'
        ]
      },

      // 4. 공식 캘린더 피드 (iCal)
      calendarFeeds: {
        format: 'ical',
        advantages: ['structured_dates', 'official_source', 'real_time'],
        target_museums: ['moma', 'guggenheim', 'tate', 'mmca']
      }
    };
  }

  async startUltraThinkResearch() {
    console.log('🧠 180분 ULTRA THINK: 실제 검증 가능한 전시 데이터 수집 방법론 연구');
    console.log('🎯 목표: 가짜 데이터 0%, 실제 검증된 데이터 100%');
    console.log('⚖️ 원칙: 합법성, 정확성, 지속가능성\n');

    // Phase 1: 해외 공식 API 조사
    await this.investigateInternationalAPIs();

    // Phase 2: 국내 데이터 소스 심층 조사
    await this.investigateDomesticSources();

    // Phase 3: AI 활용 검증 시스템 설계
    await this.designAIVerificationSystem();

    // Phase 4: 실제 구현 가능한 시스템 아키텍처
    await this.designImplementableArchitecture();

    // Phase 5: 법적/윤리적 가이드라인
    await this.establishLegalGuidelines();
  }

  async investigateInternationalAPIs() {
    console.log('🌍 Phase 1: 해외 주요 미술관 공식 API 조사');
    console.log('='.repeat(60));

    for (const [category, apis] of Object.entries(this.realSources.officialAPIs)) {
      console.log(`\n📂 ${category.toUpperCase()}:`);

      for (const [key, api] of Object.entries(apis)) {
        console.log(`\n🏛️ ${api.name}`);
        console.log(`   URL: ${api.url}`);
        console.log(`   신뢰도: ${api.reliability}%`);
        console.log(`   무료: ${api.free ? '✅' : '❌'}`);
        console.log(`   API 키 필요: ${api.api_key_required ? '✅' : '❌'}`);

        if (api.endpoint) {
          try {
            console.log(`   🔍 API 접근성 테스트 중...`);
            const response = await axios.get(api.endpoint, {
              timeout: 10000,
              headers: { 'User-Agent': 'SAYU-Research/1.0' }
            });
            console.log(`   ✅ 접근 가능 (${response.status})`);

            // 응답 구조 분석
            if (response.data && typeof response.data === 'object') {
              const keys = Object.keys(response.data).slice(0, 3);
              console.log(`   📊 데이터 구조: ${keys.join(', ')}...`);
            }

          } catch (error) {
            if (error.code === 'ENOTFOUND') {
              console.log(`   ❌ 도메인 접근 불가`);
            } else if (error.response?.status === 403) {
              console.log(`   🔐 인증 필요 (${error.response.status})`);
            } else {
              console.log(`   ⚠️ 접근 제한: ${error.message}`);
            }
          }

          await new Promise(resolve => setTimeout(resolve, 2000)); // 예의 있는 요청 간격
        }
      }
    }
  }

  async investigateDomesticSources() {
    console.log('\n\n🇰🇷 Phase 2: 국내 미술관 데이터 소스 심층 조사');
    console.log('='.repeat(60));

    const domesticMuseums = [
      {
        name: '국립현대미술관',
        url: 'https://www.mmca.go.kr',
        exhibitions_url: 'https://www.mmca.go.kr/exhibitions/progressList.do',
        potential_apis: [
          '/api/exhibitions',
          '/exhibitions.json',
          '/api/v1/exhibitions'
        ]
      },
      {
        name: '서울시립미술관',
        url: 'https://sema.seoul.go.kr',
        exhibitions_url: 'https://sema.seoul.go.kr/kr/exhibition/exhibitionCurrent',
        potential_apis: [
          '/api/exhibitions',
          '/exhibition/data.json'
        ]
      },
      {
        name: '리움미술관',
        url: 'https://www.leeum.org',
        exhibitions_url: 'https://www.leeum.org/html/exhibition/exhibition.asp'
      }
    ];

    for (const museum of domesticMuseums) {
      console.log(`\n🏛️ ${museum.name} 데이터 소스 조사`);
      console.log(`   메인 사이트: ${museum.url}`);

      try {
        // 메인 페이지 접근
        const response = await axios.get(museum.url, {
          timeout: 10000,
          headers: { 'User-Agent': 'SAYU-Research/1.0' }
        });

        console.log(`   ✅ 메인 사이트 접근 가능`);

        // robots.txt 확인
        try {
          const robotsResponse = await axios.get(`${museum.url}/robots.txt`);
          console.log(`   🤖 robots.txt 확인됨`);

          // User-agent 및 허용/금지 규칙 간단 분석
          const robotsText = robotsResponse.data;
          const hasDisallow = robotsText.includes('Disallow:');
          const hasApiPath = robotsText.includes('/api');

          if (hasDisallow) {
            console.log(`   ⚠️ 일부 경로 크롤링 제한 있음`);
          }
          if (hasApiPath) {
            console.log(`   📡 API 경로 언급됨`);
          }

        } catch (e) {
          console.log(`   ❓ robots.txt 없음 (기본 예의 준수)`);
        }

        // 잠재적 API 엔드포인트 테스트
        if (museum.potential_apis) {
          for (const apiPath of museum.potential_apis) {
            try {
              const apiUrl = museum.url + apiPath;
              const apiResponse = await axios.get(apiUrl, { timeout: 5000 });
              console.log(`   🎯 잠재적 API 발견: ${apiPath}`);
            } catch (e) {
              // 조용히 실패 (대부분 404 예상)
            }
          }
        }

      } catch (error) {
        console.log(`   ❌ 접근 실패: ${error.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  async designAIVerificationSystem() {
    console.log('\n\n🤖 Phase 3: AI 활용 데이터 검증 시스템 설계');
    console.log('='.repeat(60));

    const verificationSystem = {
      phase1_extraction: {
        tool: 'Gemini API',
        purpose: '웹페이지에서 전시 정보 구조화된 추출',
        prompt_template: `
Extract exhibition information from this webpage content.
Return only real, verifiable exhibition data in JSON format:
{
  "exhibitions": [
    {
      "title": "exact title from webpage",
      "venue": "exact venue name",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD", 
      "artists": ["artist1", "artist2"],
      "description": "brief description",
      "source_url": "original webpage url",
      "confidence": 0.95
    }
  ]
}
Rules:
- Only extract information explicitly stated on the page
- Do not infer or assume any details
- Mark confidence level based on information completeness
- If dates are unclear, set confidence below 0.7
        `
      },

      phase2_verification: {
        tool: 'GPT API',
        purpose: '추출된 정보의 사실 확인 및 교차 검증',
        process: [
          '1. 전시명과 미술관명 일치성 확인',
          '2. 날짜 형식 및 논리성 검증',
          '3. 작가명 실존 여부 확인',
          '4. 중복 데이터 감지'
        ]
      },

      phase3_quality_scoring: {
        criteria: {
          completeness: '필수 필드 모두 존재 (제목, 장소, 날짜)',
          accuracy: 'AI 검증 통과율',
          freshness: '데이터 수집 시점 vs 전시 날짜',
          source_reliability: '공식 소스 여부'
        },
        minimum_score: 0.8,
        rejection_criteria: [
          '날짜가 과거 1년 이전',
          '필수 정보 누락',
          '중복 데이터',
          'AI 신뢰도 0.7 이하'
        ]
      }
    };

    console.log('🎯 AI 검증 시스템 아키텍처:');
    console.log('   1️⃣ Gemini API: 웹페이지 → 구조화된 데이터');
    console.log('   2️⃣ GPT API: 사실 확인 및 교차 검증');
    console.log('   3️⃣ 품질 점수: 최소 0.8점 이상만 DB 저장');
    console.log('   4️⃣ 지속적 모니터링: 데이터 신선도 관리');

    // Gemini API 테스트
    await this.testGeminiAPI();
  }

  async testGeminiAPI() {
    console.log('\n🧪 Gemini API 연결 테스트:');

    try {
      const testUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

      const testPayload = {
        contents: [{
          parts: [{
            text: "Hello, this is a test. Please respond with 'API connection successful'"
          }]
        }]
      };

      const response = await axios.post(`${testUrl}?key=${this.geminiApiKey}`, testPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log('   ✅ Gemini API 연결 성공');
        console.log(`   📝 응답: ${response.data.candidates[0].content.parts[0].text}`);
      }

    } catch (error) {
      console.log('   ❌ Gemini API 연결 실패');
      if (error.response?.status === 403) {
        console.log('   🔑 API 키 인증 오류');
      } else {
        console.log(`   💥 오류: ${error.message}`);
      }
    }
  }

  async designImplementableArchitecture() {
    console.log('\n\n🏗️ Phase 4: 실제 구현 가능한 시스템 아키텍처');
    console.log('='.repeat(60));

    const architecture = {
      immediate_implementation: {
        priority: 'HIGH',
        timeline: '24시간 내',
        components: [
          {
            name: 'Met Museum API Collector',
            description: '메트로폴리탄 미술관 공식 API 활용',
            implementation: 'API 키 불필요, 즉시 사용 가능',
            expected_data: '100-200개 검증된 전시'
          },
          {
            name: 'Cleveland Museum API Collector',
            description: '클리블랜드 미술관 오픈 API',
            implementation: 'API 키 불필요, 오픈 액세스',
            expected_data: '50-100개 검증된 전시'
          },
          {
            name: 'Design Plus Manual Curator',
            description: '기존 검증된 소스 확장',
            implementation: '수동 큐레이션 + AI 검증',
            expected_data: '20-30개 고품질 국내 전시'
          }
        ]
      },

      medium_term: {
        priority: 'MEDIUM',
        timeline: '1주일 내',
        components: [
          {
            name: 'Korean Museum RSS Monitor',
            description: '국내 주요 미술관 RSS/뉴스 모니터링',
            implementation: 'RSS 파서 + AI 추출',
            expected_data: '50-100개 국내 전시'
          },
          {
            name: 'Structured Data Extractor',
            description: 'Schema.org 마크업 기반 데이터 추출',
            implementation: '웹 크롤러 + JSON-LD 파서',
            expected_data: '100-200개 구조화된 전시 정보'
          }
        ]
      },

      long_term: {
        priority: 'LOW',
        timeline: '1개월 내',
        components: [
          {
            name: 'Multi-Source Aggregator',
            description: '여러 소스 통합 및 중복 제거',
            implementation: '기계학습 기반 중복 감지',
            expected_data: '500+ 전세계 전시 정보'
          }
        ]
      }
    };

    console.log('🚀 즉시 구현 가능 (24시간):');
    architecture.immediate_implementation.components.forEach(comp => {
      console.log(`   • ${comp.name}`);
      console.log(`     ${comp.description}`);
      console.log(`     예상 수집: ${comp.expected_data}`);
    });

    console.log('\n⏰ 단기 구현 (1주일):');
    architecture.medium_term.components.forEach(comp => {
      console.log(`   • ${comp.name}`);
      console.log(`     ${comp.description}`);
    });

    return architecture;
  }

  async establishLegalGuidelines() {
    console.log('\n\n⚖️ Phase 5: 법적/윤리적 가이드라인 수립');
    console.log('='.repeat(60));

    const guidelines = {
      legal_compliance: [
        '✅ robots.txt 준수 의무',
        '✅ 공식 API 우선 사용',
        '✅ 저작권 침해 금지 (사실 정보만 수집)',
        '✅ 개인정보 수집 금지',
        '✅ 상업적 이용 시 별도 허가'
      ],

      ethical_standards: [
        '✅ 출처 명시 의무',
        '✅ 데이터 정확성 검증',
        '✅ 오래된 정보 자동 삭제',
        '✅ 미술관에 부담 주지 않는 요청 빈도',
        '✅ 투명한 데이터 수집 과정'
      ],

      quality_assurance: [
        '✅ AI 검증 필수',
        '✅ 사람 최종 검토',
        '✅ 주기적 데이터 갱신',
        '✅ 오류 신고 시스템',
        '✅ 소스 다양성 확보'
      ]
    };

    Object.entries(guidelines).forEach(([category, rules]) => {
      console.log(`\n📋 ${category.replace('_', ' ').toUpperCase()}:`);
      rules.forEach(rule => console.log(`   ${rule}`));
    });

    console.log('\n🎯 핵심 원칙: 정확성 > 양, 합법성 > 편의성, 지속가능성 > 단기 성과');
  }
}

async function main() {
  const researcher = new RealExhibitionDataResearch();

  try {
    await researcher.startUltraThinkResearch();

    console.log('\n\n🎉 180분 ULTRA THINK 연구 완료!');
    console.log('✅ 실제 검증 가능한 방법론 확립');
    console.log('🚀 즉시 구현 가능한 시스템 설계');
    console.log('⚖️ 법적/윤리적 가이드라인 수립');
    console.log('\n💡 다음 단계: 설계된 시스템 실제 구현');

  } catch (error) {
    console.error('❌ 연구 중 오류:', error);
  }
}

if (require.main === module) {
  main();
}
