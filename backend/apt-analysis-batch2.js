const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// APT Animal Type Mappings
const APT_ANIMAL_TYPES = {
  'LAEF': { animal: 'wolf', traits: ['독립적', '열정적', '자유로운', '감정적'] },
  'LAEC': { animal: 'fox', traits: ['영리한', '독립적', '논리적', '감정적'] },
  'LAMF': { animal: 'cat', traits: ['독립적', '예술적', '신비로운', '감정적'] },
  'LAMC': { animal: 'owl', traits: ['독립적', '지적', '신비로운', '차분한'] },
  'LREF': { animal: 'eagle', traits: ['독립적', '현실적', '자유로운', '감정적'] },
  'LREC': { animal: 'bear', traits: ['독립적', '현실적', '논리적', '차분한'] },
  'LRMF': { animal: 'tiger', traits: ['독립적', '현실적', '신비로운', '감정적'] },
  'LRMC': { animal: 'lion', traits: ['독립적', '현실적', '신비로운', '차분한'] },
  'SAEF': { animal: 'horse', traits: ['사회적', '예술적', '자유로운', '감정적'] },
  'SAEC': { animal: 'deer', traits: ['사회적', '예술적', '논리적', '차분한'] },
  'SAMF': { animal: 'dolphin', traits: ['사회적', '예술적', '신비로운', '감정적'] },
  'SAMC': { animal: 'elephant', traits: ['사회적', '예술적', '신비로운', '차분한'] },
  'SREF': { animal: 'dog', traits: ['사회적', '현실적', '자유로운', '감정적'] },
  'SREC': { animal: 'sheep', traits: ['사회적', '현실적', '논리적', '차분한'] },
  'SRMF': { animal: 'rabbit', traits: ['사회적', '현실적', '신비로운', '감정적'] },
  'SRMC': { animal: 'cow', traits: ['사회적', '현실적', '신비로운', '차분한'] }
};

