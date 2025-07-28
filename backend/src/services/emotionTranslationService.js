const openai = require('../config/openai');
const db = require('../config/database');
const vectorSimilarityService = require('./vectorSimilarityService');

class EmotionTranslationService {
  /**
   * 감정 입력을 해석하고 벡터로 변환
   */
  async interpretEmotion(emotionInput) {
    try {
      // 감정 데이터를 텍스트로 변환
      const emotionDescription = this.buildEmotionDescription(emotionInput);

      // OpenAI를 사용해 감정 해석
      const interpretation = await this.analyzeEmotionWithAI(emotionDescription, emotionInput);

      // 감정을 벡터로 변환
      const emotionVector = await this.convertToVector(interpretation);

      return {
        emotionId: emotionInput.id,
        interpretation,
        vector: emotionVector,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error interpreting emotion:', error);
      throw error;
    }
  }

  /**
   * 감정 데이터를 설명하는 텍스트 생성
   */
  buildEmotionDescription(emotionInput) {
    const parts = [];

    // 색상 설명
    if (emotionInput.color) {
      const { primary, gradient, animation } = emotionInput.color;
      parts.push(`Primary color: HSL(${primary.hue}, ${primary.saturation}%, ${primary.lightness}%)`);

      if (gradient) {
        parts.push(`Gradient with ${gradient.stops.length} colors`);
      }

      if (animation) {
        parts.push(`Animation: ${animation.type} with ${animation.intensity} intensity`);
      }
    }

    // 날씨 메타포
    if (emotionInput.weather) {
      parts.push(`Weather metaphor: ${emotionInput.weather}`);
    }

    // 형태
    if (emotionInput.shape) {
      parts.push(`Shape: ${emotionInput.shape.type} with complexity ${emotionInput.shape.complexity}`);
    }

    // 소리
    if (emotionInput.sound) {
      parts.push(`Sound: ${emotionInput.sound.pitch} pitch, ${emotionInput.sound.tempo} BPM`);
    }

    // 컨텍스트
    if (emotionInput.context) {
      parts.push(`Context: ${emotionInput.context.timeOfDay} in ${emotionInput.context.season}`);
    }

    return parts.join('. ');
  }

  /**
   * AI를 사용해 감정 분석
   */
  async analyzeEmotionWithAI(description, emotionInput) {
    const prompt = `
    You are an expert in emotional psychology and art therapy. Analyze the following emotional expression and provide a detailed interpretation.
    
    Emotional Expression:
    ${description}
    
    Please analyze and return a JSON object with:
    1. dimensions: {
       valence: number (-1 to 1, negative to positive),
       arousal: number (0 to 1, calm to excited),
       dominance: number (0 to 1, submissive to dominant),
       complexity: number (0 to 1, simple to complex)
    }
    2. characteristics: {
       primary: string (main emotion label),
       secondary: string (secondary emotion if any),
       nuances: array of strings (subtle emotional nuances)
    }
    3. artisticHints: {
       preferredStyles: array of art styles,
       avoidStyles: array of styles to avoid,
       colorPalette: 'warm' | 'cool' | 'neutral' | 'contrasting',
       composition: 'centered' | 'dynamic' | 'scattered' | 'layered',
       texture: 'smooth' | 'rough' | 'mixed',
       movement: 'static' | 'flowing' | 'explosive' | 'rhythmic'
    }
    
    Consider color psychology:
    - Warm colors (red, orange, yellow): energy, passion, warmth
    - Cool colors (blue, green, purple): calm, peace, introspection
    - High saturation: intensity, strong emotion
    - Low saturation: subtlety, muted emotion
    - Light values: optimism, openness
    - Dark values: depth, mystery, introspection
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in emotional psychology and art therapy. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * 감정 해석을 벡터로 변환
   */
  async convertToVector(interpretation) {
    // 다차원 감정 공간에서의 위치를 벡터로 표현
    const vector = [
      interpretation.dimensions.valence,
      interpretation.dimensions.arousal,
      interpretation.dimensions.dominance,
      interpretation.dimensions.complexity,
      // 색상 관련 차원들
      this.mapColorPaletteToValue(interpretation.artisticHints.colorPalette),
      this.mapCompositionToValue(interpretation.artisticHints.composition),
      this.mapTextureToValue(interpretation.artisticHints.texture),
      this.mapMovementToValue(interpretation.artisticHints.movement)
    ];

    // 스타일 선호도 추가 (각 스타일에 대한 점수)
    const styleVector = await this.encodeStylePreferences(
      interpretation.artisticHints.preferredStyles,
      interpretation.artisticHints.avoidStyles
    );

    return [...vector, ...styleVector];
  }

  /**
   * 예술 작품과 감정 매칭
   */
  async findMatchingArtworks(emotionVector, interpretation, limit = 10) {
    try {
      // 1. 직접적 매칭: 감정 벡터와 가장 유사한 작품들
      const directMatches = await this.findDirectMatches(emotionVector, interpretation, Math.ceil(limit * 0.5));

      // 2. 은유적 매칭: 구조적/주제적 유사성
      const metaphoricalMatches = await this.findMetaphoricalMatches(interpretation, Math.ceil(limit * 0.3));

      // 3. 보완적 매칭: 감정의 균형을 위한 작품
      const complementaryMatches = await this.findComplementaryMatches(emotionVector, interpretation, Math.ceil(limit * 0.2));

      // 결과 통합 및 중복 제거
      const allMatches = [
        ...directMatches.map(m => ({ ...m, type: 'direct' })),
        ...metaphoricalMatches.map(m => ({ ...m, type: 'metaphorical' })),
        ...complementaryMatches.map(m => ({ ...m, type: 'complementary' }))
      ];

      // 중복 제거 및 점수순 정렬
      const uniqueMatches = this.deduplicateMatches(allMatches);

      // 각 매칭에 대한 설명 생성
      const matchesWithExplanation = await Promise.all(
        uniqueMatches.slice(0, limit).map(match =>
          this.generateMatchExplanation(match, interpretation)
        )
      );

      return matchesWithExplanation;
    } catch (error) {
      console.error('Error finding matching artworks:', error);
      throw error;
    }
  }

  /**
   * 직접적 매칭: 감정 벡터 유사도 기반
   */
  async findDirectMatches(emotionVector, interpretation, limit) {
    // 데이터베이스에서 벡터 유사도 검색
    const query = `
      SELECT 
        a.*,
        1 - (a.emotion_vector <=> $1::vector) as similarity_score
      FROM artworks a
      WHERE a.emotion_vector IS NOT NULL
      ORDER BY a.emotion_vector <=> $1::vector
      LIMIT $2
    `;

    const result = await db.query(query, [emotionVector, limit]);

    return result.rows.map(row => ({
      artwork: this.formatArtwork(row),
      score: row.similarity_score,
      matchingAspects: this.identifyMatchingAspects(row, interpretation)
    }));
  }

  /**
   * 은유적 매칭: 구조적/주제적 유사성
   */
  async findMetaphoricalMatches(interpretation, limit) {
    // 감정의 구조적 특성과 유사한 구조를 가진 작품 찾기
    const structuralQuery = `
      SELECT a.*
      FROM artworks a
      WHERE 
        a.composition_type = $1
        OR a.movement_type = $2
        OR a.texture_type = $3
      ORDER BY 
        CASE 
          WHEN a.composition_type = $1 THEN 1
          WHEN a.movement_type = $2 THEN 2
          WHEN a.texture_type = $3 THEN 3
        END,
        a.view_count DESC
      LIMIT $4
    `;

    const result = await db.query(structuralQuery, [
      interpretation.artisticHints.composition,
      interpretation.artisticHints.movement,
      interpretation.artisticHints.texture,
      limit
    ]);

    return result.rows.map(row => ({
      artwork: this.formatArtwork(row),
      score: 0.8, // 은유적 매칭은 약간 낮은 기본 점수
      metaphorType: this.identifyMetaphorType(row, interpretation)
    }));
  }

  /**
   * 보완적 매칭: 감정의 균형을 위한 작품
   */
  async findComplementaryMatches(emotionVector, interpretation, limit) {
    // 반대 감정 벡터 생성
    const complementaryVector = emotionVector.map((value, index) => {
      if (index === 0) return -value; // valence 반전
      if (index === 1) return 1 - value; // arousal 반전
      return value; // 나머지는 유지
    });

    const query = `
      SELECT 
        a.*,
        1 - (a.emotion_vector <=> $1::vector) as complementary_score
      FROM artworks a
      WHERE a.emotion_vector IS NOT NULL
      ORDER BY a.emotion_vector <=> $1::vector
      LIMIT $2
    `;

    const result = await db.query(query, [complementaryVector, limit]);

    return result.rows.map(row => ({
      artwork: this.formatArtwork(row),
      score: row.complementary_score * 0.7, // 보완적 매칭은 더 낮은 점수
      balanceType: this.identifyBalanceType(row, interpretation)
    }));
  }

  /**
   * 매칭 설명 생성
   */
  async generateMatchExplanation(match, interpretation) {
    const explanationPrompt = `
    Explain why this artwork matches the emotion in a poetic and insightful way.
    
    Emotion characteristics:
    - Primary: ${interpretation.characteristics.primary}
    - Nuances: ${interpretation.characteristics.nuances.join(', ')}
    - Color palette: ${interpretation.artisticHints.colorPalette}
    
    Artwork:
    - Title: ${match.artwork.title}
    - Artist: ${match.artwork.artist}
    - Style: ${match.artwork.style}
    - Match type: ${match.type}
    
    Provide:
    1. A one-sentence reasoning for the connection
    2. 2-3 specific connection points
    3. An emotional journey (from -> through -> to)
    
    Be concise and meaningful. Respond in the language of the emotion data.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a sensitive art therapist and curator who sees deep connections between emotions and art.'
        },
        {
          role: 'user',
          content: explanationPrompt
        }
      ],
      temperature: 0.8
    });

    const explanation = this.parseExplanation(response.choices[0].message.content);

    return {
      ...match,
      matching: {
        score: match.score,
        type: match.type,
        reasoning: explanation.reasoning,
        connections: explanation.connections
      },
      emotionalJourney: explanation.journey
    };
  }

  // 헬퍼 메서드들
  mapColorPaletteToValue(palette) {
    const mapping = { warm: 0.8, cool: 0.2, neutral: 0.5, contrasting: 1 };
    return mapping[palette] || 0.5;
  }

  mapCompositionToValue(composition) {
    const mapping = { centered: 0.2, dynamic: 0.8, scattered: 0.6, layered: 1 };
    return mapping[composition] || 0.5;
  }

  mapTextureToValue(texture) {
    const mapping = { smooth: 0.2, rough: 0.8, mixed: 0.5 };
    return mapping[texture] || 0.5;
  }

  mapMovementToValue(movement) {
    const mapping = { static: 0, flowing: 0.5, explosive: 1, rhythmic: 0.7 };
    return mapping[movement] || 0.5;
  }

  async encodeStylePreferences(preferred, avoided) {
    // 간단한 스타일 인코딩 (실제로는 더 복잡한 인코딩 필요)
    const allStyles = [
      'impressionism', 'expressionism', 'abstract', 'realism',
      'surrealism', 'minimalism', 'baroque', 'contemporary'
    ];

    return allStyles.map(style => {
      if (preferred.includes(style)) return 1;
      if (avoided.includes(style)) return -1;
      return 0;
    });
  }

  formatArtwork(row) {
    return {
      id: row.id,
      title: row.title,
      artist: row.artist,
      year: row.year,
      imageUrl: row.image_url,
      style: row.style,
      medium: row.medium,
      museum: row.museum,
      description: row.description
    };
  }

  deduplicateMatches(matches) {
    const seen = new Set();
    return matches
      .filter(match => {
        if (seen.has(match.artwork.id)) return false;
        seen.add(match.artwork.id);
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }

  identifyMatchingAspects(artwork, interpretation) {
    const aspects = [];

    if (artwork.dominant_colors && interpretation.artisticHints.colorPalette) {
      aspects.push('color harmony');
    }

    if (artwork.composition_type === interpretation.artisticHints.composition) {
      aspects.push('compositional structure');
    }

    if (artwork.emotional_tags?.includes(interpretation.characteristics.primary)) {
      aspects.push('emotional resonance');
    }

    return aspects;
  }

  identifyMetaphorType(artwork, interpretation) {
    if (artwork.composition_type === interpretation.artisticHints.composition) {
      return 'structural metaphor';
    }
    if (artwork.movement_type === interpretation.artisticHints.movement) {
      return 'dynamic metaphor';
    }
    return 'thematic metaphor';
  }

  identifyBalanceType(artwork, interpretation) {
    if (artwork.emotional_valence && interpretation.dimensions.valence < 0) {
      return 'emotional balance';
    }
    if (artwork.energy_level && interpretation.dimensions.arousal > 0.7) {
      return 'energy balance';
    }
    return 'aesthetic balance';
  }

  parseExplanation(aiResponse) {
    // AI 응답을 구조화된 형태로 파싱
    // 실제 구현에서는 더 정교한 파싱 필요
    const lines = aiResponse.split('\n').filter(line => line.trim());

    return {
      reasoning: lines[0] || 'Deep emotional resonance found',
      connections: lines.slice(1, 4).map(line => {
        const [aspect, description] = line.split(':').map(s => s.trim());
        return { aspect: aspect || 'Connection', description: description || line };
      }),
      journey: {
        from: 'Current emotional state',
        through: 'Artistic transformation',
        to: 'Emotional resolution'
      }
    };
  }

  /**
   * 감정 번역 세션 저장
   */
  async saveTranslationSession(userId, emotionInput, interpretation, matches) {
    const query = `
      INSERT INTO emotion_translation_sessions 
      (user_id, emotion_input, interpretation, matches, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `;

    const result = await db.query(query, [
      userId,
      JSON.stringify(emotionInput),
      JSON.stringify(interpretation),
      JSON.stringify(matches)
    ]);

    return result.rows[0].id;
  }
}

module.exports = new EmotionTranslationService();
