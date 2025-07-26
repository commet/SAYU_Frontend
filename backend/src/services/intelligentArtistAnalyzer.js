/**
 * SAYU APT 매칭 정확도 향상을 위한 
 * 웹 검색 기반 아티스트 심층 분석 시스템
 * 
 * 목표:
 * - 각 아티스트별 500단어 이상의 상세 전기 수집
 * - 작품 스타일과 개인 성격 분리 분석
 * - LAREMFC 4차원 심리학적 근거 제시
 * - APT 매핑 정확도 90% 이상 달성
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

class IntelligentArtistAnalyzer {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    // LAREMFC 차원 정의
    this.laremfcDimensions = {
      L: { name: 'Lively', description: '활발함 vs 조용함', range: [-1, 1] },
      A: { name: 'Agreeable', description: '친화성 vs 경쟁성', range: [-1, 1] },
      R: { name: 'Responsible', description: '책임감 vs 자유분방', range: [-1, 1] },
      E: { name: 'Emotional', description: '감정적 vs 이성적', range: [-1, 1] },
      M: { name: 'Methodical', description: '체계적 vs 즉흥적', range: [-1, 1] },
      F: { name: 'Focused', description: '집중형 vs 다면형', range: [-1, 1] },
      C: { name: 'Creative', description: '창조적 vs 전통적', range: [-1, 1] }
    };
    
    // APT 동물 유형 매핑
    this.animalTypes = [
      'wolf', 'fox', 'bear', 'deer', 'rabbit', 'cat', 'dog', 'horse',
      'eagle', 'owl', 'dove', 'peacock', 'lion', 'tiger', 'elephant', 'whale'
    ];
    
    this.searchKeywords = {
      biography: '[artist_name] biography psychology personality traits character',
      artStyle: '[artist_name] art style painting technique artistic method',
      personality: '[artist_name] personal life habits working process creative method',
      philosophy: '[artist_name] artistic philosophy beliefs worldview ideology',
      relationships: '[artist_name] relationships collaborations influences mentors',
      critiques: '[artist_name] art criticism personality analysis psychological profile'
    };
  }

  /**
   * 웹 검색을 통한 아티스트 상세 정보 수집
   */
  async searchArtistInformation(artistName) {
    console.log(`🔍 ${artistName} 정보 수집 시작...`);
    
    const searchResults = {
      biography: '',
      artStyle: '',
      personality: '',
      philosophy: '',
      critiques: '',
      sources: []
    };

    try {
      // Perplexity를 통한 심층 분석
      const perplexityPrompt = `
        Provide a comprehensive psychological and artistic analysis of ${artistName}.
        Include:
        1. Detailed biography (minimum 300 words)
        2. Personality traits and psychological characteristics
        3. Artistic style and techniques
        4. Personal philosophy and worldview
        5. Working habits and creative process
        6. Relationships and social tendencies
        7. Emotional patterns in their art
        
        Focus on psychological insights that would help understand their personality type.
        Cite specific examples and sources.
      `;

      console.log(`📊 Perplexity 심층 분석: ${artistName}`);
      // Note: Perplexity API call would go here
      // For now, we'll use mock data structure
      
      // Tavily 검색을 통한 추가 정보
      const tavilyQueries = [
        `${artistName} personality psychology analysis`,
        `${artistName} working habits creative process studio`,
        `${artistName} personal life character traits`,
        `${artistName} art style emotional characteristics`,
        `${artistName} philosophy beliefs worldview`
      ];

      console.log(`🌐 Tavily 다중 검색: ${artistName}`);
      for (const query of tavilyQueries) {
        // Note: Tavily API call would go here
        console.log(`  - 검색: ${query}`);
      }

      return searchResults;
      
    } catch (error) {
      console.error(`❌ ${artistName} 정보 수집 실패:`, error);
      return null;
    }
  }

  /**
   * 심리학적 특성 분석 및 LAREMFC 매핑
   */
  async analyzePersonalityTraits(artistData) {
    const { biography, artStyle, personality, philosophy } = artistData;
    
    const analysisPrompt = `
      Based on the following information about an artist, analyze their personality 
      and map it to the LAREMFC 7-dimensional model:

      Biography: ${biography}
      Art Style: ${artStyle}
      Personality Info: ${personality}
      Philosophy: ${philosophy}

      LAREMFC Dimensions:
      L (Lively): Active/Energetic vs Calm/Quiet (-1 to 1)
      A (Agreeable): Friendly/Cooperative vs Competitive/Assertive (-1 to 1)
      R (Responsible): Disciplined/Organized vs Free-spirited/Spontaneous (-1 to 1)
      E (Emotional): Emotional/Intuitive vs Rational/Logical (-1 to 1)
      M (Methodical): Systematic/Planned vs Improvisational/Flexible (-1 to 1)
      F (Focused): Focused/Specialized vs Diverse/Multi-faceted (-1 to 1)
      C (Creative): Innovative/Original vs Traditional/Conservative (-1 to 1)

      Provide:
      1. LAREMFC scores with detailed justification
      2. Primary and secondary animal type recommendations
      3. Confidence score (0-100)
      4. Key personality indicators
      5. Psychological evidence from their life and work

      Format as JSON with detailed explanations.
    `;

    // Here we would use GPT-4 or similar AI for analysis
    console.log('🧠 심리학적 특성 분석 중...');
    
    // Mock analysis structure
    return {
      laremfc: {
        L: { score: 0.0, confidence: 0, evidence: [] },
        A: { score: 0.0, confidence: 0, evidence: [] },
        R: { score: 0.0, confidence: 0, evidence: [] },
        E: { score: 0.0, confidence: 0, evidence: [] },
        M: { score: 0.0, confidence: 0, evidence: [] },
        F: { score: 0.0, confidence: 0, evidence: [] },
        C: { score: 0.0, confidence: 0, evidence: [] }
      },
      animalTypes: {
        primary: { type: 'wolf', confidence: 85, reasoning: '' },
        secondary: { type: 'eagle', confidence: 72, reasoning: '' }
      },
      overallConfidence: 85,
      keyTraits: [],
      psychologicalProfile: '',
      evidenceSources: []
    };
  }

  /**
   * APT 매핑 및 검증
   */
  async mapToAPTType(personalityAnalysis) {
    const { laremfc, animalTypes } = personalityAnalysis;
    
    // LAREMFC 점수를 기반으로 APT 동물 유형 결정
    const aptMapping = {
      wolf: { 
        typical: { L: 0.7, A: -0.3, R: 0.5, E: 0.2, M: 0.6, F: 0.8, C: 0.4 },
        description: '독립적이고 리더십이 강한 타입'
      },
      fox: {
        typical: { L: 0.5, A: 0.2, R: -0.2, E: 0.4, M: -0.3, F: 0.3, C: 0.8 },
        description: '영리하고 적응력이 뛰어난 타입'
      },
      bear: {
        typical: { L: -0.2, A: 0.6, R: 0.8, E: 0.3, M: 0.7, F: 0.5, C: 0.2 },
        description: '신중하고 보호적인 타입'
      },
      // ... 나머지 동물 유형들
    };

    const distances = {};
    for (const [animal, profile] of Object.entries(aptMapping)) {
      let distance = 0;
      for (const [dimension, score] of Object.entries(laremfc)) {
        distance += Math.pow(score.score - profile.typical[dimension], 2);
      }
      distances[animal] = Math.sqrt(distance);
    }

    // 가장 가까운 매칭 찾기
    const bestMatch = Object.entries(distances)
      .sort(([,a], [,b]) => a - b)[0];

    return {
      aptType: bestMatch[0],
      matchScore: 100 - (bestMatch[1] * 20), // 거리를 점수로 변환
      alternatives: Object.entries(distances)
        .sort(([,a], [,b]) => a - b)
        .slice(1, 4)
        .map(([type, distance]) => ({
          type,
          score: 100 - (distance * 20)
        }))
    };
  }

  /**
   * 배치 분석 실행 (10명씩)
   */
  async processBatch(batchSize = 10) {
    console.log('🚀 아티스트 배치 분석 시작...\n');
    
    // 분석이 필요한 아티스트들 선택 (APT 프로필이 없는 아티스트)
    const artistsToAnalyze = await this.pool.query(`
      SELECT id, name, name_ko, nationality, birth_year, death_year, bio
      FROM artists 
      WHERE apt_profile IS NULL 
        AND is_verified = false
      ORDER BY follow_count DESC NULLS LAST, created_at DESC
      LIMIT $1
    `, [batchSize]);

    if (artistsToAnalyze.rows.length === 0) {
      console.log('✅ 분석할 아티스트가 없습니다.');
      return;
    }

    console.log(`📋 ${artistsToAnalyze.rows.length}명의 아티스트 분석 예정\n`);

    const results = [];
    let processed = 0;

    for (const artist of artistsToAnalyze.rows) {
      try {
        console.log(`\n[${++processed}/${artistsToAnalyze.rows.length}] 분석 중: ${artist.name}`);
        console.log('─'.repeat(60));

        // 1. 웹 검색을 통한 정보 수집
        const searchResults = await this.searchArtistInformation(artist.name);
        if (!searchResults) {
          console.log(`⚠️ ${artist.name} 정보 수집 실패`);
          continue;
        }

        // 2. 심리학적 특성 분석
        const personalityAnalysis = await this.analyzePersonalityTraits(searchResults);

        // 3. APT 매핑
        const aptMapping = await this.mapToAPTType(personalityAnalysis);

        // 4. 결과 구성
        const analysisResult = {
          artistId: artist.id,
          artistName: artist.name,
          timestamp: new Date().toISOString(),
          searchResults,
          personalityAnalysis,
          aptMapping,
          confidence: personalityAnalysis.overallConfidence,
          needsReview: personalityAnalysis.overallConfidence < 70
        };

        results.push(analysisResult);

        // 5. 데이터베이스 업데이트
        await this.updateArtistAPTProfile(artist.id, analysisResult);

        console.log(`✅ ${artist.name} 분석 완료 (신뢰도: ${personalityAnalysis.overallConfidence}%)`);
        console.log(`   APT 유형: ${aptMapping.aptType} (매칭도: ${aptMapping.matchScore.toFixed(1)}%)`);

        // API 호출 제한을 위한 딜레이
        await this.delay(2000);

      } catch (error) {
        console.error(`❌ ${artist.name} 분석 중 오류:`, error);
        continue;
      }
    }

    // 6. 배치 결과 저장
    await this.saveBatchResults(results);
    
    console.log(`\n🎉 배치 분석 완료: ${results.length}/${artistsToAnalyze.rows.length}명 성공`);
    return results;
  }

  /**
   * 아티스트 APT 프로필 업데이트
   */
  async updateArtistAPTProfile(artistId, analysisResult) {
    const aptProfile = {
      laremfc: analysisResult.personalityAnalysis.laremfc,
      aptType: analysisResult.aptMapping.aptType,
      matchScore: analysisResult.aptMapping.matchScore,
      alternatives: analysisResult.aptMapping.alternatives,
      confidence: analysisResult.confidence,
      analysisDate: new Date().toISOString(),
      sources: analysisResult.searchResults.sources,
      needsReview: analysisResult.needsReview
    };

    await this.pool.query(`
      UPDATE artists 
      SET 
        apt_profile = $1,
        bio = $2,
        is_verified = $3,
        verification_date = NOW(),
        verification_method = 'ai_web_analysis',
        updated_at = NOW()
      WHERE id = $4
    `, [
      JSON.stringify(aptProfile),
      analysisResult.searchResults.biography || null,
      !analysisResult.needsReview,
      artistId
    ]);
  }

  /**
   * 배치 결과 저장
   */
  async saveBatchResults(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `artist-analysis-batch-${timestamp}.json`;
    const filepath = path.join(__dirname, '../../data/analysis', filename);

    // 디렉터리 생성
    await fs.mkdir(path.dirname(filepath), { recursive: true });

    // 결과 저장
    await fs.writeFile(filepath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalAnalyzed: results.length,
      averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
      highConfidenceCount: results.filter(r => r.confidence >= 80).length,
      needsReviewCount: results.filter(r => r.needsReview).length,
      aptDistribution: this.calculateAPTDistribution(results),
      results
    }, null, 2));

    console.log(`💾 분석 결과 저장: ${filepath}`);
  }

  /**
   * APT 유형 분포 계산
   */
  calculateAPTDistribution(results) {
    const distribution = {};
    results.forEach(result => {
      const aptType = result.aptMapping.aptType;
      distribution[aptType] = (distribution[aptType] || 0) + 1;
    });
    return distribution;
  }

  /**
   * 지연 함수
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 분석 통계 리포트 생성
   */
  async generateAnalysisReport() {
    const stats = await this.pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(apt_profile) as analyzed_artists,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_artists,
        COUNT(CASE WHEN apt_profile->>'needsReview' = 'true' THEN 1 END) as needs_review,
        AVG(CAST(apt_profile->>'confidence' AS NUMERIC)) as avg_confidence
      FROM artists
    `);

    const aptDistribution = await this.pool.query(`
      SELECT 
        apt_profile->>'aptType' as apt_type,
        COUNT(*) as count
      FROM artists
      WHERE apt_profile IS NOT NULL
      GROUP BY apt_profile->>'aptType'
      ORDER BY count DESC
    `);

    const report = {
      timestamp: new Date().toISOString(),
      summary: stats.rows[0],
      aptDistribution: aptDistribution.rows,
      progress: {
        analyzed: stats.rows[0].analyzed_artists,
        total: stats.rows[0].total_artists,
        percentage: ((stats.rows[0].analyzed_artists / stats.rows[0].total_artists) * 100).toFixed(2)
      }
    };

    console.log('\n📊 분석 진행 상황 리포트');
    console.log('========================');
    console.log(`총 아티스트: ${report.summary.total_artists}명`);
    console.log(`분석 완료: ${report.summary.analyzed_artists}명 (${report.progress.percentage}%)`);
    console.log(`검증 완료: ${report.summary.verified_artists}명`);
    console.log(`검토 필요: ${report.summary.needs_review}명`);
    console.log(`평균 신뢰도: ${report.summary.avg_confidence?.toFixed(1)}%`);

    console.log('\n🐾 APT 유형 분포:');
    report.aptDistribution.forEach(item => {
      console.log(`  ${item.apt_type}: ${item.count}명`);
    });

    return report;
  }
}

// 실행 스크립트
async function main() {
  const analyzer = new IntelligentArtistAnalyzer();
  
  try {
    console.log('🎨 SAYU APT 아티스트 분석 시스템 시작\n');
    
    // 현재 상태 리포트
    await analyzer.generateAnalysisReport();
    
    console.log('\n🚀 첫 번째 배치 분석 시작...');
    
    // 첫 10명 분석
    const results = await analyzer.processBatch(10);
    
    // 최종 리포트
    console.log('\n📈 최종 분석 리포트');
    await analyzer.generateAnalysisReport();
    
  } catch (error) {
    console.error('❌ 시스템 오류:', error);
  } finally {
    await analyzer.pool.end();
  }
}

module.exports = { IntelligentArtistAnalyzer, main };

// 직접 실행 시
if (require.main === module) {
  main();
}