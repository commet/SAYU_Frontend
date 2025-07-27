// 향상된 작가 APT 분석기
// 각 작가의 예술적 특성을 심층 분석하여 16가지 APT 유형과 정밀 매칭

require('dotenv').config();
const { pool } = require('./src/config/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Google AI 초기화
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// 16가지 APT 유형과 특성 (SAYU 정의)
const APT_TYPES = {
  'LAEF': { 
    animal: '여우', 
    title: '몽환적 방랑자',
    characteristics: '독립적 작업, 추상적 표현, 감정적 깊이, 자유로운 실험'
  },
  'LAEC': { 
    animal: '고양이', 
    title: '감성 큐레이터',
    characteristics: '독립적 작업, 추상적 표현, 감정적 깊이, 체계적 구성'
  },
  'LAMF': { 
    animal: '올빼미', 
    title: '직관적 탐구자',
    characteristics: '독립적 작업, 추상적 표현, 의미 추구, 자유로운 탐색'
  },
  'LAMC': { 
    animal: '거북이', 
    title: '고독한 철학자',
    characteristics: '독립적 작업, 추상적 표현, 의미 추구, 체계적 접근'
  },
  'LREF': { 
    animal: '카멜레온', 
    title: '고독한 관찰자',
    characteristics: '독립적 작업, 구상적 표현, 감정적 관찰, 자유로운 변화'
  },
  'LREC': { 
    animal: '고슴도치', 
    title: '섬세한 감정가',
    characteristics: '독립적 작업, 구상적 표현, 감정적 섬세함, 체계적 기법'
  },
  'LRMF': { 
    animal: '문어', 
    title: '침묵의 관찰자',
    characteristics: '독립적 작업, 구상적 표현, 의미 탐구, 자유로운 해석'
  },
  'LRMC': { 
    animal: '비버', 
    title: '학구적 연구자',
    characteristics: '독립적 작업, 구상적 표현, 의미 연구, 체계적 방법론'
  },
  'SAEF': { 
    animal: '나비', 
    title: '감성 나눔이',
    characteristics: '사회적 활동, 추상적 표현, 감정 공유, 자유로운 교류'
  },
  'SAEC': { 
    animal: '펭귄', 
    title: '감성 조율사',
    characteristics: '사회적 활동, 추상적 표현, 감정 조화, 체계적 협업'
  },
  'SAMF': { 
    animal: '앵무새', 
    title: '영감 전도사',
    characteristics: '사회적 활동, 추상적 표현, 의미 전파, 자유로운 소통'
  },
  'SAMC': { 
    animal: '사슴', 
    title: '문화 기획자',
    characteristics: '사회적 활동, 추상적 표현, 의미 기획, 체계적 운영'
  },
  'SREF': { 
    animal: '강아지', 
    title: '친근한 공감자',
    characteristics: '사회적 활동, 구상적 표현, 감정 공감, 자유로운 친밀감'
  },
  'SREC': { 
    animal: '오리', 
    title: '세심한 조화자',
    characteristics: '사회적 활동, 구상적 표현, 감정 배려, 체계적 균형'
  },
  'SRMF': { 
    animal: '코끼리', 
    title: '지혜로운 안내자',
    characteristics: '사회적 활동, 구상적 표현, 의미 안내, 자유로운 지도'
  },
  'SRMC': { 
    animal: '독수리', 
    title: '체계적 교육자',
    characteristics: '사회적 활동, 구상적 표현, 의미 교육, 체계적 전달'
  }
};

// 예술 스타일과 APT 축의 관계
const styleToAPTMapping = {
  // L/S 축 (독립적/사회적)
  solitary_keywords: ['reclusive', 'isolated', 'hermit', 'solitary', 'alone', 'withdrawn'],
  social_keywords: ['collaborative', 'group', 'school', 'movement', 'collective', 'workshop'],
  
  // A/R 축 (추상적/구상적)
  abstract_keywords: ['abstract', 'non-figurative', 'conceptual', 'minimalist', 'expressionist'],
  realistic_keywords: ['realistic', 'figurative', 'portrait', 'landscape', 'still life', 'naturalistic'],
  
  // E/M 축 (감정적/의미적)
  emotional_keywords: ['emotional', 'passionate', 'expressive', 'intuitive', 'spontaneous', 'sensual'],
  meaningful_keywords: ['intellectual', 'conceptual', 'philosophical', 'symbolic', 'allegorical', 'narrative'],
  
  // F/C 축 (자유로운/체계적)
  free_keywords: ['experimental', 'innovative', 'revolutionary', 'avant-garde', 'radical', 'unconventional'],
  controlled_keywords: ['traditional', 'classical', 'academic', 'methodical', 'precise', 'disciplined']
};

// AI를 활용한 작가 특성 분석
async function analyzeArtistWithAI(artist) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
작가 "${artist.name}"의 예술적 특성을 다음 4가지 축으로 분석해주세요:

1. 작업 방식 (L: 독립적/은둔적 vs S: 사회적/협업적) - 점수: -100 ~ +100
2. 표현 방식 (A: 추상적/개념적 vs R: 구상적/사실적) - 점수: -100 ~ +100  
3. 창작 동기 (E: 감정적/직관적 vs M: 의미적/지적) - 점수: -100 ~ +100
4. 창작 과정 (F: 자유로운/실험적 vs C: 체계적/전통적) - 점수: -100 ~ +100

각 축에 대해:
- 점수 (음수는 첫 번째 특성, 양수는 두 번째 특성)
- 근거가 되는 작품이나 일화
- 해당 특성이 나타나는 구체적 예시

작가 정보:
${artist.bio || '정보 없음'}
시대: ${artist.era || '미상'}
국적: ${artist.nationality || '미상'}

JSON 형식으로 응답해주세요.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON 파싱 시도
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('JSON 파싱 실패:', e);
    }
    
    return null;
  } catch (error) {
    console.error('AI 분석 실패:', error.message);
    return null;
  }
}

