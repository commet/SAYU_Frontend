/**
 * 개인 아티스트만 선별 (공방, 귀속작품 제외)
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function selectIndividualArtists() {
  try {
    console.log('🎨 개인 아티스트 선별 중...\n');
    
    // 개인 아티스트 가능성이 높은 조건:
    // 1. 이름이 너무 길지 않음 (60자 이하)
    // 2. "Attributed to", "After", "School of", "Workshop of" 등 제외
    // 3. "Manufactory", "Company" 등 제외
    // 4. 생년이 있거나 개인명으로 보이는 패턴
    
    const individualArtists = await pool.query(`
      SELECT 
        id,
        name,
        name_ko,
        nationality,
        birth_year,
        death_year,
        bio,
        copyright_status,
        follow_count,
        created_at
      FROM artists 
      WHERE 
        apt_profile IS NULL 
        AND is_verified = false
        AND name IS NOT NULL
        AND LENGTH(name) < 60
        AND name NOT ILIKE '%attributed to%'
        AND name NOT ILIKE '%after %'
        AND name NOT ILIKE '%school of%'
        AND name NOT ILIKE '%workshop%'
        AND name NOT ILIKE '%manufactory%'
        AND name NOT ILIKE '%company%'
        AND name NOT ILIKE '%studio%'
        AND name NOT ILIKE '%; %'
        AND name NOT ILIKE '%founded%'
        AND name NOT ILIKE '%modeled by%'
        AND name NOT ILIKE '%circle of%'
        AND name NOT ILIKE '%follower of%'
        AND (
          birth_year IS NOT NULL 
          OR name ~ '^[A-Z][a-z]+ [A-Z][a-z]+$'
          OR name ~ '^[A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+$'
          OR nationality IS NOT NULL
        )
      ORDER BY 
        CASE WHEN follow_count > 0 THEN follow_count ELSE 0 END DESC,
        CASE WHEN birth_year IS NOT NULL THEN 1 ELSE 2 END,
        created_at DESC
      LIMIT 30
    `);

    console.log(`📋 개인 아티스트 후보: ${individualArtists.rows.length}명`);
    console.log('═'.repeat(80));

    // 다양성을 위한 선별
    const selectedArtists = [];
    const nationalityCount = {};
    const eraCount = { 
      'medieval': 0,      // ~1400
      'renaissance': 0,   // 1400-1600
      'baroque': 0,       // 1600-1750
      'modern': 0,        // 1750-1900
      'contemporary': 0   // 1900~
    };
    
    for (const artist of individualArtists.rows) {
      if (selectedArtists.length >= 10) break;
      
      const nationality = artist.nationality || 'Unknown';
      const natCount = nationalityCount[nationality] || 0;
      
      // 국적별 최대 3명까지
      if (natCount >= 3) continue;
      
      // 시대별 균형 (선택사항)
      let era = 'unknown';
      if (artist.birth_year) {
        if (artist.birth_year < 1400) era = 'medieval';
        else if (artist.birth_year < 1600) era = 'renaissance';
        else if (artist.birth_year < 1750) era = 'baroque';
        else if (artist.birth_year < 1900) era = 'modern';
        else era = 'contemporary';
      }
      
      selectedArtists.push({...artist, era});
      nationalityCount[nationality] = natCount + 1;
      eraCount[era] = (eraCount[era] || 0) + 1;
    }

    console.log(`\n🎯 최종 선정 아티스트 (${selectedArtists.length}명):`);
    console.log('═'.repeat(80));

    selectedArtists.forEach((artist, index) => {
      console.log(`\n[${index + 1}] ${artist.name}`);
      console.log(`    국적: ${artist.nationality || '불명'}`);
      console.log(`    생몰년: ${artist.birth_year || '?'} - ${artist.death_year || '현재'}`);
      console.log(`    시대: ${artist.era}`);
      console.log(`    팔로워: ${artist.follow_count || 0}명`);
      console.log(`    저작권: ${artist.copyright_status}`);
      
      const bioLength = artist.bio ? artist.bio.length : 0;
      console.log(`    기존 전기: ${bioLength}자 ${bioLength < 100 ? '⚠️ 부족' : bioLength < 300 ? '📝 보통' : '✅ 충분'}`);
    });

    // 분포 확인
    console.log('\n🌍 국적 분포:');
    Object.entries(nationalityCount).forEach(([nationality, count]) => {
      console.log(`   ${nationality}: ${count}명`);
    });

    console.log('\n⏰ 시대 분포:');
    Object.entries(eraCount).forEach(([era, count]) => {
      if (count > 0) console.log(`   ${era}: ${count}명`);
    });

    // 실제 웹 검색 키워드 생성
    console.log('\n🔍 검색 최적화 키워드:');
    selectedArtists.slice(0, 5).forEach(artist => {
      const name = artist.name;
      console.log(`\n${name}:`);
      
      // 라파엘의 경우 실제 라파엘로 검색
      if (name.includes('Raphael') || name.includes('Raffaello')) {
        console.log(`  🎨 "Raphael painter biography personality psychology"`);
        console.log(`  🧠 "Raffaello Sanzio character traits working methods"`);
        console.log(`  📚 "Renaissance Raphael artistic philosophy personal life"`);
      } else {
        console.log(`  🎨 "${name} artist biography personality psychology"`);
        console.log(`  🧠 "${name} character traits working methods creative process"`);
        console.log(`  📚 "${name} artistic philosophy personal life relationships"`);
      }
    });

    console.log('\n📊 분석 품질 예상:');
    const wellKnownCount = selectedArtists.filter(a => 
      a.name.includes('Raphael') || 
      a.birth_year && a.birth_year > 1400 ||
      a.follow_count > 10
    ).length;
    
    console.log(`✅ 정보가 풍부할 아티스트: ${wellKnownCount}명`);
    console.log(`⚠️ 도전적인 분석 대상: ${selectedArtists.length - wellKnownCount}명`);

    console.log('\n🚀 다음 단계:');
    console.log('1. MCP 아티스트 분석기 실행');
    console.log('2. Perplexity + Tavily 검색 시작');
    console.log('3. LAREMFC 심리 분석');
    console.log('4. APT 동물 유형 매칭');

    return selectedArtists;

  } catch (error) {
    console.error('❌ 아티스트 선별 오류:', error);
  } finally {
    await pool.end();
  }
}

selectIndividualArtists();