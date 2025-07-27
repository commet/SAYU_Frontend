// Gemini API를 사용한 유명 작가 APT 분석
require('dotenv').config();
const { pool } = require('./src/config/database');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function analyzeArtistAPT(artist) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
예술가 정보를 바탕으로 Art Personality Type (APT)을 분석해주세요.

작가 정보:
- 이름: ${artist.name}
- 국적: ${artist.nationality || ''}
- 시대: ${artist.era || ''}
- 소개: ${artist.bio || ''}

APT 16가지 유형:
1. LRUF (늑대) - 독립적 리더
2. LRUC (사자) - 카리스마 리더  
3. LREF (고래) - 공감적 리더
4. LRMC (코끼리) - 안정적 리더
5. LAUF (치타) - 독립적 모험가
6. LAUC (매) - 전략적 모험가
7. LAEF (여우) - 몽환적 방랑자
8. LAMC (곰) - 탐구적 실천가
9. SAUF (고양이) - 관찰자
10. SAUC (부엉이) - 분석가
11. SAEF (사슴) - 감성적 관찰자
12. SAMC (거북이) - 전통적 실천가
13. SRUF (나비) - 자유로운 창조자
14. SRUC (돌고래) - 혁신적 실천가
15. SREF (강아지) - 친근한 공감자
16. SRMC (독수리) - 체계적 교육자

다음 형식으로 답변해주세요:

주 성향: [APT 코드]
부 성향: [APT 코드]
제3 성향: [APT 코드]

분석 근거:
[작가의 작품 세계, 성격, 예술 철학을 바탕으로 한 자세한 설명]

주요 특징:
- [특징 1]
- [특징 2]
- [특징 3]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // 응답 파싱
    const lines = text.split('\n');
    let primary = null, secondary = null, tertiary = null;
    let analysisStarted = false;
    let analysis = '';
    let characteristics = [];

    for (let line of lines) {
      if (line.includes('주 성향:')) {
        const match = line.match(/\b(L[AR][UME][FCR]|S[AR][UME][FCR])\b/);
        if (match) primary = match[0];
      } else if (line.includes('부 성향:')) {
        const match = line.match(/\b(L[AR][UME][FCR]|S[AR][UME][FCR])\b/);
        if (match) secondary = match[0];
      } else if (line.includes('제3 성향:')) {
        const match = line.match(/\b(L[AR][UME][FCR]|S[AR][UME][FCR])\b/);
        if (match) tertiary = match[0];
      } else if (line.includes('분석 근거:')) {
        analysisStarted = true;
      } else if (line.includes('주요 특징:')) {
        analysisStarted = false;
      } else if (analysisStarted && line.trim()) {
        analysis += line + '\n';
      } else if (line.startsWith('- ')) {
        characteristics.push(line.substring(2));
      }
    }

    return {
      primary_apt: primary,
      secondary_apt: secondary,
      tertiary_apt: tertiary,
      analysis: analysis.trim(),
      characteristics: characteristics,
      meta: {
        source: 'gemini_analysis',
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`Error analyzing ${artist.name}:`, error.message);
    return null;
  }
}

async function analyzeFamousArtists() {
  try {
    console.log('🎨 Gemini API를 사용한 유명 작가 APT 분석 시작');
    console.log('='.repeat(80));

    // 중요도 75점 이상, APT 프로필이 없는 작가들 조회
    const artists = await pool.query(`
      SELECT id, name, nationality, era, bio, importance_score
      FROM artists
      WHERE importance_score >= 75
        AND (apt_profile IS NULL OR apt_profile->>'primary_apt' IS NULL)
      ORDER BY importance_score DESC
      LIMIT 10
    `);

    console.log(`\n${artists.rows.length}명의 작가를 분석합니다.\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < artists.rows.length; i++) {
      const artist = artists.rows[i];
      console.log(`\n[${i+1}/${artists.rows.length}] ${artist.name} (중요도: ${artist.importance_score})`);
      
      // API 속도 제한 고려 (1초 대기)
      if (i > 0) await new Promise(resolve => setTimeout(resolve, 1000));

      const aptProfile = await analyzeArtistAPT(artist);
      
      if (aptProfile && aptProfile.primary_apt) {
        // 데이터베이스 업데이트
        try {
          await pool.query(
            'UPDATE artists SET apt_profile = $1, updated_at = NOW() WHERE id = $2',
            [JSON.stringify(aptProfile), artist.id]
          );
          
          console.log(`✅ 성공: ${aptProfile.primary_apt} / ${aptProfile.secondary_apt} / ${aptProfile.tertiary_apt}`);
          console.log(`   분석: ${aptProfile.analysis.substring(0, 100)}...`);
          successCount++;
        } catch (err) {
          console.error(`❌ DB 업데이트 실패:`, err.message);
          errorCount++;
        }
      } else {
        console.log(`❌ 분석 실패`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`분석 완료: 성공 ${successCount}명, 실패 ${errorCount}명`);

    // APT 분포 확인
    const distribution = await pool.query(`
      SELECT 
        apt_profile->>'primary_apt' as apt_type,
        COUNT(*) as count
      FROM artists
      WHERE apt_profile IS NOT NULL
        AND apt_profile->>'primary_apt' IS NOT NULL
        AND importance_score >= 75
      GROUP BY apt_profile->>'primary_apt'
      ORDER BY count DESC
    `);

    console.log('\n업데이트된 APT 분포:');
    distribution.rows.forEach(row => {
      console.log(`${row.apt_type}: ${row.count}명`);
    });

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

analyzeFamousArtists();