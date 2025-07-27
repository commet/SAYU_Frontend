const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function listHighImportanceArtists() {
  try {
    // 중요도 90+ 아티스트 조회
    const result = await pool.query(`
      SELECT 
        name,
        importance_score,
        apt_profile->'primary_types'->0->>'type' as apt_type,
        apt_profile->'primary_types'->0->>'title_ko' as apt_title,
        apt_profile->'primary_types'->0->>'name_ko' as apt_animal,
        apt_profile->'primary_types'->0->>'confidence' as confidence,
        nationality,
        birth_year,
        death_year
      FROM artists 
      WHERE importance_score >= 90
      ORDER BY importance_score DESC, name
    `);
    
    console.log('🌟 중요도 90+ 아티스트 전체 명단\n');
    console.log(`총 ${result.rows.length}명\n`);
    
    // 중요도별 그룹핑
    const groups = {
      95: [],
      94: [],
      93: [],
      92: [],
      91: [],
      90: []
    };
    
    result.rows.forEach(artist => {
      const score = artist.importance_score;
      if (!groups[score]) {
        groups[score] = [];
      }
      groups[score].push(artist);
    });
    
    // 중요도별 출력
    Object.keys(groups).sort((a, b) => b - a).forEach(score => {
      if (groups[score].length > 0) {
        console.log(`\n📊 중요도 ${score} (${groups[score].length}명)\n`);
        
        groups[score].forEach((artist, idx) => {
          const apt = artist.apt_type ? 
            `${artist.apt_type} - ${artist.apt_title} (${artist.apt_animal})` : 
            'APT 미설정';
          
          const years = artist.birth_year ? 
            `${artist.birth_year || '?'}-${artist.death_year || '현재'}` : 
            '';
          
          const nationality = artist.nationality || '국적 미상';
          
          console.log(`${idx + 1}. ${artist.name}`);
          console.log(`   ${nationality} ${years}`);
          console.log(`   APT: ${apt}`);
          if (artist.confidence) {
            console.log(`   신뢰도: ${artist.confidence}%`);
          }
          console.log('');
        });
      }
    });
    
    // APT 타입별 분포
    const aptDistribution = {};
    result.rows.forEach(artist => {
      const type = artist.apt_type || '미설정';
      aptDistribution[type] = (aptDistribution[type] || 0) + 1;
    });
    
    console.log('\n📈 APT 타입 분포:');
    Object.entries(aptDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}명`);
      });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

listHighImportanceArtists();