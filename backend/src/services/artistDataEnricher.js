// Artist Data Enricher - 외부 소스에서 작가 정보 수집

const axios = require('axios');
const cheerio = require('cheerio');

class ArtistDataEnricher {
  constructor() {
    this.sources = {
      artnet: 'https://www.artnet.com/artists/',
      metmuseum: 'https://www.metmuseum.org/art/collection/search',
      arthistory: 'http://arthistoryresources.net/ARTHLinks.html',
      wikipedia: 'https://en.wikipedia.org/wiki/'
    };
    
    this.cache = new Map();
  }

  async enrichArtistData(artistName, existingData = {}) {
    console.log(`   🔍 외부 데이터 수집: ${artistName}`);
    
    // 캐시 확인
    if (this.cache.has(artistName)) {
      return this.cache.get(artistName);
    }
    
    const enrichedData = {
      ...existingData,
      name: artistName,
      sources: []
    };
    
    try {
      // 1. Wikipedia 검색
      const wikiData = await this.fetchWikipediaData(artistName);
      if (wikiData) {
        enrichedData.bio = enrichedData.bio || wikiData.summary;
        enrichedData.era = enrichedData.era || wikiData.era;
        enrichedData.movement = enrichedData.movement || wikiData.movement;
        enrichedData.nationality = enrichedData.nationality || wikiData.nationality;
        enrichedData.sources.push('wikipedia');
      }
      
      // 2. Artnet 정보 (시뮬레이션)
      const artnetData = await this.fetchArtnetData(artistName);
      if (artnetData) {
        enrichedData.exhibitions = artnetData.exhibitions;
        enrichedData.auctionRecords = artnetData.auctionRecords;
        enrichedData.ranking = artnetData.ranking;
        enrichedData.sources.push('artnet');
      }
      
      // 3. Met Museum 컬렉션
      const metData = await this.fetchMetMuseumData(artistName);
      if (metData) {
        enrichedData.worksInMet = metData.count;
        enrichedData.metDepartments = metData.departments;
        enrichedData.sources.push('metmuseum');
      }
      
      // 4. 추가 맥락 정보
      enrichedData.contextualInfo = this.generateContextualInfo(enrichedData);
      
      // 캐시 저장
      this.cache.set(artistName, enrichedData);
      
      return enrichedData;
      
    } catch (error) {
      console.error(`   ⚠️ 데이터 수집 오류: ${error.message}`);
      return enrichedData;
    }
  }

  async fetchWikipediaData(artistName) {
    try {
      // Wikipedia API 사용
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(artistName)}&limit=1&format=json`;
      const searchResponse = await axios.get(searchUrl);
      
      if (searchResponse.data[1].length === 0) {
        return null;
      }
      
      const pageTitle = searchResponse.data[1][0];
      const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json`;
      
      const pageResponse = await axios.get(pageUrl);
      const pages = pageResponse.data.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pageId === '-1') {
        return null;
      }
      
      const extract = pages[pageId].extract;
      
      // 정보 추출
      const data = {
        summary: extract.substring(0, 1000),
        era: this.extractEra(extract),
        movement: this.extractMovement(extract),
        nationality: this.extractNationality(extract)
      };
      
