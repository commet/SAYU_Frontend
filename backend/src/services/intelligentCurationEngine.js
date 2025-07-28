const { pool } = require('../config/database');
const { logger } = require('../config/logger');
const OpenAI = require('openai');

/**
 * SAYU 지능형 큐레이션 엔진
 * 사용자의 성격, 감정, 선호도, 위치를 종합하여 맞춤형 전시 추천
 */
class IntelligentCurationEngine {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 16가지 성격 유형별 예술 선호도 매핑
    this.personalityArtMapping = {
      // 분석가 그룹 (NT)
      'architect': {
        preferredStyles: ['minimalism', 'conceptual_art', 'installation'],
        emotionalResonance: ['contemplative', 'intellectual', 'structured'],
        avoidTopics: ['overly_emotional', 'chaotic'],
        matchThreshold: 0.8
      },
      'logician': {
        preferredStyles: ['mathematical_art', 'optical_illusions', 'systematic'],
        emotionalResonance: ['curious', 'analytical', 'innovative'],
        avoidTopics: ['purely_decorative'],
        matchThreshold: 0.85
      },
      'commander': {
        preferredStyles: ['bold_statements', 'large_scale', 'historical'],
        emotionalResonance: ['powerful', 'ambitious', 'decisive'],
        avoidTopics: ['passive', 'ambiguous'],
        matchThreshold: 0.75
      },
      'debater': {
        preferredStyles: ['provocative', 'controversial', 'multi_perspective'],
        emotionalResonance: ['challenging', 'dynamic', 'intellectual'],
        avoidTopics: ['conservative', 'single_narrative'],
        matchThreshold: 0.8
      },

      // 외교관 그룹 (NF)
      'advocate': {
        preferredStyles: ['symbolic', 'spiritual', 'expressive'],
        emotionalResonance: ['meaningful', 'transformative', 'deep'],
        avoidTopics: ['superficial', 'commercial'],
        matchThreshold: 0.9
      },
      'mediator': {
        preferredStyles: ['romantic', 'nature_inspired', 'personal_narrative'],
        emotionalResonance: ['authentic', 'gentle', 'imaginative'],
        avoidTopics: ['aggressive', 'harsh'],
        matchThreshold: 0.85
      },
      'protagonist': {
        preferredStyles: ['inspiring', 'community_based', 'uplifting'],
        emotionalResonance: ['hopeful', 'connecting', 'empowering'],
        avoidTopics: ['cynical', 'divisive'],
        matchThreshold: 0.8
      },
      'campaigner': {
        preferredStyles: ['colorful', 'experimental', 'collaborative'],
        emotionalResonance: ['joyful', 'spontaneous', 'inclusive'],
        avoidTopics: ['restrictive', 'traditional'],
        matchThreshold: 0.75
      },

      // 관리자 그룹 (SJ)
      'logistician': {
        preferredStyles: ['classical', 'well_crafted', 'documented'],
        emotionalResonance: ['reliable', 'quality', 'traditional'],
        avoidTopics: ['experimental', 'unfinished'],
        matchThreshold: 0.8
      },
      'defender': {
        preferredStyles: ['portraiture', 'cultural_heritage', 'warm'],
        emotionalResonance: ['comforting', 'familiar', 'caring'],
        avoidTopics: ['disturbing', 'cold'],
        matchThreshold: 0.85
      },
      'executive': {
        preferredStyles: ['prestigious', 'established', 'impressive'],
        emotionalResonance: ['accomplished', 'respected', 'formal'],
        avoidTopics: ['underground', 'casual'],
        matchThreshold: 0.75
      },
      'consul': {
        preferredStyles: ['accessible', 'popular', 'celebratory'],
        emotionalResonance: ['social', 'pleasant', 'harmonious'],
        avoidTopics: ['exclusive', 'difficult'],
        matchThreshold: 0.8
      },

      // 탐험가 그룹 (SP)
      'virtuoso': {
        preferredStyles: ['craftsmanship', 'technical', 'hands_on'],
        emotionalResonance: ['skillful', 'practical', 'immediate'],
        avoidTopics: ['overly_theoretical'],
        matchThreshold: 0.8
      },
      'adventurer': {
        preferredStyles: ['aesthetic', 'sensory', 'atmospheric'],
        emotionalResonance: ['beautiful', 'immersive', 'present'],
        avoidTopics: ['intellectual_only'],
        matchThreshold: 0.85
      },
      'entrepreneur': {
        preferredStyles: ['dynamic', 'attention_grabbing', 'trendy'],
        emotionalResonance: ['exciting', 'energetic', 'current'],
        avoidTopics: ['static', 'outdated'],
        matchThreshold: 0.75
      },
      'entertainer': {
        preferredStyles: ['fun', 'interactive', 'spectacular'],
        emotionalResonance: ['entertaining', 'social', 'memorable'],
        avoidTopics: ['serious_only', 'isolated'],
        matchThreshold: 0.8
      }
    };

