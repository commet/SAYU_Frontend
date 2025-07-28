const { pool } = require('../config/database');
const { logger } = require('../config/logger');
const axios = require('axios');

/**
 * SAYU 향상된 아티스트 정보 수집 및 저장 서비스
 *
 * 기능:
 * 1. 다중 소스에서 아티스트 정보 수집 (Wikipedia, DBpedia, Wikidata, 미술관 API)
 * 2. AI 기반 감정 시그니처 생성
 * 3. 16가지 성격 유형별 친화도 계산
 * 4. 저작권 상태 자동 판단
 * 5. 중복 제거 및 데이터 품질 검증
 */
class EnhancedArtistCollectorService {
  constructor() {
    this.sources = {
      wikipedia: {
        apiUrl: 'https://en.wikipedia.org/api/rest_v1',
        language: ['en', 'ko'],
        priority: 1
      },
      wikidata: {
        apiUrl: 'https://query.wikidata.org/sparql',
        priority: 2
      },
      dbpedia: {
        apiUrl: 'https://dbpedia.org/sparql',
        priority: 3
      },
      openai: {
        apiUrl: 'https://api.openai.com/v1',
        model: 'gpt-4-turbo-preview'
      }
    };

    // 16가지 동물 성격 유형
    this.animalTypes = [
      'wolf', 'fox', 'owl', 'dolphin', 'lion', 'elephant',
      'rabbit', 'eagle', 'bear', 'cat', 'dog', 'horse',
      'tiger', 'penguin', 'butterfly', 'turtle'
    ];

    // 감정 차원 (512차원 벡터를 위한 기본 감정들)
    this.emotionDimensions = [
      'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust',
      'serenity', 'melancholy', 'passion', 'contemplation', 'mystery',
      'hope', 'nostalgia', 'power', 'fragility', 'rebellion'
    ];
  }

  /**
   * 아티스트 이름으로 포괄적 정보 수집
   */
  async collectArtistInfo(artistName, options = {}) {
    try {
      logger.info(`🎨 아티스트 정보 수집 시작: ${artistName}`);

      // 1. 기존 DB 확인
      const existingArtist = await this.checkExistingArtist(artistName);
      if (existingArtist && !options.forceUpdate) {
        logger.info(`✅ 기존 아티스트 정보 발견: ${artistName}`);
        return existingArtist;
      }

      // 2. 다중 소스에서 병렬 수집
      const [
        wikipediaData,
        wikidataData,
        dbpediaData,
        museumData
      ] = await Promise.allSettled([
        this.fetchFromWikipedia(artistName),
        this.fetchFromWikidata(artistName),
        this.fetchFromDBpedia(artistName),
        this.fetchFromMuseumAPIs(artistName)
      ]);

      // 3. 데이터 통합
      const mergedData = await this.mergeArtistData({
        wikipedia: wikipediaData.status === 'fulfilled' ? wikipediaData.value : null,
        wikidata: wikidataData.status === 'fulfilled' ? wikidataData.value : null,
        dbpedia: dbpediaData.status === 'fulfilled' ? dbpediaData.value : null,
        museum: museumData.status === 'fulfilled' ? museumData.value : null
      }, artistName);

      // 4. AI 기반 분석
      const enhancedData = await this.enhanceWithAI(mergedData);

      // 5. 데이터베이스 저장
      const savedArtist = await this.saveArtistToDatabase(enhancedData);

      logger.info(`✅ 아티스트 정보 수집 완료: ${artistName}`);
      return savedArtist;

    } catch (error) {
      logger.error(`❌ 아티스트 정보 수집 실패: ${artistName}`, error);
      throw error;
    }
  }

