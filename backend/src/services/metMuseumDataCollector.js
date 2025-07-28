// 메트로폴리탄 미술관 API 데이터 수집 서비스
class MetMuseumDataCollector {
  constructor() {
    this.baseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1';
  }

  async getArtistInfo(artistName) {
    try {
      console.log(`🎨 Met Museum에서 ${artistName} 정보 수집 중...`);

      // 1단계: 작가 이름으로 작품 검색
      const artworks = await this.searchArtworks(artistName);

      if (!artworks || artworks.length === 0) {
        console.log(`❌ Met Museum에서 ${artistName} 작품을 찾을 수 없음`);
        return null;
      }

      // 2단계: 작품 상세 정보에서 작가 정보 추출
      const artistData = await this.extractArtistData(artworks, artistName);

      console.log(`✅ Met Museum에서 ${artistName} 정보 수집 완료`);
      return artistData;
    } catch (error) {
      console.error(`Met Museum 데이터 수집 실패 (${artistName}):`, error.message);
      return null;
    }
  }

  async searchArtworks(artistName) {
    try {
      // 작가명으로 검색
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(artistName)}&hasImages=true`;
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        return null;
      }

      const searchData = await searchResponse.json();

      if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
        return null;
      }

      // 상위 10개 작품만 분석 (API 제한 고려)
      const objectIds = searchData.objectIDs.slice(0, 10);
      const artworks = [];

      for (const objectId of objectIds) {
        try {
          const objectUrl = `${this.baseUrl}/objects/${objectId}`;
          const objectResponse = await fetch(objectUrl);

          if (objectResponse.ok) {
            const objectData = await objectResponse.json();

            // 작가명이 일치하는지 확인
            if (this.isArtistMatch(objectData.artistDisplayName, artistName)) {
              artworks.push(objectData);
            }
          }

          // API 요청 제한 고려 (100ms 대기)
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.error(`작품 ${objectId} 정보 수집 실패:`, err.message);
        }
      }

      return artworks;
    } catch (error) {
      console.error('Met Museum 작품 검색 실패:', error.message);
      return null;
    }
  }

  isArtistMatch(displayName, searchName) {
    if (!displayName || !searchName) return false;

    const normalize = (name) => name.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    const normalizedDisplay = normalize(displayName);
    const normalizedSearch = normalize(searchName);

    // 완전 일치 또는 부분 일치 확인
    return normalizedDisplay.includes(normalizedSearch) ||
           normalizedSearch.includes(normalizedDisplay);
  }

  async extractArtistData(artworks, artistName) {
    const data = {
      name: artistName,
      source: 'met_museum',
      nationality: '',
      birth_year: null,
      death_year: null,
      art_movements: [],
      mediums: [],
      periods: [],
      works_count: artworks.length,
      notable_works: [],
      departments: [],
      confidence: 'medium',
      reliability: 3
    };

    // 작품들로부터 정보 추출
    for (const artwork of artworks) {
      // 국적 정보
      if (artwork.artistNationality && !data.nationality) {
        data.nationality = artwork.artistNationality;
      }

      // 생몰년도
      if (artwork.artistBeginDate && !data.birth_year) {
        data.birth_year = this.parseYear(artwork.artistBeginDate);
      }
      if (artwork.artistEndDate && !data.death_year) {
        data.death_year = this.parseYear(artwork.artistEndDate);
      }

      // 매체 정보
      if (artwork.medium) {
        const medium = this.categorizeMedium(artwork.medium);
        if (medium && !data.mediums.includes(medium)) {
          data.mediums.push(medium);
        }
      }

      // 시대 정보
      if (artwork.period) {
        if (!data.periods.includes(artwork.period)) {
          data.periods.push(artwork.period);
        }
      }

      // 대표 작품 (이미지가 있는 작품 우선)
      if (artwork.primaryImage && data.notable_works.length < 5) {
        data.notable_works.push({
          title: artwork.title,
          date: artwork.objectDate,
          medium: artwork.medium,
          dimensions: artwork.dimensions,
          image_url: artwork.primaryImage
        });
      }

      // 부서 정보 (예술 장르 파악)
      if (artwork.department && !data.departments.includes(artwork.department)) {
        data.departments.push(artwork.department);
      }
    }

    // 예술 운동 추정
    data.art_movements = this.estimateArtMovements(data);

    // 신뢰도 조정
    if (data.works_count >= 5) data.reliability += 2;
    if (data.nationality && data.birth_year) data.reliability += 1;
    if (data.reliability >= 5) data.confidence = 'high';

    return data;
  }

  parseYear(dateString) {
    if (!dateString) return null;
    const yearMatch = dateString.match(/\b(\d{4})\b/);
    return yearMatch ? parseInt(yearMatch[1]) : null;
  }

  categorizeMedium(mediumString) {
    const mediumString_lower = mediumString.toLowerCase();

    if (mediumString_lower.includes('oil') || mediumString_lower.includes('canvas')) {
      return 'Oil Painting';
    } else if (mediumString_lower.includes('watercolor')) {
      return 'Watercolor';
    } else if (mediumString_lower.includes('bronze') || mediumString_lower.includes('marble')) {
      return 'Sculpture';
    } else if (mediumString_lower.includes('print') || mediumString_lower.includes('etching')) {
      return 'Printmaking';
    } else if (mediumString_lower.includes('drawing') || mediumString_lower.includes('pencil')) {
      return 'Drawing';
    }

    return 'Mixed Media';
  }

  estimateArtMovements(data) {
    const movements = [];

    // 시대별 운동 추정
    if (data.birth_year) {
      if (data.birth_year >= 1400 && data.birth_year <= 1600) {
        movements.push('Renaissance');
      } else if (data.birth_year >= 1600 && data.birth_year <= 1750) {
        movements.push('Baroque');
      } else if (data.birth_year >= 1750 && data.birth_year <= 1850) {
        movements.push('Romanticism');
      } else if (data.birth_year >= 1830 && data.birth_year <= 1880) {
        movements.push('Impressionism');
      } else if (data.birth_year >= 1860 && data.birth_year <= 1920) {
        movements.push('Modern Art');
      } else if (data.birth_year >= 1900) {
        movements.push('Contemporary Art');
      }
    }

    // 부서별 운동 추정
    if (data.departments.includes('Modern and Contemporary Art')) {
      movements.push('Contemporary Art');
    }
    if (data.departments.includes('European Paintings')) {
      movements.push('European Art');
    }

    return [...new Set(movements)]; // 중복 제거
  }
}

module.exports = MetMuseumDataCollector;