// 텍스트 기반 APT 점수 계산
function calculateAPTScoresFromText(bio, era, nationality) {
  const scores = {
    L_S: 0,
    A_R: 0,
    E_M: 0,
    F_C: 0
  };
  
  if (!bio) return scores;
  
  const bioLower = bio.toLowerCase();
  
  // L/S 축 분석
  styleToAPTMapping.solitary_keywords.forEach(keyword => {
    if (bioLower.includes(keyword)) scores.L_S -= 15;
  });
  styleToAPTMapping.social_keywords.forEach(keyword => {
    if (bioLower.includes(keyword)) scores.L_S += 15;
  });
  
  // A/R 축 분석
  styleToAPTMapping.abstract_keywords.forEach(keyword => {
    if (bioLower.includes(keyword)) scores.A_R -= 15;
  });
  styleToAPTMapping.realistic_keywords.forEach(keyword => {
    if (bioLower.includes(keyword)) scores.A_R += 15;
  });
  
  // E/M 축 분석
  styleToAPTMapping.emotional_keywords.forEach(keyword => {
    if (bioLower.includes(keyword)) scores.E_M -= 15;
  });
  styleToAPTMapping.meaningful_keywords.forEach(keyword => {
    if (bioLower.includes(keyword)) scores.E_M += 15;
  });
  
  // F/C 축 분석
  styleToAPTMapping.free_keywords.forEach(keyword => {
    if (bioLower.includes(keyword)) scores.F_C -= 15;
  });
  styleToAPTMapping.controlled_keywords.forEach(keyword => {
    if (bioLower.includes(keyword)) scores.F_C += 15;
  });
  
  // 시대별 보정
  if (era) {
    const eraLower = era.toLowerCase();
    if (eraLower.includes('baroque')) scores.F_C += 20;
    if (eraLower.includes('impressionism')) scores.F_C -= 20;
    if (eraLower.includes('abstract')) scores.A_R -= 30;
    if (eraLower.includes('renaissance')) scores.F_C += 30;
    if (eraLower.includes('romanticism')) scores.E_M -= 20;
    if (eraLower.includes('surrealism')) scores.A_R -= 25;
  }
  
  // 점수 정규화 (-100 ~ 100)
  Object.keys(scores).forEach(key => {
    scores[key] = Math.max(-100, Math.min(100, scores[key]));
  });
  
  return scores;
}