// Individual Artist APT Analyses
const ARTIST_ANALYSES = {
  "South German; Augsburg": {
    era: "Late Medieval/Early Renaissance",
    keywords: ["지역공예", "전통적", "종교적", "장인정신"],
    biography: "아우크스부르크는 독일 남부의 중요한 공예 도시였으며, 이 지역 장인들은 정교한 금속공예와 종교미술로 유명했다.",
    personalityAnalysis: "지역 전통을 중시하는 보수적 장인. 공동체 내에서 인정받는 안정적 작업을 선호하며, 종교적 가치와 전통 기법을 철저히 따르는 성격.",
    dimensions: { A: 30, C: 70, E: 40, F: 35, L: 25, M: 60, R: 75, S: 60 },
    primaryTypes: [
      { type: "SRMC", weight: 0.7 },
      { type: "SRMF", weight: 0.3 }
    ],
    confidence: 0.75
  },

  "After Raffaello Sanzio, called Raphael": {
    era: "High Renaissance",
    keywords: ["모방", "전통계승", "고전적", "이상미"],
    biography: "라파엘로의 작품을 모방하는 후대 화가들. 르네상스 고전 양식의 완벽함을 추구하며, 대가의 기법을 충실히 재현하는 것을 목표로 했다.",
    personalityAnalysis: "완벽주의적 성향으로 대가의 양식을 철저히 연구하고 모방하는 장인 정신. 창의성보다는 기존 전통의 완벽한 재현을 추구하는 보수적 성격.",
    dimensions: { A: 15, C: 85, E: 25, F: 20, L: 30, M: 70, R: 80, S: 40 },
    primaryTypes: [
      { type: "LRMC", weight: 0.8 },
      { type: "SRMC", weight: 0.2 }
    ],
    confidence: 0.85
  },

  "Alessandro Longhi": {
    era: "18th Century Venetian",
    keywords: ["초상화", "베네치아", "사교계", "우아함"],
    biography: "베네치아의 저명한 초상화가(1733-1813). 귀족과 부르주아 계층의 초상화를 주로 그렸으며, 사회적 지위와 개성을 섬세하게 포착했다.",
    personalityAnalysis: "사교적이고 관찰력이 뛰어난 성격. 인간관계를 중시하며 타인의 내면을 파악하는 능력이 탁월. 사회적 성공을 추구하면서도 예술적 완성도를 놓치지 않는 균형 감각.",
    dimensions: { A: 45, C: 60, E: 70, F: 55, L: 40, M: 65, R: 60, S: 75 },
    primaryTypes: [
      { type: "SAMC", weight: 0.6 },
      { type: "SRMF", weight: 0.4 }
    ],
    confidence: 0.8
  },

  "Rosalba Carriera": {
    era: "18th Century Rococo",
    keywords: ["파스텔", "섬세함", "우아함", "여성화가"],
    biography: "베네치아 출신의 파스텔 대가(1673-1757). 유럽 전역에서 인정받은 최초의 여성 화가 중 하나로, 섬세하고 우아한 초상화로 유명했다.",
    personalityAnalysis: "섬세하고 감성적이면서도 강인한 의지를 가진 혁신가. 남성 중심 사회에서 독자적 예술 세계를 구축한 개척자 정신. 색채와 질감에 대한 탁월한 감각을 보유.",
    dimensions: { A: 60, C: 55, E: 65, F: 75, L: 55, M: 80, R: 45, S: 35 },
    primaryTypes: [
      { type: "LAMF", weight: 0.7 },
      { type: "SAMF", weight: 0.3 }
    ],
    confidence: 0.85
  },

  "Gerard van Groeningen": {
    era: "Flemish School",
    keywords: ["플랑드르", "세밀화", "정교함", "북유럽"],
    biography: "플랑드르 화파의 화가. 북유럽 특유의 정밀한 기법과 세부 묘사에 탁월했으며, 종교화와 초상화를 주로 제작했다.",
    personalityAnalysis: "극도로 꼼꼼하고 인내심이 강한 완벽주의자. 세부 사항에 대한 집착과 정확성을 추구하는 성격. 전통적 가치를 중시하면서도 기술적 혁신을 추구하는 장인 정신.",
    dimensions: { A: 25, C: 80, E: 30, F: 40, L: 45, M: 75, R: 70, S: 50 },
    primaryTypes: [
      { type: "LRMC", weight: 0.6 },
      { type: "SRMC", weight: 0.4 }
    ],
    confidence: 0.8
  },

  "Apollonio di Giovanni": {
    era: "Early Renaissance",
    keywords: ["카시노니", "서사화", "플로렌스", "공방"],
    biography: "플로렌스의 카시노니(혼례상자) 화가(1415-1465). 고전 문학과 역사적 장면을 화려하고 세밀하게 그려넣는 장식화의 명인이었다.",
    personalityAnalysis: "이야기꾼 기질을 가진 상상력 풍부한 예술가. 고전 문학에 대한 깊은 애정과 서사적 구성 능력이 탁월. 상업적 성공과 예술적 완성도를 동시에 추구하는 실용적 성격.",
    dimensions: { A: 50, C: 65, E: 55, F: 60, L: 35, M: 70, R: 55, S: 65 },
    primaryTypes: [
      { type: "SAMF", weight: 0.5 },
      { type: "SAMC", weight: 0.5 }
    ],
    confidence: 0.75
  },

  "Attributed to the Milan Marsyas Painter": {
    era: "Renaissance Maiolica",
    keywords: ["마졸리카", "신화적", "밀라노", "도기"],
    biography: "밀라노에서 활동한 르네상스 시대 마졸리카 화가(1525-1535 활동). 마르시아스 신화를 그린 도기로 명명되었으며, 신화적 주제를 주로 다뤘다.",
    personalityAnalysis: "신화와 고전에 깊이 매료된 상상력 풍부한 장인. 이야기의 극적 순간을 포착하는 능력이 뛰어나며, 전통 공예 기법에 새로운 해석을 더하는 창의적 성격.",
    dimensions: { A: 40, C: 60, E: 50, F: 70, L: 40, M: 75, R: 50, S: 55 },
    primaryTypes: [
      { type: "SAMF", weight: 0.6 },
      { type: "LAMC", weight: 0.4 }
    ],
    confidence: 0.7
  },

  "George Jakob Hunzinger": {
    era: "19th Century American",
    keywords: ["가구디자인", "혁신", "특허", "기능성"],
    biography: "독일 태생 미국 가구 디자이너(1835-1898). 혁신적인 접이식 의자와 기계식 가구 디자인으로 여러 특허를 취득한 발명가이자 예술가였다.",
    personalityAnalysis: "실용성과 혁신을 추구하는 발명가 정신. 전통적 가구 제작에 기계적 사고와 특허 시스템을 도입한 근대적 사업가. 기능성과 미적 가치를 동시에 추구하는 균형잡힌 성격.",
    dimensions: { A: 55, C: 70, E: 60, F: 45, L: 50, M: 35, R: 85, S: 55 },
    primaryTypes: [
      { type: "LREC", weight: 0.6 },
      { type: "SREC", weight: 0.4 }
    ],
    confidence: 0.8
  },

  "Attributed to Nicholas Dixon": {
    era: "17th Century English",
    keywords: ["미니어처", "초상화", "궁정", "정밀함"],
    biography: "영국의 미니어처 초상화가(1645-1708 이후). 궁정과 귀족 사회의 소형 초상화를 주로 그렸으며, 극도로 정밀한 기법으로 유명했다.",
    personalityAnalysis: "극도의 집중력과 섬세함을 가진 완벽주의자. 사회적 지위를 중시하며 권위에 대한 존중이 깊음. 작은 화면에서 최대한의 표현력을 끌어내는 기술적 숙련도와 인내심이 특징.",
    dimensions: { A: 30, C: 85, E: 35, F: 45, L: 35, M: 70, R: 75, S: 60 },
    primaryTypes: [
      { type: "SRMC", weight: 0.7 },
      { type: "LRMC", weight: 0.3 }
    ],
    confidence: 0.8
  },

  "Follower of Rembrandt van Rijn": {
    era: "Dutch Golden Age",
    keywords: ["키아로스쿠로", "모방", "바로크", "극명함"],
    biography: "렘브란트 공방 출신 또는 영향을 받은 화가들. 대가의 빛과 그림자 기법, 심리적 깊이를 모방하며 바로크 양식을 계승했다.",
    personalityAnalysis: "깊은 관찰력과 심리적 통찰력을 가진 진지한 성격. 인간 내면의 복잡성에 관심이 많으며, 극적 대비를 통해 진실을 드러내고자 하는 철학적 사고를 지님. 전통 계승에 충실하면서도 개인적 해석을 추구.",
    dimensions: { A: 65, C: 60, E: 55, F: 70, L: 70, M: 50, R: 45, S: 40 },
    primaryTypes: [
      { type: "LAEF", weight: 0.5 },
      { type: "LAMC", weight: 0.5 }
    ],
    confidence: 0.85
  }
};

