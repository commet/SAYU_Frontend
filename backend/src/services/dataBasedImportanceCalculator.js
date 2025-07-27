// 데이터 기반 중요도 계산 서비스
const WikipediaDataCollector = require('./wikipediaDataCollector');
const MetMuseumDataCollector = require('./metMuseumDataCollector');

class DataBasedImportanceCalculator {
  constructor() {
    this.wikipediaCollector = new WikipediaDataCollector();
    this.metMuseumCollector = new MetMuseumDataCollector();
  }

  async calculateImportanceScore(artistName) {
    try {
      console.log(`🔍 ${artistName}의 중요도 분석 시작...`);
      
      // 1단계: 다중 소스에서 데이터 수집
      const [wikipediaData, metMuseumData] = await Promise.all([
        this.wikipediaCollector.getArtistInfo(artistName),
        this.metMuseumCollector.getArtistInfo(artistName)
      ]);

      // 2단계: 데이터 통합
      const consolidatedData = this.consolidateData(wikipediaData, metMuseumData, artistName);
      
      // 3단계: 중요도 점수 계산
      const importanceScore = this.computeImportanceScore(consolidatedData);
      
      // 4단계: APT 추정을 위한 특징 분석
      const personalityIndicators = this.analyzePersonalityIndicators(consolidatedData);

      console.log(`✅ ${artistName} 중요도 분석 완료: ${importanceScore}점`);
      
      return {
        artist_name: artistName,
        importance_score: importanceScore,
        data_sources: consolidatedData.sources,
        confidence_level: consolidatedData.confidence,
        biographical_data: {
          nationality: consolidatedData.nationality,
          birth_year: consolidatedData.birth_year,
          death_year: consolidatedData.death_year,
          art_movements: consolidatedData.art_movements,
          mediums: consolidatedData.mediums || []
        },
        personality_indicators: personalityIndicators,
        notable_works: consolidatedData.notable_works || [],
        analysis_metadata: {
          wikipedia_reliability: wikipediaData?.reliability || 0,
          museum_reliability: metMuseumData?.reliability || 0,
          total_sources: consolidatedData.sources.length,
          data_completeness: this.calculateDataCompleteness(consolidatedData)
        }
      };
    } catch (error) {
      console.error(`중요도 계산 실패 (${artistName}):`, error.message);
      return null;
    }
  }

  consolidateData(wikipediaData, metMuseumData, artistName) {
    const consolidated = {
      name: artistName,
      sources: [],
      confidence: 'low',
      nationality: '',
      birth_year: null,
      death_year: null,
      art_movements: [],
      mediums: [],
      notable_works: [],
      bio: '',
      characteristics: [],
      total_reliability: 0
    };

    // Wikipedia 데이터 통합
    if (wikipediaData) {
      consolidated.sources.push(...wikipediaData.sources);
      consolidated.nationality = wikipediaData.nationality || consolidated.nationality;
      consolidated.birth_year = wikipediaData.birth_year || consolidated.birth_year;
      consolidated.death_year = wikipediaData.death_year || consolidated.death_year;
      consolidated.art_movements.push(...(wikipediaData.art_movements || []));
      consolidated.bio = wikipediaData.bio || '';
      consolidated.characteristics.push(...(wikipediaData.characteristics || []));
      consolidated.total_reliability += wikipediaData.reliability || 0;
    }

    // Met Museum 데이터 통합
    if (metMuseumData) {
      consolidated.sources.push(metMuseumData.source);
      
      // 정보 보완 (Wikipedia 정보가 없는 경우)
      if (!consolidated.nationality && metMuseumData.nationality) {
        consolidated.nationality = metMuseumData.nationality;
      }
      if (!consolidated.birth_year && metMuseumData.birth_year) {
        consolidated.birth_year = metMuseumData.birth_year;
      }
      if (!consolidated.death_year && metMuseumData.death_year) {
        consolidated.death_year = metMuseumData.death_year;
      }
      
      consolidated.art_movements.push(...(metMuseumData.art_movements || []));
      consolidated.mediums.push(...(metMuseumData.mediums || []));
      consolidated.notable_works.push(...(metMuseumData.notable_works || []));
      consolidated.total_reliability += metMuseumData.reliability || 0;
    }

    // 중복 제거
    consolidated.art_movements = [...new Set(consolidated.art_movements)];
    consolidated.mediums = [...new Set(consolidated.mediums)];
    consolidated.sources = [...new Set(consolidated.sources)];

    // 신뢰도 기반 confidence 레벨 설정
    if (consolidated.total_reliability >= 8) consolidated.confidence = 'high';
    else if (consolidated.total_reliability >= 5) consolidated.confidence = 'medium';

    return consolidated;
  }

  computeImportanceScore(data) {
    let score = 50; // 기본 점수

    // 1. 데이터 소스 점수 (최대 20점)
    const sourceScore = Math.min(data.sources.length * 5, 20);
    score += sourceScore;

    // 2. 시대적 중요성 (최대 15점)
    const historicalScore = this.calculateHistoricalImportance(data);
    score += historicalScore;

    // 3. 예술 운동 참여도 (최대 15점)
    const movementScore = Math.min(data.art_movements.length * 3, 15);
    score += movementScore;

    // 4. 작품 다양성 (최대 10점)
    const mediumScore = Math.min(data.mediums.length * 2.5, 10);
    score += mediumScore;

    // 5. 대표작 유명도 (최대 10점)
    const worksScore = Math.min(data.notable_works.length * 2, 10);
    score += worksScore;

    // 6. 신뢰도 보정 (최대 10점)
    const reliabilityScore = Math.min(data.total_reliability, 10);
    score += reliabilityScore;

    // 7. 특별 가산점
    score += this.calculateBonusPoints(data);

    // 최종 점수는 0-100 범위로 제한
    return Math.min(Math.max(Math.round(score), 0), 100);
  }

