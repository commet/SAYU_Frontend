const { Pool } = require('pg');
const OpenAI = require('openai');
const axios = require('axios');
const sharp = require('sharp');
const ColorThief = require('colorthief');

class ArtistEnrichmentService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // 16가지 성격 유형
    this.personalityTypes = [
      'wolf', 'sheep', 'deer', 'horse', 'cow', 'pig',
      'rabbit', 'cat', 'dog', 'fox', 'bear', 'elephant',
      'lion', 'eagle', 'dolphin', 'owl'
    ];
  }

  /**
   * 아티스트 정보 자동 보강
   */
  async enrichArtist(artistId) {
    try {
      // 1. 기존 아티스트 정보 가져오기
      const artist = await this.getArtist(artistId);
      if (!artist) throw new Error('Artist not found');

      // 2. 감정 프로필 생성
      const emotionalProfile = await this.generateEmotionalProfile(artist);

      // 3. 성격 유형 친화도 계산
      const personalityAffinity = await this.calculatePersonalityAffinity(artist);

      // 4. 대표작 정보 수집
      const representativeWorks = await this.collectRepresentativeWorks(artist);

      // 5. 주요 테마 분석
      const themesSubjects = await this.analyzeThemes(artist, representativeWorks);

      // 6. 색상 분석 (대표작 기반)
      const artisticStyle = await this.analyzeArtisticStyle(artist, representativeWorks);

      // 7. DB 업데이트
      await this.updateArtistProfile(artistId, {
        emotional_profile: emotionalProfile,
        personality_affinity: personalityAffinity,
        representative_works: representativeWorks,
        themes_subjects: themesSubjects,
        artistic_style: artisticStyle
      });

      return {
        success: true,
        artistId,
        enrichedData: {
          emotionalProfile,
          personalityAffinity,
          representativeWorks,
          themesSubjects,
          artisticStyle
        }
      };
    } catch (error) {
      console.error('Error enriching artist:', error);
      throw error;
    }
  }

  /**
   * 감정 프로필 생성 (AI 활용)
   */
  async generateEmotionalProfile(artist) {
    try {
      const prompt = `
      아티스트: ${artist.name}
      생애: ${artist.bio || '정보 없음'}
      국적: ${artist.nationality || '알 수 없음'}
      시대: ${artist.era || '알 수 없음'}
      
      이 아티스트의 작품과 삶을 바탕으로 감정적 특성을 분석해주세요:
      1. 주요 감정 3-5개 (한 단어로)
      2. 감정 강도 (1-10)
      3. 전반적인 무드 시그니처 (한 문장)
      4. 관람객에게 미치는 영향 (한 문장)
      
      JSON 형식으로 응답해주세요.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content);

      return {
        primary_emotions: result.primary_emotions || [],
        emotional_intensity: result.emotional_intensity || 5,
        mood_signature: result.mood_signature || '',
        viewer_impact: result.viewer_impact || ''
      };
    } catch (error) {
      console.error('Error generating emotional profile:', error);
      return {
        primary_emotions: [],
        emotional_intensity: 5,
        mood_signature: 'Unknown',
        viewer_impact: 'To be analyzed'
      };
    }
  }

  /**
   * 성격 유형 친화도 계산
   */
  async calculatePersonalityAffinity(artist) {
    try {
      const prompt = `
      아티스트: ${artist.name}
      설명: ${artist.bio || ''}
      
      이 아티스트의 작품 스타일과 주제를 바탕으로 16가지 동물 성격 유형과의 친화도를 계산해주세요.
      
      동물 유형:
      - wolf (늑대): 독립적, 리더십, 강렬함
      - sheep (양): 평화로움, 조화, 부드러움
      - deer (사슴): 우아함, 민감함, 자연친화
      - horse (말): 자유로움, 역동적, 열정적
      - cow (소): 안정적, 느긋함, 전통적
      - pig (돼지): 즐거움, 풍요, 현실적
      - rabbit (토끼): 섬세함, 창의적, 빠른
      - cat (고양이): 독립적, 우아함, 신비로움
      - dog (개): 충성, 친근함, 사교적
      - fox (여우): 영리함, 적응력, 호기심
      - bear (곰): 힘, 보호, 내향적
      - elephant (코끼리): 지혜, 기억력, 공동체
      - lion (사자): 리더십, 용기, 카리스마
      - eagle (독수리): 비전, 자유, 높은 이상
      - dolphin (돌고래): 지능, 놀이, 소통
      - owl (부엉이): 지혜, 직관, 신중함
      
      각 동물 유형에 0-1 사이의 점수를 부여하고, 
      가장 높은 점수 3개를 best_match_types로,
      매칭 이유를 match_reasoning으로 설명해주세요.
      
      JSON 형식으로 응답해주세요.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content);

      return {
        scores: result.scores || {},
        best_match_types: result.best_match_types || [],
        match_reasoning: result.match_reasoning || ''
      };
    } catch (error) {
      console.error('Error calculating personality affinity:', error);
      return {
        scores: {},
        best_match_types: [],
        match_reasoning: 'Analysis pending'
      };
    }
  }

  /**
   * 대표작 정보 수집
   */
  async collectRepresentativeWorks(artist) {
    try {
      // Met Museum API에서 작품 검색
      const metWorks = await this.searchMetMuseum(artist.name);

      // Cleveland Museum API에서 작품 검색
      const clevelandWorks = await this.searchClevelandMuseum(artist.name);

      // 중복 제거 및 상위 10개 선택
      const allWorks = [...metWorks, ...clevelandWorks];
      const uniqueWorks = this.deduplicateWorks(allWorks);
      const topWorks = uniqueWorks.slice(0, 10);

      // 각 작품에 감정 태그 추가
      const enrichedWorks = await Promise.all(
        topWorks.map(work => this.addEmotionalTags(work))
      );

      return enrichedWorks;
    } catch (error) {
      console.error('Error collecting representative works:', error);
      return [];
    }
  }

  /**
   * Met Museum API 검색
   */
  async searchMetMuseum(artistName) {
    try {
      const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?artistOrCulture=true&q=${encodeURIComponent(artistName)}`;
      const searchResponse = await axios.get(searchUrl);

      if (!searchResponse.data.objectIDs || searchResponse.data.objectIDs.length === 0) {
        return [];
      }

      // 상위 5개 작품만 상세 정보 가져오기
      const objectIds = searchResponse.data.objectIDs.slice(0, 5);
      const works = await Promise.all(
        objectIds.map(async (id) => {
          try {
            const objectUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
            const objectResponse = await axios.get(objectUrl);
            const obj = objectResponse.data;

            return {
              title: obj.title || 'Untitled',
              year: obj.objectDate ? parseInt(obj.objectDate) : null,
              medium: obj.medium || 'Unknown medium',
              current_location: 'Metropolitan Museum of Art',
              image_url: obj.primaryImage || obj.primaryImageSmall || '',
              source: 'met'
            };
          } catch (error) {
            return null;
          }
        })
      );

      return works.filter(work => work !== null);
    } catch (error) {
      console.error('Error searching Met Museum:', error);
      return [];
    }
  }

  /**
   * Cleveland Museum API 검색
   */
  async searchClevelandMuseum(artistName) {
    try {
      const searchUrl = `https://openaccess-api.clevelandart.org/api/artworks?artists=${encodeURIComponent(artistName)}&limit=5`;
      const response = await axios.get(searchUrl);

      if (!response.data.data || response.data.data.length === 0) {
        return [];
      }

      return response.data.data.map(obj => ({
        title: obj.title || 'Untitled',
        year: obj.creation_date ? parseInt(obj.creation_date) : null,
        medium: obj.technique || 'Unknown medium',
        current_location: 'Cleveland Museum of Art',
        image_url: obj.images?.web?.url || '',
        source: 'cleveland'
      }));
    } catch (error) {
      console.error('Error searching Cleveland Museum:', error);
      return [];
    }
  }

  /**
   * 작품 중복 제거
   */
  deduplicateWorks(works) {
    const seen = new Set();
    return works.filter(work => {
      const key = `${work.title.toLowerCase()}_${work.year}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * 작품에 감정 태그 추가
   */
  async addEmotionalTags(work) {
    try {
      const prompt = `
      작품 정보:
      제목: ${work.title}
      연도: ${work.year || '알 수 없음'}
      매체: ${work.medium}
      
      이 작품이 전달하는 주요 감정을 3-5개의 한국어 단어로 표현해주세요.
      예: ["평온", "고독", "희망", "열정"]
      
      JSON 배열 형식으로만 응답해주세요.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100
      });

      const tags = JSON.parse(response.choices[0].message.content);

      return {
        ...work,
        emotional_tags: tags
      };
    } catch (error) {
      console.error('Error adding emotional tags:', error);
      return {
        ...work,
        emotional_tags: []
      };
    }
  }

  /**
   * 주요 테마 분석
   */
  async analyzeThemes(artist, works) {
    try {
      const workTitles = works.map(w => w.title).join(', ');

      const prompt = `
      아티스트: ${artist.name}
      대표작: ${workTitles}
      설명: ${artist.bio || ''}
      
      이 아티스트의 작품에서 나타나는:
      1. 주요 테마 (3-5개)
      2. 반복되는 모티프 (3-5개)
      3. 개념적 관심사 (3-5개)
      
      각각 한국어로 간단명료하게 답해주세요.
      JSON 형식으로 응답해주세요.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content);

      return {
        primary_themes: result.primary_themes || [],
        recurring_motifs: result.recurring_motifs || [],
        conceptual_interests: result.conceptual_interests || []
      };
    } catch (error) {
      console.error('Error analyzing themes:', error);
      return {
        primary_themes: [],
        recurring_motifs: [],
        conceptual_interests: []
      };
    }
  }

  /**
   * 예술 스타일 분석 (색상 포함)
   */
  async analyzeArtisticStyle(artist, works) {
    try {
      // 이미지가 있는 작품들의 색상 분석
      const worksWithImages = works.filter(w => w.image_url);
      const colorAnalyses = await Promise.all(
        worksWithImages.slice(0, 3).map(work => this.analyzeImageColors(work.image_url))
      );

      // 가장 많이 나타나는 색상들 추출
      const allColors = colorAnalyses.flat();
      const dominantColors = this.findDominantColors(allColors);

      // AI를 통한 스타일 분석
      const styleAnalysis = await this.analyzeStyleWithAI(artist, dominantColors);

      return {
        movements: styleAnalysis.movements || [],
        techniques: styleAnalysis.techniques || [],
        dominant_colors: dominantColors,
        color_temperature: styleAnalysis.color_temperature || 'neutral',
        brushwork: styleAnalysis.brushwork || ''
      };
    } catch (error) {
      console.error('Error analyzing artistic style:', error);
      return {
        movements: [],
        techniques: [],
        dominant_colors: [],
        color_temperature: 'neutral',
        brushwork: ''
      };
    }
  }

  /**
   * 이미지에서 주요 색상 추출
   */
  async analyzeImageColors(imageUrl) {
    try {
      if (!imageUrl) return [];

      // 이미지 다운로드
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // Sharp로 이미지 처리 및 색상 추출
      const { dominant } = await sharp(buffer).stats();

      // RGB를 HEX로 변환
      const rgbToHex = (r, g, b) => `#${[r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      }).join('')}`;

      return [rgbToHex(dominant.r, dominant.g, dominant.b)];
    } catch (error) {
      console.error('Error analyzing image colors:', error);
      return [];
    }
  }

  /**
   * 주요 색상 찾기
   */
  findDominantColors(colors) {
    // 색상 빈도 계산
    const colorFrequency = {};
    colors.forEach(color => {
      if (color) {
        colorFrequency[color] = (colorFrequency[color] || 0) + 1;
      }
    });

    // 빈도순으로 정렬하여 상위 5개 반환
    return Object.entries(colorFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([color]) => color);
  }

  /**
   * AI를 통한 스타일 분석
   */
  async analyzeStyleWithAI(artist, dominantColors) {
    try {
      const prompt = `
      아티스트: ${artist.name}
      시대: ${artist.era || '알 수 없음'}
      주요 색상: ${dominantColors.join(', ')}
      
      이 정보를 바탕으로 분석해주세요:
      1. 예술 운동/사조 (movements): 최대 3개
      2. 기법 (techniques): 최대 3개
      3. 색상 온도 (color_temperature): warm/cool/neutral/mixed 중 하나
      4. 붓터치 특징 (brushwork): 한 문장으로
      
      JSON 형식으로 응답해주세요.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing style with AI:', error);
      return {};
    }
  }

  /**
   * 아티스트 정보 가져오기
   */
  async getArtist(artistId) {
    const query = 'SELECT * FROM artists WHERE id = $1';
    const result = await this.pool.query(query, [artistId]);
    return result.rows[0];
  }

  /**
   * 아티스트 프로필 업데이트
   */
  async updateArtistProfile(artistId, enrichedData) {
    const query = `
      UPDATE artists 
      SET 
        emotional_profile = $2,
        personality_affinity = $3,
        representative_works = $4,
        themes_subjects = $5,
        artistic_style = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await this.pool.query(query, [
      artistId,
      enrichedData.emotional_profile,
      enrichedData.personality_affinity,
      enrichedData.representative_works,
      enrichedData.themes_subjects,
      enrichedData.artistic_style
    ]);
  }

  /**
   * 모든 아티스트 일괄 처리
   */
  async enrichAllArtists() {
    try {
      const query = `
        SELECT id, name 
        FROM artists 
        WHERE emotional_profile = '{}' OR emotional_profile IS NULL
        ORDER BY follow_count DESC
        LIMIT 10
      `;

      const result = await this.pool.query(query);
      const artists = result.rows;

      console.log(`Found ${artists.length} artists to enrich`);

      const results = [];
      for (const artist of artists) {
        console.log(`Enriching ${artist.name}...`);
        try {
          const enrichResult = await this.enrichArtist(artist.id);
          results.push(enrichResult);
          console.log(`✓ Successfully enriched ${artist.name}`);

          // API 제한을 위한 대기
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`✗ Failed to enrich ${artist.name}:`, error.message);
          results.push({ success: false, artistId: artist.id, error: error.message });
        }
      }

      return {
        total: artists.length,
        succeeded: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      console.error('Error in batch enrichment:', error);
      throw error;
    }
  }
}

module.exports = ArtistEnrichmentService;
