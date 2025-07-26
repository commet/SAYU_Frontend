const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function applyAPTToDatabase() {
  try {
    console.log('💾 APT 분석 결과 데이터베이스 적용 시작\n');
    
    // 1. 핵심 아티스트 데이터 적용 (정확도 높은 expert analysis)
    console.log('🎨 1단계: 핵심 아티스트 APT 프로필 적용...');
    
    let expertData = [];
    try {
      expertData = JSON.parse(fs.readFileSync('apt-db-insert-data.json', 'utf8'));
      console.log(`   - ${expertData.length}명의 핵심 아티스트 프로필 로드됨`);
    } catch (error) {
      console.log('   - 핵심 아티스트 데이터 파일 없음, 건너뜀');
    }
    
    let expertApplied = 0;
    for (const data of expertData) {
      try {
        await pool.query(`
          UPDATE artists 
          SET apt_profile = $1, updated_at = NOW()
          WHERE id = $2
        `, [data.apt_profile, data.artist_id]);
        
        // 매핑 로그 저장
        await pool.query(`
          INSERT INTO artist_apt_mappings 
          (artist_id, mapping_method, apt_profile, confidence_score, mapped_by, mapping_notes)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          data.artist_id,
          data.mapping_method,
          data.apt_profile,
          data.confidence_score,
          data.mapped_by,
          data.mapping_notes
        ]);
        
        expertApplied++;
      } catch (error) {
        console.log(`   - 오류 (${data.artist_id}): ${error.message}`);
      }
    }
    
    console.log(`   ✅ 핵심 아티스트 ${expertApplied}명 적용 완료\n`);
    
    // 2. AI 추론 데이터 적용
    console.log('🤖 2단계: AI 추론 APT 프로필 적용...');
    
    let aiData = [];
    try {
      aiData = JSON.parse(fs.readFileSync('ai-apt-db-apply-data.json', 'utf8'));
      console.log(`   - ${aiData.length}명의 AI 추론 프로필 로드됨`);
    } catch (error) {
      console.log('   - AI 추론 데이터 파일 없음, 건너뜀');
    }
    
    let aiApplied = 0;
    for (const data of aiData) {
      try {
        // 이미 apt_profile이 있는지 확인 (expert data 우선)
        const existing = await pool.query(`
          SELECT apt_profile FROM artists WHERE id = $1
        `, [data.artist_id]);
        
        if (existing.rows.length > 0 && existing.rows[0].apt_profile) {
          continue; // 이미 expert data가 있으면 건너뛰기
        }
        
        await pool.query(`
          UPDATE artists 
          SET apt_profile = $1, updated_at = NOW()
          WHERE id = $2
        `, [data.apt_profile, data.artist_id]);
        
        // 매핑 로그 저장
        await pool.query(`
          INSERT INTO artist_apt_mappings 
          (artist_id, mapping_method, apt_profile, confidence_score, mapped_by, mapping_notes)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          data.artist_id,
          data.mapping_method,
          data.apt_profile,
          data.confidence_score,
          data.mapped_by,
          data.mapping_notes
        ]);
        
        aiApplied++;
      } catch (error) {
        console.log(`   - 오류 (${data.artist_id}): ${error.message}`);
      }
    }
    
    console.log(`   ✅ AI 추론 아티스트 ${aiApplied}명 적용 완료\n`);
    
    // 3. 적용 결과 통계
    console.log('📊 3단계: 적용 결과 분석...');
    
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(apt_profile) as mapped_artists,
        COUNT(CASE WHEN apt_profile IS NULL THEN 1 END) as unmapped_artists
      FROM artists
    `);
    
    const stat = stats.rows[0];
    const mappingRate = ((stat.mapped_artists / stat.total_artists) * 100).toFixed(1);
    
    console.log(`   📈 전체 아티스트: ${stat.total_artists}명`);
    console.log(`   ✅ APT 매핑 완료: ${stat.mapped_artists}명 (${mappingRate}%)`);
    console.log(`   ❌ 매핑 미완료: ${stat.unmapped_artists}명\n`);
    
    // 4. APT 타입별 분포 확인
    console.log('🎯 APT 타입 분포:');
    
    const distribution = await pool.query(`
      SELECT 
        (apt_profile->'primary_types'->0->>'type') as apt_type,
        COUNT(*) as count,
        ROUND(AVG((apt_profile->'meta'->>'confidence')::decimal), 2) as avg_confidence
      FROM artists 
      WHERE apt_profile IS NOT NULL
      GROUP BY (apt_profile->'primary_types'->0->>'type')
      ORDER BY count DESC
    `);
    
    distribution.rows.forEach(row => {
      console.log(`   ${row.apt_type}: ${row.count}명 (평균 신뢰도: ${row.avg_confidence})`);
    });
    
    // 5. 뷰 테스트
    console.log('\n📋 APT 통계 뷰 테스트:');
    
    try {
      const viewTest = await pool.query('SELECT * FROM apt_dimension_stats');
      const dims = viewTest.rows[0];
      
      console.log('   차원별 분포:');
      console.log(`   - Lone vs Shared: ${dims.lone_dominant}명 vs ${dims.shared_dominant}명`);
      console.log(`   - Abstract vs Representational: ${dims.abstract_dominant}명 vs ${dims.representational_dominant}명`);
      console.log(`   - Emotional vs Meaning: ${dims.emotional_dominant}명 vs ${dims.meaning_dominant}명`);
      console.log(`   - Flow vs Constructive: ${dims.flow_dominant}명 vs ${dims.constructive_dominant}명`);
    } catch (error) {
      console.log('   ⚠️ 뷰 테스트 오류:', error.message);
    }
    
    console.log('\n✅ APT 데이터베이스 적용 완료!');
    console.log(`📊 매핑률: ${mappingRate}% (${stat.mapped_artists}/${stat.total_artists})`);
    
    return {
      total: stat.total_artists,
      mapped: stat.mapped_artists,
      unmapped: stat.unmapped_artists,
      expertApplied,
      aiApplied,
      mappingRate: parseFloat(mappingRate)
    };
    
  } catch (error) {
    console.error('❌ 전체 오류:', error.message);
  } finally {
    await pool.end();
  }
}

applyAPTToDatabase();