const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixAPTProfiles() {
  console.log('🔧 Fixing APT Profile format issues...\n');
  
  // Check existing APT structure first
  const existingResult = await pool.query(`
    SELECT name, apt_profile 
    FROM artists 
    WHERE apt_profile IS NOT NULL 
    LIMIT 1
  `);
  
  if (existingResult.rows.length > 0) {
    console.log('✅ Existing APT Profile format:');
    console.log(JSON.stringify(existingResult.rows[0].apt_profile, null, 2));
    console.log('\n');
  }

  // Fixed APT profiles with correct structure
  const fixedProfiles = {
    "South German; Augsburg": {
      "meta": {
        "source": "comprehensive_analysis_batch2",
        "keywords": ["지역공예", "전통적", "종교적", "장인정신"],
        "reasoning": ["지역 전통을 중시하는 보수적 장인. 공동체 내에서 인정받는 안정적 작업을 선호하며, 종교적 가치와 전통 기법을 철저히 따르는 성격."],
        "confidence": 0.75
      },
      "dimensions": {
        "A": 30, "C": 70, "E": 40, "F": 35, "L": 25, "M": 60, "R": 75, "S": 60
      },
      "primary_types": [
        {"type": "SRMC", "weight": 0.7},
        {"type": "SRMF", "weight": 0.3}
      ]
    },
    
    "After Raffaello Sanzio, called Raphael": {
      "meta": {
        "source": "comprehensive_analysis_batch2", 
        "keywords": ["모방", "전통계승", "고전적", "이상미"],
        "reasoning": ["완벽주의적 성향으로 대가의 양식을 철저히 연구하고 모방하는 장인 정신. 창의성보다는 기존 전통의 완벽한 재현을 추구하는 보수적 성격."],
        "confidence": 0.85
      },
      "dimensions": {
        "A": 15, "C": 85, "E": 25, "F": 20, "L": 30, "M": 70, "R": 80, "S": 40
      },
      "primary_types": [
        {"type": "LRMC", "weight": 0.8},
        {"type": "SRMC", "weight": 0.2}
      ]
    },
    
    "Alessandro Longhi": {
      "meta": {
        "source": "comprehensive_analysis_batch2",
        "keywords": ["초상화", "베네치아", "사교계", "우아함"],
        "reasoning": ["사교적이고 관찰력이 뛰어난 성격. 인간관계를 중시하며 타인의 내면을 파악하는 능력이 탁월. 사회적 성공을 추구하면서도 예술적 완성도를 놓치지 않는 균형 감각."],
        "confidence": 0.8
      },
      "dimensions": {
        "A": 45, "C": 60, "E": 70, "F": 55, "L": 40, "M": 65, "R": 60, "S": 75
      },
      "primary_types": [
        {"type": "SAMC", "weight": 0.6},
        {"type": "SRMF", "weight": 0.4}
      ]
    },
    
    "Rosalba Carriera": {
      "meta": {
        "source": "comprehensive_analysis_batch2",
        "keywords": ["파스텔", "섬세함", "우아함", "여성화가"],
        "reasoning": ["섬세하고 감성적이면서도 강인한 의지를 가진 혁신가. 남성 중심 사회에서 독자적 예술 세계를 구축한 개척자 정신. 색채와 질감에 대한 탁월한 감각을 보유."],
        "confidence": 0.85
      },
      "dimensions": {
        "A": 60, "C": 55, "E": 65, "F": 75, "L": 55, "M": 80, "R": 45, "S": 35
      },
      "primary_types": [
        {"type": "LAMF", "weight": 0.7},
        {"type": "SAMF", "weight": 0.3}
      ]
    },
    
    "Gerard van Groeningen": {
      "meta": {
        "source": "comprehensive_analysis_batch2",
        "keywords": ["플랑드르", "세밀화", "정교함", "북유럽"],
        "reasoning": ["극도로 꼼꼼하고 인내심이 강한 완벽주의자. 세부 사항에 대한 집착과 정확성을 추구하는 성격. 전통적 가치를 중시하면서도 기술적 혁신을 추구하는 장인 정신."],
        "confidence": 0.8
      },
      "dimensions": {
        "A": 25, "C": 80, "E": 30, "F": 40, "L": 45, "M": 75, "R": 70, "S": 50
      },
      "primary_types": [
        {"type": "LRMC", "weight": 0.6},
        {"type": "SRMC", "weight": 0.4}
      ]
    },
    
    "Apollonio di Giovanni": {
      "meta": {
        "source": "comprehensive_analysis_batch2",
        "keywords": ["카시노니", "서사화", "플로렌스", "공방"],
        "reasoning": ["이야기꾼 기질을 가진 상상력 풍부한 예술가. 고전 문학에 대한 깊은 애정과 서사적 구성 능력이 탁월. 상업적 성공과 예술적 완성도를 동시에 추구하는 실용적 성격."],
        "confidence": 0.75
      },
      "dimensions": {
        "A": 50, "C": 65, "E": 55, "F": 60, "L": 35, "M": 70, "R": 55, "S": 65
      },
      "primary_types": [
        {"type": "SAMF", "weight": 0.5},
        {"type": "SAMC", "weight": 0.5}
      ]
    },
    
    "Attributed to the Milan Marsyas Painter": {
      "meta": {
        "source": "comprehensive_analysis_batch2",
        "keywords": ["마졸리카", "신화적", "밀라노", "도기"],
        "reasoning": ["신화와 고전에 깊이 매료된 상상력 풍부한 장인. 이야기의 극적 순간을 포착하는 능력이 뛰어나며, 전통 공예 기법에 새로운 해석을 더하는 창의적 성격."],
        "confidence": 0.7
      },
      "dimensions": {
        "A": 40, "C": 60, "E": 50, "F": 70, "L": 40, "M": 75, "R": 50, "S": 55
      },
      "primary_types": [
        {"type": "SAMF", "weight": 0.6},
        {"type": "LAMC", "weight": 0.4}
      ]
    },
    
    "George Jakob Hunzinger": {
      "meta": {
        "source": "comprehensive_analysis_batch2",
        "keywords": ["가구디자인", "혁신", "특허", "기능성"],
        "reasoning": ["실용성과 혁신을 추구하는 발명가 정신. 전통적 가구 제작에 기계적 사고와 특허 시스템을 도입한 근대적 사업가. 기능성과 미적 가치를 동시에 추구하는 균형잡힌 성격."],
        "confidence": 0.8
      },
      "dimensions": {
        "A": 55, "C": 70, "E": 60, "F": 45, "L": 50, "M": 35, "R": 85, "S": 55
      },
      "primary_types": [
        {"type": "LREC", "weight": 0.6},
        {"type": "SREC", "weight": 0.4}
      ]
    },
    
    "Attributed to Nicholas Dixon": {
      "meta": {
        "source": "comprehensive_analysis_batch2",
        "keywords": ["미니어처", "초상화", "궁정", "정밀함"],
        "reasoning": ["극도의 집중력과 섬세함을 가진 완벽주의자. 사회적 지위를 중시하며 권위에 대한 존중이 깊음. 작은 화면에서 최대한의 표현력을 끌어내는 기술적 숙련도와 인내심이 특징."],
        "confidence": 0.8
      },
      "dimensions": {
        "A": 30, "C": 85, "E": 35, "F": 45, "L": 35, "M": 70, "R": 75, "S": 60
      },
      "primary_types": [
        {"type": "SRMC", "weight": 0.7},
        {"type": "LRMC", "weight": 0.3}
      ]
    },
    
    "Follower of Rembrandt van Rijn": {
      "meta": {
        "source": "comprehensive_analysis_batch2",
        "keywords": ["키아로스쿠로", "모방", "바로크", "극명함"],
        "reasoning": ["깊은 관찰력과 심리적 통찰력을 가진 진지한 성격. 인간 내면의 복잡성에 관심이 많으며, 극적 대비를 통해 진실을 드러내고자 하는 철학적 사고를 지님. 전통 계승에 충실하면서도 개인적 해석을 추구."],
        "confidence": 0.85
      },
      "dimensions": {
        "A": 65, "C": 60, "E": 55, "F": 70, "L": 70, "M": 50, "R": 45, "S": 40
      },
      "primary_types": [
        {"type": "LAEF", "weight": 0.5},
        {"type": "LAMC", "weight": 0.5}
      ]
    }
  };

  let successCount = 0;
  let errorCount = 0;

  // Apply fixes
  for (const [artistName, aptProfile] of Object.entries(fixedProfiles)) {
    try {
      const result = await pool.query(`
        UPDATE artists 
        SET apt_profile = $1, updated_at = NOW()
        WHERE name = $2
        RETURNING name
      `, [JSON.stringify(aptProfile), artistName]);
      
      if (result.rows.length > 0) {
        console.log(`✅ Updated APT profile for: ${artistName}`);
        successCount++;
      } else {
        console.log(`⚠️  Artist not found: ${artistName}`);
      }
    } catch (error) {
      console.log(`❌ Error updating ${artistName}: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 APT Profile Update Summary:`);
  console.log(`Successfully updated: ${successCount} artists`);
  console.log(`Errors: ${errorCount} artists`);
  console.log(`Total processed: ${Object.keys(fixedProfiles).length} artists`);

  await pool.end();
}

fixAPTProfiles().catch(console.error);