// SRMC 유형 분석

require('dotenv').config();
const { pool } = require('./src/config/database');

async function analyzeSRMC() {
  try {
    // SRMC 정의 확인
    console.log('\n📚 SRMC (체계적 교육자) 정의:');
    console.log('=====================================');
    console.log('S: Social (함께) - 작품을 타인과 공유하며 감상');
    console.log('R: Representational (구상) - 명확한 형태와 의미');
    console.log('M: Meaning (의미) - 작품의 의도와 메시지 중시');
    console.log('C: Constructive (체계) - 논리적이고 구조적 접근\n');
    
    // SRMC로 분류된 작가들 샘플
    const srmcArtists = await pool.query(`
      SELECT 
        name, 
        nationality, 
        era, 
        birth_year,
        death_year,
        LENGTH(COALESCE(bio, '')) as bio_length,
        apt_profile->'primary_types'->0->>'confidence' as confidence,
        apt_profile->'meta'->>'search_info' as search_info,
        apt_profile->'meta'->>'actual_artist_name' as actual_name
      FROM artists
      WHERE apt_profile->'primary_types'->0->>'type' = 'SRMC'
      ORDER BY RANDOM()
      LIMIT 30
    `);
    
    console.log('🔍 SRMC로 분류된 작가들 샘플 (30명):');
    console.log('=====================================\n');
    
    // 귀속 작품 vs 실제 작가 분류
    let attributions = 0;
    let realArtists = 0;
    
    srmcArtists.rows.forEach((artist, idx) => {
      const isAttribution = artist.name.match(/Attributed|Follower|Workshop|After/);
      if (isAttribution) attributions++;
      else realArtists++;
      
      console.log(`${idx + 1}. ${artist.name}`);
      console.log(`   국적: ${artist.nationality || '알 수 없음'} | 시대: ${artist.era || '알 수 없음'}`);
      console.log(`   생몰: ${artist.birth_year || '?'} - ${artist.death_year || '?'}`);
      console.log(`   Bio: ${artist.bio_length}자 | 신뢰도: ${artist.confidence}%`);
      if (artist.actual_name) {
        console.log(`   실제 작가명: ${artist.actual_name}`);
      }
      if (artist.search_info) {
        console.log(`   검색 정보: ${artist.search_info.substring(0, 100)}...`);
      }
      console.log('');
    });
    
    console.log(`\n📊 SRMC 분포 분석:`);
    console.log(`   - 귀속 작품: ${attributions}개`);
    console.log(`   - 실제 작가: ${realArtists}개`);
    
    // 축 점수 분석
    const axisScores = await pool.query(`
      SELECT 
        AVG((50 + (apt_profile->'dimensions'->>'S')::INT)) as avg_S,
        AVG((50 + (apt_profile->'dimensions'->>'R')::INT)) as avg_R,
        AVG((50 + (apt_profile->'dimensions'->>'M')::INT)) as avg_M,
        AVG((50 + (apt_profile->'dimensions'->>'C')::INT)) as avg_C
      FROM artists
      WHERE apt_profile->'primary_types'->0->>'type' = 'SRMC'
    `);
    
    console.log(`\n📈 SRMC 평균 축 점수:`);
    const scores = axisScores.rows[0];
    console.log(`   - S (Social): ${Math.round(scores.avg_s)}% (기대: >50%)`);
    console.log(`   - R (Representational): ${Math.round(scores.avg_r)}% (기대: >50%)`);
    console.log(`   - M (Meaning): ${Math.round(scores.avg_m)}% (기대: >50%)`);
    console.log(`   - C (Constructive): ${Math.round(scores.avg_c)}% (기대: >50%)`);
    
    // 전체 APT 분포
    const allTypes = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as apt_type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM artists WHERE apt_profile IS NOT NULL)) as percentage
      FROM artists
      WHERE apt_profile IS NOT NULL
      GROUP BY apt_type
      ORDER BY count DESC
    `);
    
    console.log(`\n🎭 전체 APT 유형 분포:`);
    allTypes.rows.forEach(row => {
      console.log(`   ${row.apt_type}: ${row.count}명 (${row.percentage}%)`);
    });
    
    // SRMC가 과도하게 많은 이유 분석
    console.log(`\n⚠️  SRMC 과다 분류 원인 분석:`);
    console.log(`1. 귀속 작품들이 대부분 SRMC로 분류됨`);
    console.log(`2. 데이터 부족 시 기본값처럼 SRMC가 선택됨`);
    console.log(`3. 프롬프트나 가중치 조정 필요`);
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

analyzeSRMC();