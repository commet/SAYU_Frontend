const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function copyExactFormat() {
  try {
    // Get Andy Warhol's exact profile
    const warholProfile = await pool.query(`
      SELECT apt_profile
      FROM artists 
      WHERE name = 'Andy Warhol'
    `);
    
    if (warholProfile.rows.length > 0) {
      const originalProfile = warholProfile.rows[0].apt_profile;
      console.log('Original Warhol profile:', JSON.stringify(originalProfile, null, 2));
      
      // Create Andreas Gursky profile by copying Warhol's format exactly, only changing specific values
      const gurskyProfile = {
        meta: {
          source: "expert_preset",  // Exact same source
          keywords: [
            "분석적",
            "완벽주의", 
            "체계적",
            "관찰"
          ],
          reasoning: [
            "대규모 사진작업을 통한 현대 자본주의의 체계적 분석과 관찰"
          ],
          confidence: 0.85
        },
        dimensions: {
          A: 50,
          C: 80,
          E: 40,
          F: 60,
          L: 70,
          M: 80,
          R: 90,
          S: 60
        },
        primary_types: [
          {
            type: "RMCL",  // Following same 4-letter pattern
            weight: 0.7
          },
          {
            type: "RMCF",
            weight: 0.3
          }
        ]
      };
      
      console.log('\nTrying Andreas Gursky...');
      
      try {
        const result = await pool.query(`
          UPDATE artists 
          SET apt_profile = $1
          WHERE name = 'Andreas Gursky'
          RETURNING name
        `, [JSON.stringify(gurskyProfile)]);
        
        if (result.rows.length > 0) {
          console.log('✅ Andreas Gursky updated!');
          
          // Now create the others with the same exact format
          const artists = [
            {
              name: 'Cindy Sherman',
              keywords: ["변신", "심리탐구", "정체성", "실험"],
              reasoning: ["다양한 페르소나를 통한 정체성과 사회 고정관념 탐구"],
              dimensions: { A: 60, C: 90, E: 80, F: 90, L: 80, M: 70, R: 70, S: 77 },
              types: ["CFLE", "CFEM"]
            },
            {
              name: 'Anselm Kiefer',
              keywords: ["신화적", "역사의식", "물질실험", "철학적"],
              reasoning: ["독일 역사와 신화를 거대한 물질 실험으로 재해석"],
              dimensions: { A: 50, C: 90, E: 90, F: 60, L: 80, M: 90, R: 70, S: 63 },
              types: ["MCEL", "MCER"]
            },
            {
              name: 'Yinka Shonibare',
              keywords: ["문화융합", "협력적", "유머", "포용성"],
              reasoning: ["아프리카와 유럽 문화를 융합한 협력적 예술 실천"],
              dimensions: { A: 90, C: 80, E: 70, F: 80, L: 80, M: 80, R: 70, S: 83 },
              types: ["ASML", "ASMF"]
            },
            {
              name: 'Kerry James Marshall',
              keywords: ["역사의식", "교육적", "체계적", "대표성"],
              reasoning: ["흑인의 존재를 회화사에 체계적으로 복원하는 교육적 접근"],
              dimensions: { A: 80, C: 80, E: 70, F: 60, L: 80, M: 60, R: 80, S: 73 },
              types: ["ACRL", "ACRS"]
            },
            {
              name: 'Kehinde Wiley',
              keywords: ["화려함", "대담함", "글로벌", "혁신"],
              reasoning: ["전통 초상화의 화려한 재해석을 통한 권력 구조 도전"],
              dimensions: { A: 70, C: 90, E: 80, F: 80, L: 90, M: 90, R: 70, S: 80 },
              types: ["LMCF", "LMCE"]
            }
          ];
          
          for (const artist of artists) {
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
                  type: artist.types[0],
                  weight: 0.7
                },
                {
                  type: artist.types[1],
                  weight: 0.3
                }
              ]
            };
            
            try {
              const updateResult = await pool.query(`
                UPDATE artists 
                SET apt_profile = $1
                WHERE name = $2
                RETURNING name
              `, [JSON.stringify(profile), artist.name]);
              
              if (updateResult.rows.length > 0) {
                console.log(`✅ ${artist.name} updated`);
              } else {
                console.log(`❌ ${artist.name} not found`);
              }
            } catch (error) {
              console.log(`❌ ${artist.name} failed: ${error.message}`);
            }
          }
          
        } else {
          console.log('❌ No rows returned');
        }
        
      } catch (error) {
        console.log('❌ Still failing:', error.message);
        
        // Let's try the absolute minimal change - just copy Warhol's profile to Andreas Gursky
        console.log('\nTrying exact copy of Warhol profile...');
        
        try {
          const copyResult = await pool.query(`
            UPDATE artists 
            SET apt_profile = $1
            WHERE name = 'Andreas Gursky'
            RETURNING name
          `, [JSON.stringify(originalProfile)]);
          
          if (copyResult.rows.length > 0) {
            console.log('✅ Exact copy worked! Now we know the format is valid.');
            
            // Update with small changes
            const modifiedProfile = JSON.parse(JSON.stringify(originalProfile));
            modifiedProfile.meta.keywords = ["분석적", "체계적", "관찰", "정밀"];
            modifiedProfile.meta.reasoning = ["현대 자본주의와 소비문화를 대규모 사진으로 분석"];
            modifiedProfile.dimensions.R = 90; // Change Rationality to 90
            modifiedProfile.dimensions.M = 80; // Change Materialism to 80
            
            const finalResult = await pool.query(`
              UPDATE artists 
              SET apt_profile = $1
              WHERE name = 'Andreas Gursky'
              RETURNING name
            `, [JSON.stringify(modifiedProfile)]);
            
            if (finalResult.rows.length > 0) {
              console.log('✅ Modified profile worked!');
            }
            
          } else {
            console.log('❌ Even exact copy failed');
          }
          
        } catch (copyError) {
          console.log('❌ Exact copy failed:', copyError.message);
        }
      }
      
    } else {
      console.log('Could not find Warhol profile');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

copyExactFormat();