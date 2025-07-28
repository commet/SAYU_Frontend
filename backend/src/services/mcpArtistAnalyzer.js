/**
 * MCP 도구 기반 아티스트 심층 분석 시스템
 * perplexity_ask와 tavily_search를 활용한 실제 웹 검색
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

class MCPArtistAnalyzer {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // LAREMFC 심리학적 차원 정의
    this.laremfcDimensions = {
      L: {
        name: 'Lively',
        description: '활발함 vs 조용함',
        indicators: {
          high: ['energetic', 'dynamic', 'active', 'vibrant', 'expressive'],
          low: ['calm', 'quiet', 'reserved', 'contemplative', 'subtle']
        }
      },
      A: {
        name: 'Agreeable',
        description: '친화성 vs 경쟁성',
        indicators: {
          high: ['collaborative', 'friendly', 'cooperative', 'harmonious', 'empathetic'],
          low: ['competitive', 'assertive', 'independent', 'confrontational', 'critical']
        }
      },
      R: {
        name: 'Responsible',
        description: '책임감 vs 자유분방',
        indicators: {
          high: ['disciplined', 'organized', 'methodical', 'reliable', 'structured'],
          low: ['spontaneous', 'free-spirited', 'improvisational', 'flexible', 'unconventional']
        }
      },
      E: {
        name: 'Emotional',
        description: '감정적 vs 이성적',
        indicators: {
          high: ['passionate', 'intuitive', 'emotional', 'expressive', 'dramatic'],
          low: ['rational', 'logical', 'analytical', 'controlled', 'objective']
        }
      },
      M: {
        name: 'Methodical',
        description: '체계적 vs 즉흥적',
        indicators: {
          high: ['systematic', 'planned', 'precise', 'detailed', 'consistent'],
          low: ['improvisational', 'adaptive', 'fluid', 'experimental', 'variable']
        }
      },
      F: {
        name: 'Focused',
        description: '집중형 vs 다면형',
        indicators: {
          high: ['specialized', 'concentrated', 'single-minded', 'dedicated', 'persistent'],
          low: ['diverse', 'multi-faceted', 'versatile', 'exploratory', 'eclectic']
        }
      },
      C: {
        name: 'Creative',
        description: '창조적 vs 전통적',
        indicators: {
          high: ['innovative', 'original', 'experimental', 'avant-garde', 'revolutionary'],
          low: ['traditional', 'classical', 'conventional', 'established', 'conservative']
        }
      }
    };

    // APT 동물 유형별 심리 프로필
    this.aptProfiles = {
      wolf: {
        name: '늑대',
        traits: { L: 0.7, A: -0.3, R: 0.5, E: 0.2, M: 0.6, F: 0.8, C: 0.4 },
        description: '독립적이고 리더십이 강한 예술가. 자신만의 길을 개척하며 무리를 이끈다.',
        keywords: ['leadership', 'independence', 'strength', 'pack', 'territory', 'alpha']
      },
      fox: {
        name: '여우',
        traits: { L: 0.5, A: 0.2, R: -0.2, E: 0.4, M: -0.3, F: 0.3, C: 0.8 },
        description: '영리하고 적응력이 뛰어난 예술가. 다양한 기법을 창의적으로 활용한다.',
        keywords: ['cleverness', 'adaptability', 'cunning', 'versatility', 'wit', 'transformation']
      },
      bear: {
        name: '곰',
        traits: { L: -0.2, A: 0.6, R: 0.8, E: 0.3, M: 0.7, F: 0.5, C: 0.2 },
        description: '신중하고 보호적인 예술가. 깊이 있는 작품을 천천히 완성한다.',
        keywords: ['strength', 'protection', 'patience', 'hibernation', 'solitude', 'wisdom']
      },
      deer: {
        name: '사슴',
        traits: { L: 0.3, A: 0.7, R: 0.4, E: 0.8, M: 0.2, F: 0.6, C: 0.5 },
        description: '섬세하고 감성적인 예술가. 자연과 감정을 예술로 표현한다.',
        keywords: ['grace', 'sensitivity', 'gentleness', 'nature', 'elegance', 'intuition']
      },
      rabbit: {
        name: '토끼',
        traits: { L: 0.8, A: 0.5, R: 0.3, E: 0.6, M: 0.4, F: 0.7, C: 0.6 },
        description: '활발하고 호기심 많은 예술가. 빠르게 새로운 것을 시도한다.',
        keywords: ['agility', 'curiosity', 'fertility', 'speed', 'playfulness', 'abundance']
      },
      cat: {
        name: '고양이',
        traits: { L: 0.4, A: -0.4, R: -0.3, E: 0.5, M: 0.1, F: 0.8, C: 0.7 },
        description: '독립적이고 신비로운 예술가. 자신만의 예술 세계를 구축한다.',
        keywords: ['independence', 'mystery', 'elegance', 'solitude', 'intuition', 'night']
      },
      dog: {
        name: '개',
        traits: { L: 0.9, A: 0.8, R: 0.6, E: 0.7, M: 0.5, F: 0.4, C: 0.3 },
        description: '충실하고 사교적인 예술가. 사람들과의 연결을 중시한다.',
        keywords: ['loyalty', 'friendship', 'companionship', 'devotion', 'service', 'protection']
      },
      horse: {
        name: '말',
        traits: { L: 0.8, A: 0.3, R: 0.7, E: 0.4, M: 0.8, F: 0.9, C: 0.2 },
        description: '자유롭고 역동적인 예술가. 강한 의지로 목표를 추구한다.',
        keywords: ['freedom', 'power', 'speed', 'nobility', 'journey', 'wild']
      },
      eagle: {
        name: '독수리',
        traits: { L: 0.6, A: -0.2, R: 0.8, E: 0.1, M: 0.9, F: 1.0, C: 0.5 },
        description: '고독하고 집중력이 뛰어난 예술가. 높은 곳에서 전체를 조망한다.',
        keywords: ['vision', 'focus', 'solitude', 'precision', 'hunting', 'majesty']
      },
      owl: {
        name: '올빼미',
        traits: { L: -0.3, A: 0.1, R: 0.6, E: -0.2, M: 0.8, F: 0.9, C: 0.6 },
        description: '지혜롭고 신중한 예술가. 깊이 있는 사색을 통해 작품을 창조한다.',
        keywords: ['wisdom', 'mystery', 'night', 'silence', 'observation', 'knowledge']
      },
      dove: {
        name: '비둘기',
        traits: { L: 0.2, A: 0.9, R: 0.5, E: 0.8, M: 0.3, F: 0.5, C: 0.4 },
        description: '평화롭고 조화로운 예술가. 아름다움과 평온을 추구한다.',
        keywords: ['peace', 'harmony', 'love', 'gentleness', 'spirit', 'messenger']
      },
      peacock: {
        name: '공작',
        traits: { L: 0.7, A: 0.2, R: 0.4, E: 0.9, M: 0.6, F: 0.7, C: 0.9 },
        description: '화려하고 표현력이 풍부한 예술가. 자신의 아름다움을 과시한다.',
        keywords: ['beauty', 'display', 'pride', 'color', 'performance', 'magnificence']
      },
      lion: {
        name: '사자',
        traits: { L: 0.8, A: 0.1, R: 0.9, E: 0.5, M: 0.7, F: 0.8, C: 0.3 },
        description: '용맹하고 카리스마가 있는 예술가. 예술계의 왕으로 군림한다.',
        keywords: ['courage', 'leadership', 'pride', 'strength', 'majesty', 'dominance']
      },
      tiger: {
        name: '호랑이',
        traits: { L: 0.9, A: -0.5, R: 0.6, E: 0.8, M: 0.4, F: 0.9, C: 0.6 },
        description: '열정적이고 강인한 예술가. 강렬한 에너지로 작품을 창조한다.',
        keywords: ['passion', 'power', 'solitude', 'intensity', 'hunting', 'stripe']
      },
      elephant: {
        name: '코끼리',
        traits: { L: 0.1, A: 0.8, R: 0.9, E: 0.6, M: 0.8, F: 0.6, C: 0.4 },
        description: '지혜롭고 기억력이 뛰어난 예술가. 전통을 존중하며 깊이 있는 작품을 만든다.',
        keywords: ['wisdom', 'memory', 'strength', 'family', 'tradition', 'patience']
      },
      whale: {
        name: '고래',
        traits: { L: -0.4, A: 0.7, R: 0.7, E: 0.9, F: 0.8, C: 0.8 },
        description: '깊이 있고 신비로운 예술가. 감정의 깊은 바다에서 영감을 얻는다.',
        keywords: ['depth', 'emotion', 'mystery', 'ancient', 'ocean', 'song']
      }
    };
  }

  /**
   * Perplexity를 통한 아티스트 심층 분석
   */
  async analyzeArtistWithPerplexity(artistName) {
    console.log(`🔍 Perplexity 분석: ${artistName}`);

    const queries = [
      {
        key: 'biography',
        query: `Provide a comprehensive biography of artist ${artistName}, including personality traits, working habits, and psychological characteristics. Focus on their personal character beyond just their artistic achievements. Minimum 300 words.`
      },
      {
        key: 'personality',
        query: `Analyze the personality and psychological profile of ${artistName}. What were their personal characteristics, relationships, and behavioral patterns? How did their personality influence their art?`
      },
      {
        key: 'workingStyle',
        query: `Describe ${artistName}'s working methods, creative process, and studio habits. Were they systematic or spontaneous? Collaborative or solitary? Detail-oriented or big-picture focused?`
      },
      {
        key: 'philosophy',
        query: `What were ${artistName}'s philosophical beliefs, worldview, and artistic principles? How did they approach life and art? What motivated them?`
      }
    ];

    const results = {};

    for (const queryObj of queries) {
      try {
        console.log(`  📊 ${queryObj.key} 분석 중...`);

        // Note: 실제 구현에서는 perplexity_ask MCP 도구를 사용
        // const response = await perplexity_ask(queryObj.query);

        // 시뮬레이션용 구조
        results[queryObj.key] = {
          content: `Detailed analysis of ${artistName} - ${queryObj.key}`,
          sources: [],
          confidence: 0.85
        };

        // API 호출 제한을 위한 딜레이
        await this.delay(1000);

      } catch (error) {
        console.error(`❌ ${queryObj.key} 분석 실패:`, error);
        results[queryObj.key] = { content: '', sources: [], confidence: 0 };
      }
    }

    return results;
  }

  /**
   * Tavily를 통한 추가 정보 수집
   */
  async enrichWithTavilySearch(artistName, perplexityResults) {
    console.log(`🌐 Tavily 보완 검색: ${artistName}`);

    const searchQueries = [
      `"${artistName}" personality psychology character traits`,
      `"${artistName}" studio practice working methods creative process`,
      `"${artistName}" relationships collaborations personal life`,
      `"${artistName}" art criticism personality analysis psychological profile`,
      `"${artistName}" philosophy beliefs ideology worldview artist`
    ];

    const searchResults = [];

    for (const query of searchQueries) {
      try {
        console.log(`  🔎 검색: ${query}`);

        // Note: 실제 구현에서는 tavily_search MCP 도구를 사용
        // const response = await tavily_search({
        //   query: query,
        //   search_depth: "advanced",
        //   max_results: 5
        // });

        // 시뮬레이션용 구조
        searchResults.push({
          query,
          results: [],
          relevantInfo: `Additional information about ${artistName}`,
          confidence: 0.75
        });

        await this.delay(800);

      } catch (error) {
        console.error(`❌ Tavily 검색 실패: ${query}`, error);
      }
    }

    return searchResults;
  }

  /**
   * 텍스트 분석을 통한 LAREMFC 점수 계산
   */
  analyzeTextForLAREMFC(combinedText) {
    const scores = {};

    for (const [dimension, config] of Object.entries(this.laremfcDimensions)) {
      let score = 0;
      let indicatorCount = 0;

      const text = combinedText.toLowerCase();

      // 긍정적 지표 검색
      config.indicators.high.forEach(indicator => {
        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
        const matches = (text.match(regex) || []).length;
        score += matches * 0.2;
        indicatorCount += matches;
      });

      // 부정적 지표 검색
      config.indicators.low.forEach(indicator => {
        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
        const matches = (text.match(regex) || []).length;
        score -= matches * 0.2;
        indicatorCount += matches;
      });

      // -1 to 1 범위로 정규화
      score = Math.max(-1, Math.min(1, score));

      scores[dimension] = {
        score: parseFloat(score.toFixed(3)),
        confidence: Math.min(100, indicatorCount * 10),
        indicators: indicatorCount
      };
    }

    return scores;
  }

  /**
   * APT 동물 유형 매칭
   */
  matchToAPTType(laremfcScores) {
    const matches = [];

    for (const [animalType, profile] of Object.entries(this.aptProfiles)) {
      let distance = 0;
      let validDimensions = 0;

      for (const [dimension, data] of Object.entries(laremfcScores)) {
        if (data.confidence > 30) { // 신뢰도가 30% 이상인 차원만 사용
          const expectedScore = profile.traits[dimension];
          const actualScore = data.score;
          distance += Math.pow(expectedScore - actualScore, 2);
          validDimensions++;
        }
      }

      if (validDimensions >= 4) { // 최소 4개 차원에서 신뢰할 만한 데이터가 있어야 함
        distance = Math.sqrt(distance / validDimensions);
        const matchScore = Math.max(0, 100 - (distance * 50));

        matches.push({
          animalType,
          matchScore: parseFloat(matchScore.toFixed(1)),
          distance: parseFloat(distance.toFixed(3)),
          validDimensions,
          profile
        });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * 단일 아티스트 완전 분석
   */
  async analyzeArtist(artistId, artistName) {
    console.log(`\n🎨 ${artistName} 심층 분석 시작`);
    console.log('═'.repeat(50));

    try {
      // 1. Perplexity 심층 분석
      const perplexityResults = await this.analyzeArtistWithPerplexity(artistName);

      // 2. Tavily 보완 검색
      const tavilyResults = await this.enrichWithTavilySearch(artistName, perplexityResults);

      // 3. 텍스트 통합
      const combinedText = [
        perplexityResults.biography?.content || '',
        perplexityResults.personality?.content || '',
        perplexityResults.workingStyle?.content || '',
        perplexityResults.philosophy?.content || '',
        ...tavilyResults.map(r => r.relevantInfo || '')
      ].join(' ');

      console.log(`📝 통합 텍스트 길이: ${combinedText.length} 문자`);

      // 4. LAREMFC 분석
      const laremfcScores = this.analyzeTextForLAREMFC(combinedText);

      console.log('🧠 LAREMFC 프로필:');
      for (const [dim, data] of Object.entries(laremfcScores)) {
        const config = this.laremfcDimensions[dim];
        console.log(`  ${dim} (${config.name}): ${data.score} (신뢰도: ${data.confidence}%)`);
      }

      // 5. APT 매칭
      const aptMatches = this.matchToAPTType(laremfcScores);

      if (aptMatches.length > 0) {
        console.log('\n🐾 APT 매칭 결과:');
        aptMatches.slice(0, 3).forEach((match, idx) => {
          console.log(`  ${idx + 1}. ${match.profile.name} (${match.animalType}): ${match.matchScore}%`);
          console.log(`     ${match.profile.description}`);
        });
      }

      // 6. 신뢰도 계산
      const avgConfidence = Object.values(laremfcScores)
        .reduce((sum, data) => sum + data.confidence, 0) / 7;

      const overallConfidence = Math.min(95, avgConfidence * 0.7 +
        (aptMatches[0]?.matchScore || 0) * 0.3);

      console.log(`\n📊 전체 신뢰도: ${overallConfidence.toFixed(1)}%`);

      // 7. 결과 구성
      const analysisResult = {
        artistId,
        artistName,
        timestamp: new Date().toISOString(),
        sources: {
          perplexity: perplexityResults,
          tavily: tavilyResults
        },
        analysis: {
          laremfc: laremfcScores,
          aptMatches: aptMatches.slice(0, 5),
          combinedTextLength: combinedText.length,
          overallConfidence: parseFloat(overallConfidence.toFixed(1))
        },
        needsReview: overallConfidence < 70
      };

      return analysisResult;

    } catch (error) {
      console.error(`❌ ${artistName} 분석 실패:`, error);
      return null;
    }
  }

  /**
   * 배치 분석 실행
   */
  async processBatch(batchSize = 10) {
    console.log(`🚀 아티스트 배치 분석 시작 (${batchSize}명)`);
    console.log('═'.repeat(60));

    // 분석 대상 아티스트 선택
    const artists = await this.pool.query(`
      SELECT id, name, name_ko, nationality, birth_year, death_year, follow_count
      FROM artists 
      WHERE apt_profile IS NULL 
        AND is_verified = false
        AND name IS NOT NULL
      ORDER BY 
        CASE WHEN follow_count > 0 THEN follow_count ELSE 0 END DESC,
        created_at DESC
      LIMIT $1
    `, [batchSize]);

    if (artists.rows.length === 0) {
      console.log('✅ 분석할 아티스트가 없습니다.');
      return [];
    }

    console.log(`📋 분석 대상: ${artists.rows.length}명\n`);

    const results = [];
    let successful = 0;

    for (let i = 0; i < artists.rows.length; i++) {
      const artist = artists.rows[i];
      const progress = `[${i + 1}/${artists.rows.length}]`;

      console.log(`${progress} 분석 시작: ${artist.name}`);

      try {
        const result = await this.analyzeArtist(artist.id, artist.name);

        if (result && result.analysis.overallConfidence > 50) {
          // 데이터베이스 업데이트
          await this.updateArtistAPTProfile(artist.id, result);
          results.push(result);
          successful++;

          console.log(`✅ ${progress} ${artist.name} 완료 (신뢰도: ${result.analysis.overallConfidence}%)`);

          if (result.analysis.aptMatches.length > 0) {
            const topMatch = result.analysis.aptMatches[0];
            console.log(`   🎯 최적 매칭: ${topMatch.profile.name} (${topMatch.matchScore}%)`);
          }
        } else {
          console.log(`⚠️ ${progress} ${artist.name} 신뢰도 부족으로 스킵`);
        }

      } catch (error) {
        console.error(`❌ ${progress} ${artist.name} 실패:`, error.message);
      }

      // API 제한을 위한 딜레이
      if (i < artists.rows.length - 1) {
        console.log('   ⏳ 대기 중...\n');
        await this.delay(3000);
      }
    }

    // 배치 결과 저장
    if (results.length > 0) {
      await this.saveBatchResults(results);
    }

    console.log('\n🎉 배치 분석 완료');
    console.log(`   성공: ${successful}/${artists.rows.length}명`);
    console.log(`   성공률: ${((successful / artists.rows.length) * 100).toFixed(1)}%`);

    return results;
  }

  /**
   * 아티스트 APT 프로필 업데이트
   */
  async updateArtistAPTProfile(artistId, analysisResult) {
    const { laremfc, aptMatches, overallConfidence } = analysisResult.analysis;

    const aptProfile = {
      version: '2.0',
      analysisDate: new Date().toISOString(),
      laremfc,
      aptMatches,
      primaryType: aptMatches[0]?.animalType || null,
      confidence: overallConfidence,
      sources: {
        perplexity: true,
        tavily: true,
        textLength: analysisResult.analysis.combinedTextLength
      },
      needsReview: analysisResult.needsReview
    };

    // 개선된 전기 정보 (첫 300단어)
    const improvedBio = analysisResult.sources.perplexity.biography?.content?.substring(0, 500) || null;

    await this.pool.query(`
      UPDATE artists 
      SET 
        apt_profile = $1,
        bio = COALESCE($2, bio),
        is_verified = $3,
        verification_date = NOW(),
        verification_method = 'mcp_web_analysis_v2',
        updated_at = NOW()
      WHERE id = $4
    `, [
      JSON.stringify(aptProfile),
      improvedBio,
      !analysisResult.needsReview,
      artistId
    ]);
  }

  /**
   * 배치 결과 저장
   */
  async saveBatchResults(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const filename = `mcp-artist-analysis-${timestamp}.json`;
    const filepath = path.join(__dirname, '../../data/analysis', filename);

    // 디렉터리 생성
    await fs.mkdir(path.dirname(filepath), { recursive: true });

    const batchSummary = {
      timestamp: new Date().toISOString(),
      totalAnalyzed: results.length,
      averageConfidence: results.reduce((sum, r) => sum + r.analysis.overallConfidence, 0) / results.length,
      highConfidenceCount: results.filter(r => r.analysis.overallConfidence >= 80).length,
      needsReviewCount: results.filter(r => r.needsReview).length,
      aptDistribution: this.calculateAPTDistribution(results),
      laremfcStats: this.calculateLAREMFCStats(results),
      results
    };

    await fs.writeFile(filepath, JSON.stringify(batchSummary, null, 2));
    console.log(`💾 분석 결과 저장: ${filename}`);

    return batchSummary;
  }

  /**
   * APT 분포 계산
   */
  calculateAPTDistribution(results) {
    const distribution = {};
    results.forEach(result => {
      const primaryType = result.analysis.aptMatches[0]?.animalType;
      if (primaryType) {
        distribution[primaryType] = (distribution[primaryType] || 0) + 1;
      }
    });
    return distribution;
  }

  /**
   * LAREMFC 통계 계산
   */
  calculateLAREMFCStats(results) {
    const stats = {};

    for (const dimension of Object.keys(this.laremfcDimensions)) {
      const scores = results.map(r => r.analysis.laremfc[dimension]?.score).filter(s => s !== undefined);
      const confidences = results.map(r => r.analysis.laremfc[dimension]?.confidence).filter(c => c !== undefined);

      stats[dimension] = {
        averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0,
        averageConfidence: confidences.length > 0 ? confidences.reduce((a, b) => a + b) / confidences.length : 0,
        dataPoints: scores.length
      };
    }

    return stats;
  }

  /**
   * 지연 함수
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 분석 진행 상황 리포트
   */
  async generateProgressReport() {
    const stats = await this.pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(apt_profile) as analyzed_artists,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_artists,
        COUNT(CASE WHEN apt_profile->>'needsReview' = 'true' THEN 1 END) as needs_review,
        AVG(CAST(apt_profile->>'confidence' AS NUMERIC)) as avg_confidence
      FROM artists
      WHERE name IS NOT NULL
    `);

    const aptDistribution = await this.pool.query(`
      SELECT 
        apt_profile->>'primaryType' as apt_type,
        COUNT(*) as count,
        AVG(CAST(apt_profile->>'confidence' AS NUMERIC)) as avg_confidence
      FROM artists
      WHERE apt_profile IS NOT NULL AND apt_profile->>'primaryType' IS NOT NULL
      GROUP BY apt_profile->>'primaryType'
      ORDER BY count DESC
    `);

    const recentAnalyses = await this.pool.query(`
      SELECT name, apt_profile->>'primaryType' as apt_type, apt_profile->>'confidence' as confidence
      FROM artists
      WHERE apt_profile->>'analysisDate' > NOW() - INTERVAL '24 hours'
      ORDER BY updated_at DESC
      LIMIT 10
    `);

    const summary = stats.rows[0];
    const progress = ((summary.analyzed_artists / summary.total_artists) * 100).toFixed(2);

    console.log('\n📊 MCP 아티스트 분석 진행 리포트');
    console.log('═'.repeat(50));
    console.log(`📈 진행률: ${summary.analyzed_artists}/${summary.total_artists} (${progress}%)`);
    console.log(`✅ 검증 완료: ${summary.verified_artists}명`);
    console.log(`⚠️ 검토 필요: ${summary.needs_review}명`);
    console.log(`🎯 평균 신뢰도: ${summary.avg_confidence?.toFixed(1)}%`);

    if (aptDistribution.rows.length > 0) {
      console.log('\n🐾 APT 유형 분포:');
      aptDistribution.rows.forEach(row => {
        const animalName = this.aptProfiles[row.apt_type]?.name || row.apt_type;
        console.log(`  ${animalName}: ${row.count}명 (평균 신뢰도: ${parseFloat(row.avg_confidence).toFixed(1)}%)`);
      });
    }

    if (recentAnalyses.rows.length > 0) {
      console.log('\n🆕 최근 24시간 분석 결과:');
      recentAnalyses.rows.forEach(row => {
        const animalName = this.aptProfiles[row.apt_type]?.name || row.apt_type;
        console.log(`  ${row.name}: ${animalName} (${row.confidence}%)`);
      });
    }

    return {
      summary,
      progress: parseFloat(progress),
      aptDistribution: aptDistribution.rows,
      recentAnalyses: recentAnalyses.rows
    };
  }
}

// 실행 함수
async function runMCPAnalysis() {
  const analyzer = new MCPArtistAnalyzer();

  try {
    console.log('🎨 SAYU MCP 아티스트 분석 시스템 v2.0');
    console.log('═'.repeat(60));

    // 현재 진행 상황 확인
    await analyzer.generateProgressReport();

    console.log('\n🚀 배치 분석 시작...');

    // 첫 번째 배치 (10명) 분석
    const results = await analyzer.processBatch(10);

    if (results.length > 0) {
      console.log('\n📈 배치 분석 완료 - 최종 리포트');
      await analyzer.generateProgressReport();
    } else {
      console.log('\n⚠️ 분석된 아티스트가 없습니다.');
    }

  } catch (error) {
    console.error('❌ 시스템 오류:', error);
  } finally {
    await analyzer.pool.end();
  }
}

module.exports = { MCPArtistAnalyzer, runMCPAnalysis };

// 직접 실행
if (require.main === module) {
  runMCPAnalysis();
}
