// 상위 중요 작가들의 APT 분석 (개선된 버전)

require('dotenv').config();
const { pool } = require('./src/config/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY);

// APT 유형 정보
const APT_TYPES = {
  'LAEF': { animal: '여우', title: '몽환적 방랑자' },
  'LAEC': { animal: '고양이', title: '감성 큐레이터' },
  'LAMF': { animal: '올빼미', title: '직관적 탐구자' },
  'LAMC': { animal: '거북이', title: '고독한 철학자' },
  'LREF': { animal: '카멜레온', title: '고독한 관찰자' },
  'LREC': { animal: '고슴도치', title: '섬세한 감정가' },
  'LRMF': { animal: '문어', title: '침묵의 관찰자' },
  'LRMC': { animal: '비버', title: '학구적 연구자' },
  'SAEF': { animal: '나비', title: '감성 나눔이' },
  'SAEC': { animal: '펭귄', title: '감성 조율사' },
  'SAMF': { animal: '앵무새', title: '영감 전도사' },
  'SAMC': { animal: '사슴', title: '문화 기획자' },
  'SREF': { animal: '강아지', title: '친근한 공감자' },
  'SREC': { animal: '오리', title: '세심한 조화자' },
  'SRMF': { animal: '코끼리', title: '지혜로운 안내자' },
  'SRMC': { animal: '독수리', title: '체계적 교육자' }
};

async function analyzeArtistAPT(artist) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
예술가 "${artist.name}"의 APT 분석을 수행합니다.

작가 정보:
- 이름: ${artist.name}
- 국적: ${artist.nationality || '미상'}
- 시대: ${artist.era || '미상'}

각 차원을 0-100으로 평가해주세요:
1. L(독립적) vs S(사회적)
2. A(추상적) vs R(구상적)  
3. E(감정적) vs M(의미적)
4. F(자유로운) vs C(체계적)

주의: 각 쌍의 합은 정확히 100이어야 합니다.

응답은 다음 JSON 형식으로만:
{
  "L": 숫자,
  "S": 숫자,
  "A": 숫자,
  "R": 숫자,
  "E": 숫자,
  "M": 숫자,
  "F": 숫자,
  "C": 숫자,
  "reasoning": "간단한 분석 근거"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // 차원 합계 검증
        parsed.S = 100 - parsed.L;
        parsed.R = 100 - parsed.A;
        parsed.M = 100 - parsed.E;
        parsed.C = 100 - parsed.F;
        
        // 주 유형 결정
        let primaryType = '';
        primaryType += parsed.L > 50 ? 'L' : 'S';
        primaryType += parsed.A > 50 ? 'A' : 'R';
        primaryType += parsed.E > 50 ? 'E' : 'M';
        primaryType += parsed.F > 50 ? 'F' : 'C';
        
        return {
          dimensions: parsed,
          primaryType: primaryType,
          reasoning: parsed.reasoning
        };
      }
    } catch (e) {
      console.error('JSON 파싱 오류:', e);
    }
    
    return null;
  } catch (error) {
    console.error(`API 오류 (${artist.name}):`, error.message);
    return null;
  }
}

