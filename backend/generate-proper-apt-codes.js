const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Analyze the pattern: SAMC, SAMF, LAEF, LAMF, LRMC, LREC, LAEC, SAEF
// Seems to be combinations of high-scoring dimensions
// S=Social, A=Agreeableness, M=Materialism, C=Creativity, F=Flexibility, L=Leadership, R=Rationality, E=Emotionality

function generateAptTypeCode(dimensions) {
  // Get the 4 highest scoring dimensions
  const sortedDims = Object.entries(dimensions)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 4)
    .map(([key]) => key);
  
  return sortedDims.join('');
}

async function updateArtistsWithProperCodes() {
  try {
    console.log('🎨 Generating proper APT type codes for artists 5-10...\n');
    
    const artists = [
      {
        name: 'Andreas Gursky',
        dimensions: { A: 50, C: 80, E: 40, F: 60, L: 70, M: 80, R: 90, S: 60 },
        keywords: ["분석적", "완벽주의", "체계적", "관찰"],
        reasoning: ["대규모 사진작업을 통한 현대 자본주의 관찰과 분석적 접근"]
      },
      {
        name: 'Cindy Sherman', 
        dimensions: { A: 60, C: 90, E: 80, F: 90, L: 80, M: 70, R: 70, S: 77 },
        keywords: ["변화", "심리탐구", "정체성", "변신"],
        reasoning: ["40년간 다양한 페르소나를 통한 정체성과 사회비판적 탐구"]
      },
      {
        name: 'Anselm Kiefer',
        dimensions: { A: 50, C: 90, E: 90, F: 60, L: 80, M: 90, R: 70, S: 63 },
        keywords: ["신화적", "역사의식", "물질실험", "철학적"],
        reasoning: ["독일 역사와 신화를 거대한 스케일과 물질 실험으로 탐구"]
      },
      {
        name: 'Yinka Shonibare',
        dimensions: { A: 90, C: 80, E: 70, F: 80, L: 80, M: 80, R: 70, S: 83 },
        keywords: ["문화융합", "사회의식", "유머", "포용성"],
        reasoning: ["문화간 경계를 넘나드는 협력적이고 포용적인 예술 실천"]
      },
      {
        name: 'Kerry James Marshall',
        dimensions: { A: 80, C: 80, E: 70, F: 60, L: 80, M: 60, R: 80, S: 73 },
        keywords: ["역사의식", "대표성", "교육적", "체계적"],
        reasoning: ["흑인의 존재감을 회화사에 체계적으로 복원하는 교육적 리더십"]
      },
      {
        name: 'Kehinde Wiley',
        dimensions: { A: 70, C: 90, E: 80, F: 80, L: 90, M: 90, R: 70, S: 80 },
        keywords: ["카리스마", "대담함", "글로벌", "장식성"],
        reasoning: ["전통 초상화의 재해석을 통한 문화적 권력과 아름다움의 재정의"]
      }
    ];
    
    for (const artist of artists) {
      // Generate primary and secondary type codes
      const sortedDims = Object.entries(artist.dimensions)
        .sort(([,a], [,b]) => b - a);
      
      const primaryType = sortedDims.slice(0, 4).map(([key]) => key).join('');
      const secondaryType = [sortedDims[0][0], sortedDims[1][0], sortedDims[2][0], sortedDims[4][0]].join('');
      
      console.log(`${artist.name}:`);
      console.log(`  Dimensions: ${Object.entries(artist.dimensions).map(([k,v]) => `${k}:${v}`).join(' ')}`);
      console.log(`  Primary type: ${primaryType}`);
      console.log(`  Secondary type: ${secondaryType}`);
      
      const profile = {
        meta: {
          source: "expert_preset",
          keywords: artist.keywords,
          reasoning: artist.reasoning,
          confidence: 0.85
        },
        dimensions: artist.dimensions,
        primary_types: [
          {
            type: primaryType,
            weight: 0.7
          },
          {
            type: secondaryType,
            weight: 0.3
          }
        ]
      };
      
      try {
        const result = await pool.query(`
          UPDATE artists 
          SET apt_profile = $1
          WHERE name = $2
          RETURNING name
        `, [JSON.stringify(profile), artist.name]);
        
        if (result.rows.length > 0) {
          console.log(`  ✅ Updated successfully\n`);
        } else {
          console.log(`  ❌ Artist not found\n`);
        }
      } catch (error) {
        console.log(`  ❌ Update failed: ${error.message}\n`);
      }
    }
    
    // Verify the updates
    console.log('🔍 Verifying updates...\n');
    
    for (const artist of artists) {
      try {
        const result = await pool.query(`
          SELECT name, apt_profile
          FROM artists 
          WHERE name = $1 AND apt_profile IS NOT NULL
        `, [artist.name]);
        
        if (result.rows.length > 0) {
          const profile = result.rows[0].apt_profile;
          console.log(`✅ ${artist.name}: ${profile.primary_types[0].type} (${profile.meta.confidence})`);
        } else {
          console.log(`❌ ${artist.name}: No profile found`);
        }
      } catch (error) {
        console.log(`❌ ${artist.name}: Verification error`);
      }
    }
    
  } catch (error) {
    console.error('Main error:', error.message);
  } finally {
    await pool.end();
  }
}

updateArtistsWithProperCodes();