// 점수를 0-100 형식으로 변환 (대립 차원 합계가 100이 되도록)
function convertToDimensionScores(rawScores) {
  const dimensions = {
    L: Math.round(50 - rawScores.L_S / 2),  // L이 높으면 S는 낮음
    S: Math.round(50 + rawScores.L_S / 2),
    A: Math.round(50 - rawScores.A_R / 2),  // A가 높으면 R은 낮음
    R: Math.round(50 + rawScores.A_R / 2),
    E: Math.round(50 - rawScores.E_M / 2),  // E가 높으면 M은 낮음
    M: Math.round(50 + rawScores.E_M / 2),
    F: Math.round(50 - rawScores.F_C / 2),  // F가 높으면 C는 낮음
    C: Math.round(50 + rawScores.F_C / 2)
  };
  
  // 정확히 100이 되도록 조정
  dimensions.S = 100 - dimensions.L;
  dimensions.R = 100 - dimensions.A;
  dimensions.M = 100 - dimensions.E;
  dimensions.C = 100 - dimensions.F;
  
  // 모든 값이 0-100 범위인지 확인
  Object.keys(dimensions).forEach(key => {
    dimensions[key] = Math.max(0, Math.min(100, dimensions[key]));
  });
  
  // 다시 한번 합계 조정
  dimensions.S = 100 - dimensions.L;
  dimensions.R = 100 - dimensions.A;
  dimensions.M = 100 - dimensions.E;
  dimensions.C = 100 - dimensions.F;
  
  return dimensions;
}

// APT 유형 결정 및 가중치 계산
function determineAPTTypes(dimensions) {
  // 주 성향 결정
  let primaryCode = '';
  primaryCode += dimensions.L > dimensions.S ? 'L' : 'S';
  primaryCode += dimensions.A > dimensions.R ? 'A' : 'R';
  primaryCode += dimensions.E > dimensions.M ? 'E' : 'M';
  primaryCode += dimensions.F > dimensions.C ? 'F' : 'C';
  
  // 각 축의 강도 계산
  const strengths = {
    L_S: Math.abs(dimensions.L - dimensions.S) / 100,
    A_R: Math.abs(dimensions.A - dimensions.R) / 100,
    E_M: Math.abs(dimensions.E - dimensions.M) / 100,
    F_C: Math.abs(dimensions.F - dimensions.C) / 100
  };
  
  // 주 성향과 부 성향 결정
  const types = [];
  
  // 주 성향 (가장 강한 성향)
  types.push({
    type: primaryCode,
    weight: 0.6 + (Object.values(strengths).reduce((a, b) => a + b, 0) / 8)
  });
  
  // 부 성향들 계산 (가장 약한 축을 반대로)
  const weakestAxis = Object.entries(strengths)
    .sort((a, b) => a[1] - b[1])[0][0];
  
  let secondaryCode = primaryCode.split('');
  if (weakestAxis === 'L_S') secondaryCode[0] = dimensions.L > 50 ? 'S' : 'L';
  if (weakestAxis === 'A_R') secondaryCode[1] = dimensions.A > 50 ? 'R' : 'A';
  if (weakestAxis === 'E_M') secondaryCode[2] = dimensions.E > 50 ? 'M' : 'E';
  if (weakestAxis === 'F_C') secondaryCode[3] = dimensions.F > 50 ? 'C' : 'F';
  
  const secondaryType = secondaryCode.join('');
  if (secondaryType !== primaryCode) {
    types.push({
      type: secondaryType,
      weight: 0.2 + (1 - strengths[weakestAxis]) * 0.1
    });
  }
  
  // 가중치 정규화
  const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
  types.forEach(t => t.weight = Math.round(t.weight / totalWeight * 100) / 100);
  
  return types;
}

// 감정 태그 추출
function extractEmotionTags(bio) {
  const emotionKeywords = {
    melancholy: ['melancholy', 'sadness', 'sorrow', 'grief', 'despair'],
    intensity: ['intense', 'passionate', 'fervent', 'ardent', 'zealous'],
    passion: ['passion', 'emotion', 'feeling', 'enthusiasm', 'love'],
    joy: ['joy', 'happiness', 'cheerful', 'delight', 'pleasure'],
    anger: ['anger', 'rage', 'fury', 'wrath', 'outrage'],
    serenity: ['serene', 'peaceful', 'calm', 'tranquil', 'placid'],
    mystery: ['mysterious', 'enigmatic', 'cryptic', 'obscure', 'mystical'],
    nostalgia: ['nostalgic', 'longing', 'yearning', 'reminiscent', 'wistful']
  };
  
  const tags = new Set();
  if (!bio) return [];
  
  const bioLower = bio.toLowerCase();
  
  Object.entries(emotionKeywords).forEach(([tag, keywords]) => {
    keywords.forEach(keyword => {
      if (bioLower.includes(keyword)) {
        tags.add(tag);
      }
    });
  });
  
  return Array.from(tags);
}

