#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 데일리 챌린지용 Met Museum 작품 수집
class DailyChallengeArtworkCollector {
  constructor() {
    this.baseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1';
    this.collected = [];
    
    // 다양한 검색 키워드 (감정적 반응을 이끌어낼 수 있는 주제들)
    this.searchQueries = [
      'landscape',
      'portrait',
      'still life',
      'abstract',
      'impressionism',
      'van gogh',
      'monet',
      'picasso',
      'flowers',
      'nature',
      'city',
      'woman',
      'man',
      'children',
      'animals',
      'colors',
      'light',
      'shadow',
      'emotion',
      'love'
    ];
  }

  async collectArtworks() {
    console.log('🎨 데일리 챌린지용 Met Museum 작품 수집 시작\n');
    
    try {
      // 테이블 확인 및 생성
      await this.ensureTable();
      
      // 각 검색어로 작품 수집
      for (const query of this.searchQueries) {
        console.log(`🔍 "${query}" 검색 중...`);
        await this.collectByQuery(query);
        
        // API 요청 제한 준수
        await this.sleep(500);
      }
      
      console.log(`\n✅ 수집 완료! 총 ${this.collected.length}개 작품`);
      
      // 데이터베이스에 저장
      await this.saveToDatabase();
      
      // 결과 요약
      await this.showResults();
      
    } catch (error) {
      console.error('❌ 수집 중 오류:', error.message);
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
        is_suitable_for_challenge boolean DEFAULT true,
        created_at timestamp with time zone DEFAULT now()
      );
      
      CREATE INDEX IF NOT EXISTS idx_artwork_pool_suitable 
      ON daily_challenge_artwork_pool(is_suitable_for_challenge);
    `;
    
    await pool.query(createTableQuery);
    console.log('📋 테이블 준비 완료');
  }

  async collectByQuery(query) {
    try {
      // 이미지가 있는 작품만 검색
      const searchUrl = `${this.baseUrl}/search?hasImages=true&q=${encodeURIComponent(query)}`;
      const searchResponse = await axios.get(searchUrl);
      
      if (!searchResponse.data.objectIDs || searchResponse.data.objectIDs.length === 0) {
        console.log(`   ⚠️  "${query}" 검색 결과 없음`);
        return;
      }
      
      const objectIds = searchResponse.data.objectIDs.slice(0, 10); // 상위 10개만
      console.log(`   📦 ${searchResponse.data.total}개 중 ${objectIds.length}개 선택`);
      
      for (const objectId of objectIds) {
        try {
          const artwork = await this.fetchArtworkDetail(objectId);
          if (artwork) {
            this.collected.push(artwork);
            console.log(`   ✅ ${artwork.title} (${artwork.artist || '미상'})`);
          }
          
          // API 요청 간격
          await this.sleep(200);
        } catch (error) {
          console.log(`   ❌ 작품 ${objectId} 처리 실패: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ "${query}" 검색 실패: ${error.message}`);
    }
  }

  async fetchArtworkDetail(objectId) {
    const response = await axios.get(`${this.baseUrl}/objects/${objectId}`);
    const data = response.data;
    
    // 데일리 챌린지에 적합한지 확인
    if (!data.primaryImage || !data.title) {
      return null;
    }
    
    // 감정적 테마 추정
    const emotionalThemes = this.analyzeEmotionalThemes(data);
    
    // 주제 분류
    const subjectMatter = this.categorizeSubject(data);
    
    // 복잡도 평가 (1-5, 5가 가장 복잡)
    const complexity = this.assessComplexity(data);
    
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
      subject_matter: subjectMatter,
      complexity_level: complexity
    };
  }

  analyzeEmotionalThemes(data) {
    const themes = [];
    const text = `${data.title} ${data.medium} ${data.culture} ${data.classification}`.toLowerCase();
    
    // 감정 키워드 매칭
    const emotionMap = {
      'peaceful': ['landscape', 'nature', 'garden', 'calm'],
      'dramatic': ['battle', 'storm', 'intense', 'dark'],
      'joyful': ['celebration', 'festival', 'bright', 'colorful'],
      'melancholic': ['solitude', 'gray', 'shadow', 'alone'],
      'romantic': ['love', 'couple', 'intimate', 'soft'],
      'mysterious': ['night', 'unknown', 'hidden', 'secret'],
      'energetic': ['movement', 'dance', 'active', 'dynamic']
    };
    
    for (const [emotion, keywords] of Object.entries(emotionMap)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        themes.push(emotion);
      }
    }
    
    return themes.length > 0 ? themes : ['contemplative'];
  }

  categorizeSubject(data) {
    const text = `${data.title} ${data.classification}`.toLowerCase();
    
    if (text.includes('portrait') || text.includes('person') || text.includes('man') || text.includes('woman')) {
      return 'portrait';
    } else if (text.includes('landscape') || text.includes('nature') || text.includes('garden')) {
      return 'landscape';
    } else if (text.includes('still life') || text.includes('flower') || text.includes('fruit')) {
      return 'still_life';
    } else if (text.includes('abstract') || text.includes('geometric')) {
      return 'abstract';
    } else {
      return 'other';
    }
  }

  categorizeStyle(data) {
    const text = `${data.culture} ${data.classification} ${data.department}`.toLowerCase();
    
    if (text.includes('impressionism') || data.artistDisplayName?.includes('Monet')) return 'impressionism';
    if (text.includes('modern') || text.includes('contemporary')) return 'modern';
    if (text.includes('classical') || text.includes('ancient')) return 'classical';
    if (text.includes('asian') || text.includes('chinese') || text.includes('japanese')) return 'asian';
    if (text.includes('european')) return 'european';
    
    return 'other';
  }

  assessComplexity(data) {
    let complexity = 3; // 기본값
    
    // 제목의 복잡성
    if (data.title.length > 50) complexity += 1;
    
    // 매체의 복잡성
    if (data.medium && data.medium.includes(',')) complexity += 1;
    
    // 추상적 vs 구상적
    if (data.classification?.toLowerCase().includes('abstract')) {
      complexity += 1;
    }
    
    return Math.min(Math.max(complexity, 1), 5);
  }

  extractTags(data) {
    const tags = [];
    
    if (data.department) tags.push(data.department.toLowerCase());
    if (data.culture) tags.push(data.culture.toLowerCase());
    if (data.medium) tags.push(...data.medium.toLowerCase().split(',').map(t => t.trim()));
    if (data.classification) tags.push(data.classification.toLowerCase());
    
    // 중복 제거 및 정리
    return [...new Set(tags)].filter(tag => tag.length > 0);
  }

  async saveToDatabase() {
    console.log('\n💾 데이터베이스 저장 중...');
    
    let saved = 0;
    let skipped = 0;
    
    for (const artwork of this.collected) {
      try {
        const query = `
          INSERT INTO daily_challenge_artwork_pool 
          (artwork_id, title, artist, date_created, medium, department, culture, 
           image_url, image_small_url, museum_url, tags, emotional_themes, 
           period_style, subject_matter, complexity_level)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (artwork_id) DO NOTHING
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
          artwork.subject_matter,
          artwork.complexity_level
        ]);
        
        if (result.rowCount > 0) {
          saved++;
        } else {
          skipped++;
        }
        
      } catch (error) {
        console.error(`저장 실패 (${artwork.title}):`, error.message);
      }
    }
    
    console.log(`✅ 저장 완료: ${saved}개 저장, ${skipped}개 중복 건너뛰기`);
  }

  async showResults() {
    const { rows } = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_suitable_for_challenge THEN 1 END) as suitable,
        COUNT(DISTINCT period_style) as styles,
        COUNT(DISTINCT subject_matter) as subjects,
        AVG(complexity_level) as avg_complexity
      FROM daily_challenge_artwork_pool
    `);
    
    const stats = rows[0];
    
    console.log('\n📊 데이터베이스 현황:');
    console.log(`   전체 작품: ${stats.total}개`);
    console.log(`   챌린지 적합: ${stats.suitable}개`);
    console.log(`   스타일 종류: ${stats.styles}개`);
    console.log(`   주제 종류: ${stats.subjects}개`);
    console.log(`   평균 복잡도: ${parseFloat(stats.avg_complexity).toFixed(1)}/5`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
const collector = new DailyChallengeArtworkCollector();
collector.collectArtworks().catch(console.error);