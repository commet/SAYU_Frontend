const { Pool } = require('pg');
const ArtworkAnalyzer = require('./artwork-analyzer');

/**
 * SAYU 플랫폼 통합 레이어
 * Artvee 데이터를 SAYU의 성격 기반 추천 시스템과 연동
 */
class SAYUIntegration {
  constructor(databaseUrl) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.analyzer = new ArtworkAnalyzer();
    
    // MBTI별 선호 아트 스타일 매핑
    this.mbtiArtPreferences = {
      // 분석가 그룹 (NT)
      'INTJ': {
        styles: ['abstract', 'minimalist', 'conceptual', 'geometric'],
        periods: ['modern', 'contemporary', 'bauhaus'],
        emotions: ['mysterious', 'contemplative'],
        colors: { temperature: 'cool', saturation: 'low' }
      },
      'INTP': {
        styles: ['surreal', 'abstract', 'experimental'],
        periods: ['dadaism', 'surrealism', 'contemporary'],
        emotions: ['mysterious', 'contemplative'],
        colors: { temperature: 'neutral', saturation: 'medium' }
      },
      'ENTJ': {
        styles: ['neoclassical', 'realism', 'architectural'],
        periods: ['renaissance', 'neoclassical', 'modern'],
        emotions: ['dramatic', 'powerful'],
        colors: { temperature: 'neutral', saturation: 'high' }
      },
      'ENTP': {
        styles: ['pop art', 'contemporary', 'mixed media'],
        periods: ['modern', 'postmodern', 'contemporary'],
        emotions: ['energetic', 'playful'],
        colors: { temperature: 'warm', saturation: 'high' }
      },
      
      // 외교관 그룹 (NF)
      'INFJ': {
        styles: ['symbolism', 'romanticism', 'mystical'],
        periods: ['romanticism', 'symbolism', 'pre-raphaelite'],
        emotions: ['serene', 'melancholic', 'mysterious'],
        colors: { temperature: 'cool', saturation: 'medium' }
      },
      'INFP': {
        styles: ['impressionism', 'fantasy', 'dreamlike'],
        periods: ['impressionism', 'post-impressionism'],
        emotions: ['dreamy', 'melancholic', 'serene'],
        colors: { temperature: 'cool', saturation: 'soft' }
      },
      'ENFJ': {
        styles: ['portrait', 'narrative', 'humanistic'],
        periods: ['renaissance', 'baroque', 'realism'],
        emotions: ['joyful', 'warm', 'inspiring'],
        colors: { temperature: 'warm', saturation: 'medium' }
      },
      'ENFP': {
        styles: ['expressionism', 'fauvism', 'vibrant'],
        periods: ['expressionism', 'fauvism', 'contemporary'],
        emotions: ['joyful', 'energetic', 'playful'],
        colors: { temperature: 'warm', saturation: 'high' }
      },
      
      // 관리자 그룹 (SJ)
      'ISTJ': {
        styles: ['classical', 'traditional', 'detailed'],
        periods: ['classical', 'academic', 'realism'],
        emotions: ['calm', 'orderly'],
        colors: { temperature: 'neutral', saturation: 'low' }
      },
      'ISFJ': {
        styles: ['pastoral', 'domestic', 'gentle'],
        periods: ['rococo', 'victorian', 'genre painting'],
        emotions: ['serene', 'nostalgic'],
        colors: { temperature: 'warm', saturation: 'soft' }
      },
      'ESTJ': {
        styles: ['historical', 'portrait', 'monumental'],
        periods: ['neoclassical', 'academic', 'historical'],
        emotions: ['powerful', 'commanding'],
        colors: { temperature: 'neutral', saturation: 'medium' }
      },
      'ESFJ': {
        styles: ['genre', 'narrative', 'celebratory'],
        periods: ['baroque', 'rococo', 'genre painting'],
        emotions: ['joyful', 'warm'],
        colors: { temperature: 'warm', saturation: 'medium' }
      },
      
      // 탐험가 그룹 (SP)
      'ISTP': {
        styles: ['industrial', 'mechanical', 'precise'],
        periods: ['futurism', 'constructivism', 'bauhaus'],
        emotions: ['cool', 'detached'],
        colors: { temperature: 'cool', saturation: 'low' }
      },
      'ISFP': {
        styles: ['nature', 'landscape', 'atmospheric'],
        periods: ['romanticism', 'impressionism', 'tonalism'],
        emotions: ['peaceful', 'contemplative'],
        colors: { temperature: 'varied', saturation: 'natural' }
      },
      'ESTP': {
        styles: ['action', 'dynamic', 'bold'],
        periods: ['futurism', 'pop art', 'street art'],
        emotions: ['energetic', 'exciting'],
        colors: { temperature: 'hot', saturation: 'high' }
      },
      'ESFP': {
        styles: ['colorful', 'festive', 'decorative'],
        periods: ['fauvism', 'pop art', 'contemporary'],
        emotions: ['joyful', 'playful', 'vibrant'],
        colors: { temperature: 'warm', saturation: 'very high' }
      }
    };
  }

  /**
   * MBTI 기반 작품 추천
   */
  async getPersonalizedRecommendations(mbtiType, options = {}) {
    const {
      limit = 20,
      mood = null,
      excludeIds = [],
      onlyHighQuality = true
    } = options;
    
    const preferences = this.mbtiArtPreferences[mbtiType];
    if (!preferences) {
      throw new Error(`Unknown MBTI type: ${mbtiType}`);
    }
    
    // 복잡한 쿼리 구성
    const query = `
      WITH scored_artworks AS (
        SELECT 
          a.*,
          -- 스타일 매칭 점수
          CASE 
            WHEN style = ANY($1::text[]) THEN 3
            WHEN genre IN (SELECT unnest($1::text[])) THEN 2
            ELSE 0
          END as style_score,
          
          -- 시대 매칭 점수
          CASE 
            WHEN period = ANY($2::text[]) THEN 2
            ELSE 0
          END as period_score,
          
          -- 감정 매칭 점수
          CASE 
            WHEN emotion_tags && $3::text[] THEN 
              cardinality(emotion_tags & $3::text[])
            ELSE 0
          END as emotion_score,
          
          -- 색상 분석 점수
          COALESCE(
            (metadata->>'colorScore')::float,
            0
          ) as color_score,
          
          -- 품질 점수
          image_quality_score,
          
          -- 인기도 점수 (사용 로그 기반)
          COALESCE(
            (SELECT COUNT(*) FROM image_usage_log 
             WHERE artwork_id = a.id 
             AND created_at > NOW() - INTERVAL '30 days'),
            0
          ) as popularity_score
          
        FROM artvee_artworks a
        WHERE 
          is_active = true
          AND processing_status = 'processed'
          ${onlyHighQuality ? 'AND image_quality_score >= 0.7' : ''}
          ${excludeIds.length > 0 ? 'AND id != ALL($6::uuid[])' : ''}
          ${mood ? "AND $7 = ANY(emotion_tags)" : ''}
      ),
      ranked_artworks AS (
        SELECT 
          *,
          -- 종합 점수 계산
          (
            style_score * 0.3 +
            period_score * 0.2 +
            emotion_score * 0.2 +
            color_score * 0.1 +
            image_quality_score * 0.15 +
            LEAST(popularity_score / 10.0, 1.0) * 0.05
          ) as total_score
        FROM scored_artworks
      )
      SELECT 
        id,
        artvee_id,
        title,
        artist,
        year_created,
        period,
        style,
        genre,
        cdn_url,
        thumbnail_url,
        emotion_tags,
        personality_tags,
        metadata,
        total_score,
        style_score,
        emotion_score
      FROM ranked_artworks
      ORDER BY total_score DESC
      LIMIT $4;
    `;
    
    const params = [
      preferences.styles,
      preferences.periods,
      preferences.emotions,
      limit
    ];
    
    if (excludeIds.length > 0) params.push(excludeIds);
    if (mood) params.push(mood);
    
    const result = await this.pool.query(query, params);
    
    // 결과 후처리
    const recommendations = result.rows.map(artwork => ({
      ...artwork,
      matchReason: this.generateMatchReason(artwork, preferences),
      personalityInsight: this.generatePersonalityInsight(mbtiType, artwork)
    }));
    
    return recommendations;
  }

  /**
   * 성격 유형별 미술관 경로 생성
   */
  async generatePersonalizedGalleryPath(mbtiType, options = {}) {
    const {
      duration = 30, // 분
      startMood = 'neutral',
      endMood = 'inspired',
      themeProgression = true
    } = options;
    
    const preferences = this.mbtiArtPreferences[mbtiType];
    const artworksPerSection = Math.ceil(duration / 3); // 3분당 1작품
    
    const path = {
      mbtiType,
      sections: [],
      totalDuration: duration,
      narrative: this.generateGalleryNarrative(mbtiType)
    };
    
    // 감정 진행 경로 설계
    const emotionProgression = this.designEmotionProgression(startMood, endMood);
    
    // 각 섹션별로 작품 선택
    for (let i = 0; i < emotionProgression.length; i++) {
      const section = {
        order: i + 1,
        theme: emotionProgression[i].theme,
        targetEmotion: emotionProgression[i].emotion,
        artworks: []
      };
      
      // 해당 섹션에 맞는 작품 선택
      const sectionArtworks = await this.getPersonalizedRecommendations(
        mbtiType,
        {
          limit: Math.ceil(artworksPerSection / emotionProgression.length),
          mood: emotionProgression[i].emotion,
          excludeIds: path.sections.flatMap(s => s.artworks.map(a => a.id))
        }
      );
      
      section.artworks = sectionArtworks;
      section.description = this.generateSectionDescription(
        mbtiType,
        section.theme,
        sectionArtworks
      );
      
      path.sections.push(section);
    }
    
    // 전환 효과 추가
    path.transitions = this.generateTransitions(path.sections);
    
    return path;
  }

  /**
   * 작품 분석 및 MBTI 태깅
   */
  async analyzeAndTagArtwork(artworkId) {
    // DB에서 작품 정보 조회
    const artworkResult = await this.pool.query(
      'SELECT * FROM artvee_artworks WHERE id = $1',
      [artworkId]
    );
    
    if (artworkResult.rows.length === 0) {
      throw new Error('Artwork not found');
    }
    
    const artwork = artworkResult.rows[0];
    
    // 이미지 분석 수행
    if (artwork.cdn_url) {
      const analysis = await this.analyzer.analyzeArtwork(
        artwork.cdn_url,
        artwork
      );
      
      if (analysis) {
        // MBTI 태그 생성
        const mbtiTags = this.generateMBTITags(analysis);
        
        // DB 업데이트
        await this.pool.query(`
          UPDATE artvee_artworks
          SET 
            personality_tags = $2,
            emotion_tags = $3,
            color_palette = $4,
            image_quality_score = $5,
            metadata = metadata || $6,
            processing_status = 'processed',
            updated_at = NOW()
          WHERE id = $1
        `, [
          artworkId,
          mbtiTags,
          analysis.emotions.map(e => e.emotion),
          analysis.colors,
          analysis.quality_score / 100,
          { analysis: analysis }
        ]);
        
        return {
          success: true,
          mbtiTags,
          emotions: analysis.emotions,
          qualityScore: analysis.quality_score
        };
      }
    }
    
    return { success: false, error: 'Analysis failed' };
  }

  /**
   * 배치 분석 및 태깅
   */
  async batchAnalyzeArtworks(limit = 100) {
    // 미처리 작품 조회
    const unprocessedResult = await this.pool.query(`
      SELECT id, cdn_url 
      FROM artvee_artworks 
      WHERE 
        processing_status IN ('pending', 'crawled')
        AND cdn_url IS NOT NULL
        AND is_active = true
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);
    
    const results = {
      total: unprocessedResult.rows.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    console.log(`🎨 Analyzing ${results.total} artworks...`);
    
    for (const artwork of unprocessedResult.rows) {
      try {
        const result = await this.analyzeAndTagArtwork(artwork.id);
        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push({ id: artwork.id, error: result.error });
        }
        
        // 진행 상황 표시
        if ((results.successful + results.failed) % 10 === 0) {
          console.log(`Progress: ${results.successful + results.failed}/${results.total}`);
        }
        
        // API 제한 고려
        await this.sleep(1000);
        
      } catch (error) {
        results.failed++;
        results.errors.push({ id: artwork.id, error: error.message });
      }
    }
    
    console.log(`✅ Analysis complete: ${results.successful} successful, ${results.failed} failed`);
    return results;
  }

  /**
   * 퀴즈용 작품 선택
   */
  async getQuizArtworks(questionType, options = {}) {
    const { count = 4, difficulty = 'medium' } = options;
    
    const strategies = {
      'style_recognition': async () => {
        // 스타일 인식 문제용 작품 선택
        const styles = ['impressionism', 'cubism', 'surrealism', 'realism'];
        const artworks = [];
        
        for (const style of styles.slice(0, count)) {
          const result = await this.pool.query(`
            SELECT * FROM artvee_artworks
            WHERE 
              style = $1
              AND image_quality_score >= 0.8
              AND artist IS NOT NULL
            ORDER BY RANDOM()
            LIMIT 1
          `, [style]);
          
          if (result.rows[0]) {
            artworks.push(result.rows[0]);
          }
        }
        
        return artworks;
      },
      
      'emotion_matching': async () => {
        // 감정 매칭 문제용 작품 선택
        const emotions = ['serene', 'dramatic', 'joyful', 'melancholic'];
        const artworks = [];
        
        for (const emotion of emotions.slice(0, count)) {
          const result = await this.pool.query(`
            SELECT * FROM artvee_artworks
            WHERE 
              $1 = ANY(emotion_tags)
              AND image_quality_score >= 0.7
            ORDER BY RANDOM()
            LIMIT 1
          `, [emotion]);
          
          if (result.rows[0]) {
            artworks.push(result.rows[0]);
          }
        }
        
        return artworks;
      },
      
      'artist_identification': async () => {
        // 작가 식별 문제용 작품 선택
        const result = await this.pool.query(`
          WITH famous_artists AS (
            SELECT artist, COUNT(*) as work_count
            FROM artvee_artworks
            WHERE artist IS NOT NULL
            GROUP BY artist
            HAVING COUNT(*) >= 5
            ORDER BY work_count DESC
            LIMIT 20
          )
          SELECT DISTINCT ON (a.artist) a.*
          FROM artvee_artworks a
          JOIN famous_artists fa ON a.artist = fa.artist
          WHERE a.image_quality_score >= 0.8
          ORDER BY a.artist, RANDOM()
          LIMIT $1
        `, [count]);
        
        return result.rows;
      }
    };
    
    const strategy = strategies[questionType];
    if (!strategy) {
      throw new Error(`Unknown question type: ${questionType}`);
    }
    
    const artworks = await strategy();
    
    // 퀴즈 메타데이터 추가
    return artworks.map(artwork => ({
      ...artwork,
      quizData: this.generateQuizData(artwork, questionType, difficulty)
    }));
  }

  // 헬퍼 메서드들
  generateMBTITags(analysis) {
    const tags = [];
    const scores = analysis.mbti.scores;
    
    // 주 유형
    tags.push(analysis.mbti.type);
    
    // 보조 유형 (점수가 근접한 경우)
    if (Math.abs(scores.E - scores.I) < 2) {
      tags.push(analysis.mbti.type.replace(/[EI]/, scores.E > scores.I ? 'I' : 'E'));
    }
    if (Math.abs(scores.N - scores.S) < 2) {
      tags.push(analysis.mbti.type.replace(/[NS]/, scores.N > scores.S ? 'S' : 'N'));
    }
    
    return [...new Set(tags)];
  }

  generateMatchReason(artwork, preferences) {
    const reasons = [];
    
    if (preferences.styles.includes(artwork.style)) {
      reasons.push(`${artwork.style} 스타일은 당신의 성향과 잘 맞습니다`);
    }
    
    if (artwork.emotion_tags?.some(e => preferences.emotions.includes(e))) {
      reasons.push(`이 작품의 감정적 톤이 당신과 공명합니다`);
    }
    
    if (artwork.period && preferences.periods.includes(artwork.period)) {
      reasons.push(`${artwork.period} 시대의 미학을 선호하시는군요`);
    }
    
    return reasons;
  }

  generatePersonalityInsight(mbtiType, artwork) {
    const insights = {
      'INTJ': '이 작품의 구조적 완성도와 숨겨진 의미가 당신의 분석적 사고를 자극할 것입니다.',
      'INFP': '작품 속 감정의 깊이와 상상력이 당신의 내면 세계와 연결될 것입니다.',
      'ENFP': '생동감 넘치는 색채와 자유로운 표현이 당신의 창의성을 일깨울 것입니다.',
      'ISTJ': '세밀한 기법과 전통적 가치가 당신의 미적 기준과 일치합니다.'
    };
    
    return insights[mbtiType] || '이 작품은 당신의 독특한 관점을 풍부하게 할 것입니다.';
  }

  generateGalleryNarrative(mbtiType) {
    const narratives = {
      'NT': '논리와 혁신의 여정: 예술 속 숨겨진 패턴과 의미를 탐구합니다.',
      'NF': '감성과 영감의 여정: 작품이 전하는 깊은 메시지와 감동을 경험합니다.',
      'SJ': '전통과 완성의 여정: 시대를 초월한 걸작들의 기술적 우수성을 감상합니다.',
      'SP': '감각과 순간의 여정: 생생한 시각적 경험과 즉각적인 아름다움을 만납니다.'
    };
    
    const group = mbtiType.slice(1, 3);
    return narratives[group] || narratives.NF;
  }

  designEmotionProgression(startMood, endMood) {
    const progressions = {
      'neutral-inspired': [
        { emotion: 'contemplative', theme: '성찰의 시작' },
        { emotion: 'curious', theme: '발견의 즐거움' },
        { emotion: 'energetic', theme: '창조적 에너지' },
        { emotion: 'inspired', theme: '영감의 정점' }
      ],
      'melancholic-joyful': [
        { emotion: 'melancholic', theme: '내면의 고요' },
        { emotion: 'serene', theme: '평화의 발견' },
        { emotion: 'hopeful', theme: '새로운 가능성' },
        { emotion: 'joyful', theme: '기쁨의 해방' }
      ]
    };
    
    const key = `${startMood}-${endMood}`;
    return progressions[key] || progressions['neutral-inspired'];
  }

  generateSectionDescription(mbtiType, theme, artworks) {
    const artist = artworks[0]?.artist || '익명의 예술가';
    const style = artworks[0]?.style || '다양한 스타일';
    
    return `${theme} - ${artist}의 ${style} 작품을 통해 ${mbtiType} 유형의 고유한 시각을 경험합니다.`;
  }

  generateTransitions(sections) {
    return sections.slice(0, -1).map((section, index) => ({
      from: section.order,
      to: sections[index + 1].order,
      type: 'emotional',
      description: `${section.targetEmotion}에서 ${sections[index + 1].targetEmotion}로의 자연스러운 감정 전환`
    }));
  }

  generateQuizData(artwork, questionType, difficulty) {
    const quizData = {
      question: '',
      options: [],
      correctAnswer: '',
      explanation: ''
    };
    
    switch (questionType) {
      case 'style_recognition':
        quizData.question = '이 작품의 미술 사조는 무엇일까요?';
        quizData.correctAnswer = artwork.style;
        quizData.explanation = `이 작품은 ${artwork.style}의 특징인 ${this.getStyleCharacteristics(artwork.style)}을 보여줍니다.`;
        break;
        
      case 'emotion_matching':
        quizData.question = '이 작품이 전달하는 주된 감정은 무엇일까요?';
        quizData.correctAnswer = artwork.emotion_tags[0];
        quizData.explanation = `색채와 구도에서 ${artwork.emotion_tags[0]}의 느낌이 강하게 드러납니다.`;
        break;
        
      case 'artist_identification':
        quizData.question = '이 작품의 작가는 누구일까요?';
        quizData.correctAnswer = artwork.artist;
        quizData.explanation = `${artwork.artist}의 독특한 화풍과 기법을 확인할 수 있습니다.`;
        break;
    }
    
    return quizData;
  }

  getStyleCharacteristics(style) {
    const characteristics = {
      'impressionism': '빛과 색의 순간적 인상, 붓터치가 보이는 기법',
      'cubism': '기하학적 형태로 분해된 사물, 다각도 동시 표현',
      'surrealism': '꿈과 무의식의 표현, 비현실적 이미지 조합',
      'realism': '사실적이고 정확한 묘사, 일상적 주제'
    };
    
    return characteristics[style] || '독특한 예술적 표현';
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SAYUIntegration;