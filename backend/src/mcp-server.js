#!/usr/bin/env node

// SAYU MCP Server - AI가 SAYU 기능을 직접 사용할 수 있게 함
// Claude, GPT 등이 이 서버를 통해 SAYU 데이터에 접근 가능

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

class SAYUMCPServer {
  constructor() {
    this.server = new Server({
      name: 'sayu-art-personality',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {},
        resources: {}
      }
    });

    this.setupTools();
    this.setupResources();
  }

  setupTools() {
    // 도구 목록 제공
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'get_personality_types',
            description: 'Get all SAYU personality types with descriptions',
            inputSchema: {
              type: 'object',
              properties: {
                language: {
                  type: 'string',
                  description: 'Language for descriptions (en, ko)',
                  default: 'en'
                }
              }
            }
          },
          {
            name: 'analyze_art_personality',
            description: 'Analyze art personality based on user responses',
            inputSchema: {
              type: 'object',
              properties: {
                responses: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'User responses to art preference questions'
                },
                detail_level: {
                  type: 'string',
                  enum: ['basic', 'detailed'],
                  default: 'basic',
                  description: 'Level of analysis detail'
                }
              },
              required: ['responses']
            }
          },
          {
            name: 'recommend_artworks',
            description: 'Get artwork recommendations based on personality type',
            inputSchema: {
              type: 'object',
              properties: {
                personality_type: {
                  type: 'string',
                  description: 'SAYU personality type (VISIONARY, EXPLORER, etc.)'
                },
                preferences: {
                  type: 'object',
                  description: 'Additional preferences like period, style, etc.'
                },
                limit: {
                  type: 'number',
                  default: 5,
                  description: 'Number of recommendations to return'
                }
              },
              required: ['personality_type']
            }
          }
        ]
      };
    });

    // 도구 실행 핸들러
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'get_personality_types':
          return await this.getPersonalityTypes(args);

        case 'analyze_art_personality':
          return await this.analyzePersonality(args);

        case 'recommend_artworks':
          return await this.recommendArtworks(args);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  setupResources() {
    // 리소스 목록 제공
    this.server.setRequestHandler('resources/list', async () => {
      return {
        resources: [
          {
            uri: 'sayu://personality-database',
            name: 'SAYU Personality Database',
            description: 'Complete personality type information and traits',
            mimeType: 'application/json'
          },
          {
            uri: 'sayu://art-collection',
            name: 'Curated Art Collection',
            description: 'SAYU\'s curated collection of artworks with personality mappings',
            mimeType: 'application/json'
          }
        ]
      };
    });

    // 리소스 읽기 핸들러
    this.server.setRequestHandler('resources/read', async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'sayu://personality-database':
          return await this.getPersonalityDatabase();

        case 'sayu://art-collection':
          return await this.getArtCollection();

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  // 도구 구현
  async getPersonalityTypes(args) {
    const { language = 'en' } = args || {};

    const types = {
      'VISIONARY': {
        name: language === 'ko' ? '비전가' : 'Visionary',
        description: language === 'ko'
          ? '예술을 변혁적 힘으로 보는 큰 그림을 그리는 사상가'
          : 'Big picture thinker who sees art as transformative',
        traits: language === 'ko'
          ? ['혁신적', '추상적', '미래지향적']
          : ['innovative', 'abstract', 'future-focused'],
        artPreferences: ['contemporary', 'conceptual', 'experimental'],
        matches: language === 'ko'
          ? '현대미술, 개념미술, 실험적 작품'
          : 'Contemporary art, conceptual pieces, experimental works'
      },
      'EXPLORER': {
        name: language === 'ko' ? '탐험가' : 'Explorer',
        description: language === 'ko'
          ? '새로운 예술적 영역을 찾는 모험적 정신'
          : 'Adventurous spirit seeking new artistic frontiers',
        traits: language === 'ko'
          ? ['호기심많은', '실험적', '다양한']
          : ['curious', 'experimental', 'diverse'],
        artPreferences: ['mixed-media', 'global-art', 'emerging-artists'],
        matches: language === 'ko'
          ? '믹스미디어, 세계 각국 예술, 신진 작가'
          : 'Mixed media, global art, emerging artists'
      },
      'CURATOR': {
        name: language === 'ko' ? '큐레이터' : 'Curator',
        description: language === 'ko'
          ? '세련된 미적 감각을 가진 사려깊은 수집가'
          : 'Thoughtful collector with refined aesthetic sense',
        traits: language === 'ko'
          ? ['분석적', '세부지향적', '품질중시']
          : ['analytical', 'detail-oriented', 'quality-focused'],
        artPreferences: ['classical', 'museum-quality', 'well-established'],
        matches: language === 'ko'
          ? '고전미술, 박물관급 작품, 확립된 거장들'
          : 'Classical art, museum-quality pieces, established masters'
      },
      'SOCIAL': {
        name: language === 'ko' ? '소셜' : 'Social',
        description: language === 'ko'
          ? '공유하기를 좋아하는 공동체 중심의 예술 애호가'
          : 'Community-minded art enthusiast who loves sharing',
        traits: language === 'ko'
          ? ['협력적', '소통지향적', '트렌드인식']
          : ['collaborative', 'communicative', 'trend-aware'],
        artPreferences: ['popular', 'shareable', 'socially-relevant'],
        matches: language === 'ko'
          ? '인기작품, 공유가능한 작품, 사회적 관련성'
          : 'Popular works, shareable pieces, socially relevant art'
      }
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          data: types,
          language,
          note: 'SAYU의 16가지 성격 유형 중 주요 4가지 타입'
        }, null, 2)
      }]
    };
  }

  async analyzePersonality(args) {
    const { responses, detail_level = 'basic' } = args;

    if (!responses || responses.length < 2) {
      throw new Error('최소 2개의 응답이 필요합니다');
    }

    // 간단한 분석 로직 (실제로는 더 정교한 알고리즘 사용)
    const scores = { VISIONARY: 0, EXPLORER: 0, CURATOR: 0, SOCIAL: 0 };

    responses.forEach(response => {
      const lower = response.toLowerCase();

      // 키워드 기반 점수 계산
      if (lower.includes('새로운') || lower.includes('혁신') || lower.includes('미래') ||
          lower.includes('innovative') || lower.includes('future') || lower.includes('new')) {
        scores.VISIONARY += 2;
      }

      if (lower.includes('다양한') || lower.includes('탐험') || lower.includes('모험') ||
          lower.includes('diverse') || lower.includes('explore') || lower.includes('adventure')) {
        scores.EXPLORER += 2;
      }

      if (lower.includes('품질') || lower.includes('전통') || lower.includes('클래식') ||
          lower.includes('quality') || lower.includes('traditional') || lower.includes('classic')) {
        scores.CURATOR += 2;
      }

      if (lower.includes('공유') || lower.includes('사람들') || lower.includes('함께') ||
          lower.includes('share') || lower.includes('people') || lower.includes('social')) {
        scores.SOCIAL += 2;
      }
    });

    // 가장 높은 점수의 타입 선택
    const primaryType = Object.entries(scores).reduce((a, b) => (scores[a[0]] > scores[b[0]] ? a : b))[0];
    const confidence = Math.round((scores[primaryType] / (responses.length * 2)) * 100);

    const result = {
      success: true,
      analysis: {
        primaryType,
        confidence: Math.min(confidence, 95), // 최대 95%
        scores,
        responses_analyzed: responses.length
      }
    };

    if (detail_level === 'detailed') {
      result.analysis.detailed_insights = {
        strengths: this.getTypeStrengths(primaryType),
        recommendations: this.getTypeRecommendations(primaryType),
        similar_types: this.getSimilarTypes(primaryType)
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  async recommendArtworks(args) {
    const { personality_type, preferences = {}, limit = 5 } = args;

    // 성격 유형별 추천 로직
    const recommendations = this.getArtworksByType(personality_type, limit);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          personality_type,
          recommendations,
          total: recommendations.length,
          note: 'SAYU의 AI 추천 시스템 기반'
        }, null, 2)
      }]
    };
  }

  // 헬퍼 메서드들
  getTypeStrengths(type) {
    const strengths = {
      VISIONARY: ['창의적 사고', '미래 지향적', '혁신적 접근'],
      EXPLORER: ['호기심', '개방성', '다양성 추구'],
      CURATOR: ['품질 인식', '세부 주의', '심미안'],
      SOCIAL: ['소통 능력', '공감대 형성', '트렌드 파악']
    };
    return strengths[type] || [];
  }

  getTypeRecommendations(type) {
    const recommendations = {
      VISIONARY: ['현대미술관 방문', '아트페어 참관', '실험적 전시 탐방'],
      EXPLORER: ['세계 각국 미술 탐방', '신진 작가 발굴', '다양한 매체 체험'],
      CURATOR: ['고전 거장 작품 감상', '박물관 컬렉션 연구', '아트 히스토리 학습'],
      SOCIAL: ['아트 커뮤니티 참여', '전시 관련 토론', '작품 공유 활동']
    };
    return recommendations[type] || [];
  }

  getSimilarTypes(type) {
    const similar = {
      VISIONARY: ['EXPLORER', 'CURATOR'],
      EXPLORER: ['VISIONARY', 'SOCIAL'],
      CURATOR: ['VISIONARY', 'SOCIAL'],
      SOCIAL: ['EXPLORER', 'CURATOR']
    };
    return similar[type] || [];
  }

  getArtworksByType(type, limit) {
    // 실제로는 데이터베이스에서 가져옴
    const artworkDatabase = {
      VISIONARY: [
        { title: 'Untitled (Perfect Lovers)', artist: 'Felix Gonzalez-Torres', year: 1991, style: 'Contemporary' },
        { title: 'One & Three Chairs', artist: 'Joseph Kosuth', year: 1965, style: 'Conceptual' },
        { title: 'The Physical Impossibility of Death', artist: 'Damien Hirst', year: 1991, style: 'Contemporary' }
      ],
      EXPLORER: [
        { title: 'Guernica', artist: 'Pablo Picasso', year: 1937, style: 'Cubism' },
        { title: 'The Great Wave', artist: 'Hokusai', year: 1831, style: 'Japanese Woodblock' },
        { title: "Campbell's Soup Cans", artist: 'Andy Warhol', year: 1962, style: 'Pop Art' }
      ],
      CURATOR: [
        { title: 'Mona Lisa', artist: 'Leonardo da Vinci', year: 1503, style: 'Renaissance' },
        { title: 'The Starry Night', artist: 'Vincent van Gogh', year: 1889, style: 'Post-Impressionism' },
        { title: 'Girl with a Pearl Earring', artist: 'Johannes Vermeer', year: 1665, style: 'Baroque' }
      ],
      SOCIAL: [
        { title: 'American Gothic', artist: 'Grant Wood', year: 1930, style: 'American Regionalism' },
        { title: 'The Kiss', artist: 'Gustav Klimt', year: 1908, style: 'Art Nouveau' },
        { title: 'The Persistence of Memory', artist: 'Salvador Dalí', year: 1931, style: 'Surrealism' }
      ]
    };

    return (artworkDatabase[type] || []).slice(0, limit);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('SAYU MCP Server running...');
  }
}

// 서버 실행
if (require.main === module) {
  const server = new SAYUMCPServer();
  server.run().catch(console.error);
}

module.exports = SAYUMCPServer;