// 부 유형 결정
function getSecondaryTypes(dimensions, primaryType) {
  const types = [{
    type: primaryType,
    weight: 0.6
  }];
  
  // 각 축의 강도
  const strengths = {
    L_S: Math.abs(dimensions.L - 50),
    A_R: Math.abs(dimensions.A - 50),
    E_M: Math.abs(dimensions.E - 50),
    F_C: Math.abs(dimensions.F - 50)
  };
  
  // 가장 약한 축을 반대로
  const weakest = Object.entries(strengths)
    .sort((a, b) => a[1] - b[1])[0][0];
  
  let secondaryCode = primaryType.split('');
  const axisMap = { L_S: 0, A_R: 1, E_M: 2, F_C: 3 };
  const idx = axisMap[weakest];
  
  if (weakest === 'L_S') secondaryCode[0] = primaryType[0] === 'L' ? 'S' : 'L';
  if (weakest === 'A_R') secondaryCode[1] = primaryType[1] === 'A' ? 'R' : 'A';
  if (weakest === 'E_M') secondaryCode[2] = primaryType[2] === 'E' ? 'M' : 'E';
  if (weakest === 'F_C') secondaryCode[3] = primaryType[3] === 'F' ? 'C' : 'F';
  
  const secondaryType = secondaryCode.join('');
  if (secondaryType !== primaryType) {
    types.push({
      type: secondaryType,
      weight: 0.25
    });
  }
  
  // 세 번째 유형
  const sortedStrengths = Object.entries(strengths).sort((a, b) => a[1] - b[1]);
  if (sortedStrengths.length >= 2) {
    const secondWeakest = sortedStrengths[1][0];
    let tertiaryCode = primaryType.split('');
    
    if (secondWeakest === 'L_S') tertiaryCode[0] = primaryType[0] === 'L' ? 'S' : 'L';
    if (secondWeakest === 'A_R') tertiaryCode[1] = primaryType[1] === 'A' ? 'R' : 'A';
    if (secondWeakest === 'E_M') tertiaryCode[2] = primaryType[2] === 'E' ? 'M' : 'E';
    if (secondWeakest === 'F_C') tertiaryCode[3] = primaryType[3] === 'F' ? 'C' : 'F';
    
    const tertiaryType = tertiaryCode.join('');
    if (tertiaryType !== primaryType && tertiaryType !== secondaryType) {
      types.push({
        type: tertiaryType,
        weight: 0.15
      });
    }
  }
  
  return types;
}

async function main() {
  try {
    console.log('🎨 상위 중요 작가 APT 분석 시작');
    console.log('=' + '='.repeat(60));
    
    // 상위 20명의 중요 작가만 분석
    const artists = await pool.query(`
      SELECT id, name, nationality, era, bio, importance_score, apt_profile
      FROM artists
      WHERE importance_score >= 85
        AND (apt_profile IS NULL OR apt_profile->>'meta' IS NULL 
             OR (apt_profile->'meta'->>'source') != 'gemini_analysis')
      ORDER BY importance_score DESC
      LIMIT 20
    `);
    
    console.log(`\n📊 분석 대상: ${artists.rows.length}명\n`);
    
    let success = 0;
    const distribution = {};
    
    for (const artist of artists.rows) {
      console.log(`\n🎨 ${artist.name} (중요도: ${artist.importance_score})`);
      
      const analysis = await analyzeArtistAPT(artist);
      
      if (analysis && APT_TYPES[analysis.primaryType]) {
        const aptInfo = APT_TYPES[analysis.primaryType];
        const types = getSecondaryTypes(analysis.dimensions, analysis.primaryType);
        
        console.log(`  ✅ ${analysis.primaryType} - ${aptInfo.animal} (${aptInfo.title})`);
        console.log(`  📊 L:${analysis.dimensions.L} A:${analysis.dimensions.A} E:${analysis.dimensions.E} F:${analysis.dimensions.F}`);
        console.log(`  💭 ${analysis.reasoning}`);
        
        // APT 프로필 생성
        const aptProfile = {
          dimensions: analysis.dimensions,
          primary_types: types,
          periods: {
            main: {
              dominant_type: analysis.primaryType,
              years: artist.era || 'Unknown'
            }
          },
          meta: {
            confidence: 0.85,
            source: 'gemini_analysis',
            keywords: [],
            reasoning: analysis.reasoning
          }
        };
        
        // 업데이트
        await pool.query(
          'UPDATE artists SET apt_profile = $1, updated_at = NOW() WHERE id = $2',
          [JSON.stringify(aptProfile), artist.id]
        );
        
        distribution[analysis.primaryType] = (distribution[analysis.primaryType] || 0) + 1;
        success++;
        
        // API 제한 방지
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log(`  ❌ 분석 실패`);
      }
    }
    
    console.log('\n\n📊 분석 결과:');
    console.log(`✅ 성공: ${success}/${artists.rows.length}`);
    
    console.log('\n📊 APT 분포:');
    Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const info = APT_TYPES[type];
        console.log(`  ${type} (${info.animal}): ${count}명`);
      });
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

main();