// 예술 운동 추출
function extractArtMovements(bio, era) {
  const movements = new Set();
  
  const movementKeywords = {
    'Impressionism': ['impressionist', 'impressionism'],
    'Post-Impressionism': ['post-impressionist', 'post-impressionism'],
    'Expressionism': ['expressionist', 'expressionism'],
    'Cubism': ['cubist', 'cubism'],
    'Surrealism': ['surrealist', 'surrealism'],
    'Abstract Expressionism': ['abstract expressionist', 'abstract expressionism'],
    'Renaissance': ['renaissance'],
    'Baroque': ['baroque'],
    'Romanticism': ['romantic', 'romanticism'],
    'Realism': ['realist', 'realism'],
    'Minimalism': ['minimalist', 'minimalism'],
    'Pop Art': ['pop art', 'pop artist'],
    'Contemporary': ['contemporary'],
    'Modern': ['modern', 'modernist', 'modernism']
  };
  
  const textToCheck = ((bio || '') + ' ' + (era || '')).toLowerCase();
  
  Object.entries(movementKeywords).forEach(([movement, keywords]) => {
    keywords.forEach(keyword => {
      if (textToCheck.includes(keyword)) {
        movements.add(movement);
      }
    });
  });
  
  return Array.from(movements);
}

// 신뢰도 계산
function calculateConfidence(scores, hasAI, bioLength) {
  let confidence = 40; // 기본 신뢰도
  
  // AI 분석 여부
  if (hasAI) confidence += 30;
  
  // Bio 길이에 따른 가중치
  if (bioLength > 2000) confidence += 20;
  else if (bioLength > 1000) confidence += 15;
  else if (bioLength > 500) confidence += 10;
  else if (bioLength > 100) confidence += 5;
  
  // 점수의 명확성 (극단적일수록 신뢰도 높음)
  Object.values(scores).forEach(score => {
    if (Math.abs(score) > 70) confidence += 3;
    else if (Math.abs(score) > 50) confidence += 2;
    else if (Math.abs(score) > 30) confidence += 1;
  });
  
  return Math.min(100, confidence);
}

