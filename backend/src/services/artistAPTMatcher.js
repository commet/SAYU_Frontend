// Artist APT Matcher Service - 작가를 16가지 APT 유형으로 정밀 분류
// CORRECTED SAYU AXIS DEFINITIONS:
// L/S: Lone (Individual, introspective) vs Social (Interactive, collaborative)
// A/R: Abstract (Atmospheric, symbolic) vs Representational (Realistic, concrete)
// E/M: Emotional (Affective, feeling-based) vs Meaning-driven (Analytical, rational)
// F/C: Flow (Fluid, spontaneous) vs Constructive (Structured, systematic)

const db = require('../config/database');
const { SAYU_TYPES } = require('../../../shared/SAYUTypeDefinitions');
const { openai } = require('../config/openai');
const axios = require('axios');

class ArtistAPTMatcher {
  constructor() {
    this.aptTypes = Object.keys(SAYU_TYPES);
    
    // 4축 평가 기준 (CORRECTED SAYU DEFINITIONS)
    this.evaluationCriteria = {
      L_S: { // Lone (Individual, introspective) vs Social (Interactive, collaborative)
        L: ['독립적 작업', '고독한 작업실', '개인주의적', '내향적', '은둔적', '자기성찰적'],
        S: ['협업 선호', '그룹 활동', '사회적 메시지', '공동체 지향', '외향적', '네트워킹']
      },
      A_R: { // Abstract (Atmospheric, symbolic) vs Representational (Realistic, concrete)
        A: ['추상화', '개념적', '형태 해체', '색채 중심', '비구상', '분위기적'],
        R: ['사실주의', '구체적 묘사', '인물화', '풍경화', '정물화', '세밀한 표현']
      },
      E_M: { // Emotional (Affective, feeling-based) vs Meaning-driven (Analytical, rational)
        E: ['감정 표현', '직관적', '열정적', '감성적', '즉흥적', '개인적 경험'],
        M: ['지적 탐구', '철학적', '개념 중심', '이론적', '분석적', '사회 비평']
      },
      F_C: { // Flow (Fluid, spontaneous) vs Constructive (Structured, systematic)
        F: ['실험적', '자발적', '혁신적', '즉흥적', '유동적', '탐험적'],
        C: ['전통적', '기법 중시', '체계적', '계획적', '구조적', '체계적']
      }
    };
  }

  // ==================== 메인 분석 함수 ====================
  
  async analyzeArtist(artistData) {
    try {
      console.log(`🎨 작가 APT 분석 시작: ${artistData.name}`);
      
      // 1. 기본 정보 수집
      const enrichedData = await this.enrichArtistData(artistData);
      
      // 2. 4축 점수 계산
      const axisScores = await this.calculateAxisScores(enrichedData);
      
      // 3. APT 유형 결정
      const aptType = this.determineAPTType(axisScores);
      
      // 4. 신뢰도 계산
      const confidence = this.calculateConfidence(axisScores, enrichedData);
      
      // 5. 상세 분석 생성
      const analysis = await this.generateDetailedAnalysis(enrichedData, aptType, axisScores);
      
      return {
        artistId: artistData.id,
        artistName: artistData.name,
        aptType,
        axisScores,
        confidence,
        analysis,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`작가 분석 실패: ${artistData.name}`, error);
      throw error;
    }
  }

  // ==================== 데이터 수집 ====================
  
  async enrichArtistData(artistData) {
    const enriched = { ...artistData };
    
    // Wikipedia 데이터가 있으면 활용
    if (artistData.bio) {
      enriched.wikipediaAnalysis = await this.analyzeWikipediaText(artistData.bio);
    }
    
    // 작품 데이터 수집
    const artworks = await this.getArtistArtworks(artistData.id);
    enriched.artworks = artworks;
    enriched.artworkAnalysis = this.analyzeArtworkStyles(artworks);
    
    // 전시 이력 분석
    const exhibitions = await this.getArtistExhibitions(artistData.id);
    enriched.exhibitionAnalysis = this.analyzeExhibitionHistory(exhibitions);
    
    return enriched;
  }

  // ==================== 4축 점수 계산 ====================
  
