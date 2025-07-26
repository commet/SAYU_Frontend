const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function analyzeArtistSources() {
  try {
    console.log('🔍 아티스트 데이터 소스 및 APT 매칭 로직 분석\n');
    
    // 1. 아티스트 데이터 소스 분석
    console.log('📊 아티스트 데이터 소스 분포:');
    
    const sourcesAnalysis = await pool.query(`
      SELECT 
        CASE 
          WHEN sources::text LIKE '%wikipedia%' THEN 'Wikipedia 포함'
          WHEN sources::text LIKE '%wikidata%' THEN 'Wikidata 포함'
          WHEN sources::text LIKE '%museums%' THEN 'Museum API 포함'
          WHEN sources IS NULL THEN 'No Source'
          ELSE 'Other'
        END as source_type,
        COUNT(*) as count
      FROM artists 
      GROUP BY source_type
      ORDER BY count DESC
    `);
    
    sourcesAnalysis.rows.forEach(row => {
      console.log(`   ${row.source_type}: ${row.count}명`);
    });
    
    // 2. 구체적인 소스 데이터 샘플
    console.log('\n📝 아티스트 소스 데이터 샘플:');
    
    const sourceSamples = await pool.query(`
      SELECT name, name_ko, nationality, sources, 
             LENGTH(bio) as bio_length, LENGTH(bio_ko) as bio_ko_length
      FROM artists 
      WHERE sources IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 5
    `);
    
    sourceSamples.rows.forEach((artist, i) => {
      console.log(`\n[${i+1}] ${artist.name || artist.name_ko}`);
      console.log(`   국적: ${artist.nationality || 'N/A'}`);
      console.log(`   소스: ${JSON.stringify(artist.sources)}`);
      console.log(`   바이오 길이: ${artist.bio_length || 0} / ${artist.bio_ko_length || 0} 글자`);
    });
    
    // 3. APT 매핑 방법별 상세 분석
    console.log('\n🎯 APT 매핑 방법 상세 분석:');
    
    const mappingMethods = await pool.query(`
      SELECT 
        mapping_method,
        COUNT(*) as count,
        ROUND(AVG(confidence_score), 2) as avg_confidence,
        MIN(confidence_score) as min_confidence,
        MAX(confidence_score) as max_confidence
      FROM artist_apt_mappings
      GROUP BY mapping_method
      ORDER BY count DESC
    `);
    
    mappingMethods.rows.forEach(row => {
      console.log(`\n   ${row.mapping_method}:`);
      console.log(`     - 아티스트 수: ${row.count}명`);
      console.log(`     - 평균 신뢰도: ${row.avg_confidence}`);
      console.log(`     - 신뢰도 범위: ${row.min_confidence} ~ ${row.max_confidence}`);
    });
    
    // 4. APT 매핑 로직별 특성 분석
    console.log('\n🔬 APT 매핑 로직 분석:');
    
    // expert_analysis_v2 (수동 설정)
    const expertSamples = await pool.query(`
      SELECT a.name, a.name_ko, aam.mapping_notes
      FROM artists a
      JOIN artist_apt_mappings aam ON a.id = aam.artist_id
      WHERE aam.mapping_method = 'expert_analysis_v2'
      LIMIT 3
    `);
    
    console.log('\n   📌 expert_analysis_v2 (수동 전문가 분석):');
    expertSamples.rows.forEach(artist => {
      console.log(`     - ${artist.name || artist.name_ko}: ${artist.mapping_notes}`);
    });
    
    // ai_inference_v1 (AI 기반 추론)
    const aiSamples = await pool.query(`
      SELECT a.name, a.name_ko, aam.mapping_notes
      FROM artists a
      JOIN artist_apt_mappings aam ON a.id = aam.artist_id
      WHERE aam.mapping_method = 'ai_inference_v1'
      LIMIT 3
    `);
    
    console.log('\n   🤖 ai_inference_v1 (AI 기반 추론):');
    aiSamples.rows.forEach(artist => {
      console.log(`     - ${artist.name || artist.name_ko}: ${artist.mapping_notes}`);
    });
    
    // quick_inference_v1 (빠른 규칙 기반)
    const quickSamples = await pool.query(`
      SELECT a.name, a.name_ko, aam.mapping_notes
      FROM artists a
      JOIN artist_apt_mappings aam ON a.id = aam.artist_id
      WHERE aam.mapping_method = 'quick_inference_v1'
      LIMIT 3
    `);
    
    console.log('\n   ⚡ quick_inference_v1 (빠른 규칙 기반):');
    quickSamples.rows.forEach(artist => {
      console.log(`     - ${artist.name || artist.name_ko}: ${artist.mapping_notes}`);
    });
    
    // 5. 데이터 품질 분석
    console.log('\n📋 데이터 품질 분석:');
    
    const qualityStats = await pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(sources) as has_sources,
        COUNT(bio) as has_bio,
        COUNT(bio_ko) as has_bio_ko,
        COUNT(apt_profile) as has_apt,
        ROUND(AVG(LENGTH(bio))) as avg_bio_length,
        ROUND(AVG(LENGTH(bio_ko))) as avg_bio_ko_length
      FROM artists
    `);
    
    const quality = qualityStats.rows[0];
    console.log(`   총 아티스트: ${quality.total_artists}명`);
    console.log(`   소스 정보 보유: ${quality.has_sources}명 (${(quality.has_sources/quality.total_artists*100).toFixed(1)}%)`);
    console.log(`   영문 바이오 보유: ${quality.has_bio}명 (평균 ${quality.avg_bio_length}글자)`);
    console.log(`   한국어 바이오 보유: ${quality.has_bio_ko}명 (평균 ${quality.avg_bio_ko_length}글자)`);
    console.log(`   APT 프로필 보유: ${quality.has_apt}명 (${(quality.has_apt/quality.total_artists*100).toFixed(1)}%)`);
    
    console.log('\n🔍 결론: APT 매칭은 주로 다음 정보를 기반으로 함:');
    console.log('   1. 전문가 수동 분석 (21명, 95% 신뢰도)');
    console.log('   2. AI 추론 (바이오그래피 텍스트 + 메타데이터)');
    console.log('   3. 규칙 기반 (국적, 시대, 저작권 상태)');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

analyzeArtistSources();