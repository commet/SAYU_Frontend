const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAPTProfiles() {
  try {
    console.log('🔍 APT 프로필 구조 분석\n');
    
    // 최근 추가된 프로필들 확인
    const recent = await pool.query(`
      SELECT 
        name, 
        apt_profile,
        updated_at
      FROM artists 
      WHERE apt_profile IS NOT NULL
      ORDER BY updated_at DESC 
      LIMIT 5
    `);
    
    console.log('📋 최근 APT 프로필 5개:');
    recent.rows.forEach((artist, idx) => {
      console.log(`\n[${idx + 1}] ${artist.name}`);
      console.log(`업데이트: ${artist.updated_at}`);
      
      if (artist.apt_profile) {
        const profile = typeof artist.apt_profile === 'string' 
          ? JSON.parse(artist.apt_profile) 
          : artist.apt_profile;
        
        console.log('프로필 구조:', Object.keys(profile));
        
        if (profile.primary_types && profile.primary_types.length > 0) {
          console.log(`Primary APT: ${profile.primary_types[0].type} (${profile.primary_types[0].confidence}%)`);
        }
        
        if (profile.laremfc) {
          const dims = Object.entries(profile.laremfc).map(([k, v]) => `${k}:${v}`).join(' ');
          console.log(`LAREMFC: ${dims}`);
        }
      }
    });
    
    // 프로필별 동물 유형 분포 확인
    const animalTypes = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as animal_type,
        COUNT(*) as count
      FROM artists 
      WHERE apt_profile IS NOT NULL 
        AND apt_profile->'primary_types' IS NOT NULL
      GROUP BY apt_profile->'primary_types'->0->>'type'
      ORDER BY count DESC
    `);
    
    console.log('\n🐾 동물 유형 분포:');
    if (animalTypes.rows.length > 0) {
      animalTypes.rows.forEach(row => {
        console.log(`  ${row.animal_type}: ${row.count}명`);
      });
    } else {
      console.log('  분포 데이터 없음 - 프로필 구조 확인 필요');
    }
    
    // 프로필이 있지만 primary_types가 없는 경우 확인
    const missingPrimary = await pool.query(`
      SELECT name, apt_profile
      FROM artists 
      WHERE apt_profile IS NOT NULL 
        AND (apt_profile->'primary_types' IS NULL OR apt_profile->'primary_types'->0 IS NULL)
      LIMIT 3
    `);
    
    if (missingPrimary.rows.length > 0) {
      console.log('\n⚠️ primary_types 누락된 프로필:');
      missingPrimary.rows.forEach(row => {
        console.log(`  ${row.name}: ${JSON.stringify(row.apt_profile).substring(0, 100)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

checkAPTProfiles();