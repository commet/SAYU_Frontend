const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

class BatchResultsIntegrator {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    this.processed = 0;
    this.errors = [];
  }

  async loadLatestResults() {
    // 가장 최근 배치 결과 파일 찾기
    const files = fs.readdirSync(__dirname)
      .filter(file => file.startsWith('batch_collection_results_'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      throw new Error('배치 수집 결과 파일을 찾을 수 없습니다.');
    }

    const latestFile = files[0];
    console.log(`📄 통합 대상: ${latestFile}`);
    
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, latestFile), 'utf8'));
    return data.results;
  }

  filterReadyArtists(results) {
    // medium 이상 신뢰도를 가진 작가들만 선택
    return results.filter(result => 
      result.reliabilityGrade === 'medium' || result.reliabilityGrade === 'high'
    );
  }

  async checkArtistExists(artistName) {
    try {
      const result = await this.pool.query(
        'SELECT id FROM artists WHERE LOWER(name) = LOWER($1)',
        [artistName]
      );
      return result.rows.length > 0 ? result.rows[0].id : null;
    } catch (error) {
      console.error(`작가 존재 확인 실패 (${artistName}):`, error.message);
      return null;
    }
  }

  prepareArtistData(result) {
    const wiki = result.wikipediaData || {};
    const met = result.metMuseumData || {};
    const original = result.originalArtist;

    // 예술 운동 배열을 문자열로 변환
    const artMovements = [
      ...(wiki.art_movements || []),
      ...(met.art_movements || [])
    ].filter(Boolean);

    // 주요 작품 처리
    const keyWorks = wiki.key_works || [];
    const notableWorks = met.notable_works || [];
    const allWorks = [...keyWorks, ...notableWorks.map(w => w.title || w)].filter(Boolean);

    return {
      name: original.name,
      birth_year: wiki.birth_year || met.birth_year || null,
      death_year: wiki.death_year || met.death_year || null,
      nationality: wiki.nationality || met.nationality || '',
      bio: wiki.bio || '',
      art_movements: artMovements.length > 0 ? artMovements.join(', ') : '',
      major_works: allWorks.slice(0, 10).join(', '), // 상위 10개만
      importance_score: original.estimatedImportance,
      cultural_context: original.culturalSignificance,
      period: this.determinePeriod(wiki.birth_year || met.birth_year),
      style_characteristics: (wiki.characteristics || []).join(', '),
      
      // 메타데이터
      data_sources: JSON.stringify({
        wikipedia: !!wiki.confidence,
        met_museum: !!met.works_count,
        reliability_score: result.reliabilityScore,
        confidence_level: result.reliabilityGrade,
        collected_at: result.collectedAt
      }),

      // APT 관련 필드들 (나중에 업데이트 예정)
      apt_primary_type: null,
      apt_secondary_types: null,
      apt_confidence_score: null,
      apt_analysis_notes: 'Awaiting APT classification',
      
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  determinePeriod(birthYear) {
    if (!birthYear) return 'Contemporary';
    
    if (birthYear >= 1400 && birthYear <= 1600) return 'Renaissance';
    if (birthYear >= 1600 && birthYear <= 1750) return 'Baroque';
    if (birthYear >= 1750 && birthYear <= 1850) return 'Classical/Romantic';
    if (birthYear >= 1850 && birthYear <= 1900) return 'Modern Early';
    if (birthYear >= 1900 && birthYear <= 1950) return 'Modern';
    if (birthYear >= 1950) return 'Contemporary';
    
    return 'Contemporary';
  }

  async insertArtist(artistData) {
    const insertQuery = `
      INSERT INTO artists (
        name, birth_year, death_year, nationality, bio, art_movements,
        major_works, importance_score, cultural_context, period,
        style_characteristics, data_sources,
        apt_primary_type, apt_secondary_types, apt_confidence_score, apt_analysis_notes,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING id, name
    `;

    const values = [
      artistData.name,
      artistData.birth_year,
      artistData.death_year,
      artistData.nationality,
      artistData.bio,
      artistData.art_movements,
      artistData.major_works,
      artistData.importance_score,
      artistData.cultural_context,
      artistData.period,
      artistData.style_characteristics,
      artistData.data_sources,
      artistData.apt_primary_type,
      artistData.apt_secondary_types,
      artistData.apt_confidence_score,
      artistData.apt_analysis_notes,
      artistData.created_at,
      artistData.updated_at
    ];

    try {
      const result = await this.pool.query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`DB 삽입 실패: ${error.message}`);
    }
  }

  async processArtist(result) {
    const artistName = result.originalArtist.name;
    console.log(`\n🎨 ${artistName} 데이터베이스 통합 시작...`);

    try {
      // 1. 중복 확인
      const existingId = await this.checkArtistExists(artistName);
      if (existingId) {
        console.log(`   ⚠️ ${artistName} 이미 존재함 (ID: ${existingId})`);
        return { status: 'skipped', artistId: existingId, reason: 'already_exists' };
      }

      // 2. 데이터 준비
      const artistData = this.prepareArtistData(result);

      // 3. 데이터베이스 삽입
      const insertedArtist = await this.insertArtist(artistData);

      console.log(`   ✅ ${artistName} 성공적으로 추가됨 (ID: ${insertedArtist.id})`);
      console.log(`      신뢰도: ${result.reliabilityGrade}, 점수: ${result.reliabilityScore}`);
      
      return { 
        status: 'success', 
        artistId: insertedArtist.id, 
        data: artistData,
        originalResult: result
      };

    } catch (error) {
      console.error(`   ❌ ${artistName} 통합 실패:`, error.message);
      this.errors.push({ artist: artistName, error: error.message });
      
      return { 
        status: 'failed', 
        artistName, 
        error: error.message 
      };
    }
  }

  async createAptProfiles(processedArtists) {
    console.log('\n🧠 APT 프로필 테이블 연동 준비...');
    
    const successfulArtists = processedArtists.filter(p => p.status === 'success');
    
    for (const processed of successfulArtists) {
      try {
        // apt_profiles 테이블에 기본 엔트리 생성 (상세 분석은 별도 스크립트에서)
        await this.pool.query(`
          INSERT INTO apt_profiles (
            artist_id, artist_name, analysis_status, created_at, updated_at
          ) VALUES ($1, $2, 'pending', NOW(), NOW())
          ON CONFLICT (artist_id) DO NOTHING
        `, [processed.artistId, processed.data.name]);
        
        console.log(`   📋 ${processed.data.name} APT 프로필 슬롯 생성됨`);
      } catch (error) {
        console.error(`   ⚠️ APT 프로필 생성 실패 (${processed.data.name}):`, error.message);
      }
    }
  }

  async generateSummaryReport(processedArtists) {
    const summary = {
      total: processedArtists.length,
      successful: processedArtists.filter(p => p.status === 'success').length,
      skipped: processedArtists.filter(p => p.status === 'skipped').length,
      failed: processedArtists.filter(p => p.status === 'failed').length,
      errors: this.errors,
      processedAt: new Date().toISOString(),
      nextSteps: [
        'APT 성격 분석 실행',
        '작품 데이터 추가 수집',
        '이미지 및 메타데이터 보완'
      ]
    };

    // 성공한 작가들 상세 정보
    summary.successfulArtists = processedArtists
      .filter(p => p.status === 'success')
      .map(p => ({
        id: p.artistId,
        name: p.data.name,
        period: p.data.period,
        importance: p.data.importance_score,
        reliability: p.originalResult.reliabilityGrade
      }));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `integration_summary_${timestamp}.json`;
    
    fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(summary, null, 2));
    console.log(`\n💾 통합 요약 저장: ${filename}`);
    
    return summary;
  }

  printFinalReport(summary) {
    console.log('\n🎯 데이터베이스 통합 완료!');
    console.log('='.repeat(50));
    console.log(`📊 처리 결과:`);
    console.log(`   ✅ 성공: ${summary.successful}명`);
    console.log(`   ⏭️ 건너뜀: ${summary.skipped}명 (이미 존재)`);
    console.log(`   ❌ 실패: ${summary.failed}명`);
    
    if (summary.successful > 0) {
      console.log('\n🏆 새로 추가된 작가들:');
      summary.successfulArtists.forEach((artist, index) => {
        console.log(`   ${index + 1}. ${artist.name} (ID: ${artist.id}, 중요도: ${artist.importance})`);
      });
    }

    if (summary.errors.length > 0) {
      console.log('\n⚠️ 오류 발생:');
      summary.errors.forEach(error => {
        console.log(`   • ${error.artist}: ${error.error}`);
      });
    }

    console.log('\n🔄 다음 단계:');
    summary.nextSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });
  }

  async run() {
    console.log('🚀 배치 결과 데이터베이스 통합 시작!');
    
    try {
      // 1. 결과 로딩
      const allResults = await this.loadLatestResults();
      
      // 2. 준비된 작가들 필터링
      const readyArtists = this.filterReadyArtists(allResults);
      console.log(`📋 통합 대상: ${readyArtists.length}명 (신뢰도 medium 이상)`);

      if (readyArtists.length === 0) {
        console.log('⚠️ 데이터베이스 통합 가능한 작가가 없습니다.');
        return;
      }

      // 3. 각 작가 처리
      const processedArtists = [];
      for (const result of readyArtists) {
        const processed = await this.processArtist(result);
        processedArtists.push(processed);
        this.processed++;
      }

      // 4. APT 프로필 준비
      await this.createAptProfiles(processedArtists);

      // 5. 요약 보고서 생성
      const summary = await this.generateSummaryReport(processedArtists);
      this.printFinalReport(summary);

      console.log('\n🎉 데이터베이스 통합 성공적으로 완료!');
      return summary;

    } catch (error) {
      console.error('❌ 데이터베이스 통합 실패:', error.message);
      throw error;
    } finally {
      await this.pool.end();
    }
  }
}

// 실행 스크립트
async function main() {
  const integrator = new BatchResultsIntegrator();
  
  try {
    const summary = await integrator.run();
    process.exit(0);
  } catch (error) {
    console.error('💥 통합 프로세스 실패:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = BatchResultsIntegrator;