// 메인 분석 함수
async function analyzeArtistsAPT() {
  try {
    console.log('🧬 향상된 작가 APT 분석 시작');
    console.log('=' + '='.repeat(80));
    
    // 분석이 필요한 작가들 조회
    const artists = await pool.query(`
      SELECT id, name, bio, era, nationality, importance_score, apt_profile
      FROM artists
      WHERE (apt_profile IS NULL OR (apt_profile->'meta'->>'confidence')::float < 0.8)
        AND bio IS NOT NULL
        AND LENGTH(bio) > 200
      ORDER BY 
        importance_score DESC NULLS LAST,
        LENGTH(bio) DESC
      LIMIT 30
    `);
    
    console.log(`\n📊 분석 대상: ${artists.rows.length}명의 작가\n`);
    
    let analyzed = 0;
    let aiAnalyzed = 0;
    
    for (const artist of artists.rows) {
      console.log(`\n분석 중: ${artist.name}`);
      console.log(`  - 시대: ${artist.era || '미상'}`);
      console.log(`  - 국적: ${artist.nationality || '미상'}`);
      console.log(`  - Bio 길이: ${artist.bio.length}자`);
      
      // 텍스트 기반 분석
      const textScores = calculateAPTScoresFromText(artist.bio, artist.era, artist.nationality);
      
      // AI 분석 (Google AI API가 있는 경우)
      let aiAnalysis = null;
      let finalScores = textScores;
      
      if (process.env.GOOGLE_AI_API_KEY && artist.importance_score >= 80) {
        console.log('  🤖 AI 분석 진행 중...');
        aiAnalysis = await analyzeArtistWithAI(artist);
        
        if (aiAnalysis) {
          aiAnalyzed++;
          // AI 분석 결과와 텍스트 분석 결과 병합
          finalScores = {
            L_S: (textScores.L_S + (aiAnalysis.L_S || 0)) / 2,
            A_R: (textScores.A_R + (aiAnalysis.A_R || 0)) / 2,
            E_M: (textScores.E_M + (aiAnalysis.E_M || 0)) / 2,
            F_C: (textScores.F_C + (aiAnalysis.F_C || 0)) / 2
          };
        }
      }
      
      // 차원 점수 변환 (0-100 형식, 대립 차원 합계 100)
      const dimensions = convertToDimensionScores(finalScores);
      
      // APT 유형들 결정 (주 성향, 부 성향)
      const aptTypes = determineAPTTypes(dimensions);
      const primaryType = aptTypes[0];
      const aptInfo = APT_TYPES[primaryType.type];
      const confidence = calculateConfidence(finalScores, !!aiAnalysis, artist.bio.length);
      
      console.log(`  📍 주 APT 유형: ${primaryType.type} - ${aptInfo.animal} (${aptInfo.title})`);
      console.log(`  📊 차원 점수: L:${dimensions.L}/S:${dimensions.S}, A:${dimensions.A}/R:${dimensions.R}, E:${dimensions.E}/M:${dimensions.M}, F:${dimensions.F}/C:${dimensions.C}`);
      console.log(`  🎯 신뢰도: ${confidence}%`);
      
      // 감정 태그와 예술 운동 추출
      const emotionTags = extractEmotionTags(artist.bio);
      const artMovements = extractArtMovements(artist.bio, artist.era);
      
      // 시대별 성향 분석 (간단한 버전)
      const periods = {};
      if (artist.era) {
        periods.main = {
          dominant_type: primaryType.type,
          years: artist.era
        };
      }
      
      // APT 프로필 생성 (올바른 형식)
      const aptProfile = {
        dimensions: dimensions,
        primary_types: aptTypes,
        periods: periods,
        meta: {
          confidence: confidence / 100,
          source: aiAnalysis ? 'ai_analysis' : 'text_analysis',
          keywords: [
            ...(finalScores.L_S < 0 ? ['독립적', '은둔적'] : ['사회적', '협업적']),
            ...(finalScores.A_R < 0 ? ['추상적', '개념적'] : ['구상적', '사실적']),
            ...(finalScores.E_M < 0 ? ['감정적', '직관적'] : ['의미적', '지적']),
            ...(finalScores.F_C < 0 ? ['자유로운', '실험적'] : ['체계적', '전통적'])
          ],
          emotion_tags: emotionTags,
          art_movements: artMovements
        }
      };
      
      // 데이터베이스 업데이트
      await pool.query(`
        UPDATE artists 
        SET apt_profile = $1, updated_at = NOW()
        WHERE id = $2
      `, [JSON.stringify(aptProfile), artist.id]);
      
      analyzed++;
      
      // API 제한 회피를 위한 대기
      if (aiAnalysis) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // 분석 결과 통계
    console.log('\n\n📊 분석 완료 통계:');
    console.log(`   전체 분석: ${analyzed}명`);
    console.log(`   AI 분석: ${aiAnalyzed}명`);
    console.log(`   텍스트 분석: ${analyzed - aiAnalyzed}명`);
    
    // APT 유형별 분포
    const distribution = await pool.query(`
      SELECT 
        apt_profile->>'type' as apt_type,
        apt_profile->>'animal' as animal,
        COUNT(*) as count,
        AVG((apt_profile->>'confidence')::float) as avg_confidence
      FROM artists
      WHERE apt_profile IS NOT NULL
      GROUP BY apt_profile->>'type', apt_profile->>'animal'
      ORDER BY count DESC
    `);
    
    console.log('\n📊 APT 유형별 분포:');
    distribution.rows.forEach(row => {
      console.log(`   ${row.apt_type} (${row.animal}): ${row.count}명 - 평균 신뢰도: ${(row.avg_confidence * 100).toFixed(1)}%`);
    });
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await pool.end();
  }
}

// 실행
analyzeArtistsAPT().then(() => {
  console.log('\n✅ APT 분석 완료!');
  console.log('다음 단계: 분석된 APT 프로필을 기반으로 사용자 추천 시스템 구축');
});