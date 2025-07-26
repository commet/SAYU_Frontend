#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const { Pool } = require('pg');
const pLimit = require('p-limit');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 최적화된 데일리 챌린지용 Met Museum 작품 수집기
class OptimizedDailyChallengeCollector {
  constructor() {
    this.baseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1';
    this.collected = [];
    this.cache = new Map(); // API 응답 캐싱
    this.limit = pLimit(5); // 동시 요청 제한
    
    // 확장된 검색어 (감정적 반응과 다양성 증대)
    this.searchQueries = [
      // 기본 장르
      'landscape', 'portrait', 'still life', 'abstract', 'figure',
      
      // 감정적 키워드
      'emotion', 'love', 'melancholy', 'joy', 'sorrow', 'hope', 
      'peace', 'passion', 'solitude', 'celebration',
      
      // 주요 작가들
      'van gogh', 'monet', 'picasso', 'rembrandt', 'vermeer',
      'degas', 'cezanne', 'renoir', 'turner', 'klimt',
      
      // 자연과 풍경
      'nature', 'flowers', 'sunset', 'ocean', 'mountain', 
      'forest', 'garden', 'rain', 'storm', 'light',
      
      // 인물과 감정
      'woman', 'man', 'child', 'family', 'mother', 
      'smile', 'tears', 'dream', 'sleep', 'dance',
      
      // 색상과 분위기
      'blue', 'red', 'golden', 'shadow', 'bright', 
      'dark', 'colorful', 'monochrome', 'vibrant', 'subtle',
      
      // 시대와 스타일
      'impressionism', 'expressionism', 'renaissance', 'baroque',
      'modern', 'contemporary', 'classical', 'romantic', 'realism',
      
      // 문화와 지역
      'asian', 'european', 'american', 'african', 'islamic',
      'japanese', 'chinese', 'french', 'italian', 'dutch'
    ];
    
    // 감정 테마 확장
    this.emotionKeywords = {
      'peaceful': ['calm', 'serene', 'tranquil', 'quiet', 'gentle', 'soft', 'harmony'],
      'dramatic': ['intense', 'powerful', 'bold', 'striking', 'conflict', 'tension', 'dynamic'],
      'joyful': ['happy', 'cheerful', 'bright', 'lively', 'festive', 'playful', 'celebration'],
      'melancholic': ['sad', 'lonely', 'solitary', 'gloomy', 'somber', 'pensive', 'nostalgic'],
      'romantic': ['love', 'tender', 'intimate', 'passionate', 'dreamy', 'sensual', 'affection'],
      'mysterious': ['enigmatic', 'dark', 'shadow', 'night', 'hidden', 'secret', 'unknown'],
      'energetic': ['vibrant', 'active', 'movement', 'dance', 'rhythm', 'motion', 'alive'],
      'contemplative': ['thoughtful', 'meditative', 'reflective', 'introspective', 'philosophical'],
      'whimsical': ['playful', 'fantastical', 'imaginative', 'quirky', 'dream-like', 'surreal'],
      'spiritual': ['divine', 'sacred', 'religious', 'transcendent', 'ethereal', 'mystical']
    };
  }

  async collectArtworks() {
    console.log('🎨 최적화된 데일리 챌린지 작품 수집 시작\n');
    
    try {
      // 데이터베이스 준비
      await this.ensureTable();
      
      // 현재 컬렉션 상태 확인
      const currentStats = await this.getCurrentStats();
      console.log(`📊 현재 컬렉션: ${currentStats.total}개 작품\n`);
      
      // 병렬로 검색어 처리
      const searchPromises = this.searchQueries.map(query => 
        this.limit(() => this.collectByQuery(query))
      );
      
      await Promise.all(searchPromises);
      
      console.log(`\n✅ 수집 완료! 총 ${this.collected.length}개 작품 발견`);
      
      // 품질 필터링
      const filtered = await this.filterHighQualityArtworks();
      console.log(`🔍 품질 필터링: ${filtered.length}개 작품 선정`);
      
      // 데이터베이스 저장
      await this.saveToDatabase(filtered);
      
      // 결과 요약
      await this.showDetailedResults();
      
    } catch (error) {
      console.error('❌ 수집 중 오류:', error.message);
    } finally {
      await pool.end();
    }
  }