  async calculateAxisScores(enrichedData) {
    const scores = {
      L_S: 0, // -100(L) ~ +100(S)
      A_R: 0, // -100(A) ~ +100(R)
      E_M: 0, // -100(E) ~ +100(M)
      F_C: 0  // -100(F) ~ +100(C)
    };
    
    // 1. 텍스트 기반 분석
    if (enrichedData.wikipediaAnalysis) {
      const textScores = this.analyzeTextForAxes(enrichedData.wikipediaAnalysis);
      scores.L_S += textScores.L_S * 0.3;
      scores.A_R += textScores.A_R * 0.3;
      scores.E_M += textScores.E_M * 0.3;
      scores.F_C += textScores.F_C * 0.3;
    }
    
    // 2. 작품 스타일 분석
    if (enrichedData.artworkAnalysis) {
      scores.A_R += enrichedData.artworkAnalysis.abstractionLevel * 0.4;
      scores.E_M += enrichedData.artworkAnalysis.emotionalContent * 0.2;
      scores.F_C += enrichedData.artworkAnalysis.experimentalLevel * 0.2;
    }
    
    // 3. 전시 이력 분석
    if (enrichedData.exhibitionAnalysis) {
      scores.L_S += enrichedData.exhibitionAnalysis.collaborativeScore * 0.2;
    }
    
    // 4. AI 기반 종합 분석
    const aiScores = await this.getAIAxisScores(enrichedData);
    scores.L_S += aiScores.L_S * 0.1;
    scores.A_R += aiScores.A_R * 0.1;
    scores.E_M += aiScores.E_M * 0.1;
    scores.F_C += aiScores.F_C * 0.1;
    
    // 점수 정규화 (-100 ~ +100)
    Object.keys(scores).forEach(axis => {
      scores[axis] = Math.max(-100, Math.min(100, scores[axis]));
    });
    
    return scores;
  }

  analyzeTextForAxes(wikipediaAnalysis) {
    const scores = { L_S: 0, A_R: 0, E_M: 0, F_C: 0 };
    const text = wikipediaAnalysis.toLowerCase();
    
    // L/S 축 분석
    this.evaluationCriteria.L_S.L.forEach(keyword => {
      if (text.includes(keyword)) scores.L_S -= 20;
    });
    this.evaluationCriteria.L_S.S.forEach(keyword => {
      if (text.includes(keyword)) scores.L_S += 20;
    });
    
    // A/R 축 분석
    this.evaluationCriteria.A_R.A.forEach(keyword => {
      if (text.includes(keyword)) scores.A_R -= 20;
    });
    this.evaluationCriteria.A_R.R.forEach(keyword => {
      if (text.includes(keyword)) scores.A_R += 20;
    });
    
    // E/M 축 분석
    this.evaluationCriteria.E_M.E.forEach(keyword => {
      if (text.includes(keyword)) scores.E_M -= 20;
    });
    this.evaluationCriteria.E_M.M.forEach(keyword => {
      if (text.includes(keyword)) scores.E_M += 20;
    });
    
    // F/C 축 분석
    this.evaluationCriteria.F_C.F.forEach(keyword => {
      if (text.includes(keyword)) scores.F_C -= 20;
    });
    this.evaluationCriteria.F_C.C.forEach(keyword => {
      if (text.includes(keyword)) scores.F_C += 20;
    });
    
    return scores;
  }

  // ==================== APT 유형 결정 ====================
  
  determineAPTType(axisScores) {
    let aptCode = '';
    
    // L/S 축
    aptCode += axisScores.L_S < 0 ? 'L' : 'S';
    
    // A/R 축
    aptCode += axisScores.A_R < 0 ? 'A' : 'R';
    
    // E/M 축
    aptCode += axisScores.E_M < 0 ? 'E' : 'M';
    
    // F/C 축
    aptCode += axisScores.F_C < 0 ? 'F' : 'C';
    
    return aptCode;
  }

  // ==================== AI 기반 분석 ====================
  