  calculateHistoricalImportance(data) {
    if (!data.birth_year) return 5; // 기본 점수

    const birthYear = data.birth_year;
    
    // 시대별 가중치
    if (birthYear >= 1400 && birthYear <= 1600) return 15; // 르네상스
    if (birthYear >= 1600 && birthYear <= 1750) return 12; // 바로크
    if (birthYear >= 1750 && birthYear <= 1850) return 10; // 낭만주의/신고전주의
    if (birthYear >= 1830 && birthYear <= 1900) return 12; // 인상파/후기인상파
    if (birthYear >= 1880 && birthYear <= 1950) return 15; // 현대미술 개척기
    if (birthYear >= 1920 && birthYear <= 1970) return 10; // 현대미술 발전기
    if (birthYear >= 1950) return 8; // 동시대 미술

    return 5;
  }

  calculateBonusPoints(data) {
    let bonus = 0;

    // 주요 예술 운동 참여 보너스
    const majorMovements = ['Renaissance', 'Impressionism', 'Cubism', 'Surrealism', 'Abstract Expressionism'];
    const participatedMajorMovements = data.art_movements.filter(movement => 
      majorMovements.some(major => movement.includes(major))
    );
    bonus += participatedMajorMovements.length * 2;

    // 다국적 인지도 보너스 (여러 소스에서 확인된 경우)
    if (data.sources.length >= 3) bonus += 3;

    // 한국 작가 특별 가산점 (문화적 다양성 증진)
    if (data.nationality && data.nationality.toLowerCase().includes('korean')) {
      bonus += 5;
    }

    return Math.min(bonus, 15); // 최대 15점 보너스
  }

  calculateDataCompleteness(data) {
    const fields = ['nationality', 'birth_year', 'death_year', 'art_movements', 'bio'];
    const completedFields = fields.filter(field => {
      const value = data[field];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    });
    
    return Math.round((completedFields.length / fields.length) * 100);
  }

  analyzePersonalityIndicators(data) {
    const indicators = {
      leadership_tendency: 0,    // L vs S
      action_orientation: 0,     // A vs R  
      emotional_expression: 0,   // E vs M
      flexibility: 0,            // F vs C
      confidence: 'medium'
    };

    // Bio와 특징에서 성격 지표 추출
    const text = (data.bio + ' ' + data.characteristics.join(' ')).toLowerCase();

    // Leadership vs Support 지표
    const leadershipKeywords = ['pioneer', 'revolutionary', 'founded', 'established', 'innovative', 'influential'];
    const supportKeywords = ['traditional', 'follower', 'influenced by', 'student of', 'collaborative'];
    
    indicators.leadership_tendency = this.calculateKeywordScore(text, leadershipKeywords, supportKeywords);

    // Action vs Reflection 지표  
    const actionKeywords = ['experimental', 'bold', 'dramatic', 'energetic', 'spontaneous'];
    const reflectionKeywords = ['contemplative', 'meditative', 'quiet', 'philosophical', 'thoughtful'];
    
    indicators.action_orientation = this.calculateKeywordScore(text, actionKeywords, reflectionKeywords);

    // Emotional vs Mental 지표
    const emotionalKeywords = ['emotional', 'passionate', 'expressive', 'feeling', 'intuitive'];
    const mentalKeywords = ['analytical', 'intellectual', 'rational', 'systematic', 'logical'];
    
    indicators.emotional_expression = this.calculateKeywordScore(text, emotionalKeywords, mentalKeywords);

    // Flexible vs Consistent 지표
    const flexibleKeywords = ['versatile', 'changing', 'experimental', 'varied', 'diverse'];
    const consistentKeywords = ['consistent', 'systematic', 'methodical', 'disciplined', 'structured'];
    
    indicators.flexibility = this.calculateKeywordScore(text, flexibleKeywords, consistentKeywords);

    // 신뢰도 설정
    const totalKeywords = leadershipKeywords.length + supportKeywords.length + actionKeywords.length + 
                         reflectionKeywords.length + emotionalKeywords.length + mentalKeywords.length +
                         flexibleKeywords.length + consistentKeywords.length;
    
    const foundKeywords = this.countFoundKeywords(text, [
      ...leadershipKeywords, ...supportKeywords, ...actionKeywords, ...reflectionKeywords,
      ...emotionalKeywords, ...mentalKeywords, ...flexibleKeywords, ...consistentKeywords
    ]);

    if (foundKeywords >= 5) indicators.confidence = 'high';
    else if (foundKeywords >= 3) indicators.confidence = 'medium';
    else indicators.confidence = 'low';

    return indicators;
  }

  calculateKeywordScore(text, positiveKeywords, negativeKeywords) {
    const positiveCount = positiveKeywords.filter(keyword => text.includes(keyword)).length;
    const negativeCount = negativeKeywords.filter(keyword => text.includes(keyword)).length;
    
    if (positiveCount + negativeCount === 0) return 0;
    
    // -1 (완전 negative) ~ +1 (완전 positive) 범위로 정규화
    return (positiveCount - negativeCount) / (positiveCount + negativeCount);
  }

  countFoundKeywords(text, keywords) {
    return keywords.filter(keyword => text.includes(keyword)).length;
  }
}

module.exports = DataBasedImportanceCalculator;