  async ensureTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS daily_challenge_artwork_pool (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        artwork_id text UNIQUE NOT NULL,
        title text NOT NULL,
        artist text,
        date_created text,
        medium text,
        department text,
        culture text,
        image_url text NOT NULL,
        image_small_url text,
        museum_url text,
        tags text[],
        emotional_themes text[],
        period_style text,
        color_palette text,
        subject_matter text,
        complexity_level integer DEFAULT 3,
        quality_score numeric(3,2) DEFAULT 0.5,
        is_suitable_for_challenge boolean DEFAULT true,
        view_count integer DEFAULT 0,
        selection_count integer DEFAULT 0,
        avg_emotion_match_score numeric(3,2),
        created_at timestamp with time zone DEFAULT now(),
        last_used_at timestamp with time zone
      );
      
      CREATE INDEX IF NOT EXISTS idx_artwork_pool_suitable 
      ON daily_challenge_artwork_pool(is_suitable_for_challenge, quality_score DESC);
      
      CREATE INDEX IF NOT EXISTS idx_artwork_pool_themes
      ON daily_challenge_artwork_pool USING GIN(emotional_themes);
      
      CREATE INDEX IF NOT EXISTS idx_artwork_pool_random
      ON daily_challenge_artwork_pool(random());
    `;
    
    await pool.query(createTableQuery);
    console.log('📋 테이블 준비 완료');
  }

  async collectByQuery(query) {
    try {
      // 캐시 확인
      if (this.cache.has(query)) {
        console.log(`   📦 "${query}" (캐시됨)`);
        return this.cache.get(query);
      }
      
      // API 요청 (재시도 로직 포함)
      const searchUrl = `${this.baseUrl}/search?hasImages=true&q=${encodeURIComponent(query)}`;
      const searchResponse = await this.fetchWithRetry(searchUrl);
      
      if (!searchResponse.data.objectIDs || searchResponse.data.objectIDs.length === 0) {
        console.log(`   ⚠️  "${query}" 검색 결과 없음`);
        return [];
      }
      
      // 랜덤하게 섞어서 다양성 증대
      const shuffled = this.shuffleArray(searchResponse.data.objectIDs);
      const objectIds = shuffled.slice(0, 15); // 검색당 15개
      
      console.log(`   🔍 "${query}": ${searchResponse.data.total}개 중 ${objectIds.length}개 처리`);
      
      // 병렬로 작품 상세 정보 가져오기
      const artworkPromises = objectIds.map(id => 
        this.limit(() => this.fetchArtworkDetail(id))
      );
      
      const artworks = await Promise.all(artworkPromises);
      const validArtworks = artworks.filter(a => a !== null);
      
      this.collected.push(...validArtworks);
      this.cache.set(query, validArtworks);
      
      return validArtworks;
      
    } catch (error) {
      console.log(`   ❌ "${query}" 검색 실패: ${error.message}`);
      return [];
    }
  }

  async fetchArtworkDetail(objectId) {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/objects/${objectId}`);
      const data = response.data;
      
      // 기본 유효성 검사
      if (!this.isValidArtwork(data)) {
        return null;
      }
      
      // 품질 점수 계산
      const qualityScore = this.calculateQualityScore(data);
      if (qualityScore < 0.3) {
        return null; // 낮은 품질 작품 제외
      }
      
      // 감정적 테마 분석 (향상된 버전)
      const emotionalThemes = this.analyzeEmotionalThemes(data);
      
      // 색상 팔레트 추출 (이미지 분석 시뮬레이션)
      const colorPalette = this.extractColorPalette(data);
      
      return {
        artwork_id: data.objectID.toString(),
        title: data.title,
        artist: data.artistDisplayName || null,
        date_created: data.objectDate || null,
        medium: data.medium || null,
        department: data.department || null,
        culture: data.culture || null,
        image_url: data.primaryImage,
        image_small_url: data.primaryImageSmall,
        museum_url: data.objectURL || null,
        tags: this.extractTags(data),
        emotional_themes: emotionalThemes,
        period_style: this.categorizeStyle(data),
        color_palette: colorPalette,
        subject_matter: this.categorizeSubject(data),
        complexity_level: this.assessComplexity(data),
        quality_score: qualityScore
      };
      
    } catch (error) {
      // 조용히 실패 처리
      return null;
    }
  }

  isValidArtwork(data) {
    return !!(
      data.primaryImage && 
      data.title && 
      data.primaryImage.includes('https') &&
      !data.title.toLowerCase().includes('fragment') &&
      !data.title.toLowerCase().includes('unknown')
    );
  }

  calculateQualityScore(data) {
    let score = 0.5; // 기본 점수
    
    // 이미지 품질
    if (data.primaryImage && data.primaryImageSmall) score += 0.1;
    if (data.primaryImage?.includes('original')) score += 0.1;
    
    // 메타데이터 완성도
    if (data.artistDisplayName) score += 0.1;
    if (data.objectDate) score += 0.05;
    if (data.medium) score += 0.05;
    if (data.culture) score += 0.05;
    if (data.department) score += 0.05;
    
    // 유명 작품/작가 가중치
    const famousArtists = ['van gogh', 'monet', 'picasso', 'rembrandt', 'da vinci'];
    if (data.artistDisplayName && 
        famousArtists.some(artist => data.artistDisplayName.toLowerCase().includes(artist))) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  analyzeEmotionalThemes(data) {
    const themes = new Set();
    const text = `${data.title} ${data.medium} ${data.culture} ${data.classification} ${data.tags?.join(' ')}`.toLowerCase();
    
    // 각 감정 카테고리에 대해 점수 계산
    const emotionScores = {};
    
    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          score += 1;
        }
      }
      if (score > 0) {
        emotionScores[emotion] = score;
      }
    }
    
    // 상위 3개 감정 테마 선택
    const sortedEmotions = Object.entries(emotionScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion]) => emotion);
    
    return sortedEmotions.length > 0 ? sortedEmotions : ['contemplative'];
  }

  extractColorPalette(data) {
    // 실제로는 이미지 분석이 필요하지만, 여기서는 메타데이터 기반 추정
    const text = `${data.title} ${data.medium} ${data.tags?.join(' ')}`.toLowerCase();
    
    if (text.includes('monochrome') || text.includes('black') || text.includes('white')) {
      return 'monochrome';
    } else if (text.includes('gold') || text.includes('golden')) {
      return 'warm';
    } else if (text.includes('blue') || text.includes('ocean') || text.includes('sky')) {
      return 'cool';
    } else if (text.includes('colorful') || text.includes('vibrant')) {
      return 'vibrant';
    } else {
      return 'balanced';
    }
  }

  categorizeSubject(data) {
    const text = `${data.title} ${data.classification} ${data.department}`.toLowerCase();
    
    const categories = {
      'portrait': ['portrait', 'person', 'face', 'figure', 'man', 'woman', 'child'],
      'landscape': ['landscape', 'nature', 'mountain', 'sea', 'forest', 'countryside'],
      'still_life': ['still life', 'flower', 'fruit', 'vase', 'table', 'interior'],
      'abstract': ['abstract', 'geometric', 'composition', 'non-representational'],
      'religious': ['religious', 'christ', 'madonna', 'saint', 'biblical'],
      'mythological': ['mythology', 'goddess', 'hero', 'myth', 'legend'],
      'historical': ['battle', 'history', 'war', 'event', 'ceremony'],
      'genre': ['daily life', 'domestic', 'scene', 'everyday', 'folk']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    
    return 'other';
  }

  categorizeStyle(data) {
    const text = `${data.culture} ${data.classification} ${data.department} ${data.period}`.toLowerCase();
    const artist = data.artistDisplayName?.toLowerCase() || '';
    
    // 작가 기반 스타일 매칭
    const artistStyles = {
      'impressionism': ['monet', 'renoir', 'degas', 'pissarro', 'manet'],
      'post-impressionism': ['van gogh', 'cezanne', 'gauguin', 'toulouse-lautrec'],
      'renaissance': ['da vinci', 'michelangelo', 'raphael', 'botticelli'],
      'baroque': ['rembrandt', 'vermeer', 'caravaggio', 'rubens'],
      'modern': ['picasso', 'matisse', 'kandinsky', 'mondrian'],
      'romantic': ['turner', 'delacroix', 'friedrich', 'goya']
    };
    
    for (const [style, artists] of Object.entries(artistStyles)) {
      if (artists.some(a => artist.includes(a))) {
        return style;
      }
    }
    
    // 텍스트 기반 스타일 매칭
    if (text.includes('impressionism')) return 'impressionism';
    if (text.includes('modern') || text.includes('contemporary')) return 'modern';
    if (text.includes('classical') || text.includes('ancient')) return 'classical';
    if (text.includes('asian') || text.includes('oriental')) return 'asian';
    if (text.includes('medieval')) return 'medieval';
    if (text.includes('baroque')) return 'baroque';
    if (text.includes('renaissance')) return 'renaissance';
    
    return 'other';
  }

  assessComplexity(data) {
    let complexity = 3; // 기본값
    
    // 작품 설명의 복잡성
    const description = `${data.title} ${data.medium}`;
    if (description.length > 100) complexity += 1;
    if (description.length < 20) complexity -= 1;
    
    // 매체의 복잡성
    if (data.medium) {
      if (data.medium.includes('mixed') || data.medium.includes('multimedia')) complexity += 1;
      if (data.medium.includes('oil') || data.medium.includes('canvas')) complexity -= 0.5;
    }
    
    // 스타일별 복잡성
    const style = this.categorizeStyle(data);
    if (['abstract', 'modern', 'contemporary'].includes(style)) complexity += 1;
    if (['portrait', 'landscape'].includes(this.categorizeSubject(data))) complexity -= 0.5;
    
    return Math.round(Math.min(Math.max(complexity, 1), 5));
  }

  extractTags(data) {
    const tags = new Set();
    
    // 기본 태그
    if (data.department) tags.add(data.department.toLowerCase());
    if (data.culture) tags.add(data.culture.toLowerCase());
    if (data.period) tags.add(data.period.toLowerCase());
    if (data.dynasty) tags.add(data.dynasty.toLowerCase());
    if (data.classification) tags.add(data.classification.toLowerCase());
    
    // 매체 태그
    if (data.medium) {
      data.medium.toLowerCase().split(/[,;]/).forEach(m => {
        const cleaned = m.trim();
        if (cleaned.length > 2 && cleaned.length < 30) {
          tags.add(cleaned);
        }
      });
    }
    
    // 추가 태그
    if (data.tags) {
      data.tags.forEach(tag => tags.add(tag.toLowerCase()));
    }
    
    return Array.from(tags).filter(tag => tag.length > 0);
  }

  async filterHighQualityArtworks() {
    // 중복 제거
    const uniqueMap = new Map();
    this.collected.forEach(artwork => {
      const key = artwork.artwork_id;
      if (!uniqueMap.has(key) || uniqueMap.get(key).quality_score < artwork.quality_score) {
        uniqueMap.set(key, artwork);
      }
    });
    
    // 품질 기준으로 필터링
    return Array.from(uniqueMap.values())
      .filter(artwork => artwork.quality_score >= 0.4)
      .sort((a, b) => b.quality_score - a.quality_score);
  }

  async saveToDatabase(artworks) {
    console.log('\n💾 데이터베이스 저장 중...');
    
    let saved = 0;
    let updated = 0;
    let errors = 0;
    
    // 배치 처리
    const batchSize = 50;
    for (let i = 0; i < artworks.length; i += batchSize) {
      const batch = artworks.slice(i, i + batchSize);
      
      const promises = batch.map(async (artwork) => {
        try {
          const query = `
            INSERT INTO daily_challenge_artwork_pool 
            (artwork_id, title, artist, date_created, medium, department, culture, 
             image_url, image_small_url, museum_url, tags, emotional_themes, 
             period_style, color_palette, subject_matter, complexity_level, quality_score)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (artwork_id) 
            DO UPDATE SET 
              quality_score = GREATEST(daily_challenge_artwork_pool.quality_score, EXCLUDED.quality_score),
              emotional_themes = EXCLUDED.emotional_themes,
              tags = EXCLUDED.tags
            RETURNING (xmax = 0) AS inserted
          `;
          
          const result = await pool.query(query, [
            artwork.artwork_id,
            artwork.title,
            artwork.artist,
            artwork.date_created,
            artwork.medium,
            artwork.department,
            artwork.culture,
            artwork.image_url,
            artwork.image_small_url,
            artwork.museum_url,
            artwork.tags,
            artwork.emotional_themes,
            artwork.period_style,
            artwork.color_palette,
            artwork.subject_matter,
            artwork.complexity_level,
            artwork.quality_score
          ]);
          
          if (result.rows[0]?.inserted) {
            saved++;
          } else {
            updated++;
          }
          
        } catch (error) {
          errors++;
          console.error(`저장 실패: ${error.message}`);
        }
      });
      
      await Promise.all(promises);
      console.log(`   배치 ${Math.floor(i/batchSize) + 1} 완료...`);
    }
    
    console.log(`✅ 저장 완료: ${saved}개 신규, ${updated}개 업데이트, ${errors}개 오류`);
  }

  async getCurrentStats() {
    const { rows } = await pool.query('SELECT COUNT(*) as total FROM daily_challenge_artwork_pool');
    return rows[0];
  }

  async showDetailedResults() {
    const { rows } = await pool.query(`
      WITH stats AS (
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_suitable_for_challenge THEN 1 END) as suitable,
          COUNT(DISTINCT period_style) as styles,
          COUNT(DISTINCT subject_matter) as subjects,
          COUNT(DISTINCT emotional_themes) as emotion_types,
          AVG(complexity_level) as avg_complexity,
          AVG(quality_score) as avg_quality,
          COUNT(CASE WHEN quality_score >= 0.7 THEN 1 END) as high_quality,
          COUNT(CASE WHEN quality_score >= 0.5 THEN 1 END) as medium_quality
        FROM daily_challenge_artwork_pool
      ),
      emotion_dist AS (
        SELECT emotional_themes, COUNT(*) as count
        FROM daily_challenge_artwork_pool, 
             unnest(emotional_themes) as emotional_themes
        GROUP BY emotional_themes
        ORDER BY count DESC
        LIMIT 5
      ),
      style_dist AS (
        SELECT period_style, COUNT(*) as count
        FROM daily_challenge_artwork_pool
        WHERE period_style IS NOT NULL
        GROUP BY period_style
        ORDER BY count DESC
        LIMIT 5
      )
      SELECT 
        stats.*,
        (SELECT json_agg(row_to_json(emotion_dist)) FROM emotion_dist) as top_emotions,
        (SELECT json_agg(row_to_json(style_dist)) FROM style_dist) as top_styles
      FROM stats
    `);
    
    const stats = rows[0];
    
    console.log('\n📊 최종 데이터베이스 통계:');
    console.log(`   전체 작품: ${stats.total}개`);
    console.log(`   챌린지 적합: ${stats.suitable}개`);
    console.log(`   고품질 작품: ${stats.high_quality}개 (품질점수 0.7+)`);
    console.log(`   중품질 작품: ${stats.medium_quality}개 (품질점수 0.5+)`);
    console.log(`   평균 품질: ${parseFloat(stats.avg_quality).toFixed(2)}/1.0`);
    console.log(`   평균 복잡도: ${parseFloat(stats.avg_complexity).toFixed(1)}/5`);
    console.log(`   스타일 종류: ${stats.styles}개`);
    console.log(`   주제 종류: ${stats.subjects}개`);
    
    console.log('\n🎭 상위 감정 테마:');
    if (stats.top_emotions) {
      stats.top_emotions.forEach((emotion, i) => {
        console.log(`   ${i + 1}. ${emotion.emotional_themes}: ${emotion.count}개`);
      });
    }
    
    console.log('\n🎨 상위 스타일:');
    if (stats.top_styles) {
      stats.top_styles.forEach((style, i) => {
        console.log(`   ${i + 1}. ${style.period_style}: ${style.count}개`);
      });
    }
  }

  // 유틸리티 함수들
  async fetchWithRetry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await axios.get(url, { timeout: 10000 });
        return response;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.sleep(1000 * (i + 1)); // 점진적 백오프
      }
    }
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
if (require.main === module) {
  const collector = new OptimizedDailyChallengeCollector();
  collector.collectArtworks().catch(console.error);
}

module.exports = OptimizedDailyChallengeCollector;