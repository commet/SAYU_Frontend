const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 아티스트 지식 수집기 - 다중 소스 통합
class ArtistKnowledgeCollector {
  constructor() {
    this.sources = {
      wikipedia: 'https://en.wikipedia.org/api/rest_v1',
      wikidata: 'https://www.wikidata.org/w/api.php',
      googleKG: 'https://kgsearch.googleapis.com/v1/entities:search',
      metMuseum: 'https://collectionapi.metmuseum.org/public/collection/v1',
      artInstitute: 'https://api.artic.edu/api/v1'
    };
    
    this.cache = new Map();
    this.requestHistory = [];
    this.rateLimits = {
      wikipedia: { limit: 500, window: 3600000, requests: [] },
      wikidata: { limit: 500, window: 3600000, requests: [] },
      googleKG: { limit: 100, window: 86400000, requests: [] }
    };
  }

  // 속도 제한 확인
  checkRateLimit(source) {
    const now = Date.now();
    const rateLimit = this.rateLimits[source];
    
    if (!rateLimit) return true;
    
    // 윈도우 밖의 요청 제거
    rateLimit.requests = rateLimit.requests.filter(
      time => now - time < rateLimit.window
    );
    
    return rateLimit.requests.length < rateLimit.limit;
  }

  // 요청 기록
  recordRequest(source) {
    if (this.rateLimits[source]) {
      this.rateLimits[source].requests.push(Date.now());
    }
  }

  // 캐시된 데이터 확인
  getCachedData(key) {
    return this.cache.get(key);
  }