  async getAIAxisScores(enrichedData) {
    try {
      const prompt = `
작가 정보를 바탕으로 4가지 축의 점수를 평가해주세요:

작가: ${enrichedData.name}
생애: ${enrichedData.birth_year || '?'} - ${enrichedData.death_year || '현재'}
국적: ${enrichedData.nationality || '알 수 없음'}
주요 작품: ${enrichedData.artworks?.slice(0, 5).map(a => a.title).join(', ') || '정보 없음'}
설명: ${enrichedData.bio?.substring(0, 500) || '정보 없음'}

다음 4개 축에 대해 -100(첫 번째 특성)에서 +100(두 번째 특성) 사이의 점수를 매겨주세요:

1. L_S축: 혼자(-100) vs 함께(+100)
   - 혼자: 독립적, 은둔적, 개인 작업실, 내향적
   - 함께: 협업, 그룹 활동, 사회적, 외향적

2. A_R축: 추상(-100) vs 구상(+100)
   - 추상: 비구상, 개념적, 형태 해체, 색채 중심
   - 구상: 사실주의, 구체적 묘사, 인물/풍경/정물

3. E_M축: 감정(-100) vs 의미(+100)
   - 감정: 직관적, 열정적, 감성적, 개인적 경험
   - 의미: 지적, 철학적, 개념 중심, 사회 비평

4. F_C축: 자유(-100) vs 체계(+100)
   - 자유: 실험적, 규칙 파괴, 즉흥적, 혁신적
   - 체계: 전통적, 기법 중시, 계획적, 정교한

JSON 형식으로 응답해주세요:
{
  "L_S": 점수,
  "A_R": 점수,
  "E_M": 점수,
  "F_C": 점수,
  "reasoning": "간단한 설명"
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 500,
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        L_S: result.L_S || 0,
        A_R: result.A_R || 0,
        E_M: result.E_M || 0,
        F_C: result.F_C || 0
      };
      
    } catch (error) {
      console.error('AI 분석 실패:', error);
      return { L_S: 0, A_R: 0, E_M: 0, F_C: 0 };
    }
  }

  // ==================== 상세 분석 생성 ====================
  
  async generateDetailedAnalysis(enrichedData, aptType, axisScores) {
    const typeInfo = SAYU_TYPES[aptType];
    
    const analysis = {
      summary: `${enrichedData.name}은(는) ${typeInfo.name}(${aptType}) 유형의 작가입니다.`,
      typeDescription: typeInfo.description,
      
      axisAnalysis: {
        L_S: this.interpretAxisScore('L_S', axisScores.L_S),
        A_R: this.interpretAxisScore('A_R', axisScores.A_R),
        E_M: this.interpretAxisScore('E_M', axisScores.E_M),
        F_C: this.interpretAxisScore('F_C', axisScores.F_C)
      },
      
      strengths: this.identifyStrengths(aptType, enrichedData),
      
      matchingReasons: this.generateMatchingReasons(enrichedData, aptType, axisScores),
      
      recommendedFor: this.getRecommendedAudience(aptType),
      
      similarArtists: await this.findSimilarArtists(aptType, enrichedData.id)
    };
    
    return analysis;
  }

  interpretAxisScore(axis, score) {
    const interpretations = {
      L_S: {
        strong_negative: '매우 독립적이고 은둔적인 성향',
        negative: '독립적 작업을 선호하는 성향',
        neutral: '상황에 따라 독립/협업을 선택',
        positive: '협업과 교류를 즐기는 성향',
        strong_positive: '매우 사회적이고 협업 중심적'
      },
      A_R: {
        strong_negative: '완전히 추상적이고 개념적인 작품',
        negative: '추상적 표현을 주로 사용',
        neutral: '추상과 구상을 자유롭게 오가는',
        positive: '구상적 표현을 주로 사용',
        strong_positive: '철저히 사실주의적인 묘사'
      },
      E_M: {
        strong_negative: '순수한 감정 표현에 집중',
        negative: '감성적이고 직관적인 접근',
        neutral: '감정과 의미의 균형',
        positive: '개념적이고 지적인 접근',
        strong_positive: '철학적 의미 탐구에 집중'
      },
      F_C: {
        strong_negative: '완전히 실험적이고 혁신적',
        negative: '자유롭고 탐험적인 방법론',
        neutral: '실험과 전통의 조화',
        positive: '체계적이고 기법 중심적',
        strong_positive: '엄격한 전통과 규칙 준수'
      }
    };
    
    if (score < -60) return interpretations[axis].strong_negative;
    if (score < -20) return interpretations[axis].negative;
    if (score < 20) return interpretations[axis].neutral;
    if (score < 60) return interpretations[axis].positive;
    return interpretations[axis].strong_positive;
  }

  // ==================== 신뢰도 계산 ====================
  
  calculateConfidence(axisScores, enrichedData) {
    let confidence = 0;
    
    // 1. 데이터 완성도 (40%)
    if (enrichedData.bio) confidence += 10;
    if (enrichedData.artworks?.length > 5) confidence += 10;
    if (enrichedData.birth_year) confidence += 5;
    if (enrichedData.nationality) confidence += 5;
    if (enrichedData.wikipediaAnalysis) confidence += 10;
    
    // 2. 축 점수의 명확성 (40%)
    Object.values(axisScores).forEach(score => {
      if (Math.abs(score) > 50) confidence += 10;
      else if (Math.abs(score) > 30) confidence += 5;
    });
    
    // 3. 일관성 (20%)
    const consistency = this.checkConsistency(axisScores, enrichedData);
    confidence += consistency * 20;
    
    return Math.min(100, confidence);
  }

  checkConsistency(axisScores, enrichedData) {
    // 작품 스타일과 축 점수의 일관성 확인
    if (!enrichedData.artworkAnalysis) return 0.5;
    
    let consistency = 0;
    
    // 추상도와 A_R 축의 일관성
    if ((enrichedData.artworkAnalysis.abstractionLevel < 0 && axisScores.A_R < 0) ||
        (enrichedData.artworkAnalysis.abstractionLevel > 0 && axisScores.A_R > 0)) {
      consistency += 0.5;
    }
    
    // 실험성과 F_C 축의 일관성
    if ((enrichedData.artworkAnalysis.experimentalLevel < 0 && axisScores.F_C < 0) ||
        (enrichedData.artworkAnalysis.experimentalLevel > 0 && axisScores.F_C > 0)) {
      consistency += 0.5;
    }
    
    return consistency;
  }

  // ==================== 데이터베이스 작업 ====================
  
  async saveAnalysisResult(result) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // artists 테이블 업데이트
      await client.query(`
        UPDATE artists 
        SET 
          apt_type = $2,
          apt_scores = $3,
          apt_analysis = $4,
          apt_confidence = $5,
          apt_analyzed_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [
        result.artistId,
        result.aptType,
        JSON.stringify(result.axisScores),
        JSON.stringify(result.analysis),
        result.confidence
      ]);
      
      // 분석 이력 저장
      await client.query(`
        INSERT INTO artist_apt_analysis_history 
        (artist_id, apt_type, axis_scores, confidence, analysis, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        result.artistId,
        result.aptType,
        JSON.stringify(result.axisScores),
        result.confidence,
        JSON.stringify(result.analysis),
        result.timestamp
      ]);
      
      await client.query('COMMIT');
      
      console.log(`✅ ${result.artistName} APT 분석 저장 완료: ${result.aptType}`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== 헬퍼 함수들 ====================
  
  async getArtistArtworks(artistId) {
    const result = await db.query(`
      SELECT id, title, date, medium, style, genre, tags
      FROM artworks
      WHERE artist_id = $1
      ORDER BY date DESC
      LIMIT 20
    `, [artistId]);
    
    return result.rows;
  }

  async getArtistExhibitions(artistId) {
    const result = await db.query(`
      SELECT DISTINCT e.*
      FROM exhibitions e
      JOIN exhibition_artworks ea ON e.id = ea.exhibition_id
      JOIN artworks a ON ea.artwork_id = a.id
      WHERE a.artist_id = $1
      ORDER BY e.start_date DESC
      LIMIT 10
    `, [artistId]);
    
    return result.rows;
  }

  analyzeArtworkStyles(artworks) {
    if (!artworks || artworks.length === 0) return null;
    
    let abstractCount = 0;
    let emotionalCount = 0;
    let experimentalCount = 0;
    
    artworks.forEach(artwork => {
      const tags = artwork.tags || [];
      const genre = (artwork.genre || '').toLowerCase();
      const style = (artwork.style || '').toLowerCase();
      
      // 추상성 분석
      if (tags.includes('abstract') || genre.includes('abstract') || style.includes('abstract')) {
        abstractCount++;
      }
      
      // 감정성 분석
      if (tags.some(tag => ['emotional', 'expressive', 'passionate'].includes(tag))) {
        emotionalCount++;
      }
      
      // 실험성 분석
      if (tags.some(tag => ['experimental', 'innovative', 'avant-garde'].includes(tag))) {
        experimentalCount++;
      }
    });
    
    const total = artworks.length;
    
    return {
      abstractionLevel: (abstractCount / total - 0.5) * 200, // -100 ~ +100
      emotionalContent: (emotionalCount / total - 0.5) * 200,
      experimentalLevel: (experimentalCount / total - 0.5) * 200
    };
  }

  analyzeExhibitionHistory(exhibitions) {
    if (!exhibitions || exhibitions.length === 0) return null;
    
    let groupExhibitions = 0;
    let soloExhibitions = 0;
    
    exhibitions.forEach(exhibition => {
      if (exhibition.type === 'group' || exhibition.title.toLowerCase().includes('group')) {
        groupExhibitions++;
      } else {
        soloExhibitions++;
      }
    });
    
    const total = exhibitions.length;
    const collaborativeScore = total > 0 ? 
      ((groupExhibitions - soloExhibitions) / total) * 100 : 0;
    
    return {
      totalExhibitions: total,
      groupExhibitions,
      soloExhibitions,
      collaborativeScore
    };
  }

  async analyzeWikipediaText(bio) {
    // Wikipedia 텍스트 전처리 및 핵심 정보 추출
    return bio.toLowerCase();
  }

  identifyStrengths(aptType, enrichedData) {
    const typeInfo = SAYU_TYPES[aptType];
    const strengths = [];
    
    // 유형별 기본 강점
    strengths.push(...typeInfo.characteristics);
    
    // 작가별 특화 강점 추가
    if (enrichedData.artworkAnalysis) {
      if (Math.abs(enrichedData.artworkAnalysis.abstractionLevel) > 50) {
        strengths.push(enrichedData.artworkAnalysis.abstractionLevel > 0 ? '구상 표현의 대가' : '추상 표현의 선구자');
      }
      if (Math.abs(enrichedData.artworkAnalysis.experimentalLevel) > 50) {
        strengths.push(enrichedData.artworkAnalysis.experimentalLevel > 0 ? '전통 기법의 계승자' : '실험적 혁신가');
      }
    }
    
    return strengths;
  }

  generateMatchingReasons(enrichedData, aptType, axisScores) {
    const reasons = [];
    
    // 주요 특성 기반 이유
    if (Math.abs(axisScores.L_S) > 50) {
      reasons.push(axisScores.L_S < 0 ? 
        '독립적이고 내면 탐구적인 작품 세계' : 
        '사회와 소통하며 협업을 중시하는 작품 활동'
      );
    }
    
    if (Math.abs(axisScores.A_R) > 50) {
      reasons.push(axisScores.A_R < 0 ? 
        '형태를 초월한 추상적 표현력' : 
        '현실을 정교하게 포착하는 구상력'
      );
    }
    
    if (Math.abs(axisScores.E_M) > 50) {
      reasons.push(axisScores.E_M < 0 ? 
        '깊은 감정을 전달하는 직관적 작품' : 
        '철학적 의미를 담은 지적인 작품'
      );
    }
    
    if (Math.abs(axisScores.F_C) > 50) {
      reasons.push(axisScores.F_C < 0 ? 
        '경계를 넘나드는 실험적 시도' : 
        '전통을 계승하는 정교한 기법'
      );
    }
    
    return reasons;
  }

  getRecommendedAudience(aptType) {
    // 이 작가를 좋아할 만한 APT 유형들
    const recommendations = {
      LAEF: ['LAEF', 'LAMF', 'SAEF'], // 감성적이고 자유로운 유형들
      LAEC: ['LAEC', 'LREC', 'SAEC'], // 체계적이고 감성적인 유형들
      LAMF: ['LAMF', 'LAEF', 'SAMF'], // 의미 탐구와 자유로운 유형들
      LAMC: ['LAMC', 'LRMC', 'SAMC'], // 체계적 의미 탐구 유형들
      LREF: ['LREF', 'LAEF', 'SREF'], // 구상적이고 감성적인 유형들
      LREC: ['LREC', 'LAEC', 'SREC'], // 구상적이고 체계적인 유형들
      LRMF: ['LRMF', 'LAMF', 'SRMF'], // 구상적 의미 탐구 유형들
      LRMC: ['LRMC', 'LAMC', 'SRMC'], // 체계적 구상 표현 유형들
      SAEF: ['SAEF', 'LAEF', 'SREF'], // 사회적이고 감성적인 유형들
      SAEC: ['SAEC', 'LAEC', 'SREC'], // 사회적이고 체계적인 유형들
      SAMF: ['SAMF', 'LAMF', 'SRMF'], // 사회적 의미 탐구 유형들
      SAMC: ['SAMC', 'LAMC', 'SRMC'], // 체계적 사회 비평 유형들
      SREF: ['SREF', 'LREF', 'SAEF'], // 사회적 구상 표현 유형들
      SREC: ['SREC', 'LREC', 'SAEC'], // 체계적 사회적 구상 유형들
      SRMF: ['SRMF', 'LRMF', 'SAMF'], // 자유로운 사회적 의미 유형들
      SRMC: ['SRMC', 'LRMC', 'SAMC']  // 체계적 사회적 의미 유형들
    };
    
    return recommendations[aptType] || [aptType];
  }

  async findSimilarArtists(aptType, currentArtistId) {
    const result = await db.query(`
      SELECT id, name, apt_type, apt_confidence
      FROM artists
      WHERE apt_type = $1 
        AND id != $2
        AND apt_confidence > 70
      ORDER BY apt_confidence DESC
      LIMIT 5
    `, [aptType, currentArtistId]);
    
    return result.rows;
  }

  // ==================== 배치 처리 ====================
  
  async analyzeBatch(limit = 10) {
    const client = await db.getClient();
    
    try {
      // 분석되지 않은 작가들 우선순위로 선택
      const result = await client.query(`
        SELECT a.*, 
          COUNT(DISTINCT aw.id) as artwork_count,
          COUNT(DISTINCT f.id) as follower_count
        FROM artists a
        LEFT JOIN artworks aw ON a.id = aw.artist_id
        LEFT JOIN follows f ON a.id = f.artist_id
        WHERE a.apt_type IS NULL 
          OR a.apt_analyzed_at < NOW() - INTERVAL '6 months'
        GROUP BY a.id
        ORDER BY 
          CASE WHEN a.bio IS NOT NULL THEN 1 ELSE 0 END DESC,
          COUNT(DISTINCT f.id) DESC,
          COUNT(DISTINCT aw.id) DESC
        LIMIT $1
      `, [limit]);
      
      const artists = result.rows;
      console.log(`🎯 ${artists.length}명의 작가 분석 시작`);
      
      const results = [];
      
      for (const artist of artists) {
        try {
          const analysisResult = await this.analyzeArtist(artist);
          await this.saveAnalysisResult(analysisResult);
          results.push({ success: true, ...analysisResult });
          
          // API 제한 고려
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ ${artist.name} 분석 실패:`, error);
          results.push({ 
            success: false, 
            artistName: artist.name,
            error: error.message 
          });
        }
      }
      
      const summary = {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        aptTypeDistribution: this.calculateTypeDistribution(results)
      };
      
      console.log(`\n📊 배치 분석 완료:`, summary);
      return { summary, results };
      
    } finally {
      client.release();
    }
  }

  calculateTypeDistribution(results) {
    const distribution = {};
    
    results
      .filter(r => r.success && r.aptType)
      .forEach(r => {
        distribution[r.aptType] = (distribution[r.aptType] || 0) + 1;
      });
    
    return distribution;
  }
}

module.exports = ArtistAPTMatcher;