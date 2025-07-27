// Wikipedia 데이터 수집 서비스
class WikipediaDataCollector {
  constructor() {
    this.baseUrl = 'https://en.wikipedia.org/api/rest_v1';
    this.koBaseUrl = 'https://ko.wikipedia.org/api/rest_v1';
  }

  async getArtistInfo(artistName) {
    try {
      // 1단계: 영문 Wikipedia 검색
      const enData = await this.searchWikipedia(artistName, 'en');
      
      // 2단계: 한국어 Wikipedia 검색 (한국 작가의 경우)
      const koData = await this.searchWikipedia(artistName, 'ko');
      
      // 3단계: 데이터 통합 및 정제
      return this.mergeData(enData, koData, artistName);
    } catch (error) {
      console.error(`Wikipedia 데이터 수집 실패 (${artistName}):`, error.message);
      return null;
    }
  }

  async searchWikipedia(query, lang) {
    try {
      const baseUrl = lang === 'ko' ? this.koBaseUrl : this.baseUrl;
      
      // 검색 API로 페이지 찾기
      const searchResponse = await fetch(
        `${baseUrl}/page/summary/${encodeURIComponent(query)}`
      );
      
      if (!searchResponse.ok) {
        return null;
      }
      
      const data = await searchResponse.json();
      
      return {
        title: data.title,
        extract: data.extract,
        description: data.description,
        birth: this.extractBirthYear(data.extract),
        death: this.extractDeathYear(data.extract),
        nationality: this.extractNationality(data.extract),
        movements: this.extractArtMovements(data.extract),
        keyworks: this.extractKeyWorks(data.extract),
        lang: lang
      };
    } catch (error) {
      return null;
    }
  }

  mergeData(enData, koData, artistName) {
    const merged = {
      name: artistName,
      sources: [],
      reliability: 0,
      bio: '',
      birth_year: null,
      death_year: null,
      nationality: '',
      art_movements: [],
      key_works: [],
      characteristics: [],
      confidence: 'low' // 기본값
    };

    // 영문 데이터 처리
    if (enData) {
      merged.sources.push('wikipedia_en');
      merged.bio += enData.extract || '';
      merged.birth_year = enData.birth;
      merged.death_year = enData.death;
      merged.nationality = enData.nationality;
      merged.art_movements = enData.movements;
      merged.key_works = enData.keyworks;
      merged.reliability += 3;
    }

    // 한국어 데이터 처리 (보완 정보)
    if (koData) {
      merged.sources.push('wikipedia_ko');
      if (koData.extract && !merged.bio.includes(koData.extract.substring(0, 50))) {
        merged.bio += '\n' + koData.extract;
      }
      merged.reliability += 2;
    }

    // 신뢰도 기반 confidence 설정
    if (merged.reliability >= 5) merged.confidence = 'high';
    else if (merged.reliability >= 3) merged.confidence = 'medium';

    // 기본 특징 추출
    merged.characteristics = this.extractCharacteristics(merged.bio);

    return merged;
  }

  extractBirthYear(text) {
    const birthMatch = text.match(/born.*?(\d{4})|(\d{4}).*?born/i);
    return birthMatch ? parseInt(birthMatch[1] || birthMatch[2]) : null;
  }

  extractDeathYear(text) {
    const deathMatch = text.match(/died.*?(\d{4})|(\d{4}).*?died/i);
    return deathMatch ? parseInt(deathMatch[1] || deathMatch[2]) : null;
  }

  extractNationality(text) {
    const patterns = [
      /was an? (\w+) (artist|painter|sculptor)/i,
      /(\w+) (artist|painter|sculptor)/i,
      /(American|British|French|German|Italian|Spanish|Korean|Japanese|Chinese)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return '';
  }

  extractArtMovements(text) {
    const movements = [
      'Renaissance', 'Baroque', 'Romanticism', 'Realism', 'Impressionism', 
      'Post-Impressionism', 'Expressionism', 'Cubism', 'Surrealism', 
      'Abstract Expressionism', 'Pop Art', 'Conceptual Art', 'Contemporary'
    ];
    
    return movements.filter(movement => 
      text.toLowerCase().includes(movement.toLowerCase())
    );
  }

  extractKeyWorks(text) {
    // 따옴표나 이탤릭으로 표시된 작품명 추출
    const workMatches = text.match(/"([^"]+)"|''([^'']+)''/g);
    return workMatches ? workMatches.slice(0, 5).map(work => 
      work.replace(/["'']/g, '')
    ) : [];
  }

  extractCharacteristics(text) {
    const characteristics = [];
    const keywords = {
      'innovative': '혁신적',
      'experimental': '실험적',
      'emotional': '감정적',
      'analytical': '분석적',
      'spiritual': '영성적',
      'political': '정치적',
      'traditional': '전통적',
      'modern': '현대적'
    };

    Object.keys(keywords).forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        characteristics.push(keywords[keyword]);
      }
    });

    return characteristics;
  }
}

module.exports = WikipediaDataCollector;