      return data;
      
    } catch (error) {
      console.error('Wikipedia 오류:', error.message);
      return null;
    }
  }

  async fetchArtnetData(artistName) {
    // 실제 크롤링 대신 시뮬레이션 (실제 구현시 puppeteer 필요)
    try {
      // 시뮬레이션된 데이터
      const simulatedData = {
        exhibitions: Math.floor(Math.random() * 50) + 10,
        auctionRecords: Math.floor(Math.random() * 100) + 20,
        ranking: Math.floor(Math.random() * 5000) + 100
      };
      
      // 유명 작가는 더 높은 수치
      if (artistName.match(/Picasso|Monet|Van Gogh|Warhol|Rembrandt/i)) {
        simulatedData.exhibitions *= 10;
        simulatedData.auctionRecords *= 20;
        simulatedData.ranking = Math.floor(Math.random() * 100) + 1;
      }
      
      return simulatedData;
      
    } catch (error) {
      return null;
    }
  }

  async fetchMetMuseumData(artistName) {
    try {
      // Met Museum API
      const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?artistOrCulture=true&q=${encodeURIComponent(artistName)}`;
      const response = await axios.get(searchUrl, { timeout: 5000 });
      
      if (!response.data.objectIDs || response.data.objectIDs.length === 0) {
        return null;
      }
      
      // 첫 몇 개 작품의 부서 정보 수집
      const departments = new Set();
      const sampleSize = Math.min(5, response.data.objectIDs.length);
      
      for (let i = 0; i < sampleSize; i++) {
        try {
          const objectUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${response.data.objectIDs[i]}`;
          const objectResponse = await axios.get(objectUrl, { timeout: 3000 });
          
          if (objectResponse.data.department) {
            departments.add(objectResponse.data.department);
          }
        } catch (err) {
          // 개별 오브젝트 오류 무시
        }
      }
      
      return {
        count: response.data.total || response.data.objectIDs.length,
        departments: Array.from(departments)
      };
      
    } catch (error) {
      return null;
    }
  }

  extractEra(text) {
    const eraPatterns = [
      { pattern: /Renaissance/i, era: 'Renaissance' },
      { pattern: /Baroque/i, era: 'Baroque' },
      { pattern: /Impressionist/i, era: 'Impressionism' },
      { pattern: /Post-Impressionist/i, era: 'Post-Impressionism' },
      { pattern: /Modern/i, era: 'Modern' },
      { pattern: /Contemporary/i, era: 'Contemporary' },
      { pattern: /Romantic/i, era: 'Romanticism' },
      { pattern: /Realist/i, era: 'Realism' },
      { pattern: /Abstract/i, era: 'Abstract' },
      { pattern: /Cubist/i, era: 'Cubism' },
      { pattern: /Surrealist/i, era: 'Surrealism' },
      { pattern: /Gothic/i, era: 'Gothic' },
      { pattern: /Medieval/i, era: 'Medieval' }
    ];
    
    for (const { pattern, era } of eraPatterns) {
      if (pattern.test(text)) {
        return era;
      }
    }
    
    return null;
  }

  extractMovement(text) {
    const movements = [
      'Impressionism', 'Post-Impressionism', 'Cubism', 'Surrealism',
      'Abstract Expressionism', 'Pop Art', 'Minimalism', 'Conceptual Art',
      'Fauvism', 'Expressionism', 'Dadaism', 'Bauhaus', 'Art Nouveau',
      'Art Deco', 'Romanticism', 'Realism', 'Neoclassicism'
    ];
    
    for (const movement of movements) {
      if (text.includes(movement)) {
        return movement;
      }
    }
    
    return null;
  }

  extractNationality(text) {
    const nationalityPatterns = [
      { pattern: /French/i, nationality: 'French' },
      { pattern: /Italian/i, nationality: 'Italian' },
      { pattern: /Spanish/i, nationality: 'Spanish' },
      { pattern: /Dutch/i, nationality: 'Dutch' },
      { pattern: /German/i, nationality: 'German' },
      { pattern: /American/i, nationality: 'American' },
      { pattern: /British/i, nationality: 'British' },
      { pattern: /Russian/i, nationality: 'Russian' },
      { pattern: /Japanese/i, nationality: 'Japanese' },
      { pattern: /Chinese/i, nationality: 'Chinese' },
      { pattern: /Belgian/i, nationality: 'Belgian' },
      { pattern: /Austrian/i, nationality: 'Austrian' },
      { pattern: /Swiss/i, nationality: 'Swiss' },
      { pattern: /Greek/i, nationality: 'Greek' },
      { pattern: /Polish/i, nationality: 'Polish' }
    ];
    
    for (const { pattern, nationality } of nationalityPatterns) {
      if (pattern.test(text)) {
        return nationality;
      }
    }
    
    return null;
  }

  generateContextualInfo(data) {
    const info = [];
    
    // 경매 기록 기반 인지도
    if (data.auctionRecords) {
      if (data.auctionRecords > 500) {
        info.push('매우 높은 시장 인지도');
      } else if (data.auctionRecords > 100) {
        info.push('높은 시장 활동성');
      } else if (data.auctionRecords > 50) {
        info.push('중간 수준의 시장 거래');
      }
    }
    
    // 전시 이력
    if (data.exhibitions) {
      if (data.exhibitions > 100) {
        info.push('국제적 전시 활동');
      } else if (data.exhibitions > 50) {
        info.push('활발한 전시 이력');
      }
    }
    
    // Met 컬렉션
    if (data.worksInMet) {
      if (data.worksInMet > 50) {
        info.push('주요 미술관 대규모 소장');
      } else if (data.worksInMet > 10) {
        info.push('주요 미술관 다수 소장');
      } else if (data.worksInMet > 0) {
        info.push('메트로폴리탄 미술관 소장');
      }
    }
    
    // 시대별 특성
    if (data.era) {
      const eraInfo = {
        'Renaissance': '고전 부활과 인문주의',
        'Baroque': '극적 표현과 종교적 열정',
        'Impressionism': '빛과 순간의 포착',
        'Modern': '전통 파괴와 실험성',
        'Contemporary': '다원성과 개념 중시'
      };
      
      if (eraInfo[data.era]) {
        info.push(eraInfo[data.era]);
      }
    }
    
    return info;
  }

  // 배치 처리를 위한 메서드
  async enrichBatch(artists, batchSize = 5) {
    const results = [];
    
    for (let i = 0; i < artists.length; i += batchSize) {
      const batch = artists.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(artist => this.enrichArtistData(artist.name, artist))
      );
      results.push(...batchResults);
      
      // API 제한 대응
      if (i + batchSize < artists.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

module.exports = ArtistDataEnricher;