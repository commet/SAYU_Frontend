/**
 * 첫 번째 배치 분석용 아티스트 10명 선택
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function selectFirstBatch() {
  try {
    console.log('🎯 첫 번째 배치 분석용 아티스트 선택 중...\n');
    
    // 분석 우선순위:
    // 1. 팔로워가 있는 아티스트
    // 2. 최근 추가된 아티스트
    // 3. 다양한 국적 대표
    // 4. 현재 APT 프로필이 없는 아티스트
    
    const candidates = await pool.query(`
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
        created_at,
        apt_profile
      FROM artists 
      WHERE 
        apt_profile IS NULL 
        AND is_verified = false
        AND name IS NOT NULL
        AND LENGTH(name) > 2
      ORDER BY 
        CASE WHEN follow_count > 0 THEN follow_count ELSE 0 END DESC,
        CASE WHEN nationality IN ('American', 'French', 'Italian', 'Dutch', 'English', 'German', 'Japanese') THEN 1 ELSE 2 END,
        created_at DESC
      LIMIT 20
    `);

    console.log(`📋 후보 아티스트: ${candidates.rows.length}명`);
    console.log('=' * 60);

    // 다양성을 위해 국적별로 균형 맞추기
    const selectedArtists = [];
    const nationalityCount = {};
    const maxPerNationality = 3;

    for (const artist of candidates.rows) {
      const nationality = artist.nationality || 'Unknown';
      const currentCount = nationalityCount[nationality] || 0;
      
      if (selectedArtists.length < 10 && currentCount < maxPerNationality) {
        selectedArtists.push(artist);
        nationalityCount[nationality] = currentCount + 1;
      }
      
      if (selectedArtists.length === 10) break;
    }

    console.log(`\n🎨 선정된 첫 번째 배치 (${selectedArtists.length}명):`);
    console.log('═'.repeat(80));

    selectedArtists.forEach((artist, index) => {
      console.log(`\n[${index + 1}] ${artist.name}`);
      console.log(`    한국어명: ${artist.name_ko || '없음'}`);
      console.log(`    국적: ${artist.nationality || '불명'}`);
      console.log(`    생몰년: ${artist.birth_year || '?'} - ${artist.death_year || '현재'}`);
      console.log(`    팔로워: ${artist.follow_count || 0}명`);
      console.log(`    저작권: ${artist.copyright_status}`);
      console.log(`    등록일: ${new Date(artist.created_at).toLocaleDateString('ko-KR')}`);
      
      // 기존 bio 길이 확인
      const bioLength = artist.bio ? artist.bio.length : 0;
      console.log(`    기존 전기: ${bioLength}자 ${bioLength < 100 ? '⚠️ 부족' : bioLength < 300 ? '⚠️ 보통' : '✅ 충분'}`);
    });

    // 국적별 분포 확인
    console.log('\n🌍 선정된 아티스트 국적 분포:');
    const nationalityDist = {};
    selectedArtists.forEach(artist => {
      const nat = artist.nationality || 'Unknown';
      nationalityDist[nat] = (nationalityDist[nat] || 0) + 1;
    });
    
    Object.entries(nationalityDist).forEach(([nationality, count]) => {
      console.log(`   ${nationality}: ${count}명`);
    });

    // 분석 예상 시간 계산
    const estimatedTimePerArtist = 3; // 분
    const totalEstimatedTime = selectedArtists.length * estimatedTimePerArtist;
    
    console.log('\n⏱️ 예상 분석 시간:');
    console.log(`   아티스트당: ${estimatedTimePerArtist}분`);
    console.log(`   전체 배치: ${totalEstimatedTime}분 (약 ${Math.ceil(totalEstimatedTime / 60)}시간)`);

    // 검색 키워드 미리 생성
    console.log('\n🔍 주요 검색 키워드 미리보기:');
    selectedArtists.slice(0, 3).forEach(artist => {
      console.log(`\n${artist.name}:`);
      console.log(`  - "${artist.name} biography psychology personality traits"`);
      console.log(`  - "${artist.name} art style working methods creative process"`);
      console.log(`  - "${artist.name} personal character relationships studio habits"`);
    });

    console.log('\n📊 분석 전략:');
    console.log('1. Perplexity로 각 아티스트의 상세 전기 및 심리 프로필 수집');
    console.log('2. Tavily로 추가적인 성격 특성 및 작업 방식 정보 보완');
    console.log('3. 수집된 텍스트를 LAREMFC 7차원으로 분석');
    console.log('4. 16가지 APT 동물 유형과 매칭');
    console.log('5. 신뢰도 70% 이상인 경우만 데이터베이스 업데이트');

    console.log('\n✅ 첫 번째 배치 선정 완료');
    console.log('이제 MCP 아티스트 분석기를 실행할 준비가 되었습니다.');

    return selectedArtists;

  } catch (error) {
    console.error('❌ 배치 선정 오류:', error);
  } finally {
    await pool.end();
  }
}

selectFirstBatch();