// APT 상태 확인
require('dotenv').config();
const { pool } = require('./src/config/database');

async function checkAPTStatus() {
  try {
    console.log('🔍 APT 상태 확인');
    console.log('='.repeat(80));

    // 상위 중요도 작가들의 이름 확인
    const artists = await pool.query(`
      SELECT name, importance_score, apt_profile
      FROM artists 
      WHERE importance_score >= 90 
      ORDER BY importance_score DESC
      LIMIT 20
    `);

    console.log('\n상위 20명 작가:');
    artists.rows.forEach((row, i) => {
      const hasAPT = row.apt_profile && row.apt_profile.primary_apt ? '✅' : '❌';
      console.log(`${i+1}. ${row.name} (${row.importance_score}) ${hasAPT}`);
    });

    // 마스터 프로필 리스트와 매칭 확인
    const masterNames = [
      'Marina Abramović', 'Pablo Picasso', 'Vincent van Gogh', 
      'Salvador Dalí', 'Mark Rothko', 'Edward Hopper', '백남준',
      'Francis Bacon', 'Alberto Giacometti', 'Peter Paul Rubens'
    ];

    console.log('\n마스터 프로필 매칭 확인:');
    for (const name of masterNames) {
      const result = await pool.query(
        'SELECT id, name, importance_score FROM artists WHERE LOWER(name) LIKE LOWER($1) LIMIT 3',
        [`%${name}%`]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ ${name}:`);
        result.rows.forEach(row => {
          console.log(`   - ${row.name} (ID: ${row.id}, 중요도: ${row.importance_score})`);
        });
      } else {
        console.log(`❌ ${name}: 매칭 없음`);
      }
    }

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

checkAPTStatus();