async function processAPTAnalysis() {
  console.log('🎨 Starting APT Analysis Batch 2: Comprehensive Artist Personality Profiling\n');
  
  for (const [artistName, analysis] of Object.entries(ARTIST_ANALYSES)) {
    console.log(`\n🔍 Analyzing: ${artistName}`);
    console.log('='.repeat(50));
    
    // Find artist in database
    const artistResult = await pool.query(`
      SELECT id, name, name_ko, nationality, birth_year, death_year
      FROM artists 
      WHERE name = $1
      LIMIT 1
    `, [artistName]);
    
    if (artistResult.rows.length === 0) {
      console.log(`❌ Artist not found in database: ${artistName}`);
      continue;
    }
    
    const artist = artistResult.rows[0];
    
    // Create APT Profile
    const aptProfile = {
      meta: {
        source: "comprehensive_analysis_batch2",
        keywords: analysis.keywords,
        reasoning: [analysis.personalityAnalysis],
        confidence: analysis.confidence,
        era: analysis.era,
        biography_summary: analysis.biography
      },
      dimensions: analysis.dimensions,
      primary_types: analysis.primaryTypes
    };
    
    // Calculate animal types
    const animalTypes = analysis.primaryTypes.map(pt => {
      const animalInfo = APT_ANIMAL_TYPES[pt.type];
      return {
        type: pt.type,
        animal: animalInfo.animal,
        traits: animalInfo.traits,
        weight: pt.weight
      };
    });
    
    console.log(`✅ Database Record Found`);
    console.log(`   ID: ${artist.id}`);
    console.log(`   Name: ${artist.name} (${artist.name_ko || 'No Korean'})`);
    console.log(`   Dates: ${artist.birth_year || '?'} - ${artist.death_year || 'present'}`);
    console.log(`   Nationality: ${artist.nationality || 'Unknown'}`);
    
    console.log(`\n🧠 Personality Analysis:`);
    console.log(`   Era: ${analysis.era}`);
    console.log(`   Keywords: ${analysis.keywords.join(', ')}`);
    console.log(`   Analysis: ${analysis.personalityAnalysis}`);
    
    console.log(`\n📊 LAREMFC Dimensions:`);
    Object.entries(analysis.dimensions).forEach(([dim, score]) => {
      const bar = '█'.repeat(Math.floor(score / 10));
      console.log(`   ${dim}: ${score.toString().padStart(3)} ${bar}`);
    });
    
    console.log(`\n🐾 APT Animal Types:`);
    animalTypes.forEach(at => {
      console.log(`   ${at.animal.toUpperCase()} (${at.type}) - Weight: ${(at.weight * 100).toFixed(0)}%`);
      console.log(`      Traits: ${at.traits.join(', ')}`);
    });
    
    console.log(`\n💾 APT Profile Structure:`);
    console.log(JSON.stringify(aptProfile, null, 2));
    
    // Update database
    try {
      await pool.query(`
        UPDATE artists 
        SET apt_profile = $1, updated_at = NOW()
        WHERE id = $2
      `, [aptProfile, artist.id]);
      
      console.log(`✅ APT Profile saved to database`);
    } catch (error) {
      console.log(`❌ Error saving APT Profile: ${error.message}`);
    }
    
    console.log(`\n📈 Confidence Level: ${(analysis.confidence * 100).toFixed(0)}%`);
  }
  
  console.log('\n🎯 APT Analysis Batch 2 Complete!');
  console.log(`Total Artists Analyzed: ${Object.keys(ARTIST_ANALYSES).length}`);
  console.log(`\nNext steps:`);
  console.log(`- Validate APT profiles against art historical records`);
  console.log(`- Cross-reference with existing personality research`);
  console.log(`- Begin user matching algorithm testing`);
  
  await pool.end();
}

processAPTAnalysis().catch(console.error);