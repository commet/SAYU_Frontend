// 현대 중요 작가 누락 확인

require('dotenv').config();
const { pool } = require('./src/config/database');

async function checkMissingArtists() {
  try {
    // 현대 미술의 핵심 작가들
    const importantArtists = [
      'Salvador Dalí',
      'Banksy',
      'Yayoi Kusama',
      'Jean-Michel Basquiat',
      'Frida Kahlo',
      'Georgia O\'Keeffe',
      'Edward Hopper',
      'David Hockney',
      'Roy Lichtenstein',
      'Jeff Koons',
      'Damien Hirst',
      'Ai Weiwei',
      'Marina Abramović',
      'Cindy Sherman',
      'Anselm Kiefer',
      'Gerhard Richter',
      'Francis Bacon',
      'Lucian Freud',
      'Alberto Giacometti',
      'Henry Moore',
      'Alexander Calder',
      'Louise Bourgeois',
      'Robert Rauschenberg',
      'Jasper Johns',
      'Nam June Paik',
      'Joseph Beuys'
    ];

    console.log('🔍 현대 미술 핵심 작가 확인');
    console.log(`=${'='.repeat(60)}`);

    // 데이터베이스에 있는 작가 확인
    const result = await pool.query(
      'SELECT name, importance_score, apt_profile IS NOT NULL as has_apt FROM artists WHERE name = ANY($1)',
      [importantArtists]
    );

    const existing = result.rows;
    const existingNames = existing.map(r => r.name);
    const missing = importantArtists.filter(name => !existingNames.includes(name));

    console.log(`\n✅ 등록된 작가: ${existing.length}명`);
    existing.forEach(artist => {
      console.log(`  - ${artist.name} (중요도: ${artist.importance_score || '미설정'}, APT: ${artist.has_apt ? '있음' : '없음'})`);
    });

    console.log(`\n❌ 누락된 작가: ${missing.length}명`);
    missing.forEach(name => {
      console.log(`  - ${name}`);
    });

    // 한국 현대 작가도 확인
    const koreanArtists = [
      '이우환',
      '박서보',
      '정상화',
      '김창열',
      '백남준',
      '이불',
      '서도호',
      '김수자',
      '양혜규',
      '최정화'
    ];

    console.log('\n\n🔍 한국 현대 미술 핵심 작가 확인');
    console.log(`=${'='.repeat(60)}`);

    const koreanResult = await pool.query(
      'SELECT name, importance_score, apt_profile IS NOT NULL as has_apt FROM artists WHERE name = ANY($1)',
      [koreanArtists]
    );

    const existingKorean = koreanResult.rows;
    const existingKoreanNames = existingKorean.map(r => r.name);
    const missingKorean = koreanArtists.filter(name => !existingKoreanNames.includes(name));

    console.log(`\n✅ 등록된 한국 작가: ${existingKorean.length}명`);
    existingKorean.forEach(artist => {
      console.log(`  - ${artist.name} (중요도: ${artist.importance_score || '미설정'}, APT: ${artist.has_apt ? '있음' : '없음'})`);
    });

    console.log(`\n❌ 누락된 한국 작가: ${missingKorean.length}명`);
    missingKorean.forEach(name => {
      console.log(`  - ${name}`);
    });

    // 전체 통계
    console.log('\n\n📊 전체 통계');
    console.log(`=${'='.repeat(60)}`);

    const totalStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE importance_score >= 90) as tier1,
        COUNT(*) FILTER (WHERE importance_score >= 80 AND importance_score < 90) as tier2,
        COUNT(*) FILTER (WHERE importance_score >= 70 AND importance_score < 80) as tier3,
        COUNT(*) FILTER (WHERE apt_profile IS NOT NULL) as with_apt,
        COUNT(*) FILTER (WHERE apt_profile IS NOT NULL AND (apt_profile->'meta'->>'source') = 'gemini_analysis') as gemini_analyzed
      FROM artists
    `);

    const stats = totalStats.rows[0];
    console.log(`전체 작가: ${stats.total}명`);
    console.log(`Tier 1 (90+): ${stats.tier1}명`);
    console.log(`Tier 2 (80-89): ${stats.tier2}명`);
    console.log(`Tier 3 (70-79): ${stats.tier3}명`);
    console.log(`APT 프로필 보유: ${stats.with_apt}명`);
    console.log(`Gemini 분석 완료: ${stats.gemini_analyzed}명`);

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

checkMissingArtists();