    // 감정 상태별 예술 매칭
    this.emotionArtMapping = {
      'stress': ['calming', 'nature', 'meditation', 'gentle'],
      'sadness': ['uplifting', 'warm', 'hopeful', 'comforting'],
      'anxiety': ['grounding', 'stable', 'peaceful', 'reassuring'],
      'anger': ['cathartic', 'expressive', 'powerful', 'transformative'],
      'loneliness': ['connecting', 'community', 'relatable', 'inclusive'],
      'excitement': ['dynamic', 'bold', 'innovative', 'stimulating'],
      'contemplative': ['deep', 'philosophical', 'thought_provoking'],
      'curious': ['experimental', 'diverse', 'educational', 'surprising'],
      'romantic': ['beautiful', 'sensual', 'intimate', 'aesthetic'],
      'energetic': ['vibrant', 'active', 'engaging', 'lively']
    };
  }

  /**
   * 메인 큐레이션 함수 - 사용자에게 맞춤형 전시 추천
   */
  async curateExhibitionsForUser(userId, options = {}) {
    try {
      // 1. 사용자 프로필 및 상태 분석
      const userContext = await this.analyzeUserContext(userId);

      // 2. 후보 전시 필터링
      const candidateExhibitions = await this.getCandidateExhibitions(userContext, options);

      // 3. AI 기반 매칭 스코어 계산
      const scoredExhibitions = await this.calculateMatchingScores(candidateExhibitions, userContext);

      // 4. 다양성 및 균형 보장
      const balancedRecommendations = this.ensureRecommendationDiversity(scoredExhibitions, userContext);

      // 5. 개인화된 설명 생성
      const finalRecommendations = await this.generatePersonalizedDescriptions(balancedRecommendations, userContext);

      // 6. 추천 로그 저장
      await this.logRecommendation(userId, finalRecommendations);

      return {
        success: true,
        recommendations: finalRecommendations,
        userContext: {
          personality: userContext.personality,
          currentMood: userContext.currentMood,
          location: userContext.location
        },
        metadata: {
          totalCandidates: candidateExhibitions.length,
          finalCount: finalRecommendations.length,
          generatedAt: new Date()
        }
      };

    } catch (error) {
      logger.error('Curation engine error:', error);
      return {
        success: false,
        error: error.message,
        fallbackRecommendations: await this.getFallbackRecommendations(options)
      };
    }
  }

  /**
   * 사용자 컨텍스트 분석
   */
  async analyzeUserContext(userId) {
    // 기본 프로필
    const userProfile = await pool.query(`
      SELECT personality_type, location, art_preferences, 
             last_emotion_state, visit_history
      FROM users WHERE id = $1
    `, [userId]);

    if (userProfile.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userProfile.rows[0];

    // 최근 활동 분석
    const recentActivity = await pool.query(`
      SELECT exhibition_id, liked, visited, rating, review_sentiment
      FROM user_exhibition_interactions 
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC LIMIT 20
    `, [userId]);

    // 현재 감정 상태 (최근 감정 로그 또는 기본값)
    const currentEmotion = await this.getCurrentEmotionalState(userId);

    // 위치 기반 접근 가능한 지역
    const accessibleRegions = this.getAccessibleRegions(user.location);

    return {
      personality: user.personality_type,
      personalityProfile: this.personalityArtMapping[user.personality_type],
      currentMood: currentEmotion,
      location: user.location,
      accessibleRegions,
      artPreferences: user.art_preferences || {},
      recentActivity: recentActivity.rows,
      visitHistory: user.visit_history || []
    };
  }

  /**
   * 후보 전시 수집
   */
  async getCandidateExhibitions(userContext, options) {
    const {
      limit = 50,
      includeOnline = true,
      maxDistance = 50, // km
      statusFilter = ['ongoing', 'upcoming']
    } = options;

    let query = `
      SELECT e.*, v.name as venue_name, v.city as venue_city, v.type as venue_type,
             v.tier as venue_tier, v.latitude, v.longitude,
             ARRAY_AGG(DISTINCT a.name) as artists,
             ARRAY_AGG(DISTINCT t.name) as tags,
             e.emotion_profile, e.personality_matches
      FROM exhibitions e
      JOIN venues v ON e.venue_id = v.id
      LEFT JOIN exhibition_artists ea ON e.id = ea.exhibition_id
      LEFT JOIN artists a ON ea.artist_id = a.id
      LEFT JOIN exhibition_tags et ON e.id = et.exhibition_id
      LEFT JOIN tags t ON et.tag_id = t.id
      WHERE e.status = ANY($1)
    `;

    const queryParams = [statusFilter];
    let paramIndex = 2;

    // 지역 필터
    if (userContext.accessibleRegions.length > 0) {
      query += ` AND (v.city = ANY($${paramIndex}) OR e.is_online = true)`;
      queryParams.push(userContext.accessibleRegions);
      paramIndex++;
    }

    // 사용자가 이미 본 전시 제외
    if (userContext.visitHistory.length > 0) {
      query += ` AND e.id NOT IN (${userContext.visitHistory.map(() => `$${paramIndex++}`).join(',')})`;
      queryParams.push(...userContext.visitHistory);
    }

    query += `
      GROUP BY e.id, v.id
      ORDER BY 
        CASE WHEN v.tier = 1 THEN 1 ELSE 2 END,
        e.views DESC,
        e.created_at DESC
      LIMIT $${paramIndex}
    `;

    queryParams.push(limit);

    const result = await pool.query(query, queryParams);
    return result.rows;
  }

  /**
   * AI 기반 매칭 스코어 계산
   */
  async calculateMatchingScores(exhibitions, userContext) {
    const scoredExhibitions = [];

    for (const exhibition of exhibitions) {
      const scores = {
        personality: this.calculatePersonalityMatch(exhibition, userContext),
        emotion: this.calculateEmotionalMatch(exhibition, userContext),
        preference: this.calculatePreferenceMatch(exhibition, userContext),
        diversity: this.calculateDiversityBonus(exhibition, userContext),
        accessibility: this.calculateAccessibilityScore(exhibition, userContext),
        freshness: this.calculateFreshnessScore(exhibition, userContext)
      };

      // 가중 평균으로 최종 스코어 계산
      const totalScore =
        scores.personality * 0.25 +
        scores.emotion * 0.25 +
        scores.preference * 0.20 +
        scores.diversity * 0.10 +
        scores.accessibility * 0.10 +
        scores.freshness * 0.10;

      scoredExhibitions.push({
        ...exhibition,
        matchScore: totalScore,
        scoreBreakdown: scores
      });
    }

    // 스코어 순으로 정렬
    return scoredExhibitions.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * 성격 매칭 스코어 계산
   */
  calculatePersonalityMatch(exhibition, userContext) {
    const { personalityProfile } = userContext;
    if (!personalityProfile) return 0.5;

    let score = 0;
    let factors = 0;

    // 전시 스타일 매칭
    if (exhibition.style_tags) {
      const matchingStyles = exhibition.style_tags.filter(style =>
        personalityProfile.preferredStyles.includes(style)
      );
      score += (matchingStyles.length / personalityProfile.preferredStyles.length) * 0.4;
      factors += 0.4;
    }

    // 감정적 공명 매칭
    if (exhibition.emotion_profile) {
      const emotionMatch = personalityProfile.emotionalResonance.some(emotion =>
        exhibition.emotion_profile.includes(emotion)
      );
      score += emotionMatch ? 0.3 : 0;
      factors += 0.3;
    }

    // 회피 토픽 확인
    if (exhibition.topics) {
      const hasAvoidTopic = exhibition.topics.some(topic =>
        personalityProfile.avoidTopics.includes(topic)
      );
      score += hasAvoidTopic ? 0 : 0.3;
      factors += 0.3;
    }

    return factors > 0 ? score / factors : 0.5;
  }

  /**
   * 감정 매칭 스코어 계산
   */
  calculateEmotionalMatch(exhibition, userContext) {
    const { currentMood } = userContext;
    if (!currentMood || !this.emotionArtMapping[currentMood]) return 0.5;

    const recommendedTypes = this.emotionArtMapping[currentMood];

    if (exhibition.emotion_profile) {
      const matches = exhibition.emotion_profile.filter(emotion =>
        recommendedTypes.includes(emotion)
      );
      return matches.length / recommendedTypes.length;
    }

    return 0.5;
  }

  /**
   * 추천 다양성 보장
   */
  ensureRecommendationDiversity(scoredExhibitions, userContext) {
    const maxRecommendations = 10;
    const recommendations = [];
    const usedVenues = new Set();
    const usedStyles = new Set();

    for (const exhibition of scoredExhibitions) {
      if (recommendations.length >= maxRecommendations) break;

      // 다양성 체크
      const venueId = exhibition.venue_id;
      const style = exhibition.primary_style;

      // 같은 미술관에서 너무 많이 추천하지 않기
      const venueCount = recommendations.filter(r => r.venue_id === venueId).length;
      if (venueCount >= 2) continue;

      // 스타일 다양성 보장
      if (usedStyles.has(style) && usedStyles.size < 5) {
        // 이미 사용된 스타일이지만 아직 다양성이 부족한 경우 스킵
        continue;
      }

      recommendations.push(exhibition);
      usedVenues.add(venueId);
      if (style) usedStyles.add(style);
    }

    return recommendations;
  }

  /**
   * 개인화된 설명 생성
   */
  async generatePersonalizedDescriptions(exhibitions, userContext) {
    const results = [];

    for (const exhibition of exhibitions) {
      try {
        const personalizedDescription = await this.generateCuratorNote(exhibition, userContext);

        results.push({
          ...exhibition,
          curatorNote: personalizedDescription,
          recommendationReason: this.generateRecommendationReason(exhibition, userContext),
          personalizedHighlights: this.extractPersonalizedHighlights(exhibition, userContext)
        });

        // API 호출 제한
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        logger.error(`Failed to generate description for exhibition ${exhibition.id}:`, error);

        // 기본 설명 사용
        results.push({
          ...exhibition,
          curatorNote: this.generateFallbackDescription(exhibition, userContext),
          recommendationReason: '당신의 성격과 현재 감정에 맞는 전시입니다.',
          personalizedHighlights: ['추천 전시']
        });
      }
    }

    return results;
  }

  /**
   * GPT 기반 큐레이터 노트 생성
   */
  async generateCuratorNote(exhibition, userContext) {
    const prompt = `당신은 전문 아트 큐레이터입니다. 다음 사용자에게 이 전시를 추천하는 개인적이고 감성적인 메시지를 2-3문장으로 작성해주세요.

사용자 프로필:
- 성격 유형: ${userContext.personality}
- 현재 감정: ${userContext.currentMood}
- 위치: ${userContext.location}

전시 정보:
- 제목: ${exhibition.title}
- 장소: ${exhibition.venue_name}
- 작가: ${exhibition.artists?.join(', ') || '미상'}
- 설명: ${exhibition.description || ''}

톤: 친근하고 개인적이며, 왜 이 전시가 지금 이 사용자에게 특별한지 설명
언어: 한국어
길이: 2-3문장`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  }

  /**
   * 기본 설명 생성 (GPT 실패 시 폴백)
   */
  generateFallbackDescription(exhibition, userContext) {
    const personalityTraits = {
      'architect': '논리적이고 체계적인',
      'advocate': '의미있고 깊이 있는',
      'entertainer': '즐겁고 역동적인'
      // ... 다른 성격 유형들
    };

    const trait = personalityTraits[userContext.personality] || '흥미로운';

    return `${trait} 성향의 당신에게 특별히 추천하는 ${exhibition.title} 전시입니다. ${exhibition.venue_name}에서 만나보세요.`;
  }

  /**
   * 추천 로그 저장
   */
  async logRecommendation(userId, recommendations) {
    try {
      const logData = {
        user_id: userId,
        recommendations: recommendations.map(r => ({
          exhibition_id: r.id,
          match_score: r.matchScore,
          score_breakdown: r.scoreBreakdown
        })),
        created_at: new Date()
      };

      await pool.query(
        'INSERT INTO recommendation_logs (user_id, recommendations, created_at) VALUES ($1, $2, $3)',
        [userId, JSON.stringify(logData.recommendations), logData.created_at]
      );

    } catch (error) {
      logger.error('Failed to log recommendation:', error);
    }
  }

  /**
   * 현재 감정 상태 분석
   */
  async getCurrentEmotionalState(userId) {
    const recentEmotion = await pool.query(`
      SELECT emotion_state 
      FROM user_emotion_logs 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [userId]);

    return recentEmotion.rows[0]?.emotion_state || 'curious';
  }

  /**
   * 접근 가능한 지역 계산
   */
  getAccessibleRegions(userLocation) {
    // 사용자 위치 기반으로 접근 가능한 도시들 반환
    const cityGroups = {
      '서울': ['서울', '경기', '인천'],
      '부산': ['부산', '경남'],
      '대구': ['대구', '경북'],
      '광주': ['광주', '전남'],
      '대전': ['대전', '충남', '충북']
    };

    return cityGroups[userLocation] || [userLocation];
  }

  /**
   * 기본 추천 (시스템 실패 시)
   */
  async getFallbackRecommendations(options) {
    const query = `
      SELECT e.*, v.name as venue_name, v.city as venue_city
      FROM exhibitions e
      JOIN venues v ON e.venue_id = v.id
      WHERE e.status = 'ongoing' AND v.tier <= 2
      ORDER BY e.views DESC
      LIMIT 5
    `;

    const result = await pool.query(query);
    return result.rows.map(ex => ({
      ...ex,
      curatorNote: '현재 인기 있는 전시입니다.',
      matchScore: 0.7
    }));
  }

  // 추가 유틸리티 메서드들...
  calculatePreferenceMatch(exhibition, userContext) {
    // 사용자 선호도 기반 매칭
    return 0.7; // 임시값
  }

  calculateDiversityBonus(exhibition, userContext) {
    // 다양성 보너스 계산
    return 0.1;
  }

  calculateAccessibilityScore(exhibition, userContext) {
    // 접근성 점수 계산 (거리, 교통, 시간 등)
    return 0.8;
  }

  calculateFreshnessScore(exhibition, userContext) {
    // 신선도 점수 (새로운 전시일수록 높은 점수)
    const daysSinceCreated = (new Date() - new Date(exhibition.created_at)) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (daysSinceCreated / 30)); // 30일 후 0점
  }

  generateRecommendationReason(exhibition, userContext) {
    const reasons = [];

    if (exhibition.scoreBreakdown.personality > 0.8) {
      reasons.push('당신의 성격과 완벽하게 맞습니다');
    }

    if (exhibition.scoreBreakdown.emotion > 0.7) {
      reasons.push('현재 감정 상태에 도움이 될 것 같습니다');
    }

    if (exhibition.venue_tier === 1) {
      reasons.push('유명한 미술관의 특별 전시입니다');
    }

    return reasons.join(', ') || '당신에게 추천하는 전시입니다';
  }

  extractPersonalizedHighlights(exhibition, userContext) {
    const highlights = [];

    // 성격 기반 하이라이트
    const personalityProfile = this.personalityArtMapping[userContext.personality];
    if (personalityProfile) {
      exhibition.tags?.forEach(tag => {
        if (personalityProfile.preferredStyles.includes(tag)) {
          highlights.push(`${tag} 스타일`);
        }
      });
    }

    // 기본 하이라이트
    if (exhibition.artists?.length > 0) {
      highlights.push(`${exhibition.artists[0]} 작가`);
    }

    if (exhibition.venue_tier === 1) {
      highlights.push('프리미엄 미술관');
    }

    return highlights.slice(0, 3); // 최대 3개
  }
}

module.exports = new IntelligentCurationEngine();