  // 캐시에 데이터 저장
  setCachedData(key, data, ttl = 3600000) { // 1시간 기본 TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Wikipedia 데이터 수집
  async getWikipediaData(artistName, language = 'en') {
    const cacheKey = `wikipedia_${language}_${artistName}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    if (!this.checkRateLimit('wikipedia')) {
      console.log('⚠️  Wikipedia rate limit reached');
      return null;
    }

    try {
      this.recordRequest('wikipedia');
      
      // 검색 API로 정확한 타이틀 찾기 (새로운 API 엔드포인트)
      const searchUrl = `https://${language}.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(artistName)}&srlimit=5`;
      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'SAYU-Art-Platform/1.0 (educational-research)'
        }
      });

      if (!searchResponse.data.query || !searchResponse.data.query.search || searchResponse.data.query.search.length === 0) {
        return null;
      }

      const pageTitle = searchResponse.data.query.search[0].title;
      
      // 페이지 내용 가져오기
      const contentUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
      const contentResponse = await axios.get(contentUrl, {
        headers: {
          'User-Agent': 'SAYU-Art-Platform/1.0 (educational-research)'
        }
      });

      const result = {
        title: contentResponse.data.title,
        extract: contentResponse.data.extract,
        description: contentResponse.data.description,
        birthDate: this.extractBirthDate(contentResponse.data.extract),
        deathDate: this.extractDeathDate(contentResponse.data.extract),
        nationality: this.extractNationality(contentResponse.data.extract),
        pageUrl: contentResponse.data.content_urls?.desktop?.page,
        imageUrl: contentResponse.data.thumbnail?.source,
        language: language,
        source: 'wikipedia'
      };

      this.setCachedData(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error(`Wikipedia API error for ${artistName}:`, error.message);
      return null;
    }
  }

  // Wikidata 구조화된 데이터 수집
  async getWikidataData(artistName) {
    const cacheKey = `wikidata_${artistName}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    if (!this.checkRateLimit('wikidata')) {
      console.log('⚠️  Wikidata rate limit reached');
      return null;
    }

    try {
      this.recordRequest('wikidata');
      
      // 엔티티 검색
      const searchUrl = `${this.sources.wikidata}?action=wbsearchentities&search=${encodeURIComponent(artistName)}&language=en&format=json`;
      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'SAYU-Art-Platform/1.0 (educational-research)'
        }
      });

      if (!searchResponse.data.search || searchResponse.data.search.length === 0) {
        return null;
      }

      const entityId = searchResponse.data.search[0].id;
      
      // 엔티티 상세 정보 가져오기
      const entityUrl = `${this.sources.wikidata}?action=wbgetentities&ids=${entityId}&format=json`;
      const entityResponse = await axios.get(entityUrl, {
        headers: {
          'User-Agent': 'SAYU-Art-Platform/1.0 (educational-research)'
        }
      });

      const entity = entityResponse.data.entities[entityId];
      
      const result = {
        wikidataId: entityId,
        labels: entity.labels,
        descriptions: entity.descriptions,
        claims: this.parseWikidataClaims(entity.claims),
        sitelinks: entity.sitelinks,
        source: 'wikidata'
      };

      this.setCachedData(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error(`Wikidata API error for ${artistName}:`, error.message);
      return null;
    }
  }

  // Google Knowledge Graph 데이터 수집
  async getGoogleKnowledgeGraph(artistName) {
    if (!process.env.GOOGLE_API_KEY) {
      console.log('⚠️  Google API key not configured');
      return null;
    }

    const cacheKey = `google_kg_${artistName}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    if (!this.checkRateLimit('googleKG')) {
      console.log('⚠️  Google Knowledge Graph rate limit reached');
      return null;
    }

    try {
      this.recordRequest('googleKG');
      
      const url = `${this.sources.googleKG}?query=${encodeURIComponent(artistName)}&key=${process.env.GOOGLE_API_KEY}&limit=1&indent=True`;
      const response = await axios.get(url);

      if (!response.data.itemListElement || response.data.itemListElement.length === 0) {
        return null;
      }

      const result = response.data.itemListElement[0].result;
      
      const parsedResult = {
        name: result.name,
        description: result.description,
        detailedDescription: result.detailedDescription,
        url: result.url,
        types: result['@type'],
        source: 'google_knowledge_graph'
      };

      this.setCachedData(cacheKey, parsedResult);
      return parsedResult;
      
    } catch (error) {
      console.error(`Google Knowledge Graph API error for ${artistName}:`, error.message);
      return null;
    }
  }

  // 아티스트 통합 정보 수집
  async getArtistKnowledge(artistName, options = {}) {
    const {
      languages = ['en', 'ko'],
      includeArtworks = true,
      includeMovements = true
    } = options;

    console.log(`🔍 "${artistName}" 지식 수집 시작...`);

    const results = {
      artist: artistName,
      timestamp: new Date().toISOString(),
      sources: {},
      consolidated: {}
    };

    // 병렬로 모든 소스에서 데이터 수집
    const promises = [];

    // Wikipedia (다국어)
    for (const lang of languages) {
      promises.push(
        this.getWikipediaData(artistName, lang)
          .then(data => ({ source: `wikipedia_${lang}`, data }))
      );
    }

    // Wikidata
    promises.push(
      this.getWikidataData(artistName)
        .then(data => ({ source: 'wikidata', data }))
    );

    // Google Knowledge Graph
    promises.push(
      this.getGoogleKnowledgeGraph(artistName)
        .then(data => ({ source: 'google_kg', data }))
    );

    // 모든 API 호출 완료 대기
    const settledPromises = await Promise.allSettled(promises);

    // 결과 정리
    settledPromises.forEach(promise => {
      if (promise.status === 'fulfilled' && promise.value.data) {
        results.sources[promise.value.source] = promise.value.data;
      }
    });

    // 데이터 통합
    results.consolidated = this.consolidateArtistData(results.sources);

    console.log(`✅ "${artistName}" 지식 수집 완료 (${Object.keys(results.sources).length}개 소스)`);
    return results;
  }

  // 데이터 통합 및 정제
  consolidateArtistData(sources) {
    const consolidated = {
      names: {},
      descriptions: {},
      dates: {},
      biographical: {},
      artworks: [],
      movements: [],
      images: [],
      sources: Object.keys(sources)
    };

    // Wikipedia 데이터 통합
    Object.entries(sources).forEach(([key, data]) => {
      if (key.startsWith('wikipedia_')) {
        const lang = key.split('_')[1];
        consolidated.names[lang] = data.title;
        consolidated.descriptions[lang] = data.extract;
        
        if (data.birthDate) consolidated.dates.birth = data.birthDate;
        if (data.deathDate) consolidated.dates.death = data.deathDate;
        if (data.nationality) consolidated.biographical.nationality = data.nationality;
        if (data.imageUrl) consolidated.images.push(data.imageUrl);
      }
    });

    // Wikidata 구조화된 데이터 통합
    if (sources.wikidata) {
      const claims = sources.wikidata.claims;
      
      // 생년월일 (P569)
      if (claims.P569) {
        consolidated.dates.birth = this.parseWikidataDate(claims.P569[0]);
      }
      
      // 사망년월일 (P570)
      if (claims.P570) {
        consolidated.dates.death = this.parseWikidataDate(claims.P570[0]);
      }
      
      // 국적 (P27)
      if (claims.P27) {
        consolidated.biographical.nationality = claims.P27[0];
      }
      
      // 직업 (P106)
      if (claims.P106) {
        consolidated.biographical.occupations = claims.P106;
      }
      
      // 예술 운동 (P135)
      if (claims.P135) {
        consolidated.movements = claims.P135;
      }
    }

    // Google Knowledge Graph 데이터 통합
    if (sources.google_kg) {
      consolidated.names.google = sources.google_kg.name;
      consolidated.descriptions.google = sources.google_kg.description;
      
      if (sources.google_kg.detailedDescription) {
        consolidated.descriptions.detailed = sources.google_kg.detailedDescription.articleBody;
      }
    }

    return consolidated;
  }

  // 유틸리티 메서드들
  extractBirthDate(text) {
    const birthPatterns = [
      /born\s+(\d{1,2}\s+\w+\s+\d{4})/i,
      /born\s+(\d{4})/i,
      /\((\d{4})[–-]/
    ];
    
    for (const pattern of birthPatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  extractDeathDate(text) {
    const deathPatterns = [
      /died\s+(\d{1,2}\s+\w+\s+\d{4})/i,
      /died\s+(\d{4})/i,
      /[–-](\d{4})\)/
    ];
    
    for (const pattern of deathPatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  extractNationality(text) {
    const nationalityPatterns = [
      /was\s+an?\s+(\w+)\s+/i,
      /(\w+)\s+artist/i,
      /(\w+)\s+painter/i
    ];
    
    for (const pattern of nationalityPatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  parseWikidataClaims(claims) {
    const parsed = {};
    
    Object.entries(claims).forEach(([property, values]) => {
      parsed[property] = values.map(value => {
        if (value.mainsnak && value.mainsnak.datavalue) {
          return value.mainsnak.datavalue.value;
        }
        return null;
      }).filter(Boolean);
    });
    
    return parsed;
  }

  parseWikidataDate(claim) {
    if (claim.mainsnak && claim.mainsnak.datavalue) {
      const value = claim.mainsnak.datavalue.value;
      if (value.time) {
        return value.time.substring(1, 11); // +1834-01-01 -> 1834-01-01
      }
    }
    return null;
  }

  // 결과 저장
  async saveKnowledgeData(artistData, filename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = './artist-knowledge-data';
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputFile = path.join(outputDir, `${filename}-${timestamp}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(artistData, null, 2));
    
    console.log(`💾 지식 데이터 저장: ${outputFile}`);
    return outputFile;
  }

  // 배치 아티스트 처리
  async processArtistBatch(artistList, options = {}) {
    console.log(`🚀 ${artistList.length}명의 아티스트 지식 수집 시작...\n`);
    
    const results = [];
    const batchSize = options.batchSize || 5;
    const delay = options.delay || 2000;

    for (let i = 0; i < artistList.length; i += batchSize) {
      const batch = artistList.slice(i, i + batchSize);
      
      console.log(`📦 배치 ${Math.floor(i / batchSize) + 1}/${Math.ceil(artistList.length / batchSize)} 처리 중...`);
      
      const batchPromises = batch.map(artist => 
        this.getArtistKnowledge(artist, options)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`❌ ${batch[index]} 처리 실패:`, result.reason);
        }
      });
      
      // 다음 배치 전에 대기
      if (i + batchSize < artistList.length) {
        console.log(`⏳ ${delay}ms 대기 중...\n`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // 통합 결과 저장
    await this.saveKnowledgeData({
      metadata: {
        totalArtists: artistList.length,
        processedArtists: results.length,
        timestamp: new Date().toISOString(),
        options
      },
      artists: results
    }, 'artist-knowledge-batch');

    console.log(`\n✨ 배치 처리 완료: ${results.length}/${artistList.length} 성공`);
    return results;
  }
}

// 테스트 실행
async function testArtistKnowledge() {
  const collector = new ArtistKnowledgeCollector();
  
  // 테스트 아티스트 목록 (다양한 국적)
  const testArtists = [
    'Vincent van Gogh',
    'Claude Monet', 
    'Pablo Picasso',
    'Nam June Paik',
    'Do Ho Suh',
    'Yayoi Kusama',
    'Ai Weiwei'
  ];

  try {
    const results = await collector.processArtistBatch(testArtists, {
      languages: ['en', 'ko'],
      batchSize: 3,
      delay: 3000
    });
    
    console.log('\n📊 수집 결과 요약:');
    results.forEach(result => {
      const sourcesCount = Object.keys(result.sources).length;
      console.log(`  - ${result.artist}: ${sourcesCount}개 소스`);
    });
    
  } catch (error) {
    console.error('테스트 실행 오류:', error);
  }
}

// 실행
if (require.main === module) {
  testArtistKnowledge();
}

module.exports = { ArtistKnowledgeCollector };