  /**
   * Wikipedia에서 아티스트 정보 수집
   */
  async fetchFromWikipedia(artistName) {
    try {
      // 영문 Wikipedia 검색
      const searchResponse = await axios.get(
        `${this.sources.wikipedia.apiUrl}/page/summary/${encodeURIComponent(artistName)}`
      );

      if (searchResponse.data.type === 'disambiguation') {
        // 동명이인 처리
        const pageData = await this.handleDisambiguation(artistName, searchResponse.data);
        return pageData;
      }

      return {
        name: searchResponse.data.title,
        description: searchResponse.data.extract,
        birth_date: this.extractDateFromText(searchResponse.data.extract, 'birth'),
        death_date: this.extractDateFromText(searchResponse.data.extract, 'death'),
        nationality: this.extractNationalityFromText(searchResponse.data.extract),
        image_url: searchResponse.data.thumbnail?.source,
        wikipedia_url: searchResponse.data.content_urls?.desktop?.page,
        source: 'wikipedia'
      };

    } catch (error) {
      logger.warn(`Wikipedia 수집 실패: ${artistName}`, error.message);
      return null;
    }
  }

  /**
   * Wikidata에서 구조화된 정보 수집
   */
  async fetchFromWikidata(artistName) {
    try {
      const query = `
        SELECT DISTINCT ?artist ?artistLabel ?birthDate ?deathDate ?countryLabel ?occupationLabel ?movementLabel WHERE {
          ?artist rdfs:label "${artistName}"@en .
          ?artist wdt:P31 wd:Q5 .
          OPTIONAL { ?artist wdt:P569 ?birthDate . }
          OPTIONAL { ?artist wdt:P570 ?deathDate . }
          OPTIONAL { ?artist wdt:P27 ?country . }
          OPTIONAL { ?artist wdt:P106 ?occupation . }
          OPTIONAL { ?artist wdt:P135 ?movement . }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
        }
        LIMIT 5
      `;

      const response = await axios.get(this.sources.wikidata.apiUrl, {
        params: {
          query,
          format: 'json'
        },
        headers: {
          'User-Agent': 'SAYU/1.0 (https://sayu.life) ArtistCollector'
        }
      });

      const results = response.data.results.bindings;
      if (results.length === 0) return null;

      const result = results[0]; // 첫 번째 결과 사용

      return {
        name: result.artistLabel?.value,
        birth_date: result.birthDate?.value,
        death_date: result.deathDate?.value,
        nationality: result.countryLabel?.value,
        occupation: result.occupationLabel?.value,
        art_movement: result.movementLabel?.value,
        wikidata_id: this.extractWikidataId(result.artist.value),
        source: 'wikidata'
      };

    } catch (error) {
      logger.warn(`Wikidata 수집 실패: ${artistName}`, error.message);
      return null;
    }
  }

  /**
   * DBpedia에서 추가 정보 수집
   */
  async fetchFromDBpedia(artistName) {
    try {
      const query = `
        SELECT DISTINCT ?artist ?abstract ?birthPlace ?genre WHERE {
          ?artist rdfs:label "${artistName}"@en .
          ?artist rdf:type dbo:Artist .
          OPTIONAL { ?artist dbo:abstract ?abstract . FILTER(lang(?abstract) = "en") }
          OPTIONAL { ?artist dbo:birthPlace ?birthPlace . }
          OPTIONAL { ?artist dbo:genre ?genre . }
        }
        LIMIT 3
      `;

      const response = await axios.get(this.sources.dbpedia.apiUrl, {
        params: {
          query,
          format: 'json'
        }
      });

      const results = response.data.results.bindings;
      if (results.length === 0) return null;

      const result = results[0];

      return {
        biography: result.abstract?.value,
        birth_place: result.birthPlace?.value,
        genres: result.genre?.value,
        source: 'dbpedia'
      };

    } catch (error) {
      logger.warn(`DBpedia 수집 실패: ${artistName}`, error.message);
      return null;
    }
  }

