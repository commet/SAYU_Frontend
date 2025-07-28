const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { VALID_TYPE_CODES, getSAYUType } = require('@sayu/shared');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function integrateNewProfiles() {
  console.log('🔄 새로운 APT 프로필 통합 시작!\n');
  
  try {
    // 모든 APT 프로필 파일 찾기
    const files = fs.readdirSync(__dirname)
      .filter(file => file.startsWith('sayu_apt_profiles_'))
      .sort()
      .reverse();
    
    console.log(`📄 발견된 프로필 파일: ${files.length}개\n`);
    
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    
    for (const file of files) {
      console.log(`\n📋 처리 중: ${file}`);
      
      try {
        const profileData = JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
        const profiles = profileData.profiles || [];
        
        console.log(`  프로필 수: ${profiles.length}개`);
        
        for (const profile of profiles) {
          totalProcessed++;
          
          // 유효한 타입인지 확인
          if (!VALID_TYPE_CODES.includes(profile.aptPrimaryType)) {
            console.log(`  ❌ ${profile.artistName}: 잘못된 타입 (${profile.aptPrimaryType})`);
            continue;
          }
          
          // 아티스트 조회
          const checkResult = await pool.query(
            'SELECT id, name, apt_profile FROM artists WHERE LOWER(name) = LOWER($1)',
            [profile.artistName]
          );
          
          if (checkResult.rows.length === 0) {
            console.log(`  ⚠️ ${profile.artistName}: DB에 없음`);
            totalSkipped++;
            continue;
          }
          
          const artist = checkResult.rows[0];
          
          // 이미 APT가 있는 경우 스킵
          if (artist.apt_profile && artist.apt_profile.primary_types) {
            totalSkipped++;
            continue;
          }
          
          // 기존 DB 형식으로 변환
          const sayuType = getSAYUType(profile.aptPrimaryType);
          const aptProfile = {
            primary_types: [{
              type: profile.aptPrimaryType,
              title: sayuType.nameEn,
              title_ko: sayuType.name,
              animal: sayuType.animalEn?.toLowerCase(),
              name_ko: sayuType.animal,
              weight: 0.9,
              confidence: Math.round(profile.aptConfidenceScore * 100)
            }],
            dimensions: profile.aptDimensions,
            meta: {
              analysis_method: profile.analysisMethod || 'sayu_biographical_inference',
              analysis_date: profile.analysisDate || new Date().toISOString(),
              reasoning: profile.aptAnalysisNotes,
              actual_artist_name: profile.artistName,
              data_sources: profile.dataSources || ['manual']
            }
          };
          
          // 업데이트
          await pool.query(
            'UPDATE artists SET apt_profile = $1 WHERE id = $2',
            [JSON.stringify(aptProfile), artist.id]
          );
          
          console.log(`  ✅ ${artist.name}: ${profile.aptPrimaryType} 설정됨`);
          totalUpdated++;
        }
        
      } catch (error) {
        console.error(`  ❌ 파일 처리 오류: ${error.message}`);
      }
    }
    
    console.log('\n📊 통합 결과:');
    console.log(`  처리된 프로필: ${totalProcessed}개`);
    console.log(`  업데이트: ${totalUpdated}개`);
    console.log(`  스킵: ${totalSkipped}개`);
    
    // 최종 통계
    const finalStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN apt_profile IS NOT NULL THEN 1 END) as with_apt
      FROM artists
    `);
    
    console.log('\n📈 최종 현황:');
    console.log(`  전체 아티스트: ${finalStats.rows[0].total}명`);
    console.log(`  APT 프로필 보유: ${finalStats.rows[0].with_apt}명 (${(finalStats.rows[0].with_apt / finalStats.rows[0].total * 100).toFixed(1)}%)`);
    
    // 여전히 APT가 없는 중요 아티스트
    const missingAPT = await pool.query(`
      SELECT name, importance_score
      FROM artists 
      WHERE importance_score >= 90
      AND apt_profile IS NULL
      ORDER BY importance_score DESC
      LIMIT 10
    `);
    
    if (missingAPT.rows.length > 0) {
      console.log('\n⚠️ 여전히 APT 미설정 (중요도 90+):');
      missingAPT.rows.forEach(row => {
        console.log(`  - ${row.name} (중요도: ${row.importance_score})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

integrateNewProfiles();