  /**
   * 미술관 API에서 작품 정보 수집
   */
  async fetchFromMuseumAPIs(artistName) {
    try {
      const museumData = {
        artworks: [],
        exhibitions: [],
        total_works: 0
      };

      // Met Museum API
      try {
        const metSearch = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/search`, {
          params: { q: artistName, hasImages: true }
        });

        if (metSearch.data.total > 0) {
          const objectIds = metSearch.data.objectIDs.slice(0, 5); // 최대 5개 작품

          for (const objectId of objectIds) {
            const artwork = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`);
            if (artwork.data.primaryImage) {
              museumData.artworks.push({
                title: artwork.data.title,
                date: artwork.data.objectDate,
                medium: artwork.data.medium,
                image_url: artwork.data.primaryImage,
                museum: 'Metropolitan Museum',
                source: 'met'
              });
            }
          }
          museumData.total_works += metSearch.data.total;
        }
      } catch (metError) {
        logger.warn(`Met Museum API 오류: ${artistName}`, metError.message);
      }

      // Cleveland Museum API
      try {
        const clevelandSearch = await axios.get(`https://openaccess-api.clevelandart.org/api/artworks/`, {
          params: {
            artists: artistName,
            has_image: 1,
            limit: 5
          }
        });

        if (clevelandSearch.data.data.length > 0) {
          clevelandSearch.data.data.forEach(artwork => {
            if (artwork.images?.web?.url) {
              museumData.artworks.push({
                title: artwork.title,
                date: artwork.creation_date,
                medium: artwork.technique,
                image_url: artwork.images.web.url,
                museum: 'Cleveland Museum of Art',
                source: 'cleveland'
              });
            }
          });
        }
      } catch (clevelandError) {
        logger.warn(`Cleveland Museum API 오류: ${artistName}`, clevelandError.message);
      }

      return museumData;

    } catch (error) {
      logger.warn(`미술관 API 수집 실패: ${artistName}`, error.message);
      return { artworks: [], exhibitions: [], total_works: 0 };
    }
  }

  /**
   * 수집된 데이터를 통합
   */
  async mergeArtistData(sources, originalName) {
    const merged = {
      name: originalName,
      name_ko: null,
      birth_year: null,
      death_year: null,
      birth_date: null,
      death_date: null,
      nationality: null,
      nationality_ko: null,
      bio: null,
      bio_ko: null,
      copyright_status: 'unknown',
      era: null,
      art_movement: null,
      birth_place: null,
      total_artworks: 0,
      representative_works: [],
      images: {},
      sources: {},
      official_links: {},
      metadata: {}
    };

    // Wikipedia 데이터 통합
    if (sources.wikipedia) {
      const wp = sources.wikipedia;
      merged.name = wp.name || merged.name;
      merged.bio = wp.description;
      merged.nationality = wp.nationality;
      merged.birth_date = wp.birth_date;
      merged.death_date = wp.death_date;
      merged.images.portrait = wp.image_url;
      merged.official_links.wikipedia = wp.wikipedia_url;
      merged.sources.wikipedia = 'collected';

      // 연도 추출
      if (wp.birth_date) merged.birth_year = this.extractYear(wp.birth_date);
      if (wp.death_date) merged.death_year = this.extractYear(wp.death_date);
    }

    // Wikidata 데이터 통합 (더 정확한 구조화된 데이터)
    if (sources.wikidata) {
      const wd = sources.wikidata;
      merged.name = wd.name || merged.name;
      merged.nationality = wd.nationality || merged.nationality;
      merged.art_movement = wd.art_movement;
      merged.sources.wikidata = wd.wikidata_id;

      if (wd.birth_date) {
        merged.birth_date = wd.birth_date;
        merged.birth_year = this.extractYear(wd.birth_date);
      }
      if (wd.death_date) {
        merged.death_date = wd.death_date;
        merged.death_year = this.extractYear(wd.death_date);
      }
    }

    // DBpedia 데이터 통합
    if (sources.dbpedia) {
      const db = sources.dbpedia;
      if (db.biography && (!merged.bio || merged.bio.length < db.biography.length)) {
        merged.bio = db.biography;
      }
      merged.birth_place = db.birth_place;
      merged.sources.dbpedia = 'collected';
    }

    // 미술관 데이터 통합
    if (sources.museum) {
      merged.total_artworks = sources.museum.total_works;
      merged.representative_works = sources.museum.artworks;
      merged.sources.museums = sources.museum.artworks.map(a => a.source);
    }

    // 저작권 상태 자동 판단
    merged.copyright_status = this.determineCopyrightStatus(merged);

    // 시대 분류
    merged.era = this.classifyEra(merged.birth_year, merged.death_year);

    return merged;
  }

  /**
   * AI를 사용하여 감정 시그니처와 성격 친화도 계산
   */
  async enhanceWithAI(artistData) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        logger.warn('OpenAI API 키가 없어 AI 분석을 건너뜁니다');
        return {
          ...artistData,
          emotion_signature: this.generateDefaultEmotionSignature(),
          personality_affinity: this.generateDefaultPersonalityAffinity()
        };
      }

      // GPT-4를 사용한 감정 분석
      const analysisPrompt = `
        아티스트 정보:
        이름: ${artistData.name}
        출생-사망: ${artistData.birth_year || '?'} - ${artistData.death_year || '생존'}
        국적: ${artistData.nationality || '미상'}
        예술 사조: ${artistData.art_movement || '미상'}
        약력: ${artistData.bio || '정보 없음'}
        
        대표 작품들:
        ${artistData.representative_works.map(work => `- ${work.title} (${work.date})`).join('\n')}

        이 작가의 작품들이 주로 전달하는 감정들을 다음 16개 차원으로 0-10 점수로 평가해주세요:
        joy, sadness, anger, fear, surprise, disgust, serenity, melancholy, passion, contemplation, mystery, hope, nostalgia, power, fragility, rebellion

        그리고 이 작가와 가장 잘 어울리는 동물 성격 유형 3개를 선택하고 친화도(0-100)를 매겨주세요:
        wolf, fox, owl, dolphin, lion, elephant, rabbit, eagle, bear, cat, dog, horse, tiger, penguin, butterfly, turtle

        JSON 형식으로 응답해주세요:
        {
          "emotion_scores": {"joy": 7, "sadness": 8, ...},
          "personality_matches": [{"animal": "wolf", "score": 85}, ...]
        }
      `;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 예술 작품의 감정적 특성을 분석하는 전문가입니다. 작가의 스타일, 주제, 색채, 기법을 종합적으로 고려하여 객관적인 분석을 제공합니다.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const aiAnalysis = JSON.parse(response.data.choices[0].message.content);

      // 감정 시그니처를 512차원 벡터로 확장
      const emotionSignature = this.expandEmotionVector(aiAnalysis.emotion_scores);

      // 16가지 동물 유형별 친화도 계산
      const personalityAffinity = this.calculatePersonalityAffinity(aiAnalysis.personality_matches);

      return {
        ...artistData,
        emotion_signature: emotionSignature,
        personality_affinity: personalityAffinity,
        ai_analysis: {
          analyzed_at: new Date().toISOString(),
          model: 'gpt-4-turbo-preview',
          confidence: this.calculateAnalysisConfidence(artistData)
        }
      };

    } catch (error) {
      logger.warn('AI 분석 실패, 기본값 사용', error.message);
      return {
        ...artistData,
        emotion_signature: this.generateDefaultEmotionSignature(),
        personality_affinity: this.generateDefaultPersonalityAffinity()
      };
    }
  }

  /**
   * 아티스트 정보를 데이터베이스에 저장
   */
  async saveArtistToDatabase(artistData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 중복 확인 (이름 기반)
      const existingCheck = await client.query(
        'SELECT id FROM artists WHERE LOWER(name) = LOWER($1) OR LOWER(name_ko) = LOWER($1)',
        [artistData.name]
      );

      if (existingCheck.rows.length > 0) {
        // 기존 아티스트 업데이트
        const artistId = existingCheck.rows[0].id;

        const updateQuery = `
          UPDATE artists SET
            name_ko = COALESCE($2, name_ko),
            birth_year = COALESCE($3, birth_year),
            death_year = COALESCE($4, death_year),
            nationality = COALESCE($5, nationality),
            nationality_ko = COALESCE($6, nationality_ko),
            bio = COALESCE($7, bio),
            bio_ko = COALESCE($8, bio_ko),
            copyright_status = COALESCE($9, copyright_status),
            era = COALESCE($10, era),
            images = COALESCE($11, images),
            sources = COALESCE($12, sources),
            official_links = COALESCE($13, official_links),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `;

        const result = await client.query(updateQuery, [
          artistId,
          artistData.name_ko,
          artistData.birth_year,
          artistData.death_year,
          artistData.nationality,
          artistData.nationality_ko,
          artistData.bio,
          artistData.bio_ko,
          artistData.copyright_status,
          artistData.era,
          JSON.stringify(artistData.images),
          JSON.stringify(artistData.sources),
          JSON.stringify(artistData.official_links)
        ]);

        await client.query('COMMIT');

        logger.info(`✅ 기존 아티스트 정보 업데이트: ${artistData.name}`);
        return result.rows[0];

      } else {
        // 새 아티스트 삽입
        const insertQuery = `
          INSERT INTO artists (
            name, name_ko, birth_year, death_year, nationality, nationality_ko,
            bio, bio_ko, copyright_status, era, images, sources, 
            official_links, is_featured
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING *
        `;

        const result = await client.query(insertQuery, [
          artistData.name,
          artistData.name_ko,
          artistData.birth_year,
          artistData.death_year,
          artistData.nationality,
          artistData.nationality_ko,
          artistData.bio,
          artistData.bio_ko,
          artistData.copyright_status,
          artistData.era,
          JSON.stringify(artistData.images),
          JSON.stringify(artistData.sources),
          JSON.stringify(artistData.official_links),
          artistData.total_artworks > 10 // 작품이 많으면 featured로 설정
        ]);

        await client.query('COMMIT');

        logger.info(`✅ 새 아티스트 정보 저장: ${artistData.name}`);
        return result.rows[0];
      }

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('아티스트 DB 저장 실패', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 배치로 여러 아티스트 처리
   */
  async collectArtistsBatch(artistNames, options = {}) {
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };

    logger.info(`📦 배치 아티스트 수집 시작: ${artistNames.length}명`);

    for (const artistName of artistNames) {
      try {
        // 처리 간격 (API 율한 제한 고려)
        if (options.delay) {
          await new Promise(resolve => setTimeout(resolve, options.delay));
        }

        const artistData = await this.collectArtistInfo(artistName, options);
        results.successful.push({
          name: artistName,
          id: artistData.id,
          data: artistData
        });

        logger.info(`✅ 배치 처리 성공: ${artistName} (${results.successful.length}/${artistNames.length})`);

      } catch (error) {
        results.failed.push({
          name: artistName,
          error: error.message
        });

        logger.error(`❌ 배치 처리 실패: ${artistName}`, error.message);
      }
    }

    logger.info(`📦 배치 처리 완료: 성공 ${results.successful.length}, 실패 ${results.failed.length}`);
    return results;
  }

  // ===== 유틸리티 메서드들 =====

  async checkExistingArtist(artistName) {
    const result = await pool.query(
      'SELECT * FROM artists WHERE LOWER(name) = LOWER($1) OR LOWER(name_ko) = LOWER($1)',
      [artistName]
    );
    return result.rows[0] || null;
  }

  extractYear(dateString) {
    if (!dateString) return null;
    const yearMatch = dateString.match(/(\d{4})/);
    return yearMatch ? parseInt(yearMatch[1]) : null;
  }

  extractDateFromText(text, type) {
    // "born 1853" 또는 "died 1890" 패턴 찾기
    const patterns = {
      birth: /born\s+(\d{4})/i,
      death: /died\s+(\d{4})/i
    };

    const match = text.match(patterns[type]);
    return match ? match[1] : null;
  }

  extractNationalityFromText(text) {
    const nationalityPatterns = [
      /(\w+)\s+artist/i,
      /(\w+)\s+painter/i,
      /(\w+)\s+sculptor/i
    ];

    for (const pattern of nationalityPatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  extractWikidataId(wikidataUrl) {
    const match = wikidataUrl.match(/Q\d+/);
    return match ? match[0] : null;
  }

  determineCopyrightStatus(artistData) {
    const currentYear = new Date().getFullYear();

    if (artistData.death_year) {
      const yearsSinceDeath = currentYear - artistData.death_year;
      if (yearsSinceDeath >= 70) {
        return 'public_domain';
      } else if (yearsSinceDeath >= 50) {
        return 'transitional';
      } else {
        return 'licensed';
      }
    } else if (artistData.birth_year) {
      const age = currentYear - artistData.birth_year;
      if (age > 150) {
        return 'public_domain'; // 추정 사망
      } else {
        return 'contemporary';
      }
    }

    return 'unknown';
  }

  classifyEra(birthYear, deathYear) {
    if (!birthYear) return 'Contemporary';

    const activeYear = deathYear || new Date().getFullYear();

    if (activeYear < 1400) return 'Medieval';
    if (activeYear < 1600) return 'Renaissance';
    if (activeYear < 1750) return 'Baroque';
    if (activeYear < 1850) return 'Neoclassicism';
    if (activeYear < 1900) return 'Impressionism';
    if (activeYear < 1945) return 'Modern';
    if (activeYear < 1980) return 'Postmodern';
    return 'Contemporary';
  }

  generateDefaultEmotionSignature() {
    // 기본 감정 시그니처 (평균적인 값들)
    return new Array(512).fill(0).map(() => Math.random() * 0.5 + 0.25);
  }

  generateDefaultPersonalityAffinity() {
    // 16가지 동물 유형별 기본 친화도
    const affinity = {};
    this.animalTypes.forEach(animal => {
      affinity[animal] = Math.floor(Math.random() * 40) + 30; // 30-70 범위
    });
    return affinity;
  }

  expandEmotionVector(emotionScores) {
    // 16개 기본 감정을 512차원으로 확장
    const baseVector = new Array(16).fill(0);

    Object.entries(emotionScores).forEach(([emotion, score], index) => {
      if (index < 16) {
        baseVector[index] = score / 10; // 0-1 범위로 정규화
      }
    });

    // 512차원으로 확장 (보간 및 변형)
    const expandedVector = new Array(512).fill(0);
    for (let i = 0; i < 512; i++) {
      const baseIndex = i % 16;
      const variation = (Math.sin(i * 0.1) + 1) * 0.1; // 약간의 변형 추가
      expandedVector[i] = Math.max(0, Math.min(1, baseVector[baseIndex] + variation));
    }

    return expandedVector;
  }

  calculatePersonalityAffinity(aiMatches) {
    const affinity = {};

    // 모든 동물 유형을 기본값으로 초기화
    this.animalTypes.forEach(animal => {
      affinity[animal] = 20; // 기본 점수
    });

    // AI가 선택한 매치들에 높은 점수 부여
    aiMatches.forEach(match => {
      if (this.animalTypes.includes(match.animal)) {
        affinity[match.animal] = match.score;
      }
    });

    return affinity;
  }

  calculateAnalysisConfidence(artistData) {
    let confidence = 0.5; // 기본 신뢰도

    if (artistData.bio && artistData.bio.length > 100) confidence += 0.2;
    if (artistData.representative_works.length > 0) confidence += 0.1;
    if (artistData.birth_year) confidence += 0.1;
    if (artistData.nationality) confidence += 0.1;

    return Math.min(1.0, confidence);
  }
}

module.exports = new EnhancedArtistCollectorService();
